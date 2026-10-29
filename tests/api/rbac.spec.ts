import { test, expect } from '@playwright/test';

test.describe('API - Segurança e Controle de Acesso Baseado em Papéis (RF-08 / CT-09)', () => {
  test('CT-09: Deve bloquear cancelamento de pedido (HTTP 403) quando solicitado por atendente comum', async ({ request }) => {
    const payloadAtendente = {
      pedidoId: 'ped-2026-101',
      perfilUsuario: 'ATENDENTE',
      matricula: 'AT-5541',
      justificativa: 'Cliente desistiu',
    };

    const response = await request.post('/api/pedidos/cancelar', {
      data: payloadAtendente,
    });

    expect(response.status()).toBe(403);
    const data = await response.json();
    expect(data.erro).toBe('ACESSO_NEGADO');
    expect(data.mensagem).toContain('Apenas o Gerente da Unidade');
  });

  test('Deve autorizar cancelamento e estorno com sucesso quando solicitado por Gerente', async ({ request }) => {
    const payloadGerente = {
      pedidoId: 'ped-2026-101',
      perfilUsuario: 'GERENTE',
      matricula: 'GER-1002',
      justificativa: 'Erro operacional na cozinha',
    };

    const response = await request.post('/api/pedidos/cancelar', {
      data: payloadGerente,
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.sucesso).toBe(true);
    expect(data.canceladoPor).toBe('GER-1002');
    expect(data.trilhaAuditoriaRegistrada).toBe(true);
  });
});

