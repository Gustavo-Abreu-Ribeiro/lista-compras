# REV-18 — recarga ao retomar

Resumo, Compras, Jogos, Finanças e Dívidas passaram a recarregar após a janela
ou aba voltar de um período sem foco ou visibilidade. O mecanismo evita duas
recargas quando os eventos de retorno chegam juntos. Compras revalida a
seleção; Jogos e Dívidas descartam respostas antigas.

`npm run test:resume` passou com eventos de foco/visibilidade simulados e
cancelamento da inscrição. `npm run build` passou. A fixture visual foi
ajustada para responder às consultas paginadas do incremento REV-16/17;
`scripts/site/verify-reported-ui.mjs` aprovou 52 cenários no Edge. A recarga de
Compras também descarta respostas iniciadas antes de uma troca de seleção.
O cenário entre dois dispositivos ainda não foi executado.
