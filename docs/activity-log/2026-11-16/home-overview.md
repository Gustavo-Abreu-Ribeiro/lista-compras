# Panorama inicial do app

## Mudanças

- A rota `/` agora é uma tela inicial com resumo financeiro do mês, parcelas
  pendentes, quantidade de itens/categorias e atalhos para as áreas do app.
- Compras passou para `/shopping`; Início foi incluído na navegação principal.
- A tela inicial exibe preços adicionados recentemente aos links de loja já
  salvos. Ela não executa buscas externas automáticas nem chama esses preços de
  promoções verificadas.
- Os dados são carregados pelos adaptadores existentes e falhas parciais não
  impedem a navegação entre áreas.

## Verificação

- `npm run build` passou.
- Fluxo visual nativo ainda precisa de revisão manual no app Tauri.
