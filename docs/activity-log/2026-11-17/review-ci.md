# Revisão: CI por pull request

- Adicionado `.github/workflows/ci.yml` para validar pull requests e pushes em
  `main` com `npm run test:finance`, `npm run build` e `cargo check --locked`.
- Os três comandos foram executados localmente e passaram.
- REV-21 concluída; a primeira execução hospedada ocorrerá no próximo PR/push.
