const screens = {
  overview: [
    "01 / VISÃO GERAL",
    "Um ponto de partida para o seu dia.",
    "Saldo real, compromissos do mês, itens da lista e preços recentes. Uma visão reunida para decidir por onde começar.",
  ],
  shopping: [
    "02 / COMPRAS",
    "A ideia, o item e o link. Juntos.",
    "Organize por categorias, escolha um item e encontre os links de lojas que você guardou. Consulte os valores e o histórico registrado antes de decidir.",
  ],
  finance: [
    "03 / FINANÇAS",
    "Entenda o mês antes do próximo passo.",
    "Separe o que já aconteceu do que está planejado. Acompanhe saldos, parcelas, orçamentos e metas com os valores que você registra.",
  ],
  games: [
    "04 / JOGOS",
    "Sua próxima aventura está na lista.",
    "Guarde os links dos jogos, acompanhe o que está jogando e marque o que já terminou. Um espaço próprio para os seus momentos de pausa.",
  ],
};
const tabs = [...document.querySelectorAll("[data-screen]")];
function selectScreen(name, focus = false) {
  if (!screens[name]) return;
  tabs.forEach((tab) => {
    const selected = tab.dataset.screen === name;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focus) tab.focus();
  });
  document
    .querySelector("#screen-panel")
    .setAttribute("aria-labelledby", `tab-${name}`);
  document.querySelector("#gallery-image").src = `assets/${name}.png`;
  document.querySelector("#gallery-image").alt =
    `${screens[name][1]} Captura real do app com dados demonstrativos.`;
  document.querySelector("#gallery-open").dataset.image = name;
  ["#screen-number", "#screen-title", "#screen-description"].forEach(
    (id, i) => (document.querySelector(id).textContent = screens[name][i]),
  );
}
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectScreen(tab.dataset.screen));
  tab.addEventListener("keydown", (event) => {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft")
      next = (index + tabs.length - 1) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      selectScreen(tabs[next].dataset.screen, true);
    }
  });
});
document
  .querySelectorAll("[data-select]")
  .forEach((link) =>
    link.addEventListener("click", () => selectScreen(link.dataset.select)),
  );
document.querySelectorAll("[data-theme]").forEach((button) =>
  button.addEventListener("click", () => {
    document.documentElement.dataset.theme = button.dataset.theme;
    document
      .querySelectorAll("[data-theme]")
      .forEach((choice) =>
        choice.setAttribute("aria-pressed", String(choice === button)),
      );
  }),
);
const dialog = document.querySelector("#image-dialog");
document.querySelectorAll("[data-image]").forEach((button) =>
  button.addEventListener("click", () => {
    const name = button.dataset.image;
    document.querySelector("#expanded-image").src = `assets/${name}.png`;
    document.querySelector("#expanded-image").alt =
      `${screens[name][1]} Dados demonstrativos.`;
    dialog.showModal();
  }),
);
document
  .querySelector("#close-dialog")
  .addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const box = dialog.getBoundingClientRect();
    if (
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom
    )
      dialog.close();
  }
});

// Public release metadata only. No credentials, analytics or account data.
const releasesUrl =
  "https://github.com/Gustavo-Abreu-Ribeiro/lista-compras/releases";
async function loadDownloads() {
  const status = document.querySelector("#release-status");
  try {
    const response = await fetch(
      "https://api.github.com/repos/Gustavo-Abreu-Ribeiro/lista-compras/releases?per_page=100",
      {
        signal: AbortSignal.timeout(8000),
        headers: { Accept: "application/vnd.github+json" },
      },
    );
    if (!response.ok) throw new Error("Releases unavailable");
    const releases = await response.json();
    const stable = releases.filter(
      (release) => !release.draft && !release.prerelease,
    );
    let available = 0;
    for (const [platform, pattern] of [
      ["windows", /\.(exe|msi)$/i],
      ["android", /\.apk$/i],
    ]) {
      const release = stable.find((item) =>
        item.assets?.some(
          (asset) => pattern.test(asset.name) && asset.state === "uploaded",
        ),
      );
      const asset = release?.assets.find(
        (item) => pattern.test(item.name) && item.state === "uploaded",
      );
      const info = document.querySelector(`#${platform}-info`);
      const link = document.querySelector(`#${platform}-download`);
      if (
        asset &&
        new URL(asset.browser_download_url).origin === "https://github.com"
      ) {
        available++;
        info.textContent = `${release.tag_name} · ${asset.name} · ${(asset.size / 1048576).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;
        link.href = asset.browser_download_url;
        link.textContent = `Baixar para ${platform === "windows" ? "Windows" : "Android"} ↓`;
      } else {
        info.textContent = "Nenhum instalador publicado para esta plataforma.";
        link.href = releasesUrl;
        link.textContent = "Acompanhar releases ↗";
      }
    }
    status.textContent = available
      ? "Disponibilidade conferida nas releases públicas do projeto."
      : "Os instaladores ainda não foram publicados. Acompanhe as releases para baixar quando estiverem disponíveis.";
  } catch {
    status.textContent =
      "Não foi possível conferir os downloads agora. Consulte as releases diretamente no GitHub.";
    for (const platform of ["windows", "android"]) {
      document.querySelector(`#${platform}-info`).textContent =
        "Disponibilidade não confirmada nesta consulta.";
    }
  }
}
loadDownloads();
