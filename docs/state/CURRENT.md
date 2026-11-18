# Estado atual da Lista de Compras

> Última verificação documental: 2026-11-18
>
> Este é um resumo para retomada. Código, testes e comandos reproduzíveis são a
> prova do comportamento da revisão atual.

## Implementado

- Release 0.5.0 publicada: commit `4913643`, CI 44299590153, Pages
  44299590134 e workflow Windows/Android/publicação 44299608785 passaram.
  Downloads públicos e botões do site conferidos; hashes em
  `docs/releases/0.5.0-verification.md`. O usuário confirmou a aplicação das
  duas migrations de dívidas em 2026-11-18; a prova autenticada permanece
  pendente em FIN-UX-001/CLOUD-001.

- FIN-UX-001 recebeu uma rota dedicada `/finance/debts`. O Planejamento mantém
  resumo e cadastro rápido; a rota mostra cada dívida recolhida, total original,
  total do plano, restante e checkboxes mensais. O restante vem das parcelas
  pendentes e cada baixa registra o gasto. Dívidas antigas sem parcelas recebem
  um formulário de conversão. Migrations aditivas implementadas e aplicação
  remota confirmada pelo usuário, sem prova de operação autenticada.
  `npm run build` passou em 2026-11-18.

- FIX-UI-001: ícones Aero brancos com sombra, resumo financeiro com espaços
  transparentes entre blocos e controles Cartucho contidos na arte. Categorias
  de Compras no Aero permanecem em coluna; listas de jogos Aero/Cartucho/Vaporwave
  usam uma coluna até 760 px. A consulta mensal não exige `debt_id`, permitindo
  carregar Início/Finanças no schema inicial; planos de dívida exigem as
  migrations cuja aplicação o usuário confirmou depois. Build, três testes
  financeiros e 40 cenários Edge
  com fixtures isoladas passaram. Evidência em
  `docs/activity-log/2026-11-18/reported-ui-fixes.md`; sem nova release desse
  incremento.

- REL-003 concluída: release 0.4.0 publicada a partir do commit
  `490071b4de0c09c51478c02cd098963cdb708c6b`, tag anotada `v0.4.0`, CI
  44220414797, release Windows/Android 44220473964 e Pages 44220414743 passaram.
  Downloads públicos, checksums, links do site e assinatura Android compatível
  com 0.3.0 foram conferidos; APK informa versionCode 4000. Provas em
  `docs/releases/0.4.0-verification.md`.

- REV-21: criado `.github/workflows/ci.yml`, acionado em pull requests e pushes
  para `main`, com teste financeiro, build frontend e `cargo check --locked`.
  Os três comandos passaram localmente; primeira execução hospedada ocorrerá no
  próximo push/PR.

- REV-01 da [revisão de confiabilidade](../development/project-review-2026-11-17.md)
  foi corrigido: parcelas mensais preservam o dia escolhido, limitado ao fim do
  mês quando necessário. Testes de calendário e centavos, `npm run build` e
  `cargo check` passaram em 2026-11-17. Gravação autenticada ainda segue a
  validação de runtime de CLOUD-001.
- A revisão de confiabilidade corrigiu as confirmações antes de remover
  categorias e jogos (REV-08/09), a mensagem cloud do Resumo com ação de recarga
  (REV-13), o adaptador de Jogos (REV-19) e o guia de agentes (REV-22).
  O gráfico financeiro passa a incluir o mês selecionado e participa da recarga
  após movimentações; prova autenticada de REV-06 ainda pendente.
- Compras descarta respostas antigas de itens e links após trocar a seleção;
  Finanças descarta cargas do mês anterior. Falta simular respostas atrasadas no
  app para concluir REV-05.
- Ajustes mobile em Jogos Cartucho, gráficos e valores financeiros foram medidos
  em fixtures Chrome de 320, 360, 390 e 480 px para Cartucho/Aero, sem rolagem
  horizontal nesses cenários. Outra matriz de 48 cenários cobriu Resumo,
  Compras, Ajustes e Login em Feira/Cartucho/Aero nas mesmas larguras; revelou
  e ajudou a corrigir overflow do histórico de preços em Compras. Todas essas
  fixtures terminaram sem overflow. Dados autenticados, demais aparências e
  dispositivos reais seguem em REV-25.
- QA final de responsividade: dez aparências, seis rotas e larguras 320/360/390/480
  passaram no Edge em 240 combinações, sem rolagem horizontal ou erros de
  navegador. Foram exercitados links de compras, cards de jogos, painel expansível
  de dívidas, navegação e login desconectado. Corrigida a navegação inferior do
  Vaporwave 95 em mobile. REV-25 continua aberta para dispositivo real e teclado
  virtual.
- Cadastros de categoria/item/link em Compras bloqueiam reenvio durante a
  gravação e mostram erro contextual preservando campos. REV-04 ainda exige
  prova com rede lenta, unicidade e clique duplo no app autenticado.
- Os modais de Compras agora recebem e restauram foco, contêm Tab/Shift+Tab,
  fecham com Escape e têm rótulo acessível na remoção de categoria. Build e
  teste financeiro passaram; validação manual de acessibilidade ainda pendente
  em REV-14.
- Resumo não apresenta falhas parciais de itens/preços como listas vazias ou
  parcelas indisponíveis como zero; adicionada tentativa de recarga dos preços.
  Build passou; erro simulado no runtime ainda pendente em REV-12.
- FIN-UX-001 está em curso: a interface e as migrations do plano finito estão
  implementadas; o usuário confirmou a aplicação das duas migrations no
  Supabase. As RPCs, cadastro, conversão e pagamento ainda precisam de prova
  autenticada. A interface continua a bloquear cadastro/conversão se detectar
  ausência do schema para não criar dados sem parcelas vinculadas.

- Frutiger Aero é uma das dez aparências, selecionável em um toque em Ajustes. Altera
  navegação, composição, superfícies e controles em todas as áreas, com paisagem
  vetorial local, dock móvel e persistência da preferência. Build e QA de seis
  rotas em 1440/768/390/320 px passaram. Incluído nos instaladores 0.3.0 publicados
  para Windows x64 e Android ARM64, com assinatura Android preservada. CI
  44141028050 passou; SHA-256 dos assets públicos e links no site foram
  conferidos. Veja `docs/design/frutiger-aero.md` e
  `docs/releases/0.3.0-verification.md`.

- Aero recebeu um passe visual com paisagem vetorial e janelas translúcidas; a
  aparência Vaporwave 95 usa barra de tarefas e controles clássicos sobre pôr do
  sol pixelado. O QA final mobile das dez aparências passou; conferência em
  dispositivo real permanece aberta em REV-25.

- Release pública 0.2.0 para Windows x64 (NSIS, sem Authenticode comercial) e
  Android ARM64 (APK assinado), com SHA-256. Os dois builds CI, assinatura APK,
  arranque do executável Windows e downloads públicos foram verificados. O site
  já reconhece os instaladores. Backup privado da chave Android fora do Git;
  instruções em `docs/releases/README.md` e evidência em
  `docs/releases/0.2.0-verification.md`. CRUD/RLS e dispositivos reais continuam
  com as pendências abaixo.

- Site de apresentação independente em `website/`, com identidade padrão Feira,
  capturas reais dos componentes com dados fictícios, galeria acessível com
  Feira/Cartucho/Frutiger Aero/Vaporwave 95, comparação de temas, recursos, FAQ e consulta de instaladores nas releases
  públicas. Build frontend e QA Chrome em 1440/768/390/320 px passaram. GitHub
  Pages publicou com sucesso em https://gustavo-abreu-ribeiro.github.io/lista-compras/;
  Revisão de texto/previews publicada pelo Pages 44145187004 (commit 0602d2e),
  com QA de todas as combinações e downloads 0.3.0 na URL pública. Estudo de
  nome/símbolo Caderno em `docs/brand/`, sem renomear o produto. Detalhes em
  `docs/product-site.md`.

- Aplicativo Tauri 2 com frontend React/TypeScript e rotas base consolidadas.
- A rota inicial `/` apresenta um panorama local de saldo real, comprometimento e parcelas do mês, volume da lista de compras, preços salvos recentemente e atalhos para Compras, Jogos e Finanças.
- A experiência principal de compras foi unida à interface principal (rota padrão `/`), removendo a tela introdutória desnecessária.
- Navegação principal compartilhada entre Compras, Jogos e Finanças; Ajustes fica acessível como destino secundário. Em telas estreitas, as áreas principais usam uma barra inferior persistente.
- Identidade visual transversal parte de uma caderneta de casa: marca de cesta em SVG, contrastes de feira, etiquetas e divisórias. Nove aparências podem ser escolhidas em Ajustes; Cartucho e Frutiger Aero trocam também navegação e composição dos painéis.
- Cadastro de item permite escolher uma categoria existente ou criar categoria e item no mesmo fluxo.
- Categorias ficam empilhadas verticalmente em telas pequenas; os links de loja só aparecem após selecionar um item.
- Finanças tem três destinos claros (Resumo, Planejar, Movimentar); categorias são opcionais e podem ser criadas dentro do formulário do lançamento. O resumo inclui gráfico realizado de seis meses e orientação inicial para cadastrar o saldo.
- Persistência de negócio em Supabase; o SQLite anterior não é inicializado e só é acessado por comandos explícitos de exportação/remoção da migração.
- Categorias, itens e links de lojas com UUID e timestamps.
- Criação, listagem, remoção e upsert por UUID expostos por comandos Tauri.
- Consultas auxiliares de preço por URL e Google Shopping/SerpApi.
- Histórico local de preços por link, com gráfico e verificação automática diária para até três links por hora enquanto o app está aberto.
- Cliente Supabase e rotas protegidas por Supabase Auth; adapters de compras, jogos, preços e finanças usam tabelas cloud com escopo do usuário.
- Fase 1 Financeira concluída: dashboard, cálculos financeiros, parcelas e metas mínimas.
- Fase 2 Financeira parcial: orçamento mensal por categoria sem dupla reserva, recorrências de renda/despesa, dívidas com saldo manual e parcela recorrente opcional. Confirmar pagamento de parcela também registra o gasto. Gráfico local de seis meses lê apenas movimentações realizadas.
- A entrada de dados fictícios foi removida de Finanças; a fixture permanece apenas dentro dos testes Rust. Teste financeiro isolado abriu SQLite temporário, aplicou migrações e validou leituras/escritas.
- O binário desktop agora usa o mesmo registro completo de comandos Tauri da biblioteca; isso corrige `Command list_financial_recurrences not found` e evita falha total da recarga financeira. Reiniciar o app é necessário; validação no runtime ainda pendente.
- A migração cloud aprovada no ADR-005 foi implementada no frontend e backend. O usuário aplicou o schema inicial; login, RLS e CRUD ainda aguardam prova completa em runtime. Importação local é por instalação e a exclusão da cópia depende de confirmação explícita.
- Revisão financeira: categorias opcionais podem ser criadas no próprio formulário; limites separam realizado/previsto/restante; quitação de parcela atualiza o saldo e o estado em conjunto. Build TypeScript e checagem Rust passaram; UX visual no runtime segue pendente.
- Correção financeira em andamento: seletor de categoria deixou de criar formulário aninhado; lançamentos avulsos agora podem ser removidos com confirmação. Lançamentos de parcelas/recorrências permanecem ligados ao planejamento.
- Dados financeiros antigos da demonstração podem ser apagados somente se a fixture original completa estiver intacta e sem vínculos externos; o usuário confirma a ação e a exclusão revalida tudo dentro de transação. Nenhuma limpeza ocorre ao abrir o app.
- O formulário para cadastrar conta/saldo fica recolhido por padrão na área de contas; com conta existente, a ação passa a se chamar “Adicionar conta”. O convite inicial só aparece enquanto não há conta, lançamento ou recorrência.

## Limites verificados

- O SQL Editor confirmou sucesso na aplicação do schema; ainda falta validar isolamento RLS e fluxos completos no runtime.
- O módulo financeiro realiza controle manual e não utiliza Open Finance.
- Login usa Supabase Auth. Clerk não faz parte da implementação atual.
- A atualização de preços não é em tempo real garantido; depende de links acessíveis e da extração conseguir ler o valor.

## Próximo passo sugerido

Aplicar a migration cloud, testar Auth/RLS e fluxos principais, importar a base
local e validar as contagens antes de remover a cópia SQLite deste dispositivo.
