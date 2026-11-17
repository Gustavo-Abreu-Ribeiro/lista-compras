// Check the production frontend without logging in, creating accounts or writing data.
// node scripts/release/smoke-ui.mjs <playwright-core module> [preview-url]
import assert from 'node:assert/strict';
const { chromium } = await import(process.argv[2] || 'playwright-core');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const base = process.argv[3] || 'http://127.0.0.1:4173';
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(base + '/finance');
    await page.getByRole('button', { name: 'Entrar', exact: true }).waitFor();
    assert(new URL(page.url()).pathname === '/login', 'Protected area must require login');
    assert(await page.getByLabel('Email', { exact: true }).isVisible());
    assert(await page.getByLabel('Senha', { exact: true }).isVisible());
    assert(await page.getByRole('button', { name: 'Criar conta', exact: true }).isEnabled());
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert(!(await page.getByRole('alert').count()), 'Supabase configuration must be bundled');
  }
  assert.deepEqual(errors, []);
  console.log('Production frontend: protected route, configured login, desktop/mobile rendering passed without account writes.');
} finally {
  await browser.close();
}
