# Estado atual da Lista de Compras

> Última verificação documental: 2026-11-17
>
> Este é um resumo para retomada. Código, testes e comandos reproduzíveis são a
> prova do comportamento da revisão atual.

## Implementado

- Site de apresentação independente em `website/`, com identidade padrão Feira,
  cinco prints reais dos componentes com dados fictícios, galeria acessível,
  paletas de demonstração, recursos, FAQ e consulta de instaladores nas releases
  públicas. Build frontend e QA Chrome em 1440/768/390/320 px passaram. GitHub
  Pages habilitado para Actions; publicação do commit ainda em verificação.

- Aplicativo Tauri 2 com frontend React/TypeScript e rotas base consolidadas.
- A rota inicial `/` apresenta um panorama local de saldo real, comprometimento e parcelas do mês, volume da lista de compras, preços salvos recentemente e atalhos para Compras, Jogos e Finanças.
- A experiência principal de compras foi unida à interface principal (rota padrão `/`), removendo a tela introdutória desnecessária.
- Navegação principal compartilhada entre Compras, Jogos e Finanças; Ajustes fica acessível como destino secundário. Em telas estreitas, as áreas principais usam uma barra inferior persistente.
- Identidade visual transversal parte de uma caderneta de casa: marca de cesta em SVG, contrastes de feira, etiquetas e divisórias. Oito aparências podem ser escolhidas em Ajustes; Cartucho troca também a navegação, composição dos painéis e apresentação dos jogos.
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
