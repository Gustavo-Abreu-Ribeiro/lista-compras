# Workboard

Registro vivo de propriedade e handoff. Não substitui Git, código, testes,
roadmap ou registro de atividades.

## Regras

- Crie entrada para trabalho concorrente, que atravesse sessões ou possa ficar
  incompleto.
- Uma entrada tem uma pessoa/agente responsável e resultado coerente.
- Atualize-a no mesmo commit de mudança relevante de estado.
- Antes de assumir uma entrada, confira Git e a prova registrada.
- Ao concluir, remova a entrada ou deixe evidência concreta; não use
  "continuar" como próximo passo.

## Trabalho ativo

## REL-005 — Publicar 0.5.1 e atualizar downloads do site

- Status: in progress
- Owner/lane: Codex
- Scope: publicar Windows x64 e Android ARM64 com as correções de paginação e recarga, e redeployar o site para expor a versão.
- Boundaries: manter assinatura Android, configuração Supabase publicável, dados remotos e SQLite legados; sem nova migration.
- Evidence: commit de correção `7e484dc`; build, testes financeiros, paginação, retorno e `cargo check --locked` passaram; QA Edge isolado aprovou 52 cenários.
- Next step: conferir versão e locks, publicar commit de release, executar workflow Windows/Android, verificar hashes e links 0.5.1 no site público.
- Updated: 2026-11-19

## SITE-003 — Repaginar a apresentação pública

- Status: complete
- Owner/lane: Codex
- Scope: dar mais personalidade à página de apresentação com nova abertura, ritmo visual, navegação de progresso e movimento discreto.
- Boundaries: preservar identidade Feira, capturas reais com dados fictícios, acessibilidade, links de releases e hospedagem GitHub Pages; não alterar o app ou dados de negócio.
- Evidence: commit `94aa9af`, Pages 44518148375 concluído; URL pública mostra a nova abertura e CSS. Build e QA Edge em cinco larguras passaram, incluindo roda lateral, teclado, galeria, downloads e movimento reduzido. Windows/Android 0.5.0 conferidos no navegador público.
- Next step: nenhuma pendência desta entrega.
- Updated: 2026-11-19

## REL-004 — Publicar 0.5.0 com gestão de dívidas

- Status: complete
- Owner/lane: Codex
- Scope: publicar instaladores Windows/Android 0.5.0, atualizar a descrição do site e conferir downloads públicos.
- Boundaries: preservar assinatura Android, dados existentes e releases anteriores; migrations remotas seguem separadas.
- Evidence: commit `4913643`, CI 44299590153, Pages 44299590134 e release 44299608785 passaram. Downloads públicos 0.5.0 conferidos por SHA-256; site ao vivo aponta para os dois assets. QA Edge isolado aprovou 52 cenários. Detalhes em `docs/releases/0.5.0-verification.md`.
- Next step: nenhuma pendência desta publicação; validação autenticada continua em FIN-UX-001 e CLOUD-001.
- Updated: 2026-11-18

## FIX-UI-001 — Capturas Aero/Cartucho e carga financeira

- Status: complete
- Owner/lane: Codex
- Scope: corrigir contraste dos ícones Aero, grade do resumo financeiro e controles no cartucho; consulta mensal independente da coluna opcional de dívida e listas mobile em coluna.
- Boundaries: sem migração remota ou alteração de cálculos; preservar dados e edição existente em Cargo.toml.
- Evidence: build e três testes financeiros passaram; `scripts/site/verify-reported-ui.mjs` aprovou 40 cenários Edge com fixtures isoladas, incluindo sete larguras, listas em coluna em quatro aparências e carga de Início/Finanças com/sem `debt_id`. Capturas em `dist/reported-ui-qa/`.
- Next step: nenhuma pendência deste incremento; prova autenticada continua em CLOUD-001/FIN-UX-001 e aparelho físico em REV-25.
- Updated: 2026-11-18

## FIN-UX-001 — Painel de planejamento financeiro

- Status: in progress
- Owner/lane: Codex
- Scope: manter Planejamento compacto e oferecer gestão dedicada de dívidas com
  cadastro, total, restante, parcelas mensais e previsão agregada.
- Boundaries: manter adapters/Supabase, preservar fatos pagos e calcular o
  restante somente pelas parcelas pendentes.
- Evidence: ADR-005 atualizado; `/finance/debts` implementa cards recolhidos,
  checkboxes e conversão de dívidas antigas. Migration 202611180001 pausa a
  recorrência antiga e cria o plano atomicamente. `npm run build` passou.
  Usuário confirmou em 2026-11-18 a aplicação das migrations 202611170002 e
  202611180001 no Supabase; execução autenticada ainda não foi verificada.
- Next step: validar cadastro, conversão de Mercado Pago, pagamento e projeção
  com sessão real; registrar resultado em
  `docs/development/finance-planning-experience-2026-11-17.md`.
- Updated: 2026-11-18

## REVIEW-001 — Revisão de confiabilidade e experiência

- Status: in progress
- Owner/lane: Codex
- Scope: acompanhar e corrigir os achados da revisão, incluindo pente fino mobile, riscando cada item após prova.
- Boundaries: preservar a propriedade e as pendências de CLOUD-001; sem remover SQLite ou alterar contratos sem decisão.
  - Evidence: REV-01/08/09/13/19/21/22 corrigidos; `npm run test:finance`, build e `cargo check --locked` passaram. CI geral adicionado em `.github/workflows/ci.yml`. QA Edge final: 10 aparências × 6 rotas × 4 larguras (240 cenários), incluindo seleção de item, cards de jogos, expansão de dívida, navegação visível, login desconectado; sem overflow nem erros. A matriz revelou e corrigiu a navegação Vaporwave 95 sobreposta no mobile. QA do site passou em quatro larguras e 16 combinações; REV-12 e REV-24 receberam incrementos adicionais em 2026-11-18; REV-25 ganhou 12 cenários para a rota de dívidas em mobile. REV-16/17 em 2026-11-19: consultas em lote e paginação implementadas; teste com 1.201 linhas, limite simulado de 200, e build passaram. REV-18: recarga ao retomar implementada em cinco telas; teste de eventos, build e 52 cenários Edge passaram. REV-14 e provas runtime/autenticadas continuam pendentes.
  - Next step: provar REV-18 entre dois dispositivos autenticados; medir REV-16 e testar REV-17 acima do limite de linhas no Supabase autenticado; simular falha parcial no Resumo para REV-12; provar REV-14 por teclado/leitor de tela; REV-04 com rede lenta, unicidade e clique duplo em Compras; REV-05 com respostas A atrasadas após B; REV-06 no app autenticado após criar/excluir/confirmar; REV-25 em aparelho físico e com teclado virtual.
- Updated: 2026-11-19

## SITE-002 — Previews, texto e estudo de marca

- Status: complete
- Owner/lane: Codex
- Scope: prints reais Feira/Cartucho/Aero no site, texto descritivo e proposta visual Caderno escolhida pelo usuário.
- Boundaries: nome/logo como estudo revisável; não trocar IDs, domínio, assinatura, dados ou instaladores.
- Evidence: commit 0602d2e e Pages 44145187004 publicados; build aprovado; QA local/pública passou em quatro larguras e 12 combinações de tema/área. Downloads reais 0.3.0 conferidos. Proposta vetorial em `docs/brand/`.
- Next step: site sem pendência; nome e símbolo Caderno permanecem como proposta de identidade revisável, com uso existente do nome documentado.
- Updated: 2026-11-17

## REL-002 — Publicar Frutiger Aero 0.3.0

- Status: complete
- Owner/lane: Codex
- Scope: commit descritivo do tema e publicação de instaladores Windows/Android 0.3.0 com download no site.
- Boundaries: preservar assinatura Android, dados e releases anteriores; sem mudança de contratos.
- Evidence: commit descritivo 444fb0c enviado; CI 44141028050 passou, APK 0.3.0/versionCode 3000 com mesmo certificado, Windows arrancou no CI, tag anotada e assets públicos conferidos por SHA-256. Chrome confirmou links 0.3.0 no site publicado.
- Next step: nenhuma pendência desta publicação; validações de dados/dispositivos continuam em CLOUD-001.
- Updated: 2026-11-17

## REL-003 — Release 0.4.0 com Vaporwave 95 e QA mobile

  - Status: complete
  - Owner/lane: Codex
  - Scope: commit/push das correções revisadas, publicar instaladores Windows/Android e atualizar previews/downloads do site.
  - Boundaries: preservar assinatura Android, releases/dados anteriores; migration de dívida não aplicada ao Supabase permanece explicitamente desabilitada.
  - Evidence: commit `490071b4de0c09c51478c02cd098963cdb708c6b` enviado; CI 44220414797, builds/publicação Windows+Android 44220473964 e Pages 44220414743 passaram. Tag anotada `v0.4.0`; SHA-256 dos downloads públicos verificados; certificado APK igual ao 0.3.0 e `versionCode=4000`. Site ao vivo aponta para APK/EXE 0.4.0. Capturas de Vaporwave estão na galeria. Evidência em `docs/releases/0.4.0-verification.md`.
  - Next step: nenhuma pendência desta publicação. REV-25 ainda requer prova em aparelho físico/teclado virtual; migration cloud financeira também aguarda aplicação/validação.
  - Updated: 2026-11-17

## UI-AERO — Identidade Frutiger Aero

- Status: complete
- Owner/lane: Codex
- Scope: aparência completa selecionável em um toque, com navegação, superfícies de vidro, paisagem vetorial, compras, jogos, finanças, login e ajustes responsivos.
- Boundaries: somente apresentação; sem mudar dados, cálculos, autenticação ou comandos; preservar Feira e Cartucho.
- Evidence: `npm run build` passou; Chrome conferiu seis rotas em 1440/768/390/320 px, persistência, reversão Cartucho/Feira, formulário financeiro, modal de item, login e movimento reduzido. Evidência em `docs/design/frutiger-aero.md`.
- Next step: nenhuma pendência deste incremento visual; nova aparência distribuída nos instaladores 0.3.0.
- Updated: 2026-11-17

## REL-001 — Releases Windows e Android 0.2.0

- Status: complete
- Owner/lane: Codex
- Scope: builds reproduzíveis Windows x64 e Android ARM64, assinatura Android preservada, checksums e release pública com configuração Supabase publicável.
- Boundaries: sem migração/exclusão de dados, sem chaves privadas no Git ou app; manter as pendências CLOUD-001 explícitas.
- Evidence: build frontend/cargo check locais e jobs Windows/Android/publish da execução 44133883561 passaram; APK assinado verificado; release v0.2.0 pública, downloads conferidos por SHA-256 e links reais confirmados no site via Chrome. Detalhes em `docs/releases/0.2.0-verification.md`.
- Next step: nenhuma pendência desta distribuição; instalação/CRUD em dispositivos reais e prova Auth/RLS continuam na frente CLOUD-001.
- Updated: 2026-11-17

## SITE-001 — Site público e downloads

- Status: complete
- Owner/lane: Codex
- Scope: site estático em `website/` com identidade Feira, prints demonstrativos, aparências e downloads de releases reais; publicação no GitHub Pages.
- Boundaries: não alterar dados, autenticação, contratos nativos ou o trabalho CLOUD-001; preservar edição prévia em Cargo.toml.
- Evidence: `npm run build` passou; Chrome validou 1440/768/390/320 px, galeria, teclado, paletas, FAQ e três estados de downloads. Workflow Pages 44123748143 concluiu com sucesso; URL pública respondeu HTTP 200.
- Next step: nenhuma pendência do site; downloads Windows e Android da release v0.2.0 foram reconhecidos e conferidos no site publicado.
- Updated: 2026-11-17

## CLOUD-001 - Migrar persistência para Supabase

- Status: in progress
- Owner/lane: agente autonomo
- Scope: fazer Supabase Auth/Postgres/RLS a fonte de dados de compras, preços, jogos e finanças; eliminar SQLite depois da importação verificada.
- Boundaries: preservar base SQLite, UUIDs e relações; nunca expor chave `secret`/`service_role` no cliente.
- Evidence: adapters cloud e autenticação foram implementados; importador SQLite exporta em modo leitura e exige confirmação antes de remover a base. Configuração local ignorada pelo Git.
- Next step: validar fluxos CRUD/Auth/RLS em Tauri, corrigir UX financeira reportada, importar os dados e conferir isolamento por usuário.
- Updated: 2026-11-16

## Modelo de entrada

```md
## ID — título curto

- Status: open | in progress | blocked | complete
- Owner/lane: pessoa, agente ou branch
- Scope: menor resultado pretendido
- Boundaries: arquivos, dados ou contratos que não devem mudar
- Evidence: teste, comando, revisão ou ADR necessário
- Next step: ação exata, arquivo/contrato e prova esperada
- Updated: YYYY-MM-DD
```
