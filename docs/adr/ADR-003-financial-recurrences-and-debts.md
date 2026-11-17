# ADR-003: Recorrências mensais e acompanhamento de dívidas

- Status: Aceita
- Data: 2026-11-16

## Contexto

O módulo financeiro precisava planejar salário e gastos fixos sem substituir
lançamentos locais, preservar o histórico e evitar compromissos duplicados.

## Decisão

- Guardar regras mensais em `financial_recurrences` e materializar cada regra
  ativa como uma transação planejada única por mês.
- Usar `(recurrence_id, recurrence_month)` como chave de idempotência. Pausar
  uma regra impede novas materializações e preserva previsões já existentes.
- Uma ocorrência planejada pode ser confirmada como realizada, mantendo a
  mesma linha e sua identidade.
- Acompanhar dívidas em `financial_debts` com saldo manual. Se houver parcela e
  vencimento informados, criar também uma recorrência de gasto. A baixa não
  altera automaticamente o saldo da dívida.
- Armazenar valores em centavos e evoluir SQLite com colunas/tabelas aditivas.

## Consequências

- Rendas recorrentes entram na projeção mensal e despesas recorrentes no
  comprometido por meio das transações planejadas.
- O usuário atualiza o saldo da dívida conforme o extrato do credor; não há
  inferência de juros, amortização ou quitação.
- Alterar uma regra não reescreve ocorrências já materializadas.
- A regra usa o último dia do mês quando o vencimento escolhido não existe.

## Alternativas descartadas

- Recalcular meses anteriores diretamente a partir da regra: alteraria o
  histórico quando o usuário mudasse salário ou despesa fixa.
- Abater a dívida automaticamente ao confirmar a parcela: saldo e encargos
  dependem do extrato real do credor e não podem ser presumidos.
