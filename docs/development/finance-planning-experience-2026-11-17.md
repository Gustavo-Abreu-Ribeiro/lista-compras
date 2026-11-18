# FIN-UX-001 — Planejamento financeiro mais claro e responsivo

## Visão

Planejamento abre um painel que responde o que já está previsto, quais dívidas
estão ativas e como os compromissos afetam os próximos meses. Formulários de
recorrência, parcela e dívida ficam atrás de ações explícitas em diálogos
compactos, em vez de ocupar a tela principal. A lista de dívidas é recolhível
por registro para continuar navegável quando crescer.

## Arquitetura e limites

- Preservar `FinanceLayout → src/features/finance/api.ts → Supabase`.
- A interface apresenta cálculos retornados pela camada financeira; não soma
  ou amortiza dívida por conta própria.
- Manter a distinção entre saldo devedor acompanhado manualmente, recorrência
  mensal, parcela com vencimento e transação realizada.
- O usuário define quantidade e valor por parcela. O total planejado (`quantidade
  × valor`) deve ser no mínimo igual ao saldo informado; a interface informa o
  total do plano e o restante das parcelas após cada confirmação. O saldo do
  credor permanece manual.
- Em telas pequenas, priorizar resumo e ações principais; formulários abrem sob
  demanda, dívidas expandem individualmente e listas não criam colunas estreitas.

## Roadmap

1. Reorganizar Planejamento em painel de compromissos, projeção e dívidas.
2. Mover cadastros para diálogos acionados por botões claros.
3. Permitir expandir uma dívida para consultar pagamentos e confirmar a
   ocorrência do mês sem presumir amortização; atualizar saldo devedor conforme
   o extrato do credor.
4. Projeção futura deve percorrer os meses e explicar cada entrada, saída e
   saldo estimado sem reescrever lançamentos históricos.

## Aceite

- Planejamento não mostra todos os formulários abertos por padrão.
- A pessoa encontra as dívidas ativas em uma lista curta e expande apenas a que
  quer consultar.
- Uma parcela pode ser confirmada uma única vez pelo fluxo transacional atual.
- Projeção de vários meses exibe a base e os compromissos de cada mês.
- Em 320–480 px, ações, listas e projeções são legíveis sem rolagem horizontal.
- Criar a dívida e suas parcelas futuras atomicamente; dados existentes devem
  permanecer intactos. A soma das parcelas nunca pode ser menor que o saldo
  informado no cadastro.

## Incremento em curso

ADR-005 registra a regra definida pelo usuário. A migração aditiva cria as parcelas futuras em uma transação, rejeita total inferior ao saldo e mantém o saldo do credor manual. A primeira camada de interface recebe número/valor de parcelas, mostra total e diferença, recolhe cadastros e agrupa cada dívida em uma lista expansível com pagamentos. O quadro de seis meses informa saídas de dívidas sem apresentá-las como previsão completa de renda e despesas.

`npm run build`, `npm run test:finance` e `cargo check --locked` passaram. A migração ainda não foi aplicada em Supabase; validação de RPC/pagamento, captura visual mobile e formulários em diálogo permanecem como próximos passos.
