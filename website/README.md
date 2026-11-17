# Site público — Lista de casa

Página estática de apresentação do aplicativo Lista de Compras. `index.html`,
`style.css`, `app.js` e `assets/` são o conteúdo publicado. Sem build, dados de
negócio ou credenciais. Paleta padrão Feira copiada dos tokens finais de
`src/app.css`; fontes Alegreya, Karla e IBM Plex Mono.

## Desenvolvimento e publicação

```sh
npm run site:dev
```

O workflow `.github/workflows/pages.yml` publica `website/` no GitHub Pages ao
receber mudanças em `main`. Pages deve estar configurado para GitHub Actions.
Documentação: [workflow de Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

URL: https://gustavo-abreu-ribeiro.github.io/lista-compras/

## Prints e verificação

As cinco capturas usam componentes reais do app com dados fictícios. O script
`scripts/site/capture.mjs` intercepta o módulo Supabase somente no navegador de
captura, bloqueia o host remoto e não faz login nem grava dados.

Execute o app com `npm run dev`, disponibilize `playwright-core` fora das
dependências do projeto e use o Chrome instalado:

```sh
node scripts/site/capture.mjs <caminho-ou-URL-do-modulo-playwright-core>
node scripts/site/verify.mjs <caminho-ou-URL-do-modulo-playwright-core>
```

O verificador usa a prévia em `http://127.0.0.1:4173`, grava evidências em
`dist/site-qa/` (ignorado) e cobre desktop/mobile, imagens, galeria, teclado,
paletas, FAQ e estados dos downloads. Não adiciona dependências ao app.

## Downloads

A página lê até 100 releases públicas pela API GitHub, ignora drafts e
prereleases e escolhe a primeira com `.exe`/`.msi` para Windows e `.apk` para
Android. Cada plataforma pode usar uma release diferente. Links são os
`browser_download_url` retornados pelo GitHub. Sem asset, mostra a ausência;
com falha de rede/API, mantém link direto para as releases. Timeout de 8 s.
O site não cria instaladores nem certifica seu funcionamento.

O helper `scripts/site/github.mjs` consulta estado, habilita Pages e acompanha
execuções usando Git Credential Manager somente em memória. Não é publicado
como parte do site nem armazena credenciais.
