# Arquitetura financeira

O módulo é isolado da lista de compras e usa Supabase para persistência. Sua integração
direta inicial é a análise de impacto de um desejo ou produto, nunca a mistura
de tabelas ou regras de domínio.

```text
FinanceLayout / componentes de finanças
              |
              v
src/features/finance/api.ts  (adapter remoto)
              |
              v
Supabase Postgres + RLS  --  cálculos agregados / funções transacionais
```

## Responsabilidades

| Camada | Responsabilidade |
| --- | --- |
| UI | capturar intenção, apresentar explicações e simulações; não calcular saldo por conta própria |
| Adaptador TypeScript | nomear e tipar chamadas autenticadas ao Supabase |
| Supabase Postgres | fatos financeiros, configurações, histórico e isolamento por usuário |
| Funções SQL transacionais | operações que alteram várias linhas como uma unidade |
| Camada de cálculo | calcular saldo, comprometimento, projeções, orçamento e impacto |

## Domínios

O módulo cresce por fronteiras explícitas: contas, categorias, lançamentos,
recorrências, contas a pagar, parcelas, investimentos, metas, orçamentos,
projeções, análises, dívidas, notificações e integração com desejos.

`financial_transactions` registra fatos ou previsões. `financial_recurrences`
guarda regras mensais; ocorrências são materializadas como transações previstas
com chave única por regra e mês. `financial_installments` representa
compromissos mensais futuros, inclusive pagamentos vinculados a uma dívida.
`financial_debts` registra o valor original informado. O plano de parcelas
acompanha o total programado e o restante, calculado pelas parcelas pendentes.
Metas não movem dinheiro sozinhas: a contribuição só ocorre
mediante lançamento confirmado pelo usuário.

## Regras de evolução

- A listagem mensal de parcelas usa somente colunas do schema inicial. O vínculo
  `debt_id` é lido separadamente pelo planejamento; a migração de planos pendente
  não deve impedir a carga de Início ou do restante de Finanças. Sem essa migração,
  o cadastro de planos permanece indisponível, sem fallback de persistência.
- Valores monetários persistidos são inteiros em centavos.
- Datas são ISO `YYYY-MM-DD`; relatórios usam o mês `YYYY-MM`.
- Alterações de salário, categoria ou regra futura não podem reescrever fatos
  ou projeções históricas já confirmadas.
- Integrações bancárias futuras devem entrar como importadores que produzem
  lançamentos normalizados; não terão acesso direto à UI ou a cálculos.
- Cálculos devem ficar em helpers tipados do adapter ou em funções SQL quando a
  operação exigir atomicidade. A UI apenas formata o resultado.
