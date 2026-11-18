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

## FIN-UX-001 — Painel de planejamento financeiro

- Status: in progress
- Owner/lane: Codex
- Scope: reorganizar Planejamento em um dashboard, mover cadastros para diálogos, agrupar dívidas em listas expansíveis e apresentar projeções mês a mês.
- Boundaries: manter a arquitetura de adapters e a semântica financeira existente; não inferir quitação/amortização nem mudar esquema sem regra explícita.
- Evidence: visão/aceite em `docs/development/finance-planning-experience-2026-11-17.md`; ADR-005 define total de parcelas >= saldo e saldo do credor manual. Migração, RPC, campos de plano, lista expansível e quadro de saídas por seis meses implementados; build/teste financeiro/cargo check passaram. Migração remota ainda não aplicada.
- Next step: aplicar e validar a migração/RPC de plano parcelado no Supabase; depois trocar disclosures de cadastro por diálogos e validar o painel em celular em `src/app/layout/FinanceLayout.tsx`.
- Updated: 2026-11-17

## REVIEW-001 — Revisão de confiabilidade e experiência

- Status: in progress
- Owner/lane: Codex
- Scope: acompanhar e corrigir os achados da revisão, incluindo pente fino mobile, riscando cada item após prova.
- Boundaries: preservar a propriedade e as pendências de CLOUD-001; sem remover SQLite ou alterar contratos sem decisão.
  - Evidence: REV-01/08/09/13/19/21/22 corrigidos; `npm run test:finance`, build e `cargo check --locked` passaram. CI geral adicionado em `.github/workflows/ci.yml`. QA Edge final: 10 aparências × 6 rotas × 4 larguras (240 cenários), incluindo seleção de item, cards de jogos, expansão de dívida, navegação visível, login desconectado; sem overflow nem erros. A matriz revelou e corrigiu a navegação Vaporwave 95 sobreposta no mobile. QA do site passou em quatro larguras e 16 combinações; REV-12 (mensagens de falha do Resumo) e REV-14 (teclado/acessibilidade dos modais) implementados, ambos aguardam prova runtime/manual; REV-04/05/06/25 parciais.
  - Next step: simular falha parcial no Resumo para REV-12; provar REV-14 por teclado/leitor de tela; REV-04 com rede lenta, unicidade e clique duplo em Compras; REV-05 com respostas A atrasadas após B; REV-06 no app autenticado após criar/excluir/confirmar; REV-25 em aparelho físico e com teclado virtual.
- Updated: 2026-11-17

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
