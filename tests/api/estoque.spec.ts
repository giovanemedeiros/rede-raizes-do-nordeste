import { test, expect } from '@playwright/test';

test.describe('API - Reserva Atômica e Concorrência de Estoque (RF-03 / CT-04 / CT-06)', () => {
  test.beforeEach(async ({ request }) => {
    // Reseta o estado do estoque antes de cada teste
    await request.post('/api/test/reset');
  });

  test('CT-04: Deve prevenir venda concorrente duplicada no último item disponível', async ({ request }) => {
    // O item prod-04 (Bolo de Macaxeira) tem saldo inicial = 1 na Matriz
    const payloadClienteA = {
      unidadeId: 'recife-matriz',
      produtoId: 'prod-04',
      quantidade: 1,
    };

    // Cliente A efetua a primeira reserva com sucesso
    const responseClienteA = await request.post('/api/pedidos/reservar', {
      data: payloadClienteA,
    });
    expect(responseClienteA.status()).toBe(201);
    const dataA = await responseClienteA.json();
    expect(dataA.status).toBe('RESERVADO');
    expect(dataA.saldoRestante).toBe(0);

    // Cliente B tenta reservar o mesmo item no mesmo instante
    const responseClienteB = await request.post('/api/pedidos/reservar', {
      data: payloadClienteA,
    });
    expect(responseClienteB.status()).toBe(409);
    const dataB = await responseClienteB.json();
    expect(dataB.erro).toBe('PRODUTO_ESGOTADO');
    expect(dataB.mensagem).toContain('produto acabou de ser reservado');
  });

  test('CT-06: Deve liberar automaticamente o estoque após expiração do tempo de reserva (TTL)', async ({ request }) => {
    // Cria reserva temporária
    const reservaResp = await request.post('/api/pedidos/reservar', {
      data: {
        unidadeId: 'recife-matriz',
        produtoId: 'prod-03',
        quantidade: 1,
      },
    });
    expect(reservaResp.status()).toBe(201);
    const { reservaId, saldoRestante } = await reservaResp.json();

    // Aciona job de expiração para simular abandono de carrinho após 10 minutos
    const expirarResp = await request.post('/api/pedidos/expirar-reservas', {
      data: { forcarExpiracaoReservaId: reservaId },
    });
    expect(expirarResp.status()).toBe(200);
    const dadosExpiracao = await expirarResp.json();
    expect(dadosExpiracao.reservasExpiradas).toBe(1);

    // Valida que o estoque foi restituído
    const novaReserva = await request.post('/api/pedidos/reservar', {
      data: {
        unidadeId: 'recife-matriz',
        produtoId: 'prod-03',
        quantidade: 1,
      },
    });
    expect(novaReserva.status()).toBe(201);
  });
});

