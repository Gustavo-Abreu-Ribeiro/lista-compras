# FIN-UX-001 — Planejamento financeiro mais claro e responsivo

## Visão

Planejamento abre um painel compacto que responde o que já está previsto e
quanto falta pagar. Cadastro rápido e uma lista curta ficam nesse painel; a
consulta completa abre em `/finance/debts`. Na tela dedicada, cada dívida fica
recolhida e expande para uma grade mensal de pagamentos.

## Arquitetura e limites

- Preservar `FinanceLayout → src/features/finance/api.ts → Supabase`.
- A interface apresenta cálculos retornados pela camada financeira; não soma
  ou amortiza dívida por conta própria.
- Manter a distinção entre valor original, parcela com vencimento e transação
  realizada. O restante vem somente das parcelas pendentes.
- O usuário define quantidade e valor por parcela. O total planejado (`quantidade
  × valor`) deve ser no mínimo igual ao saldo informado; a interface informa o
  total do plano e o restante das parcelas após cada confirmação. O valor
  original permanece como histórico.
- Em telas pequenas, priorizar resumo e ações principais; formulários abrem sob
  demanda, dívidas expandem individualmente e listas não criam colunas estreitas.

## Roadmap

1. Reorganizar Planejamento em painel de compromissos, projeção e dívidas.
2. Manter somente resumo e cadastro rápido no Planejamento; abrir a gestão
   completa em uma rota dedicada.
3. Permitir expandir uma dívida para consultar e marcar as parcelas mensais.
4. Projeção futura deve percorrer os meses e explicar cada entrada, saída e
   saldo estimado sem reescrever lançamentos históricos.

## Aceite

- Planejamento não mostra todos os formulários abertos por padrão.
- A pessoa encontra uma lista curta no Planejamento e abre a rota dedicada para
  expandir apenas a dívida que quer consultar.
- Uma parcela pode ser confirmada uma única vez pelo fluxo transacional atual.
- Projeção de vários meses exibe a base e os compromissos de cada mês.
- Em 320–480 px, ações, listas e projeções são legíveis sem rolagem horizontal.
- Criar a dívida e suas parcelas futuras atomicamente; dados existentes devem
  permanecer intactos. A soma das parcelas nunca pode ser menor que o saldo
  informado no cadastro.

## Incremento em curso

ADR-005 registra a regra definida pelo usuário. A migração aditiva cria as
parcelas futuras em uma transação e rejeita total inferior ao valor da dívida.
O Planejamento mostra resumo e cadastro rápido; `/finance/debts` apresenta total,
restante, grade de checkboxes e previsão por mês. Dívidas do modelo antigo podem
receber um plano uma única vez.

`npm run build`, `npm run test:finance` e `cargo check --locked` passaram. Em
2026-11-18, o usuário confirmou que aplicou as migrations 202611170002 e
202611180001 no Supabase. Ainda faltam validação autenticada de RPC/cadastro,
conversão de dívida antiga, pagamento e previsão, além de captura visual mobile
e formulários em diálogo.
