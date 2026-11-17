# Tema Cartucho

- Adicionada oitava opção em Ajustes > Aparência, ativada com um clique e
  preservada em `localStorage`.
- Navegação lateral numerada no desktop, navegação compacta em janelas estreitas,
  painel dominante no Início, painéis e controles chanfrados nas demais telas.
- Usada em Jogos a moldura vertical fornecida pelo usuário; a referência
  horizontal orientou linhas, contraste e detalhes gráficos do tema.
- O tema passa a ser restaurado na inicialização, inclusive em Início e Finanças.
- As regras e limitações visuais estão em `docs/DESIGN.md`.
- `npm run build` passou após a inclusão do tema; verificação visual do runtime
  Tauri continua necessária.
- Prévia headless de login em 500 px salva em
  `docs/screenshots/depois/cartucho-login-mobile.png`. As telas autenticadas
  ainda precisam de revisão visual no app com dados reais.
