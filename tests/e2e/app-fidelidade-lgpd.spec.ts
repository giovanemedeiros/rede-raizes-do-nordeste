import { test, expect } from '@playwright/test';

test.describe('E2E Mobile - Programa de Fidelidade e Privacidade LGPD (RNF-05 / CT-08)', () => {
  test('CT-08: Deve barrar cadastro de fidelidade sem consentimento e permitir compra anônima', async ({ page }) => {
    // 1. Acessa tela mobile do app
    await page.goto('/app');
    await expect(page.locator('h2')).toContainText('Programa de Fidelidade');

    // 2. Preenche CPF sem marcar o checkbox de consentimento
    await page.fill('#campo-cpf', '123.456.789-00');
    expect(await page.isChecked('#check-lgpd')).toBe(false);

    // 3. Tenta cadastrar sem autorização
    await page.click('#btn-cadastrar-fidelidade');
    await expect(page.locator('#alerta')).toBeVisible();
    await expect(page.locator('#alerta')).toContainText('Consentimento obrigatorio');

    // Captura screenshot da recusa por falta de consentimento
    await page.screenshot({ path: 'docs/evidencias/evidencia-lgpd-recusa.png', fullPage: true });

    // 4. Opt-out: Seleciona compra sem identificação (modo anônimo)
    await page.click('#btn-comprar-anonimo');
    await expect(page.locator('#alerta')).toContainText('Modo Anonimo ativado');

    // Captura screenshot da compra anônima protegendo a privacidade
    await page.screenshot({ path: 'docs/evidencias/evidencia-lgpd-anonimo.png', fullPage: true });
  });

  test('Deve aceitar cadastro quando o cliente realiza opt-in voluntário dos termos', async ({ page }) => {
    await page.goto('/app');
    await page.fill('#campo-cpf', '123.456.789-00');

    // Realiza opt-in explícito
    await page.check('#check-lgpd');
    await page.click('#btn-cadastrar-fidelidade');

    await expect(page.locator('#alerta')).toContainText('Cadastro realizado com sucesso');
    await page.screenshot({ path: 'docs/evidencias/evidencia-lgpd-sucesso.png', fullPage: true });
  });
});
