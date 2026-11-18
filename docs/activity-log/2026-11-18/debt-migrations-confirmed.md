# Aplicação das migrations de dívidas confirmada

O usuário confirmou em 2026-11-18 que aplicou ao Supabase:

- `202611170002_financial_debt_installment_plans.sql`;
- `202611180001_attach_legacy_debt_plans.sql`.

O handoff, o estado atual, o workboard e o registro da release 0.5.0 foram
atualizados para separar esta confirmação da validação em sessão autenticada.
Não houve execução de DDL nesta etapa. Ainda é preciso testar cadastro,
conversão de uma dívida antiga, pagamento de parcelas e previsão mensal em uma
conta real.
