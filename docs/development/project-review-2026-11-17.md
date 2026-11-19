# Revisão do projeto — confiabilidade, experiência e evolução

Data: 2026-11-17. Escopo: revisão do repositório e acompanhamento das correções.
Os achados abaixo registram o estado observado na revisão; a lista de progresso
indica o que foi corrigido e comprovado depois dela.

Direção de marca complementar: [nome, posicionamento e ícone](../brand/direcao-de-marca.md).

## Progresso

Risque um item somente depois da implementação e da prova indicada no próprio
achado. O risco de REV-02 deve ser resolvido antes de remover qualquer SQLite.

- [x] ~~REV-01 — Parcelas ignoram o dia informado~~ — corrigido e testado em 2026-11-17.
- [ ] REV-02 — Comprovação antes de remover o SQLite
- [ ] REV-03 — Primeira importação em conta já utilizada
- [ ] REV-04 — Falhas de compras e envios repetidos (bloqueio e erros implementados; prova de rede lenta pendente)
- [ ] REV-05 — Respostas antigas após troca de seleção (proteção implementada; prova com respostas atrasadas pendente)
- [ ] REV-06 — Gráfico financeiro após movimentações (código corrigido; prova autenticada pendente)
- [ ] REV-07 — Recuperação de senha e retorno à rota
- [x] ~~REV-08 — Confirmação da cascata ao remover categoria~~ — contagens e cancelamento conferidos no código.
- [x] ~~REV-09 — Exclusão acidental de jogos~~ — confirmação antes da exclusão.
- [ ] REV-10 — Edição de registros
- [ ] REV-11 — Estorno de parcela
- [ ] REV-12 — Estados de erro no resumo e histórico
- [x] ~~REV-13 — Mensagem cloud no resumo~~ — erro Supabase e ação de recarga.
- [ ] REV-14 — Acessibilidade dos modais e ícones (foco, Escape, contenção de Tab e nome do botão de remoção implementados; prova manual pendente)
- [ ] REV-15 — Origem e qualidade do preço
- [ ] REV-16 — Consultas em lote no resumo (implementadas; medição autenticada pendente)
- [ ] REV-17 — Completude das agregações financeiras (paginação implementada e testada; prova no Supabase pendente)
- [ ] REV-18 — Atualização entre dispositivos (recarga ao retomar implementada; prova com dois dispositivos pendente)
- [x] ~~REV-19 — Adaptador Supabase para jogos~~ — componente usa `src/features/games/api.ts`.
- [ ] REV-20 — Testes do financeiro cloud
- [x] ~~REV-21 — CI geral por PR~~ — workflow criado para build, teste financeiro e `cargo check`; comandos equivalentes passaram localmente.
- [x] ~~REV-22 — Guia de agentes alinhado à arquitetura cloud~~ — guia e playbook corrigidos.
- [ ] REV-23 — CSP do Tauri
- [ ] REV-24 — Redução da superfície de regressão do financeiro
- [ ] REV-25 — Pente fino mobile em todas as telas e aparências (jogos e gráficos corrigidos; app real pendente)

### Incremento de REV-16/17 em 2026-11-19

- REV-16: o Resumo consulta itens e links por tabela, em páginas ordenadas por
  `id`, em vez de consultar uma vez por categoria e por item. Para 20 categorias
  e 200 itens dentro de uma página, as etapas passam de 220 consultas para duas.
  A contagem é estrutural; ainda falta medir na sessão autenticada e conferir
  o resultado com dados reais.
- REV-17: saldo, histórico de seis meses, orçamento mensal e listagens mensais
  e totais de dívidas percorrem todas as páginas relevantes de transações,
  contas, parcelas, metas e limites. O leitor usa a contagem exata e falha se receber apenas
  parte das linhas ou se a contagem mudar durante a leitura. Teste isolado com
  1.201 linhas e limite simulado de 200 por resposta passou, assim como os casos
  de resposta parcial e contagem alterada. `npm run build` passou. Ainda falta
  prova com mais linhas que o limite efetivo do Supabase autenticado.

### Incremento de REV-18 em 2026-11-19

Resumo, Compras, Jogos, Finanças e Dívidas recarregam os dados ao voltar à janela
ou aba depois de perdê-la de vista. Um retorno dispara uma recarga mesmo quando
`focus` e `visibilitychange` chegam juntos. Em Compras, a seleção é conferida
com as categorias e itens atualizados; remoções em outro dispositivo limpam a
seleção inválida. Jogos e Dívidas descartam respostas antigas durante a recarga.
`npm run test:resume` e `npm run build` passaram. Falta conferir a mudança entre
dois dispositivos reais e a recuperação de uma falha de rede no app autenticado.
Antes da distribuição 0.5.1, a recarga de Compras passou a descartar a resposta
se a categoria ou o item mudar durante a consulta. A fixture Edge com consultas
paginadas aprovou 52 cenários; a prova autenticada segue pendente.

### Prova de REV-01

`createFinancialInstallment` usa agora o dia do primeiro vencimento em cada mês,
limitado ao último dia quando necessário. `npm run test:finance` passou com dias
17, 29, 30 e 31, fevereiro bissexto, virada de ano e soma exata dos centavos.
`npm run build` passou. Essa prova cobre a geração das linhas; a gravação em uma
conta Supabase autenticada ainda depende da validação de runtime de CLOUD-001.

### Provas e limites do incremento seguinte

- REV-06: a recarga financeira agora inclui o histórico, e a janela de seis meses
  inclui o mês selecionado. Respostas antigas são descartadas. Falta provar criar,
  excluir e confirmar no app autenticado.
- REV-05: Compras descarta respostas antigas de itens/links e limpa a seleção
  anterior imediatamente; Finanças usa versão de carga e mês solicitado. Falta
  prova com respostas A atrasadas após selecionar B no app.
- REV-04: cadastros de categoria, item e link usam bloqueio síncrono de reenvio,
  indicação de gravação e erro contextual sem perder os campos. Falhas ao remover
  item/link chegam ao aviso da tela. Quando a categoria é criada junto do item,
  a seleção passa a usar seu ID antes de gravar o item; uma falha posterior não
  recria a categoria na tentativa seguinte. Faltam simulações de rede lenta,
  unicidade e clique duplo no app autenticado.
- REV-08 e REV-09: o código exige confirmação antes de remover categoria ou jogo.
  A categoria informa quantos itens e links serão removidos; cancelar retorna
  antes de chamar a exclusão. Sem dados reais alterados nesta verificação.
- REV-13: o Resumo informa falha do Supabase e oferece “Tentar novamente”.
- REV-12: o Resumo não converte mais falhas parciais de itens e preços em listas
  vazias indistinguíveis de ausência de dados; valores indisponíveis usam traço,
  preços recentes permitem nova tentativa e falhas de parcelas não exibem zero.
  A prova por falha simulada no runtime ainda está pendente.
- REV-12, incremento de 2026-11-18: a nova rota de dívidas também mostra traço
  nos totais de parcelas quando a migration falta; dívidas antigas sem plano
  exibem “A definir” no lugar de zero. Build aprovado. Ainda falta a falha
  simulada no Resumo para encerrar o achado.
- REV-14: modal de Compras recebe foco inicial, contém Tab/Shift+Tab, fecha com
  Escape e restaura foco ao sair; botão de remoção de categoria ganhou nome
  acessível. `npm run build` passou; teste manual de teclado e leitor de tela
  ainda necessário antes de riscar o item.
- REV-21: `.github/workflows/ci.yml` agora executa teste financeiro, build e
  `cargo check --locked` em PRs e pushes para `main`. Os três comandos passaram
  localmente nesta sessão.
- REV-19 e REV-22: consultas de Jogos passam pelo adaptador, e guia/playbook
  descrevem React → adaptadores → Supabase. `npm run build` passou.
- REV-25: fixture visual com conteúdo longo em Chrome DevTools, viewports CSS
  reais de 320, 360, 390 e 480 px para Cartucho/Aero em jogos e finanças: sem
  rolagem horizontal; capturas de 320 e 390 px inspecionadas. QA final no Edge
  cobriu dez aparências e seis rotas (Resumo, Compras, Jogos, Finanças, Ajustes
  e Login) nas quatro larguras: 240 combinações sem overflow nem erros de
  navegador. Também conferiu seleção de item, cards de jogos, expansão de
  dívidas, navegação móvel e login desconectado; capturas de Vaporwave 95,
  Cartucho e Aero em 320 px foram inspecionadas. O QA encontrou a navegação
  inferior escondida em Vaporwave 95, corrigida e retestada. Outra matriz
  cobriu Resumo, Compras, Ajustes e Login em Feira, Cartucho e Aero nas mesmas
  larguras (48 cenários). Ela reproduziu overflow em Compras com histórico de
  preço; corrigido e novamente medido sem overflow. Capturas de 320 px foram
  inspecionadas. Cartucho agora mostra texto da categoria, separa o nome longo
  do título e ajusta o valor principal do Resumo. Ainda faltam estados de dados
  do app autenticado, demais aparências e teste em dispositivo real. Modais agora
  ficam acima da navegação fixa e rolam internamente em telas baixas; falta
  conferir com teclado virtual aberto.
- REV-24, incremento de 2026-11-18: a gestão completa de dívidas saiu do
  layout financeiro para `FinanceDebtsLayout.tsx`, com rota própria. O card
  antigo e seu ajuste manual de saldo foram removidos, deixando só resumo e
  cadastro rápido no Planejamento. Build aprovado; demais formulários do
  layout ainda concentram responsabilidades, portanto REV-24 segue aberto.
- REV-25, incremento de 2026-11-18: a rota nova de dívidas passou sem overflow
  em Feira, Aero, Cartucho e Vaporwave nas larguras 390, 600 e 760 px, com cards
  inicialmente recolhidos e checkboxes visíveis ao expandir. O QA isolado
  completo aprovou 52 cenários. Dispositivo real e teclado virtual continuam
  pendentes.

## Diagnóstico

O projeto possui uma base útil, mas a confiabilidade de dados e fluxos precisa
alcançar o acabamento visual. A prioridade sugerida é corrigir o financeiro,
concluir a migração e tornar falhas compreensíveis antes de ampliar temas ou
funcionalidades. Compras, jogos e finanças já justificam uma marca mais ampla.

Esta revisão é um inventário para priorização; não autoriza automaticamente
refatorações, novos serviços, mudanças de contrato ou migrações destrutivas.

## Evidência e limites

- **Confirmado:** comportamento diretamente identificável no código.
- **Reproduzido:** comportamento executado em verificação isolada.
- **Risco:** caminho plausível no código, ainda sem reprodução ponta a ponta.
- **Oportunidade:** evolução proposta, não requisito já implementado.
- As queixas citadas são hipóteses de experiência, não relatos coletados.

Foram inspecionados frontend, adaptadores Supabase, esquema SQL/RLS, comandos
nativos, contratos financeiros, workflows e documentação de continuidade.
Não houve acesso autenticado ao banco, alteração de dados, teste em dispositivo
real nem auditoria completa de segurança ou dependências.

| Verificação na revisão | Resultado |
| --- | --- |
| `npm run build` | Não concluiu: `tsc` indisponível e `node_modules` ausente |
| `cargo check --manifest-path src-tauri/Cargo.toml --locked --offline` | Não executou: `cargo` indisponível |
| Geração isolada de parcelas com o corpo da função atual e persistência simulada | Reproduziu vencimentos no dia 1 |
| Auth/RLS com duas contas e CRUD entre dispositivos | Não executado |

As limitações do ambiente não demonstram falha de compilação do projeto.
Resultados históricos de release não substituem estas provas pendentes.

## Prioridade alta

### ~~REV-01 — Parcelas ignoram o dia informado~~

- Estado na revisão: reproduzido. Correção e prova local concluídas em 2026-11-17.
- Evidência: `createFinancialInstallment` em [finance/api.ts](../../src/features/finance/api.ts)
 constrói a data com `Date.UTC(ano, mês + índice, 1)`.
- Exemplo executado: total de 10.000 centavos, três parcelas e primeiro vencimento
 em `2026-11-17` produziram `2026-11-01`, `2026-12-01` e `2027-01-01`, com
 valores de 3.334, 3.333 e 3.333 centavos.
- Impacto: vencimento antecipado e planejamento incorreto.
- Correção proposta: preservar o dia informado, limitando-o ao último dia dos
 meses mais curtos.
- Aceite: conferir dias 17, 29, 30 e 31, fevereiro em ano bissexto, virada de ano
 e soma exata dos centavos.

### REV-02 — Comprovação insuficiente antes de remover o SQLite

- Estado: risco de preservação de dados; remoção sem revalidação confirmada no código.
- Evidência: [SettingsLayout](../../src/app/layout/SettingsLayout.tsx) usa o marcador
 de importação; [legacy.rs](../../src-tauri/src/commands/legacy.rs) remove os arquivos
 sem comparar novamente a origem com o destino. O [importador](../../src/features/migration/api.ts)
 compara contagens e parte dos UUIDs, sem igualdade integral de conteúdo/relações.
- Existe confirmação explícita na interface. O problema é a prova técnica que a sustenta.
- Impacto: um marcador antigo pode não representar a cópia local ou o remoto atuais.
- Correção proposta: definir prova vinculada ao conteúdo importado, revalidar
 antes da remoção e preservar a cópia diante de divergência ou falha de rede.
- Aceite: alterar a origem ou remover registro remoto após importar; a exclusão
 deve ser bloqueada. Uma base inalterada deve passar com UUIDs e relações conferidos.
- Limite: mudanças no contrato do comando exigem TypeScript, Rust e documentação coordenados.

### REV-03 — Conta já utilizada impede a primeira importação

- Estado: confirmado no [importador](../../src/features/migration/api.ts).
- Qualquer registro nas tabelas protegidas interrompe a primeira importação.
- Impacto: criar uma categoria antes de importar bloqueia o fluxo; importar
 bases de diferentes dispositivos na mesma conta também encontra essa restrição.
- Queixa provável: “Comecei a usar e agora não consigo trazer meus dados antigos.”
- Correção mínima: apresentar a importação antes do primeiro cadastro e explicar
 a restrição. Conciliação entre bases exige decisão própria, sem sobrescrita implícita.
- Aceite: testar conta vazia, conta com um registro, importação interrompida e segundo dispositivo.

### REV-04 — Falhas de compras sem retorno e envios repetidos

- Estado: ausência de tratamento e de bloqueio confirmada; duplicação depende do fluxo.
- Evidência: criação/remoção de categorias e itens e carregamento de itens/links em
 [AppLayout](../../src/app/layout/AppLayout.tsx) possuem caminhos sem `try/catch`.
 O aviso geral cobre principalmente a carga inicial. Vários formulários não
 impedem novo envio enquanto aguardam a gravação.
- Queixa provável: “Cliquei, não aconteceu nada; tentei novamente e duplicou.”
- Correção proposta: estado de envio, erro contextual, preservação dos campos e
 recarga aguardada. Não tratar toda repetição como cadastro novo.
- Aceite: simular rede lenta, falha de gravação, restrição de unicidade e clique duplo.

### REV-05 — Respostas antigas podem substituir a seleção atual

- Estado: risco identificado em [AppLayout](../../src/app/layout/AppLayout.tsx) e
 [FinanceLayout](../../src/app/layout/FinanceLayout.tsx).
- Consultas anteriores podem atualizar o estado após troca de categoria, item ou mês.
 No financeiro, uma falha de recarga mantém os dados anteriores sob o novo período.
- Impacto: associação visual incorreta entre seleção e dados.
- Correção proposta: invalidar respostas obsoletas e distinguir carga, falha e dados válidos.
- Aceite: atrasar a resposta de A, selecionar B e confirmar que A nunca ocupa a tela de B.

### REV-06 — Gráfico financeiro não acompanha movimentações

- Estado: confirmado no [FinanceLayout](../../src/app/layout/FinanceLayout.tsx).
- `listFinancialHistory` executa no efeito dependente de `month`; `load()` após
 criar/remover lançamento ou pagar parcela não atualiza esse histórico.
- Queixa provável: “O saldo mudou, mas o gráfico não.”
- Correção proposta: invalidar/recarregar histórico após alterações relevantes.
- Aceite: criar, excluir e confirmar movimentações sem trocar de mês; totais e
 gráfico devem refletir o mesmo conjunto de fatos.

## Experiência e completude dos fluxos

| ID | Ponto e evidência | Queixa provável | Evolução e prova esperada |
| --- | --- | --- | --- |
| REV-07 | [Login](../../src/app/layout/LoginLayout.tsx) sem recuperação de senha nem redirecionamento pós-login | “Esqueci a senha” / “Entrei e fiquei parado” | Recuperação, confirmação e retorno à rota solicitada; testar em instalação real |
| REV-08 | Confirmação de categoria não explica cascata em [Compras](../../src/app/layout/AppLayout.tsx) | “Apaguei a categoria e perdi os itens e lojas” | Explicitar alcance e quantidade afetada; cancelar deve preservar tudo |
| REV-09 | Exclusão imediata em [Jogos](../../src/app/layout/GameLayout.tsx) | “Toquei sem querer e perdi o jogo” | Confirmação ou desfazer verificável |
| REV-10 | Adaptadores e interfaces oferecem pouca edição de registros | “Errei um nome/valor e preciso recriar” | Priorizar edição de itens/links e correção financeira, com regras explícitas para histórico |
| REV-11 | Sem estorno de pagamento de parcela na interface financeira | “Confirmei sem querer e não consigo corrigir” | Estorno transacional de parcela e lançamento; provar consistência e repetição segura |
| REV-12 | Algumas falhas viram arrays vazios no resumo/histórico | “Meus dados sumiram” | Diferenciar vazio, carregando e erro; permitir tentar novamente |
| REV-13 | [Resumo](../../src/app/layout/HomeLayout.tsx) orienta abrir Tauri para dados locais quando consultas cloud falham | “Reabri o app e continua igual” | Mensagem coerente com Supabase e ação de recuperação |
| REV-14 | Modais sem controle explícito de foco/Escape e ícones sem descrição adequada | “Não consigo usar pelo teclado” | Foco inicial, contenção/restauração de foco, Escape e nomes acessíveis; testar teclado/leitor |

REV-07 a REV-14 combinam lacunas confirmadas no código com propostas de evolução;
as queixas e a gravidade percebida ainda precisam de pesquisa com usuários.

## Preços e confiança

### REV-15 — Origem e qualidade do preço pouco claras

Fontes: [fluxo de cadastro](../../src/app/layout/AppLayout.tsx),
[adaptador](../../src/features/itemLinks/api.ts) e
[extrator nativo](../../src-tauri/src/commands/prices.rs).

- Um fallback pode salvar média do Google Shopping ou oferta encontrada pelo
 nome como preço de um link específico, sem distinção de origem.
- O extrator não valida moeda nem a correspondência do preço com o produto principal.
- Falha na consulta também atualiza `last_checked_at`; falta separar última
 tentativa e última leitura bem-sucedida.
- SerpApi depende de `SERPAPI_KEY` no ambiente nativo. Sem configuração, retorna
 ausência de resultado; isso não deve parecer promessa de busca funcional ao usuário.

Queixa provável: “O app mostra um preço, mas na loja é outro.”

Evolução proposta: indicar preço manual, extraído ou estimado; informar data da
última leitura válida e falha recente. Preservar a chave fora do frontend.
Aceite: testar extração válida, ausência de chave, timeout, moeda diferente,
página com vários produtos e consulta que retorna somente estimativa.

## Arquitetura, desempenho e manutenção

| ID | Achado | Consequência | Próximo incremento sugerido |
| --- | --- | --- | --- |
| REV-16 | [Resumo](../../src/app/layout/HomeLayout.tsx) consulta itens por categoria e links por item | Com 20 categorias e 200 itens, há 220 consultas adicionais nessas etapas | Consultas em lote/resumo agregado; medir requisições antes/depois |
| REV-17 | [Saldo](../../src/features/finance/api.ts) agrega registros no cliente sem paginação explícita | Se a API limitar resultados, totais podem ficar incompletos | Testar acima do limite configurado; agregar no servidor ou percorrer todo o conjunto |
| REV-18 | Sem atualização geral ao recuperar foco, assinatura de mudanças ou recarga clara | Mudança em outro dispositivo pode exigir sair e voltar à tela | Revalidação simples ao retornar/ação atualizar; teste com dois dispositivos |
| REV-19 | [Jogos](../../src/app/layout/GameLayout.tsx) chama Supabase no componente | Contraria a fronteira `src/features/*/api.ts` do AGENTS | Extrair adaptador tipado sem alterar o comportamento |
| REV-20 | Testes financeiros Rust estão em módulo não declarado pelo [commands/mod.rs](../../src-tauri/src/commands/mod.rs) atual | Não protegem o financeiro cloud, mesmo que permaneçam no repositório | Testar cálculos atuais, RPCs, importação e RLS; preservar legado necessário à migração |
| REV-21 | Workflows existentes cobrem publicação/site, sem CI geral da aplicação por PR | Regressões podem chegar ao release sem prova funcional | CI proporcional: build, check e testes dos caminhos críticos |
| REV-22 | Guia de agentes ainda orienta React → Tauri → SQLite | Futuras alterações podem seguir arquitetura superada | Reconciliar guia, estado e docs financeiras com os contratos cloud |
| REV-23 | [Configuração Tauri](../../src-tauri/tauri.conf.json) tem CSP nula | Camada de proteção ausente; não é evidência de exploração | Definir política compatível com recursos reais e validar navegação/conexões |
| REV-24 | Layout financeiro concentra formulários, carregamentos e renderização; CSS extenso por tema | Mudanças têm superfície de regressão ampla | Extrair por responsabilidade conforme as correções exigirem, sem reescrita geral |

## Decisões boas a preservar

- Valores financeiros em centavos e contratos explícitos de cálculo.
- UUIDs portáteis e política cloud-first.
- RLS e relações compostas por proprietário presentes no SQL; falta provar runtime.
- Pagamento de parcela transacional no Postgres.
- Timeout em consultas externas e chave SerpApi fora do frontend.
- Preservação do SQLite durante a transição.
- Documentação de decisões, releases, estado e handoff.
- Personalização visual que pode continuar sem definir uma marca diferente por tema.

## Sequência de evolução proposta

1. **Confiabilidade imediata:** REV-01, REV-04, REV-05 e REV-06; casos reproduzíveis
 e feedback de erro. REV-02 deve anteceder qualquer remoção de SQLite.
2. **Conclusão cloud:** prova Auth/RLS com duas contas, importação conferida e
 continuidade entre dispositivos; tratar REV-03 sem sobrescrever dados.
3. **Fluxos completos:** recuperação de conta, edição, estorno e exclusões claras.
4. **Proteção contra regressões:** testes do caminho cloud e CI por alteração.
 Os testes das correções devem acompanhar os incrementos desde o primeiro passo.
5. **Escala e clareza:** consultas em lote, totais completos, atualização entre
 dispositivos e origem dos preços.
6. **Produto e marca:** validar posicionamento/nome/ícone; considerar busca,
 filtros, exportação e estado de item comprado conforme necessidade observada.

Não há estimativa de prazo nesta revisão. Uma frente só deve ser considerada
concluída depois da prova indicada, não por existir uma tela ou documento.

## Próximo incremento verificável

Concluir REV-04/05/06 no app autenticado: simular rede lenta, clique duplo e
falha de unicidade em Compras; atrasar resposta de A, selecionar B e conferir
que A não ocupa B; criar, excluir e confirmar movimentações sem trocar de mês e
conferir totais/gráfico. Continuar REV-25 em dispositivo real e com as outras
aparências e estados de dados. A frente CLOUD-001 mantém suas pendências.

## REV-25 — Responsividade mobile em todas as aparências

- Estado: em curso; relato do usuário sobre gráficos e cards de jogos Cartucho.
- Evidência inicial: Cartucho usava `aspect-ratio` e posições absolutas para os
  controles de cada jogo, mesmo em largura pequena. Grids de resumo e finanças
  mantinham duas colunas em telas estreitas.
- Correção atual: jogos Cartucho viram cards de fluxo normal abaixo de 480 px;
  barras e valores financeiros se ajustam a 320 px; Aero usa uma coluna abaixo
  de 360 px. Compras deixa de abrir segunda coluna com histórico de preço;
  nomes longos de item e categoria ganham mais espaço; Cartucho recupera o
  contraste das categorias e do link do Resumo. Modais têm camada acima da
  navegação e altura limitada à viewport com rolagem interna.
- Ajuste adicional: reforçada a identidade Aero e criada a linguagem Vaporwave
  95 (janelas clássicas e paisagem pixelada), ambas com regras responsivas;
  build passou. QA renderizado completo no Edge para dez aparências e quatro
  larguras passou; dispositivo real permanece pendente, então REV-25 continua
  aberta.
- Aceite: conferir todas as rotas e aparências com dados vazios, longos e
  carregados em larguras de 320, 360, 390 e 480 px, sem rolagem horizontal,
  controles sobrepostos ou conteúdo cortado; repetir em pelo menos um celular.
  Matriz automatizada em Edge passou em dez aparências e seis rotas nas quatro
  larguras, com verificação visual parcial de capturas 320 px. Falta validar em
  dispositivo real e conferir teclado virtual/modais em uso.
