# Fundação documental e continuidade de agentes

## Contexto

O repositório continha a base Tauri/React/Rust, mas apenas README de template.
Não havia regras persistentes de arquitetura, versão ou retomada entre agentes.

## Mudança

- Documentada a arquitetura existente e seus limites reais.
- Adicionados guia para agentes, estado atual, workboard e playbooks.
- Definidos contratos, contribuição, Git, SemVer e changelog.
- Substituído o README de template por orientação de uso e desenvolvimento.

## Validação

- Revisão dos caminhos de código, comandos Tauri, esquema e scripts declarados.
- `git diff --check` concluído sem erros de whitespace.
- `npm run build` não pôde concluir porque `tsc` não está disponível no ambiente.
- `cargo check --manifest-path src-tauri/Cargo.toml` não pôde iniciar porque
  `cargo` não está instalado ou não está no `PATH` do ambiente.

## Fora de escopo

Esta alteração não implementa interface de lista, testes, sincronização,
autenticação, integração efetiva com Supabase nem nova consulta de preços.
