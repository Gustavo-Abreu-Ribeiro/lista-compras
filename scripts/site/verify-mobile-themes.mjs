// Full responsive matrix for app routes, appearances, and narrow/mobile widths.
// Uses isolated, read-only demo data; no account writes or external services.
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { createDemoContext } from "./demo-context.mjs";

const { chromium } = await import(process.argv[2] || "playwright-core");
const browser = await chromium.launch({ channel: "msedge", headless: true });
const base = process.argv[3] || "http://127.0.0.1:1420";
const themes = ["light", "ocean", "sunset", "dark", "berry", "blueprint", "citrus", "cartucho", "aero", "vaporwave"];
const routes = [
  ["home", "/"], ["shopping", "/shopping"], ["games", "/games"],
  ["finance", "/finance"], ["settings", "/settings"], ["login", "/login"],
];
const widths = [320, 360, 390, 480];
const output = "dist/mobile-qa";
await mkdir(output, { recursive: true });
let scenarios = 0;
const failures = [];

try {
  for (const theme of themes) {
    const context = await createDemoContext(browser);
    await context.addInitScript((value) => localStorage.setItem("lista-compras:theme", value), theme);
    const page = await context.newPage();
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    for (const width of widths) {
      await page.setViewportSize({ width, height: 844 });
      for (const [name, path] of routes) {
        await page.goto(base + path, { waitUntil: "domcontentloaded" });
        await page.locator(".app-navigation").waitFor();
        assert.equal(await page.locator("html").getAttribute("data-theme"), theme, `${name} lost ${theme} at ${width}px`);
        await page.evaluate(() => document.fonts.ready);
        const dimensions = await page.evaluate(() => ({ full: document.documentElement.scrollWidth, viewport: innerWidth }));
        assert(dimensions.full <= dimensions.viewport, `${theme}/${name} overflows at ${width}px: ${JSON.stringify(dimensions)}`);
        if (width <= 760) {
          assert(await page.locator(".app-bottom-nav").isVisible(), `${theme}: mobile navigation hidden at ${width}px`);
          assert(await page.locator(".app-bottom-nav .nav-link").first().isVisible(), `${theme}: mobile navigation links are covered at ${width}px`);
        }

        if (name === "shopping" && width === 390) {
          await page.getByRole("button", { name: "Casa & cozinha", exact: true }).click();
          await page.getByRole("button", { name: /Cafeteira italiana/ }).click();
          await page.getByText("Armazém da cozinha", { exact: true }).waitFor();
          const shoppingSize = await page.evaluate(() => ({ full: document.documentElement.scrollWidth, viewport: innerWidth }));
          assert(shoppingSize.full <= shoppingSize.viewport, `${theme}/shopping selection overflows: ${JSON.stringify(shoppingSize)}`);
        }
        if (name === "games" && width === 390) {
          await page.getByText("Stardew Valley", { exact: true }).waitFor();
          const gameSize = await page.evaluate(() => ({ full: document.documentElement.scrollWidth, viewport: innerWidth }));
          assert(gameSize.full <= gameSize.viewport, `${theme}/games cards overflow: ${JSON.stringify(gameSize)}`);
        }
        if (name === "finance" && width === 390) {
          await page.getByRole("button", { name: "Planejamento", exact: true }).click();
          await page.locator(".debt-row summary").filter({ hasText: "Notebook" }).click();
          await page.getByText(/Falta pagar neste plano/).first().waitFor();
          const financeSize = await page.evaluate(() => ({ full: document.documentElement.scrollWidth, viewport: innerWidth }));
          assert(financeSize.full <= financeSize.viewport, `${theme}/finance debt details overflow: ${JSON.stringify(financeSize)}`);
        }

        if (width === 320) await page.screenshot({ path: `${output}/${theme}-${name}-320.png`, fullPage: true });
        scenarios++;
      }
    }
    assert.deepEqual(pageErrors, [], `${theme} browser errors: ${pageErrors.join(" | ")}`);
    await context.close();
    console.log(`PASS ${theme}: ${routes.length} routes × ${widths.length} widths`);
  }

  const signedOut = await createDemoContext(browser, { signedIn: false });
  await signedOut.addInitScript(() => localStorage.setItem("lista-compras:theme", "vaporwave"));
  const login = await signedOut.newPage();
  for (const width of widths) {
    await login.setViewportSize({ width, height: 844 });
    await login.goto(base + "/login", { waitUntil: "domcontentloaded" });
    await login.getByRole("button", { name: "Entrar", exact: true }).waitFor();
    assert(await login.getByLabel("Senha", { exact: true }).isVisible());
    const dimensions = await login.evaluate(() => ({ full: document.documentElement.scrollWidth, viewport: innerWidth }));
    assert(dimensions.full <= dimensions.viewport, `signed-out/login overflows at ${width}px: ${JSON.stringify(dimensions)}`);
  }
  await signedOut.close();
  console.log(`PASS signed-out login: ${widths.length} widths`);
  console.log(`PASS ${scenarios} theme/route/width scenarios; debt, shopping, games, mobile navigation and signed-out login flows verified.`);
} finally {
  await browser.close();
}
