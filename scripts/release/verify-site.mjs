// Verify that the deployed website discovers the actual public release assets.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.argv[2] || 'playwright-core');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const tag = process.argv[3] || `v${JSON.parse(readFileSync(new URL('../../package.json', import.meta.url))).version}`;
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const response = await page.goto('https://gustavo-abreu-ribeiro.github.io/lista-compras/');
  assert.equal(response.status(), 200);
  for (const [platform, name] of [['windows', 'Lista-de-Compras-Windows-x64-setup.exe'], ['android', 'Lista-de-Compras-Android-arm64.apk']]) {
    const link = page.locator(`#${platform}-download`);
    await link.filter({ hasText: 'Baixar para' }).waitFor();
    assert.equal(await link.getAttribute('href'), `https://github.com/Gustavo-Abreu-Ribeiro/lista-compras/releases/download/${tag}/${name}`);
    assert((await page.locator(`#${platform}-info`).textContent()).includes(tag));
  }
  assert.deepEqual(errors, []);
  await mkdir('dist/site-qa', { recursive: true });
  await page.locator('#baixar').screenshot({ path: 'dist/site-qa/downloads-live.png' });
  console.log(`Published website resolves the real Windows and Android ${tag} download links.`);
} finally { await browser.close(); }
