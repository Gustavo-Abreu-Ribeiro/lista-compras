// node scripts/site/verify-reported-ui.mjs <playwright-core-module> [app-url]
// Regressões das capturas: somente fixtures, sem acesso à conta real.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { createDemoContext } from './demo-context.mjs';

const { chromium } = await import(process.argv[2] || 'playwright-core');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const base = process.argv[3] || 'http://127.0.0.1:1420';
const output = 'dist/reported-ui-qa';
await mkdir(output, { recursive: true });
let scenarios = 0;
try {
  for (const theme of ['aero', 'cartucho']) {
    const context = await createDemoContext(browser);
    await context.addInitScript(value => localStorage.setItem('lista-compras:theme', value), theme);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const width of [1440, 1000, 768, 680, 480, 390, 320]) {
      await page.setViewportSize({ width, height: 940 });
      await page.goto(base + (theme === 'aero' ? '/finance' : '/games'));
      await page.evaluate(() => document.fonts.ready);
      await page.locator(theme === 'aero' ? '.finance-summary' : '.game-item').first().waitFor();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${theme} overflow ${width}`);
      if (theme === 'aero') {
        const style = await page.locator('.finance-summary').evaluate(el => {
          const css = getComputedStyle(el);
          return { background: css.backgroundColor, gap: css.gap };
        });
        assert.equal(style.background, 'rgba(0, 0, 0, 0)');
        assert.equal(style.gap, '12px');
        const icons = page.locator(width > 760 ? '.top-nav .aero-nav-icon' : '.bottom-nav .aero-nav-icon');
        assert.equal(await icons.count(), 4);
        for (const icon of await icons.all()) {
          assert(await icon.isVisible());
          assert.equal(await icon.locator('svg').evaluate(el => getComputedStyle(el).stroke), 'rgb(255, 255, 255)');
        }
      } else {
        for (const card of await page.locator('.game-item').all()) {
          const bounds = await card.evaluate(el => {
            const rect = el.getBoundingClientRect();
            const group = el.querySelector('.check-group').getBoundingClientRect();
            const labels = [...el.querySelectorAll('.check')].map(label => {
              const r = label.getBoundingClientRect();
              return { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
            });
            return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, height: rect.height, groupBottom: group.bottom, labels };
          });
          for (const label of bounds.labels) {
            assert(label.top >= bounds.top && label.bottom <= bounds.bottom, `label outside card ${width}`);
            assert(label.left >= bounds.left && label.right <= bounds.right, `label outside width ${width}`);
          }
          if (width > 760) {
            assert(bounds.labels[1].top >= bounds.labels[0].bottom, `labels overlap ${width}`);
            assert(bounds.labels[1].bottom <= bounds.groupBottom + 1, `label outside control band ${width}`);
            assert(bounds.groupBottom <= bounds.top + bounds.height * .76 + 1, `serial overlap ${width}`);
          }
        }
      }
      if ([1000, 390].includes(width)) await page.screenshot({ path: `${output}/${theme}-${width}.png`, fullPage: true });
      scenarios++;
      console.log(`PASS: ${theme} ${width}px`);
    }
    assert.deepEqual(errors, []);
    await context.close();
  }
  for (const theme of ['light', 'aero', 'cartucho', 'vaporwave']) {
    const context = await createDemoContext(browser);
    await context.addInitScript(value => localStorage.setItem('lista-compras:theme', value), theme);
    const page = await context.newPage();
    for (const width of [390, 600, 760]) {
      await page.setViewportSize({ width, height: 940 });
      await page.goto(base + '/finance/debts');
      await page.locator('.debt-row').first().waitFor();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${theme} debts overflow ${width}`);
      assert(await page.locator('.debt-row').first().evaluate(el => !el.open), `${theme} debts should start collapsed`);
      await page.locator('.debt-row > summary').first().click();
      assert(await page.locator('.debt-month-grid input[type=checkbox]').count() > 0);
      scenarios++;
      for (const [path, selector] of [['/shopping', '.category-list-item'], ['/games', '.game-item']]) {
        await page.goto(base + path);
        await page.locator(selector).first().waitFor();
        const rows = await page.locator(selector).evaluateAll(elements => elements.map(el => {
          const rect = el.getBoundingClientRect();
          return { left: rect.left, top: rect.top, bottom: rect.bottom };
        }));
        for (let i = 1; i < rows.length; i++) {
          assert(Math.abs(rows[i].left - rows[0].left) < 1, `${theme} ${path} not a column at ${width}`);
          assert(rows[i].top >= rows[i - 1].bottom, `${theme} ${path} rows overlap at ${width}`);
        }
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${theme} ${path} overflow ${width}`);
        scenarios++;
      }
    }
    await context.close();
  }
  for (const legacyFinanceSchema of [false, true]) {
    const context = await createDemoContext(browser, { legacyFinanceSchema });
    const page = await context.newPage();
    await page.goto(base + '/');
    await page.getByText('Contas registradas', { exact: true }).waitFor();
    assert.equal(await page.getByText(/não puderam ser carregados|Não foi possível carregar/).count(), 0);
    await page.goto(base + '/finance');
    await page.getByText('Dívidas cadastradas', { exact: true }).waitFor();
    await page.getByText('Notebook', { exact: true }).waitFor();
    assert.equal(await page.getByText(/debt_id does not exist/).count(), 0);
    assert.equal(await page.getByText('Comece pelo saldo que você tem hoje', { exact: true }).count(), 0);
    await page.getByRole('button', { name: 'Planejamento', exact: true }).click();
    await page.locator('.finance-add-debt > summary').click();
    const addDebt = page.getByRole('button', { name: 'Cadastrar dívida', exact: true });
    if (legacyFinanceSchema) assert(await addDebt.isDisabled());
    else assert(await addDebt.isEnabled());
    await page.goto(base + '/finance/debts');
    await page.locator('.debt-row').first().waitFor();
    if (legacyFinanceSchema) assert(await page.getByText('A atualização do banco de planos parcelados ainda está pendente.').count());
    else {
      await page.locator('.debt-row > summary').first().click();
      assert(await page.locator('.debt-month-grid input[type=checkbox]').count() > 0);
    }
    scenarios++;
    await context.close();
  }
  console.log(`PASS: ${scenarios} cenários; Aero, Cartucho e carga financeira nos dois schemas. Capturas: ${output}`);
} finally {
  await browser.close();
}
