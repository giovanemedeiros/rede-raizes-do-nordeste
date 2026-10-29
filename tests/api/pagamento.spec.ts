import { test, expect } from '@playwright/test';

test.describe('API - Processamento Desacoplado de Pagamento (RF-04 / CT-01 / CT-02 / CT-03)', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('/api/test/reset');
  });

  test('CT-01: Deve aprovar pagamento via Pix e emitir senha para a fila da cozinha', async ({ request }) => {
    // 1. Cria reserva de estoque
    const resReserva = await request.post('/api/pedidos/reservar', {
      data: { unidadeId: 'recife-matriz', produtoId: 'prod-02', quantidade: 1 },
    });
    const { reservaId } = await resReserva.json();

    // 2. Processa pagamento Pix
    const resPagamento = await request.post('/api/pagamentos/processar', {
      data: {
        reservaId,
        metodo: 'pix',
        valor: 12.00,
      },
    });

    expect(resPagamento.status()).toBe(200);
    const data = await resPagamento.json();
    expect(data.sucesso).toBe(true);
    expect(data.status).toBe('APROVADO');
    expect(data.codigoSenha).toMatch(/^S-\d+$/);
    expect(data.filaCozinha).toBe('RECEBIDO');
  });

  test('CT-02: Deve recusar pagamento com status 402 quando saldo for insuficiente', async ({ request }) => {
    const resReserva = await request.post('/api/pedidos/reservar', {
      data: { unidadeId: 'recife-matriz', produtoId: 'prod-02', quantidade: 1 },
    });
    const { reservaId } = await resReserva.json();

    // Simula recusa com cartão sem saldo
    const resPagamento = await request.post('/api/pagamentos/processar', {
      data: {
        reservaId,
        metodo: 'cartao_credito',
        valor: 12.00,
        dadosCartao: { saldoSuficiente: false },
      },
    });

    expect(resPagamento.status()).toBe(402);
    const data = await resPagamento.json();
    expect(data.sucesso).toBe(false);
    expect(data.codigo).toBe('SALDO_INSUFICIENTE');
    expect(data.mensagem).toContain('Transacao nao autorizada');
  });

  test('CT-03: Deve disparar timeout em 10 segundos ao identificar lentidão no gateway', async ({ request }) => {
    test.setTimeout(15000); // Permite tempo para validação do timeout

    const resReserva = await request.post('/api/pedidos/reservar', {
      data: { unidadeId: 'recife-matriz', produtoId: 'prod-02', quantidade: 1 },
    });
    const { reservaId } = await resReserva.json();

    const inicio = Date.now();
    const resPagamento = await request.post('/api/pagamentos/processar', {
      data: {
        reservaId,
        metodo: 'cartao_credito',
        valor: 12.00,
        simularTimeout: true,
      },
    });
    const duracao = Date.now() - inicio;

    expect(resPagamento.status()).toBe(504);
    expect(duracao).toBeGreaterThanOrEqual(10000);
    const data = await resPagamento.json();
    expect(data.erro).toBe('GATEWAY_TIMEOUT');
    expect(data.mensagem).toContain('Tempo limite');
  });
});

