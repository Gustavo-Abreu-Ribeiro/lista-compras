# Revisão: estados de erro no Resumo

- Consultas por categoria e item passaram a preservar resultados parciais sem
  disfarçar as falhas como listas vazias.
- Totais indisponíveis usam traço, falha ao carregar preços recentes oferece
  tentativa explícita e falha nas parcelas não aparece como saldo zero.
- `npm run build` e `npm run test:finance` passaram. Falta simular erro Supabase
  no runtime; REV-12 segue aberta até essa prova.
