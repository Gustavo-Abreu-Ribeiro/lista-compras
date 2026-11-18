# Site público do aplicativo

## Visão e arquitetura

Apresentar compras, jogos e finanças com a identidade padrão Feira: papel,
verde escuro, terracota e as fontes Alegreya, Karla e IBM Plex Mono.
Site estático independente em `website/`, publicado no GitHub Pages. Não recebe
credenciais nem consulta dados de negócio. Não altera o aplicativo.

## Contrato e roadmap

- Prints são capturas dos componentes reais com fixtures interceptadas apenas
  no navegador de captura; legendas deixam explícitos os dados demonstrativos.
- Downloads usam somente assets de releases públicas, nunca URLs inventadas.
- Falha da API mantém acesso à página de releases; ausência de instalador é
  indicada por plataforma. Android usa APK, Windows usa EXE/MSI.
- O seletor começa em Feira e troca capturas/legendas entre Feira, Cartucho,
  Frutiger Aero e Vaporwave 95 nas quatro áreas. Não muda o tema do site nem do
  aplicativo.
- Entrega: página responsiva, capturas, navegação, galeria, aparências, downloads,
  FAQ, validação no navegador, workflow e publicação verificada por HTTP.

## Estado e prova

Página e capturas implementadas. `npm run build` passou (aviso de chunk
grande preexistente). Chrome headless validou 1440, 768, 390 e 320 px sem overflow,
imagens carregadas, abas por teclado, ampliação/fechamento, temas, FAQ e três
estados da API de releases. Nenhum erro JavaScript no navegador.

Publicado em https://gustavo-abreu-ribeiro.github.io/lista-compras/.
Workflow [44123748143](https://github.com/Gustavo-Abreu-Ribeiro/lista-compras/actions/runs/44123748143)
concluiu com sucesso e a URL respondeu HTTP 200 com título e referências aos
prints esperados. Fonte publicada: commit `5170a78`. A mesma verificação Chrome
também passou contra a URL pública após a publicação.

## Revisão de previews e texto (SITE-002)

Galeria com 12 combinações de tema/área, três cartões de comparação e três
capturas móveis ampliáveis. Dez prints novos, com a mesma fixture isolada.
Texto revisado para explicar recursos, instalação e limites sem slogans.
QA local e na URL pública passou nas quatro larguras. Publicação do commit
`0602d2e` pelo Pages 44145187004 concluiu com sucesso. Downloads reais Windows
e Android 0.3.0 também foram conferidos no navegador, sem mock da API.

Release 0.4.0 publicada: galeria com Vaporwave 95 e capturas atuais do app em
390 px. QA mobile final cobriu dez aparências, seis rotas e quatro larguras.
Na página pública, Edge confirmou os links 0.4.0, sem overflow a 390 px. Os links
de download buscam a release estável pela API pública do GitHub. Evidência em
`docs/releases/0.4.0-verification.md`.

Proposta de nome/símbolo **Caderno**, direção escolhida pelo usuário, em
`docs/brand/`. Mantida fora da identidade publicada enquanto é revisada.
