# FIN-002 — Fase 2 do Financeiro (Planejamento Mensal)

## Objetivo

Permitir planejamento mensal de receitas e despesas fixas, acompanhamento de dívidas, orçamento e leitura rápida da situação financeira em telas pequenas.

## Escopo e estado

Orçamentos, recorrências, dívidas básicas, gráfico mensal e navegação mobile foram implementados. Orçamentos e gráfico usam dados agregados localmente; a consulta histórica do gráfico é somente leitura.

## Planejado nesta frente

- Tabelas locais `financial_recurrences` e `financial_debts`, com migração aditiva.
- Orçamentos (`financial_budgets`), que já existe no SQLite mas não tem interface.
- Atualização do cálculo de `committed` e `projected` para incluir as ocorrências recorrentes materializadas.
- Comandos Tauri para gerenciar renda/gastos recorrentes, saldos de dívida e confirmação de lançamento.
- Navegação financeira por visão geral, planejamento e lançamentos, com gráfico de seis meses.
- UI de orçamento mensal por categoria.

## Critérios de aceite

1. O usuário pode cadastrar renda e despesa recorrentes, pausar regras e confirmar ocorrências sem duplicação.
2. Dívidas podem ser cadastradas com plano finito; o restante é calculado pelas
   parcelas pendentes e cada checkbox pago registra o gasto correspondente.
3. A tela mobile separa resumo, planejamento e lançamentos e mostra tendência mensal.
4. Orçamentos por categoria podem ser salvos por mês e exibem gasto/limite restante.
5. Prova automatizada específica de recorrências e migração continua como próximo passo.
