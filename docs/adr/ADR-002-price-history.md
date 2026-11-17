# ADR-002: Histórico local e atualização periódica de preços

## Status

Aceito — 2026-11-16

## Contexto

O app guarda somente o preço atual de cada link de loja. Um gráfico de variação
precisa de observações com data. Consultas externas podem falhar, demorar,
retornar valores diferentes por região e não garantem disponibilidade ou tempo
real.

## Decisão

- Criar histórico local por link de loja e preservar os valores atuais existentes.
- Registrar uma observação quando um link é criado com preço e quando uma
  atualização automática encontra um novo valor.
- Enquanto o app estiver aberto, verificar links HTTP(S) salvos no máximo uma
  vez por dia, iniciando a fila na abertura e reavaliando links elegíveis a cada
  hora, em lotes de até três. A verificação usa o extrator por URL já existente,
  tem timeout e não envia uma busca geral por nome do produto a um provedor externo.
- Não obter preços em background quando o app estiver fechado. Não prometer
  atualização em tempo real; o gráfico representa observações concluídas.
- Mostrar estado e horário da última observação, e manter a lista local
  utilizável quando a rede ou a extração falhar.

## Consequências

- A evolução do SQLite é aditiva e mantém links e preços existentes.
- O gráfico é local por loja/link; não compara lojas como se fossem o mesmo
  produto nem presume que preços extraídos sejam ofertas verificadas.
- Links sem URL utilizável não são atualizados automaticamente.
- Frequência superior à diária, buscas por Google Shopping e verificações com o
  app fechado exigem nova decisão de produto, privacidade e custo.
