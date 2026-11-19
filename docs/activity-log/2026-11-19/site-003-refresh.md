# SITE-003 — apresentação pública

A página ganhou abertura em verde profundo, texto introdutório mais marcante,
cartões das três áreas, transições de entrada e navegação lateral com roda de
progresso em telas largas. A rolagem permanece nativa. O conteúdo continua
visível sem animação, e a preferência por movimento reduzido é respeitada.

Prova local: `npm run build` passou. O verificador Edge em
`scripts/site/verify.mjs` aprovou 1600, 1440, 768, 390 e 320 px sem overflow,
roda lateral, teclado, galeria, 16 combinações tema/tela, estados dos downloads
e movimento reduzido. Capturas em `dist/site-qa/` foram inspecionadas; uma
lacuna causada pelo efeito de entrada foi corrigida e a matriz repetida.
