import { test, expect } from '@playwright/test';

test.describe('E2E - Totem de Autoatendimento Touch Vertical (1080x1920) (RNF-04 / CT-01)', () => {
  test('CT-01: Deve concluir jornada de pedido no totem em 3 toques com emissão de senha', async ({ page }) => {
    // 1. Acessa a tela do totem
    await page.goto('/totem');
    await expect(page.locator('.header h1')).toContainText('Rede Raízes do Nordeste');

    // 2. Primeiro toque: Seleciona Tapioca
    await page.click('#btn-add-tapioca');
    await expect(page.locator('#resumo')).toBeVisible();
    await expect(page.locator('#item-selecionado')).toContainText('Tapioca de Carne de Sol');

    // 3. Segundo toque: Toca em Pagar com Pix
    await page.click('#btn-pagar-pix');

    // 4. Terceiro toque / Confirmação visual: Exibe tela de sucesso e senha
    await expect(page.locator('#confirmacao')).toBeVisible();
    await expect(page.locator('#msg-sucesso')).toContainText('Pedido Confirmado com Sucesso');
    await expect(page.locator('#numero-senha')).toBeVisible();

    // Captura screenshot para anexo do relatório acadêmico
    await page.screenshot({ path: 'docs/evidencias/evidencia-totem-sucesso.png', fullPage: true });
  });
});
