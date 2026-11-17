# Changelog

Mudanças relevantes seguem [Keep a Changelog](https://keepachangelog.com/pt-BR/)
e [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

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
