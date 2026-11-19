// Browser QA: node scripts/site/verify.mjs <playwright-core module path> [site-url]
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const { chromium } = await import(process.argv[2] || "playwright-core");
const browser = await chromium.launch({ channel: "msedge", headless: true });
const base = process.argv[3] || "http://127.0.0.1:4173";
const errors = [];
const context = await browser.newContext();
const page = await context.newPage();
page.on("pageerror", (error) => errors.push(error.message));
await context.route("https://api.github.com/**", (route) =>
  route.fulfill({ json: [] }),
);
await mkdir("dist/site-qa", { recursive: true });
for (const width of [1600, 1440, 768, 390, 320]) {
  await page.setViewportSize({ width, height: 960 });
  const response = await page.goto(base);
  assert.equal(response.status(), 200);
  await page
    .locator("#release-status")
    .filter({ hasText: "ainda não foram publicados" })
    .waitFor();
  await page.evaluate(() => document.fonts.ready);
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    `Horizontal overflow at ${width}px`,
  );
  assert(await page.locator("h1").isVisible());
  if (width === 1600) {
    assert(await page.locator(".journey-nav").isVisible());
    await page.locator("#recursos").scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('[data-journey="recursos"]')?.getAttribute("aria-current") === "location");
  } else {
    assert(!(await page.locator(".journey-nav").isVisible()));
  }
  for (const image of await page.locator("img").all()) {
    if (!(await image.isVisible())) continue;
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((img) => img.decode());
    assert(
      await image.evaluate((img) => img.complete && img.naturalWidth > 0),
      `Broken image at ${width}px`,
    );
  }
  await page.getByRole("tab", { name: "Compras", exact: true }).click();
  assert.equal(
    await page.locator("#gallery-image").getAttribute("src"),
    "assets/shopping.png",
  );
  await page.keyboard.press("ArrowRight");
  assert.equal(
    await page.locator("#gallery-image").getAttribute("src"),
    "assets/finance.png",
  );
  await page.locator("#gallery-open").click();
  assert(await page.locator("#image-dialog").isVisible());
  assert.equal(
    await page.locator("#expanded-image").getAttribute("src"),
    "assets/finance.png",
  );
  await page.keyboard.press("Escape");
  assert(!(await page.locator("#image-dialog").isVisible()));
  for (const [theme, label] of [
    ["cartucho", "Cartucho"],
    ["aero", "Frutiger Aero"],
    ["vaporwave", "Vaporwave 95"],
    ["light", "Feira"],
  ]) {
    await page
      .getByRole("group", { name: "Tema das capturas" })
      .getByRole("button", { name: label, exact: true })
      .click();
    for (const [screen, label] of [
      ["overview", "Visão geral"],
      ["shopping", "Compras"],
      ["finance", "Finanças"],
      ["games", "Jogos"],
    ]) {
      await page.getByRole("tab", { name: label, exact: true }).click();
      const name = theme === "light" ? screen : `${theme}-${screen}`;
      assert.equal(
        await page.locator("#gallery-image").getAttribute("src"),
        `assets/${name}.png`,
      );
      await page.locator("#gallery-image").evaluate((img) => img.decode());
      await page.locator("#gallery-open").click();
      assert.equal(
        await page.locator("#expanded-image").getAttribute("src"),
        `assets/${name}.png`,
      );
      await page.keyboard.press("Escape");
    }
  }
  for (const [index, name] of [
    "mobile",
    "cartucho-mobile",
    "aero-mobile",
    "vaporwave-mobile",
  ].entries()) {
    await page
      .locator(".theme-examples article")
      .nth(index)
      .getByRole("button", { name: "Ver no celular" })
      .click();
    assert.equal(
      await page.locator("#expanded-image").getAttribute("src"),
      `assets/${name}.png`,
    );
    await page.locator("#expanded-image").evaluate((img) => img.decode());
    await page.keyboard.press("Escape");
  }
  await page.getByText("Posso usar sem internet?", { exact: true }).click();
  assert(
    await page
      .getByText("Os dados de negócio dependem de conexão", { exact: false })
      .isVisible(),
  );
  await page.getByRole("tab", { name: "Visão geral", exact: true }).click();
  await page.evaluate(() => {
    document
      .querySelectorAll("details")
      .forEach((detail) => (detail.open = false));
    scrollTo({ top: 0, behavior: "instant" });
  });
  await page.screenshot({
    path: `dist/site-qa/site-${width}.png`,
    fullPage: true,
  });
}
await page.emulateMedia({ reducedMotion: "reduce" });
await page.reload();
assert.equal(await page.locator(".reveal").count(), 0);
assert(await page.getByRole("heading", { name: "O que dá para fazer." }).isVisible());
await page.emulateMedia({ reducedMotion: "no-preference" });
await context.unroute("https://api.github.com/**");
await context.route("https://api.github.com/**", (route) =>
  route.fulfill({
    json: [
      {
        tag_name: "v0.1.0",
        draft: false,
        prerelease: false,
        assets: [
          {
            name: "Lista-x64.exe",
            state: "uploaded",
            size: 10485760,
            browser_download_url:
              "https://github.com/example/releases/download/v0.1.0/Lista-x64.exe",
          },
          {
            name: "Lista-arm64.apk",
            state: "uploaded",
            size: 20971520,
            browser_download_url:
              "https://github.com/example/releases/download/v0.1.0/Lista-arm64.apk",
          },
        ],
      },
    ],
  }),
);
await page.reload();
await page
  .locator("#windows-download")
  .filter({ hasText: "Baixar para Windows" })
  .waitFor();
assert(
  (await page.locator("#android-download").getAttribute("href")).endsWith(
    ".apk",
  ),
);
await context.unroute("https://api.github.com/**");
await context.route("https://api.github.com/**", (route) =>
  route.fulfill({ status: 403, json: { message: "Rate limit" } }),
);
await page.reload();
await page
  .locator("#release-status")
  .filter({ hasText: "Não foi possível" })
  .waitFor();
assert(
  (await page.locator("#windows-download").getAttribute("href")).endsWith(
    "/releases",
  ),
);
assert.deepEqual(errors, []);
await browser.close();
console.log(
  "PASS: 5 widths; section wheel; reduced motion; all 16 theme/route combinations; desktop and mobile image dialogs; keyboard tabs; FAQ; downloads present/absent/API failure; no browser errors.",
);
