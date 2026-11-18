// Capture real app components without accessing user data.
import { mkdir } from "node:fs/promises";
import { createDemoContext } from "./demo-context.mjs";
const { chromium } = await import(process.argv[2] || "playwright-core");
const browser = await chromium.launch({ channel: "msedge", headless: true });
const base = process.argv[3] || "http://127.0.0.1:1420";
try {
  await mkdir("website/assets", { recursive: true });
  for (const theme of ["cartucho", "aero", "vaporwave"]) {
    const context = await createDemoContext(browser);
    await context.addInitScript(
      (theme) => localStorage.setItem("lista-compras:theme", theme),
      theme,
    );
    const page = await context.newPage();
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
        await page
          .getByRole("button", { name: /Cafeteira italiana/ })
          .waitFor();
        if (theme !== "cartucho") {
          await page
            .getByRole("button", { name: /Cafeteira italiana/ })
            .click();
          await page.getByText("Armazém da cozinha", { exact: true }).waitFor();
        }
      }
      if (name === "overview")
        await page.getByText("R$ 4.370,00", { exact: true }).first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(700);
      await page.screenshot({ path: `website/assets/${theme}-${name}.png` });
    }
    for (const width of [320, 360, 390, 480]) {
      await page.setViewportSize({ width, height: 844 });
      for (const [name, path] of [
        ["overview", "/"],
        ["shopping", "/shopping"],
        ["finance", "/finance"],
        ["games", "/games"],
        ["settings", "/settings"],
      ]) {
        await page.goto(base + path);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(150);
        const size = await page.evaluate(() => ({ full: document.documentElement.scrollWidth, viewport: innerWidth }));
        if (size.full > size.viewport) throw new Error(`${theme}/${name} overflows at ${width}px: ${JSON.stringify(size)}`);
        if (width === 390) await page.screenshot({ path: `website/assets/${theme}-${name}-mobile.png` });
        if (name === "overview" && width === 390) await page.screenshot({ path: `website/assets/${theme}-mobile.png` });
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}
console.log(
  "Captured Cartucho, Frutiger Aero, and Vaporwave 95 desktop routes plus five mobile flows at 320, 360, 390, and 480 px.",
);
