// Render the local, unpublished identity proposal for review.
const { chromium } = await import(process.argv[2] || "playwright-core");
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  await page.goto(
    (process.argv[3] || "http://127.0.0.1:1420") +
      "/docs/brand/caderno-proposal.html",
  );
  await page.locator("h1").waitFor();
  await page
    .locator("img")
    .evaluateAll((images) =>
      Promise.all(images.map((image) => image.decode())),
    );
  await page.screenshot({
    path: "docs/brand/proposta-caderno.png",
    fullPage: true,
  });
} finally {
  await browser.close();
}
