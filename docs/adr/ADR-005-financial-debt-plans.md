# ADR-005: Planos de pagamento de dívidas

- Status: Aceita
- Data: 2026-11-17

## Contexto

O acompanhamento atual mantém o saldo da dívida manual e trata pagamento
mensal como recorrência sem término. Isso não representa com clareza uma dívida
parcelada com quantidade definida, total programado e pagamentos confirmáveis.

## Decisão

- O usuário informa saldo atual, número de parcelas, valor por parcela e primeiro
  vencimento. `quantidade × valor da parcela` deve ser maior ou igual ao saldo
  atual cadastrado; total inferior é rejeitado.
- Cada pagamento é um registro de parcela vinculado à dívida, criado em uma RPC
  transacional. A soma dos pagamentos pendentes mostra quanto falta no plano; a
  soma de todas as parcelas mostra o total programado.
- O saldo devedor mostrado pelo credor continua sendo atualizado manualmente.
  Confirmar uma parcela registra o gasto e sua baixa atomicamente, mas não
  presume amortização, juros ou quitação no saldo do credor.
- O plano parcelado substitui a recorrência automática para aquela dívida, para
  não contar o mesmo pagamento duas vezes. Recorrências existentes permanecem
  intactas e editáveis como hoje.
- Mudanças de esquema são aditivas e seguras para contas existentes.

## Consequências

Projeções consideram cada parcela no mês de vencimento; parcelas pagas deixam
de compor o saldo pendente e passam a contribuir como gasto realizado. A
diferença entre saldo informado e total programado fica visível como acréscimo
do plano, sem ser classificada automaticamente como juros.
