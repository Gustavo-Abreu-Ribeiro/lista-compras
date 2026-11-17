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
- Publicação pública será registrada após verificar workflow e URL.
