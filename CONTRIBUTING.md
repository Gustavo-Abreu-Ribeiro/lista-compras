# Como contribuir

O projeto evolui por incrementos pequenos, verificáveis e documentados.

1. Leia [AGENTS.md](AGENTS.md).
2. Consulte [estado atual](docs/state/CURRENT.md) e [workboard](docs/state/WORKBOARD.md).
3. Inspecione código, contratos e documentação afetados.
4. Defina a menor entrega útil e a evidência de funcionamento.

## Commits e versões

Use Conventional Commits: `feat`, `fix`, `docs`, `refactor`, `test`, `build`,
`ci` e `chore`. Detalhes de SemVer, branches, tags e release estão em
[docs/versioning.md](docs/versioning.md).

## Validação

| Área | Verificação mínima |
| --- | --- |
| React/TypeScript | `npm run build` |
| Rust/Tauri | `cargo check --manifest-path src-tauri/Cargo.toml` |
| Integração | ambas e `npm run tauri dev` quando viável |
| Documentação | links revisados e `git diff --check` |

Ao concluir um incremento significativo, atualize estado/workboard quando
necessário e crie um registro em `docs/activity-log/YYYY-MM-DD/` com mudança,
motivo, validação e limites de escopo.
