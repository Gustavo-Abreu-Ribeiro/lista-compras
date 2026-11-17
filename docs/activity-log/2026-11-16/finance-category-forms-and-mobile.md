# Correção de formulários e listas financeiras

- O seletor de categoria criava um formulário dentro de outros formulários de
  lançamento, recorrência, parcela e limite. Foi substituído por controles sem
  formulário para evitar submissão acidental do formulário pai.
- Lançamentos avulsos agora podem ser removidos com confirmação. Itens ligados
  a parcelas ou recorrências ficam protegidos para preservar o planejamento.
- Ajustada a quebra das linhas e ações na lista de lançamentos em telas estreitas.
- Verificação: `npm run build`, `cargo check --manifest-path src-tauri/Cargo.toml`
  e `git diff --check` passaram. O runtime visual não foi executado.
