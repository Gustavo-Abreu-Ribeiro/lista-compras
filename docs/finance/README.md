# Financeiro pessoal

Esta é a especificação canônica do módulo financeiro da Lista de Compras. Ela
preserva a visão do pedido do produto: fornecer clareza, previsibilidade e
simulações úteis — nunca julgamento — a partir de dados locais do usuário.

## Perguntas que o produto deve responder

- Quanto tenho agora, quanto está comprometido e quanto posso gastar com
  segurança?
- Quanto entra, sai, é investido e sobra no mês atual?
- Quais contas, parcelas e metas afetam os próximos meses?
- Como uma compra, uma mudança de renda ou um imprevisto afeta o futuro?
- Qual é o ritmo necessário e possível para atingir cada objetivo?

## Conceitos inegociáveis

| Conceito | Significado |
| --- | --- |
| Dinheiro real | saldo efetivamente disponível nas contas, com lançamentos realizados |
| Dinheiro comprometido | contas, parcelas e despesas previstas que já têm destino |
| Dinheiro projetado | estimativa futura baseada em eventos previstos e regras explícitas |
| Dinheiro seguro para gastar | saldo real menos compromissos do período e reservas mínimas |

O sistema deve diferenciar realizado, previsto, recorrente, parcelado,
reservado, investido e transferido. Transferência nunca é despesa. Compra
parcelada compromete cada mês pela respectiva parcela, sem contar o total todo
no mês da compra.

## Limite atual

O módulo está em fundação de dados e cálculo. A especificação descreve o
produto-alvo; só os itens marcados como entregues no
[estado atual](../state/CURRENT.md) devem ser considerados disponíveis.

## Navegação

- [Arquitetura](architecture.md)
- [Contrato de cálculos](calculation-contract.md)
- [Roadmap por fases](roadmap.md)
- [ADR-001: valores em centavos](../adr/ADR-001-financial-values-in-cents.md)
