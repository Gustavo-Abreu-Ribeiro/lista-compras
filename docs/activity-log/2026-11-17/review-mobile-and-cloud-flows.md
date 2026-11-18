# Revisão: fluxos cloud e primeiros ajustes mobile

- O gráfico financeiro agora inclui o mês selecionado e recarrega com os totais
  após movimentações. Requisições antigas não substituem o mês atual. Falta
  validação autenticada de criação, exclusão e confirmação.
- Remoção de categoria informa contagens de itens e links em cascata antes da
  confirmação; Jogos exige confirmação antes de remover. Resumo mostra falha do
  Supabase e oferece nova tentativa.
- Jogos passou a usar `src/features/games/api.ts`; guia e playbook de frontend
  foram alinhados à fonte de dados Supabase.
- Cartucho usa cards de jogo em fluxo normal abaixo de 480 px. Barras, valores e
  grids financeiros foram ajustados para larguras pequenas; Aero usa uma coluna
  abaixo de 360 px. Fixture Chrome DevTools em 320/360/390/480 px para Jogos e
  Finanças, Cartucho/Aero, não apresentou rolagem horizontal; capturas de 320 e
  390 px foram inspecionadas. O app autenticado e as outras rotas continuam em
  REV-25.
- Compras descarta respostas antigas de itens e links após trocar a seleção;
  nomes longos de categoria, email e preço ganharam quebra no CSS mobile.
  Prova de atraso de rede pendente.
- Matriz adicional Chrome DevTools: Resumo, Compras, Ajustes e Login em Feira,
  Cartucho e Aero, 320/360/390/480 px. Overflow reproduzido em Compras com
  histórico de preço; removido o wrap de coluna e limitado o conteúdo do link.
  Todos os 48 cenários terminaram sem overflow. Capturas de 320 px inspecionadas.
  Cartucho recuperou o contraste das categorias e do atalho no Resumo, e nomes
  longos deixaram de dominar o título de Compras.
- Modais de Compras passaram a ficar acima da navegação fixa e a rolar dentro
  da viewport em telas baixas; teste com teclado virtual aberto ainda pendente.
- Cadastros de categoria, item e link em Compras ganharam bloqueio de reenvio,
  estado de gravação, erro contextual e preservação dos campos. Categoria criada
  junto de item é mantida por ID para tentativa posterior se o item falhar.
  Verificação autenticada com rede lenta e clique duplo continua em REV-04.
- Verificações: `npm run build`, `npm run test:finance` e `git diff --check`
  passaram. `cargo check` já passou no incremento REV-01; não houve mudança Rust.
