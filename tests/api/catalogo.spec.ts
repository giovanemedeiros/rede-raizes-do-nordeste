import { test, expect } from '@playwright/test';

test.describe('API - Gestão de Cardápio e Multicanalidade (RF-01 / CT-05)', () => {
  test('CT-05: Deve ocultar pratos pesados em lojas de formato Cozinha Reduzida', async ({ request }) => {
    // Consulta cardápio da unidade com formato Cozinha Reduzida (Shopping Express)
    const response = await request.get('/api/cardapio?unidadeId=shopping-express');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.formato).toBe('cozinha-reduzida');

    // Valida que nenhum item da lista exige cozinha completa
    const itensCozinhaCompleta = data.itens.filter((item: any) => item.exigeCozinhaCompleta === true);
    expect(itensCozinhaCompleta.length).toBe(0);

    // Valida que o Cuscuz Tradicional Completo (prod-01) não está presente
    const itemPesado = data.itens.find((item: any) => item.id === 'prod-01');
    expect(itemPesado).toBeUndefined();

    // Valida que itens compatíveis com cozinha reduzida estão presentes (ex: tapioca e bolo)
    const tapioca = data.itens.find((item: any) => item.id === 'prod-03');
    expect(tapioca).toBeDefined();
    expect(tapioca.nome).toContain('Tapioca de Carne de Sol');
  });

  test('Deve exibir cardápio completo com pratos quentes na unidade Matriz', async ({ request }) => {
    // Consulta cardápio da unidade com Cozinha Completa (Recife Matriz)
    const response = await request.get('/api/cardapio?unidadeId=recife-matriz');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.formato).toBe('cozinha-completa');

    // Valida que o Cuscuz Tradicional Completo (prod-01) está disponível
    const itemPesado = data.itens.find((item: any) => item.id === 'prod-01');
    expect(itemPesado).toBeDefined();
    expect(itemPesado.exigeCozinhaCompleta).toBe(true);
  });
});

