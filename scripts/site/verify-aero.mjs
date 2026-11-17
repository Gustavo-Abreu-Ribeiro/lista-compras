// node scripts/site/verify-aero.mjs <playwright-core-module> [app-url]
// Real UI, isolated read-only demo fixtures; no account data or writes.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { createDemoContext } from './demo-context.mjs';
const { chromium } = await import(process.argv[2] || 'playwright-core');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const base = process.argv[3] || 'http://127.0.0.1:1420';
const output = 'dist/aero-qa';
await mkdir(output, { recursive: true });
try {
  const context = await createDemoContext(browser);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base + '/settings');
  const choice = page.getByRole('button', { name: /Frutiger Aero/ });
  await choice.click();
  assert.equal(await choice.getAttribute('aria-pressed'), 'true');
  await page.reload();
  await choice.waitFor();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'aero');
  assert.equal(await choice.getAttribute('aria-pressed'), 'true');
  const wallpaper = await page.request.get(base + '/themes/aero/landscape.svg');
  assert.equal(wallpaper.status(), 200);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [name, path] of [['home','/'],['shopping','/shopping'],['games','/games'],['finance','/finance'],['settings','/settings'],['login','/login']]) {
      await page.goto(base + path);
      await page.getByRole('navigation', { name: 'Navegação principal', exact: true }).waitFor();
      await page.evaluate(() => document.fonts.ready);
      if (name === 'shopping') {
        await page.getByRole('button', { name: 'Casa & cozinha', exact: true }).click();
        await page.getByRole('button', { name: /Cafeteira italiana/ }).click();
        await page.getByText('Armazém da cozinha', { exact: true }).waitFor();
        await page.getByRole('button', { name: '+ Novo item', exact: true }).click();
        await page.getByRole('dialog').waitFor();
        assert(await page.getByRole('dialog').isVisible());
        const dialogClose = page.getByRole('dialog').getByRole('button', { name: /Fechar|Cancelar/ }).first();
        await dialogClose.click();
      }
      await page.waitForTimeout(180);
      const dimensions = await page.evaluate(() => ({ full: document.documentElement.scrollWidth, viewport: innerWidth }));
      assert(dimensions.full <= dimensions.viewport, `${name} overflows at ${width}: ${JSON.stringify(dimensions)}`);
      if (width <= 760) assert(await page.getByRole('navigation', { name: 'Áreas do app' }).isVisible());
      if (name === 'finance') {
        await page.getByRole('button', { name: 'Novo lançamento', exact: true }).click();
        assert(await page.getByText('Registrar movimento', { exact: false }).count() || await page.locator('form').count());
      }
      if ([1440,390].includes(width)) await page.screenshot({ path: `${output}/${name}-${width}.png`, fullPage: true });
    }
  }
  await page.goto(base + '/settings');
  await page.getByRole('button', { name: /^Cartucho/ }).click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'cartucho');
  assert.equal(await page.locator('.aero-nav-icon').first().isVisible(), false);
  await page.getByRole('button', { name: 'Feira', exact: true }).click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await page.reload();
  await page.getByRole('button', { name: 'Feira', exact: true }).waitFor();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await page.getByRole('button', { name: /Frutiger Aero/ }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('.btn').first().evaluate(el => getComputedStyle(el).transitionDuration), '0s');
  assert.deepEqual(errors, []);
  const signedOut = await createDemoContext(browser, { signedIn: false });
  await signedOut.addInitScript(() => localStorage.setItem('lista-compras:theme', 'aero'));
  const login = await signedOut.newPage();
  for (const width of [1440,390]) {
    await login.setViewportSize({ width, height: 900 });
    await login.goto(base + '/login');
    await login.getByRole('button', { name: 'Entrar', exact: true }).waitFor();
    assert(await login.getByLabel('Senha', { exact: true }).isVisible());
    await login.screenshot({ path: `${output}/signed-out-${width}.png` });
  }
  console.log('PASS: one-touch selection, persisted reload, six routes at four widths, item dialog, financial form, mobile navigation, Cartucho/Feira reversal, reduced motion; no browser errors.');
} finally { await browser.close(); }
