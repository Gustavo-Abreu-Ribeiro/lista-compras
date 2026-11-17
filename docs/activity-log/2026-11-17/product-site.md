# Site de apresentação — identidade Feira

- Site estático em `website/`, com paleta/fontes do app padrão, recursos de
  compras/finanças/jogos, passos iniciais, galeria, aparência, downloads e FAQ.
- Cinco capturas dos componentes reais, incluindo celular, com fixtures de
  demonstração interceptadas no navegador. Nenhuma conta ou dado real usado.
- Galeria com navegação por teclado e ampliação em dialog; quatro paletas
  locais. Releases são consultadas sem credenciais e com timeout/fallback.
- Workflow GitHub Pages publica somente `website/`; `npm run site:dev` serve
  a página localmente. Nenhuma dependência adicionada ao aplicativo.
- Build frontend passou; aviso de chunk acima de 500 kB no app existente.
- QA com Chrome: 1440/768/390/320 px, sem overflow, imagens carregadas, galeria,
  Escape, setas, paletas, FAQ e downloads presentes/ausentes/falha da API.
- Rust e contratos nativos não foram alterados; edição anterior de Cargo.toml
  preservada. Migração cloud continua com suas próprias pendências.
- Publicado no GitHub Pages: https://gustavo-abreu-ribeiro.github.io/lista-compras/.
  Workflow 44123748143 concluiu com sucesso; URL respondeu HTTP 200 com conteúdo
  e referências aos prints corretos.
- Verificação Chrome repetida contra a URL pública: todos os fluxos e quatro
  larguras passaram, sem erros JavaScript.
