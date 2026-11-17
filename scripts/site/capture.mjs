// Use: node scripts/site/capture.mjs <path-to-playwright-core> [app-url]
// Fixtures exist only in this browser; no account, login or remote writes.
import { mkdir } from "node:fs/promises";
import { createDemoContext } from "./demo-context.mjs";
const { chromium } = await import(process.argv[2] || "playwright-core");
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await createDemoContext(browser);
await context.addInitScript(() =>
  localStorage.setItem("lista-compras:theme", "light"),
);
const page = await context.newPage();
await mkdir("website/assets", { recursive: true });
const base = process.argv[3] || "http://127.0.0.1:1420";
for (const [name, path] of [
  ["overview", "/"],
  ["shopping", "/shopping"],
  ["finance", "/finance"],
  ["games", "/games"],
]) {
  await page.goto(base + path);
  await page
    .getByRole("navigation", { name: "Navegação principal", exact: true })
    .waitFor();
  if (name === "shopping") {
    await page
      .getByRole("button", { name: "Casa & cozinha", exact: true })
      .click();
    await page.getByRole("button", { name: /Cafeteira italiana/ }).click();
    await page.getByText("Armazém da cozinha", { exact: true }).waitFor();
  }
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `website/assets/${name}.png` });
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(base + "/");
await page.getByText("R$ 4.370,00", { exact: true }).first().waitFor();
await page.waitForTimeout(900);
await page.screenshot({ path: "website/assets/mobile.png" });
await browser.close();
console.log("Captured 5 real app views with isolated demonstration fixtures.");
