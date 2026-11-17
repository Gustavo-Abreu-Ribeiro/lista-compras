# SITE-001 — Site público do aplicativo

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
- Exploração de aparências é local à página e começa em Feira.
- Entrega: página responsiva, capturas, navegação, galeria, aparências, downloads,
  FAQ, validação no navegador, workflow e publicação verificada por HTTP.

## Estado e prova

Página e cinco capturas implementadas. `npm run build` passou (aviso de chunk
grande preexistente). Chrome headless validou 1440, 768, 390 e 320 px sem overflow,
imagens carregadas, abas por teclado, ampliação/fechamento, paletas, FAQ e três
estados da API de releases. Nenhum erro JavaScript no navegador.

Pendente somente publicar o commit e conferir workflow e resposta HTTP pública.
