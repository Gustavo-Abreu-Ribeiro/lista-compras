# Gestão dedicada de dívidas

O Planejamento financeiro foi reduzido a resumo, três registros recentes,
cadastro rápido e acesso à rota `/finance/debts`. A rota dedicada apresenta
total cadastrado, restante, compromisso do mês, cards recolhidos e uma grade de
parcelas com checkboxes. A previsão agregada soma as parcelas pendentes de todas
as dívidas por mês.

O campo de atualização manual de saldo não participa da nova experiência. O
valor original permanece histórico e o restante é calculado pelas parcelas
pendentes. Registros do modelo antigo, como uma dívida criada sem parcelas,
recebem o formulário “Definir parcelamento”. A migration
`202611180001_attach_legacy_debt_plans.sql` cria as parcelas, pausa a recorrência
antiga correspondente e remove apenas ocorrências futuras ainda previstas;
lançamentos realizados são preservados.

`npm run build`, `npm run test:finance`, `cargo check` e
`node scripts/release/check-version.mjs` passaram. O QA Edge isolado aprovou
52 cenários, incluindo 12 combinações da rota de dívidas em mobile. As
migrations ainda não foram aplicadas ao projeto
Supabase: o ambiente possui somente URL e chave publicável, que não autorizam
DDL. A prova autenticada de cadastro, conversão e pagamento permanece pendente.
