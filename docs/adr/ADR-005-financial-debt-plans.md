# ADR-005: Planos de pagamento de dívidas

- Status: Aceita
- Data: 2026-11-17

## Contexto

O acompanhamento atual mantém o saldo da dívida manual e trata pagamento
mensal como recorrência sem término. Isso não representa com clareza uma dívida
parcelada com quantidade definida, total programado e pagamentos confirmáveis.

## Decisão

- O usuário informa o valor total da dívida, número de parcelas, valor por
  parcela e primeiro vencimento. `quantidade × valor da parcela` deve ser maior
  ou igual ao valor total cadastrado; total inferior é rejeitado.
- Cada pagamento é um registro de parcela vinculado à dívida, criado em uma RPC
  transacional. A soma dos pagamentos pendentes mostra quanto falta no plano; a
  soma de todas as parcelas mostra o total programado.
- O valor total cadastrado é histórico e não muda. O valor restante é sempre a
  soma das parcelas pendentes. Confirmar uma parcela registra o gasto e sua
  baixa atomicamente; a interface não oferece ajuste manual do restante.
- Dívidas criadas pelo modelo anterior podem receber um plano uma única vez.
  Ao converter, a recorrência automática criada pelo fluxo antigo é pausada e
  suas ocorrências futuras ainda previstas são removidas para evitar contagem
  dupla. Fatos já realizados permanecem no histórico.
- O plano parcelado substitui a recorrência automática para aquela dívida, para
  não contar o mesmo pagamento duas vezes. Recorrências existentes permanecem
  intactas e editáveis como hoje.
- Mudanças de esquema são aditivas e seguras para contas existentes.

## Consequências

Projeções consideram cada parcela no mês de vencimento; parcelas pagas deixam
de compor o restante do plano e passam a contribuir como gasto realizado. A
diferença entre valor da dívida e total programado fica visível como acréscimo
do plano, sem ser classificada automaticamente como juros.
