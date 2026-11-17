# ADR-004: Categorias, limites e confirmação de parcelas

- Status: Aceita
- Data: 2026-11-16

## Contexto

Na revisão de UX, categorias apareciam como uma configuração separada sem
explicação e limites podiam duplicar despesas já previstas. A ação de marcar
uma parcela paga também não refletia o pagamento no saldo real.

## Decisão

- Categorias são classificações opcionais separadas para renda e despesa; elas
  não representam contas nem mudam saldos.
- O formulário permite criar uma categoria no próprio contexto e seleciona a
  nova categoria para o lançamento, recorrência ou parcela em curso.
- Reserva de limite contabiliza apenas o valor ainda não coberto por gastos
  realizados e compromissos explícitos categorizados.
- Confirmar pagamento de parcela grava o gasto realizado e marca a parcela paga
  atomicamente; uma coluna única de referência impede duplicação.

## Consequências

- O saldo projetado, o reservado e o limite restante evitam contar duas vezes
  uma mesma despesa prevista.
- Lançamentos sem categoria continuam válidos; o seletor informa isso como
  opção e explica a finalidade da classificação.
- Pagamentos de parcelas refletem imediatamente no saldo. O usuário não precisa
  registrar uma segunda movimentação manual.
- A migração adiciona apenas coluna e índice, preservando transações existentes.

## Alternativas consideradas

- Tornar categoria obrigatória: aumenta atrito e atrapalha registros rápidos.
- Subtrair todo o limite além das despesas previstas: reserva o mesmo dinheiro
  duas vezes e reduz artificialmente o valor seguro.
- Pedir que o usuário marque a parcela e depois cadastre outro gasto: duplica
  passos e facilita divergências entre estado e saldo.
