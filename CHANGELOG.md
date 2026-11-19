# Changelog

Mudanças relevantes seguem [Keep a Changelog](https://keepachangelog.com/pt-BR/)
e [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [0.5.1] - 2026-11-19

### Fixed

- O Resumo consulta itens e links em lote; leituras financeiras percorrem todas
  as páginas antes de calcular saldos, histórico, orçamento e dívidas.
- Resumo, Compras, Jogos, Finanças e Dívidas recarregam dados ao voltar ao aplicativo;
  Compras descarta respostas antigas se a seleção mudar durante a consulta.
- Testes de paginação e retorno à janela passam a executar no CI.

## [0.5.0] - 2026-11-18

### Added

- Gestão dedicada de dívidas com parcelas mensais, valor restante calculado e
  previsão consolidada; dívidas antigas podem receber um plano finito após
  aplicar as migrations indicadas nas notas da versão.

### Fixed

- Ícones Aero mais legíveis, resumo financeiro e cards Cartucho corrigidos;
  listas de categorias e jogos em coluna no celular.
- A carga geral de Finanças funciona enquanto a atualização de planos de dívida
  ainda não foi aplicada ao Supabase.

## [0.4.0] - 2026-11-17

### Added

- Tema Vaporwave 95 com interface de janelas clássicas, textura pixelada e
  navegação móvel própria.
- Painel de dívidas com planos parcelados, restante por dívida, confirmação de
  pagamentos e previsão das parcelas; o cadastro depende da migration financeira
  indicada nas notas da versão.

### Fixed

- Ajustes de responsividade em jogos, gráficos, compras e navegação nas dez
  aparências, inclusive telas de 320 px.
- Capturas do site passam a apresentar Vaporwave 95 em desktop e mobile.

## [0.3.0] - 2026-11-17

### Added

- Identidade Frutiger Aero selecionável em um toque, com paisagem vetorial,
  vidro, navegação com ícones e layouts próprios em todas as áreas do app.

## [0.2.0] - 2026-11-17

### Added

- Distribuição Windows x64 e Android ARM64 pelo GitHub Releases, com assinatura
  Android persistente, SHA-256 e builds automatizados.
- Site público na identidade Feira, com capturas demonstrativas reais do app.

- Documentação de arquitetura, contratos, versionamento e continuidade entre
  agentes e sessões.
- Tela inicial com panorama de finanças, compras e preços recentes.
- Histórico de preços, planejamento financeiro com recorrências, dívidas e
  limites mensais, além do tema Cartucho selecionável em Ajustes.
- Esquema Supabase com RLS por conta, login e importação explícita da base SQLite.

### Changed

- Compras, jogos e finanças usam os adaptadores Supabase como persistência de
  negócio; SQLite permanece apenas como origem da migração conferida.
- Navegação e formulários foram reorganizados para uso em telas estreitas.

### Fixed

- Cadastro de categoria dentro dos formulários financeiros e remoção confirmada
  de lançamentos avulsos.
- Registro dos comandos financeiros no executável desktop e duplicação de
  pontos no histórico de preços.

## [0.1.0] - 2026-09-16

### Added

- Base Tauri, React e TypeScript.
- Persistência SQLite de categorias, itens e links de lojas.
- Upserts orientados por UUID e consultas opcionais de preço.

<!-- Adicione os links de comparação quando o repositório remoto estiver definido. -->
