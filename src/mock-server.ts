import http from 'http';
import { URL } from 'url';
import { cardapioBase, unidadesCadastradas, ItemCardapio } from './data/cardapio.js';

interface ReservaEstoque {
  id: string;
  unidadeId: string;
  produtoId: string;
  quantidade: number;
  criadaEm: number;
  expirada: boolean;
  confirmada: boolean;
}

// Estado em memória para simulação nos testes
const estoquePorUnidade: Record<string, Record<string, number>> = {};
const reservasAtivas: Record<string, ReservaEstoque> = {};
const pedidosConfirmados: any[] = [];
let contadorSenhas = 100;

function resetarEstado() {
  unidadesCadastradas.forEach((unidade) => {
    estoquePorUnidade[unidade.id] = { ...unidade.estoqueLocal };
  });
}

resetarEstado();

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Habilitar CORS para testes
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Rota de Health Check
  if (pathname === '/health' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', servico: 'Rede Raizes do Nordeste Mock API' }));
    return;
  }

  // Rota de Reset para garantir isolamento entre testes
  if (pathname === '/api/test/reset' && method === 'POST') {
    resetarEstado();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'estado_resetado' }));
    return;
  }

  // CT-05 e RF-01: Consulta de Cardápio filtrado por unidade
  if (pathname === '/api/cardapio' && method === 'GET') {
    const unidadeId = parsedUrl.searchParams.get('unidadeId') || 'recife-matriz';
    const unidade = unidadesCadastradas.find((u) => u.id === unidadeId);

    if (!unidade) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ erro: 'UNIDADE_NAO_ENCONTRADA' }));
      return;
    }

    // Regra de Negócio: Lojas com cozinha reduzida não exibem pratos que exigem cozinha completa
    const itensFiltrados = cardapioBase.filter((item) => {
      if (unidade.formato === 'cozinha-reduzida' && item.exigeCozinhaCompleta) {
        return false;
      }
      return item.disponivel;
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ unidade: unidade.nome, formato: unidade.formato, itens: itensFiltrados }));
    return;
  }

  // Helper para ler body JSON
  const getBody = (): Promise<any> => {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          resolve({});
        }
      });
    });
  };

  // CT-04, CT-06 e RF-03: Reserva Atômica de Estoque
  if (pathname === '/api/pedidos/reservar' && method === 'POST') {
    const { unidadeId, produtoId, quantidade } = await getBody();
    const estoqueAtual = estoquePorUnidade[unidadeId]?.[produtoId] || 0;

    if (estoqueAtual < (quantidade || 1)) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          erro: 'PRODUTO_ESGOTADO',
          mensagem: 'Desculpe, este produto acabou de ser reservado por outro cliente.',
        })
      );
      return;
    }

    // Decrementa do estoque disponível e cria a reserva com TTL de 10 min
    estoquePorUnidade[unidadeId][produtoId] -= (quantidade || 1);
    const reservaId = `res-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const reserva: ReservaEstoque = {
      id: reservaId,
      unidadeId,
      produtoId,
      quantidade: quantidade || 1,
      criadaEm: Date.now(),
      expirada: false,
      confirmada: false,
    };
    reservasAtivas[reservaId] = reserva;

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        reservaId,
        status: 'RESERVADO',
        saldoRestante: estoquePorUnidade[unidadeId][produtoId],
        expiraEmSegundos: 600,
      })
    );
    return;
  }

  // CT-06: Job de Expiração Automática de Reservas (TTL)
  if (pathname === '/api/pedidos/expirar-reservas' && method === 'POST') {
    const { forcarExpiracaoReservaId } = await getBody();
    let expiradasCount = 0;

    Object.values(reservasAtivas).forEach((reserva) => {
      if (!reserva.confirmada && !reserva.expirada) {
        if (forcarExpiracaoReservaId === reserva.id || Date.now() - reserva.criadaEm > 600000) {
          reserva.expirada = true;
          estoquePorUnidade[reserva.unidadeId][reserva.produtoId] += reserva.quantidade;
          expiradasCount++;
        }
      }
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'sucesso', reservasExpiradas: expiradasCount }));
    return;
  }

  // CT-01, CT-02, CT-03 e RF-04: Processamento Desacoplado de Pagamento
  if (pathname === '/api/pagamentos/processar' && method === 'POST') {
    const { reservaId, metodo, dadosCartao, simularTimeout } = await getBody();

    // CT-03: Simulação de Timeout
    if (simularTimeout) {
      await new Promise((resolve) => setTimeout(resolve, 11000));
      res.writeHead(504, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          erro: 'GATEWAY_TIMEOUT',
          mensagem: 'Tempo limite de comunicacao com o servico bancario excedido. Nenhuma cobranca foi efetuada.',
        })
      );
      return;
    }

    // CT-02: Recusa por saldo insuficiente
    if (metodo === 'cartao_credito' && dadosCartao?.saldoSuficiente === false) {
      res.writeHead(402, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          sucesso: false,
          codigo: 'SALDO_INSUFICIENTE',
          mensagem: 'Transacao nao autorizada. Verifique os dados do cartao ou escolha outra forma de pagamento.',
        })
      );
      return;
    }

    // CT-01: Sucesso no Pagamento
    const reserva = reservasAtivas[reservaId];
    if (reserva) {
      reserva.confirmada = true;
    }

    contadorSenhas++;
    const transacaoId = `tx-${Date.now()}`;
    const codigoSenha = `S-${contadorSenhas}`;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        sucesso: true,
        transacaoId,
        codigoSenha,
        status: 'APROVADO',
        filaCozinha: 'RECEBIDO',
        mensagem: 'Pedido Confirmado com Sucesso',
      })
    );
    return;
  }

  // CT-09 e RF-08: Cancelamento de Pedido com Controle de Acesso (RBAC)
  if (pathname === '/api/pedidos/cancelar' && method === 'POST') {
    const { pedidoId, perfilUsuario, matricula, justificativa } = await getBody();

    if (perfilUsuario !== 'GERENTE') {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          erro: 'ACESSO_NEGADO',
          mensagem: 'Operacao nao autorizada. Apenas o Gerente da Unidade possui permissao para cancelamento.',
        })
      );
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        sucesso: true,
        pedidoId,
        canceladoPor: matricula,
        estornoEmitido: true,
        trilhaAuditoriaRegistrada: true,
      })
    );
    return;
  }

  // CT-08 e RF-07: Adesão ao Programa de Fidelidade com LGPD
  if (pathname === '/api/fidelidade/adesao' && method === 'POST') {
    const { nome, cpf, consentimentoLgpd } = await getBody();

    if (!consentimentoLgpd) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          erro: 'CONSENTIMENTO_OBRIGATORIO',
          mensagem: 'A participacao no programa de descontos exige o consentimento com os termos da LGPD.',
        })
      );
      return;
    }

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        sucesso: true,
        cpfMascarado: cpf ? `${cpf.substring(0, 3)}.***.***-**` : 'ANONIMO',
        pontosIniciais: 50,
        versaoTermoAceito: 'v1.0-2026',
      })
    );
    return;
  }

  // Interface visual HTML para testes de E2E no Totem Touch (1080x1920)
  if (pathname === '/totem' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Totem Raízes do Nordeste</title>
        <style>
          body { font-family: sans-serif; background: #fff8f0; margin: 0; padding: 24px; color: #3d2314; }
          .header { text-align: center; border-bottom: 2px solid #d97736; padding-bottom: 16px; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 24px 0; }
          .card { background: white; border-radius: 12px; padding: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: center; }
          .btn { background: #d97736; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 18px; cursor: pointer; }
          .btn:disabled { background: #ccc; }
          #resumo { background: white; padding: 16px; border-radius: 8px; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Rede Raízes do Nordeste</h1>
          <p>Totem de Autoatendimento - Unidade Recife Centro</p>
        </div>
        <div class="grid">
          <div class="card" id="card-tapioca">
            <h3>Tapioca de Carne de Sol</h3>
            <p>R$ 20,00</p>
            <button class="btn" id="btn-add-tapioca" onclick="selecionarItem('Tapioca de Carne de Sol', 20.00)">Selecionar</button>
          </div>
          <div class="card" id="card-bolo">
            <h3>Bolo de Macaxeira</h3>
            <p>R$ 10,50</p>
            <button class="btn" id="btn-add-bolo" onclick="selecionarItem('Bolo de Macaxeira', 10.50)">Selecionar</button>
          </div>
        </div>
        <div id="resumo" style="display:none;">
          <h3>Resumo do Pedido</h3>
          <p id="item-selecionado"></p>
          <button class="btn" id="btn-pagar-pix" onclick="pagarPix()">Pagar com Pix</button>
        </div>
        <div id="confirmacao" style="display:none; text-align:center; margin-top: 24px;">
          <h2 style="color: #2e7d32;" id="msg-sucesso">Pedido Confirmado com Sucesso!</h2>
          <p id="numero-senha" style="font-size: 32px; font-weight: bold; color: #d97736;">Senha: S-101</p>
        </div>
        <script>
          function selecionarItem(nome, preco) {
            document.getElementById('resumo').style.display = 'block';
            document.getElementById('item-selecionado').innerText = nome + ' - R$ ' + preco.toFixed(2);
          }
          function pagarPix() {
            document.getElementById('resumo').style.display = 'none';
            document.getElementById('confirmacao').style.display = 'block';
          }
        </script>
      </body>
      </html>
    `);
    return;
  }

  // Interface visual HTML para testes de E2E Mobile com LGPD
  if (pathname === '/app' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>App Raízes do Nordeste</title>
        <style>
          body { font-family: sans-serif; background: #fafafa; margin: 0; padding: 16px; }
          .box { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .btn-primary { background: #d97736; color: white; width: 100%; padding: 14px; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; }
          .btn-secondary { background: #eee; color: #333; width: 100%; padding: 12px; border: none; border-radius: 8px; font-size: 14px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="box">
          <h2>Programa de Fidelidade</h2>
          <p>Acumule pontos em compras e resgate descontos regionais.</p>
          <input type="text" id="campo-cpf" placeholder="Digite seu CPF" style="width: 100%; padding: 10px; margin-bottom: 12px; box-sizing: border-box;" />
          <div style="margin: 12px 0;">
            <input type="checkbox" id="check-lgpd" />
            <label for="check-lgpd">Concordo com os Termos de Privacidade e Tratamento de Dados (LGPD)</label>
          </div>
          <button class="btn-primary" id="btn-cadastrar-fidelidade" onclick="cadastrarFidelidade()">Cadastrar e Pontuar</button>
          <button class="btn-secondary" id="btn-comprar-anonimo" onclick="comprarAnonimo()">Comprar sem Identificação</button>
          <div id="alerta" style="display:none; margin-top: 12px; padding: 10px; border-radius: 6px;"></div>
        </div>
        <script>
          function cadastrarFidelidade() {
            var check = document.getElementById('check-lgpd').checked;
            var alerta = document.getElementById('alerta');
            alerta.style.display = 'block';
            if (!check) {
              alerta.style.background = '#ffebee';
              alerta.style.color = '#c62828';
              alerta.innerText = 'Consentimento obrigatorio para aderir ao programa.';
            } else {
              alerta.style.background = '#e8f5e9';
              alerta.style.color = '#2e7d32';
              alerta.innerText = 'Cadastro realizado com sucesso! Voce ganhou 50 pontos.';
            }
          }
          function comprarAnonimo() {
            var alerta = document.getElementById('alerta');
            alerta.style.display = 'block';
            alerta.style.background = '#e3f2fd';
            alerta.style.color = '#1565c0';
            alerta.innerText = 'Modo Anonimo ativado. Nenhum dado pessoal foi armazenado.';
          }
        </script>
      </body>
      </html>
    `);
    return;
  }

  // 404 para outras rotas
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ erro: 'ROTA_NAO_ENCONTRADA' }));
});

const PORT = 3333;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`[Raizes do Nordeste Mock Server] Rodando em http://127.0.0.1:${PORT}`);
});

