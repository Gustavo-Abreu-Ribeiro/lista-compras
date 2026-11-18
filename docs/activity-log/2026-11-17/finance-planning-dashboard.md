# FIN-UX-001 — painel e planos de pagamento

- Adicionada visão de compromissos de dívidas e valores previstos nos próximos
  seis meses; a legenda deixa claro que o quadro é somente de saídas de dívida.
- Cadastros de dívida parcelada e recorrência ficam recolhidos; cada dívida
  expande para mostrar saldo manual do credor, total programado, restante do
  plano e parcelas com confirmação de pagamento.
- Plano definido em ADR-005: usuário escolhe contagem/valor; o total não pode
  ser menor que o saldo registrado. Pagamentos não alteram saldo do credor.
- Migration adiciona `debt_id` e RPC atômica para criar dívida e parcelas; a UI
  bloqueia cadastro enquanto a migration não estiver disponível no Supabase.
- `npm run build`, `npm run test:finance` e `cargo check --locked` passaram.
  Validação da migration/RPC remota e QA visual mobile permanecem pendentes.
