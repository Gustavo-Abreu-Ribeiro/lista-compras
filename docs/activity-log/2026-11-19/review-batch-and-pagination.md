# REV-16/17 — leituras completas e em lote

O Resumo passou a buscar itens e links por tabela, com paginação e ordem por
`id`. O fluxo anterior fazia uma consulta por categoria e uma por item. Com
20 categorias e 200 itens dentro de uma página, a etapa cai de 220 para duas
consultas, ainda sem medição em uma sessão autenticada.

Saldo, histórico, orçamento, dívidas e listagens mensais agora percorrem todas as páginas
relevantes de contas, transações, parcelas, metas e limites. A leitura exige
contagem exata; resposta parcial ou mudança de
contagem produz erro em vez de total incorreto.

Prova local: `node --test src/services/readAllPages.test.mjs` passou com 1.201
linhas, limite simulado de 200 por resposta, interrupção e mudança de contagem.
`npm run build` passou. Falta medir o Resumo e conferir os totais no Supabase
autenticado acima do limite real de linhas.
