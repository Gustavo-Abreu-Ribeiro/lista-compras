// Use: node scripts/site/capture.mjs <path-to-playwright-core> [app-url]
// Fixtures exist only in this browser; no account, login or remote writes.
import { mkdir } from "node:fs/promises";
const { chromium } = await import(process.argv[2] || "playwright-core");
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 940 },
  deviceScaleFactor: 1,
});
const date = new Date().toISOString();
const month = date.slice(0, 7);
const categories = ["Casa & cozinha", "Tecnologia", "Para o dia a dia"].map(
  (name, i) => ({
    id: i + 1,
    uuid: `demo-category-${i}`,
    name,
    created_at: date,
  }),
);
const items = [
  "Cafeteira italiana",
  "Luminária de mesa",
  "Jogo de panelas",
  "Organizador de cozinha",
].map((name, i) => ({
  id: i + 1,
  category_id: 1,
  name,
  uuid: `demo-item-${i}`,
  created_at: date,
}));
const tables = {
  app_categories: categories,
  app_items: items,
  app_item_links: [
    {
      id: 1,
      item_id: 1,
      store_name: "Loja da casa",
      url: "https://example.com/cafeteira",
      price: 149.9,
      created_at: date,
    },
    {
      id: 2,
      item_id: 1,
      store_name: "Armazém da cozinha",
      url: "https://example.com/cozinha",
      price: 169.9,
      created_at: date,
    },
  ],
  app_item_link_price_history: [159.9, 155, 149.9].map((price, i) => ({
    id: i,
    item_link_id: 1,
    price,
    observed_at: `${month}-${String(i + 1).padStart(2, "0")}T12:00:00Z`,
  })),
  app_financial_accounts: [
    {
      id: 1,
      name: "Conta do dia a dia",
      account_type: "checking",
      opening_balance_cents: 520000,
    },
  ],
  app_financial_categories: [
    { id: 1, name: "Casa", kind: "expense", is_essential: true },
  ],
  app_financial_transactions: [
    {
      id: 1,
      kind: "expense",
      amount_cents: 65000,
      occurred_on: `${month}-04`,
      description: "Compras do mês",
      category_id: 1,
      account_id: 1,
      status: "posted",
    },
    {
      id: 2,
      kind: "expense",
      amount_cents: 18000,
      occurred_on: `${month}-09`,
      description: "Contas de casa",
      category_id: 1,
      account_id: 1,
      status: "posted",
    },
  ],
  app_financial_installments: [
    {
      id: 1,
      description: "Escrivaninha · 2 de 4",
      amount_cents: 15000,
      due_on: `${month}-25`,
      state: "pending",
      category_id: 1,
    },
  ],
  app_financial_goals: [
    {
      id: 1,
      name: "Reserva de emergência",
      target_cents: 1000000,
      saved_cents: 320000,
      due_on: null,
      priority: 1,
      contribution_min_cents: 20000,
    },
  ],
  app_financial_budgets: [
    { id: 1, category_id: 1, month, limit_cents: 120000 },
  ],
  app_games: ["Stardew Valley", "Hollow Knight", "Celeste", "A Short Hike"].map(
    (name, i) => ({
      id: `game-${i}`,
      name,
      url: "https://example.com/jogo",
      status: ["playing", "backlog", "finished", "backlog"][i],
      updated_at: date,
    }),
  ),
};
await context.route("**/src/services/supabase.ts*", (route) =>
  route.fulfill({
    contentType: "application/javascript",
    body: `const tables = ${JSON.stringify(tables)};
    export const isSupabaseConfigured = true;
    export const supabase = {
      auth: { getSession: async () => ({ data: { session: { user: { email: 'demo@example.com' } } } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) },
      from(name) {
        let rows = tables[name] || []; const q = {
          select() { return q }, order() { return q }, gte() { return q }, gt() { return q }, lt() { return q }, lte() { return q }, or() { return q }, limit() { return q },
          eq(key, value) { rows = rows.filter(row => row[key] === value); return q },
          in() { return q }, upsert() { throw Error('Capture is read-only') }, insert() { throw Error('Capture is read-only') }, delete() { throw Error('Capture is read-only') },
          then(resolve) { return Promise.resolve({ data: rows, error: null }).then(resolve) }
        }; return q;
      }
    };`,
  }),
);
await context.route("**/*.supabase.co/**", (route) => route.abort());
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
