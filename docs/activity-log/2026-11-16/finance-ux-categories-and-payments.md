# Clareza de categorias e pagamentos financeiros

- Categorias passaram a explicar sua função, diferenciar renda de gasto e podem
  ser criadas junto do lançamento, recorrência, parcela ou limite mensal.
- Resumo mobile passa a priorizar dinheiro seguro, oferece entrada guiada e
  usa rótulos mais diretos para saldo e compromissos.
- Limites mensais mostram realizado, previsto e restante sem reservar novamente
  despesas já planejadas para a mesma categoria.
- Confirmar pagamento de parcela registra o gasto e atualiza a parcela em uma
  única transação SQLite.
- Verificação: `npm run build`, `cargo check --manifest-path src-tauri/Cargo.toml` e `git diff --check` passaram.
- Testes automatizados e validação visual no Tauri não foram executados nesta unidade.
- Próximo passo: validar os fluxos em tela estreita e cobrir os contratos com testes.
