# DOING — handoff operacional

Leia este arquivo antes de iniciar uma mudança. Ele é o resumo de execução mais
curto do repositório; código, testes e Git continuam sendo a prova final.

## Atividade Atual: REVIEW-001 / REL-003 (QA mobile e release 0.4.0)

QA Edge passou para 10 aparências × 6 rotas × 4 larguras (240 cenários), com
fluxos de compras, jogos, dívida e login desconectado. A matriz revelou e
corrigiu a navegação Vaporwave 95 sobreposta pelo painel; site atualizado com
capturas Vaporwave desktop/mobile e versão 0.4.0 preparada. Build, teste
financeiro, cargo check e QA do site passaram. PRÓXIMO PASSO: commitar e enviar
as alterações, acionar o workflow manual de release e verificar instaladores,
checksums e publicação Pages antes de marcar REL-003 concluída.

REV-25 continua aberta só para validação em aparelho físico/teclado virtual;
não marcar como concluída sem essa prova. Migration financeira também não foi
aplicada ao Supabase e o app informa quando os planos de dívida estão
indisponíveis.

**SITE-002 concluída em 2026-11-17:** site com previews Feira/Cartucho/Aero em
quatro áreas e no celular; texto reescrito de forma descritiva. Commit 0602d2e,
Pages 44145187004 e QA na URL pública aprovados; downloads 0.3.0 conferidos.
Direção de nome Caderno escolhida pelo usuário; proposta vetorial revisável em
`docs/brand/caderno-proposal.html` e `docs/brand/proposta-caderno.png`.
Há app de notas com esse nome; estudo em `docs/brand/naming.md`. Nenhuma troca
de identidade/IDs/assinatura foi aplicada ao produto nesta entrega.

**UI-AERO concluída em 2026-11-17:** Frutiger Aero disponível em um toque em
Ajustes > Aparência no código atual. Build e QA Chrome desktop/mobile passaram;
documentação em `docs/design/frutiger-aero.md`. **REL-002 concluída:** instaladores
0.3.0 publicados com a nova aparência. Commit descritivo 444fb0c, tag anotada
v0.3.0 e workflow 44141028050 conferidos; SHA-256 dos dois assets públicos e
links reais no site passaram. Evidência em `docs/releases/0.3.0-verification.md`.
Os binários 0.2.0 anteriores permanecem disponíveis. Próximas provas da frente
cloud continuam abaixo.

**REL-001 concluída em 2026-11-17:** release Windows x64/Android ARM64 0.2.0
em https://github.com/Gustavo-Abreu-Ribeiro/lista-compras/releases/tag/v0.2.0.
Execução 44133883561 passou; tag anotada no commit 732cc08. Assinatura APK,
arranque Windows, SHA-256 dos downloads públicos e links reais no site
verificados. Chave Android preservada fora do Git em
`~/.codex/private/lista-compras/`; preservar backup para futuras atualizações.
Evidência em `docs/releases/0.2.0-verification.md`. As próximas provas da frente
cloud permanecem abaixo; nenhuma base SQLite foi removida.

- Estado: EM CURSO
- Dono: Agente autônomo
- Escopo: Migrar compras, jogos, preços e finanças para Supabase Auth/Postgres com RLS individual; retirar SQLite após importação conferida.
- Prova atual: schema inicial foi executado no projeto (retorno do SQL Editor: “Success. No rows returned”); adapters de compras, jogos, preços e finanças usam Supabase; autenticação protege as rotas. Fluxos financeiros e responsividade estão em correção após relato de falha no runtime.

## PROXIMO PASSO

Revisão ativa em `docs/development/project-review-2026-11-17.md`: REV-01,
REV-08, REV-09, REV-13, REV-19, REV-21 e REV-22 estão riscados após correção. REV-06
foi implementado, mas falta provar no app autenticado: criar, excluir e confirmar
movimentações sem trocar de mês e comparar totais/gráfico em
`src/app/layout/FinanceLayout.tsx`. REV-05 também pede prova: atrasar resposta
de A, selecionar B e conferir que A não aparece em Compras/Finanças. REV-25
iniciou ajuste mobile; ampliar QA nas
rotas com dados autenticados, outras aparências e dispositivo real. A matriz
local de 48 cenários para Compras/Resumo/Ajustes/Login em Feira/Cartucho/Aero,
320–480 px, passou sem overflow após corrigir histórico de preços. REV-04 pede
prova de rede lenta, unicidade e clique duplo em Compras; o código já bloqueia
reenvio e mostra erro contextual.
Aero foi reforçado com paisagem e superfícies translúcidas, e Vaporwave 95 foi
reformulado como janelas Windows 95 sobre um pôr do sol pixelado. QA Edge em
dez temas e quatro larguras passou; REV-25 mantém somente a prova em aparelho
real e teclado virtual.
REV-12: o Resumo diferencia falha parcial de dados vazios; validar erro simulado
no runtime. REV-14: validar foco/Escape e nomes acessíveis com teclado/leitor de
tela antes de riscar. Build e teste financeiro passaram. A migração CLOUD-001
mantém os passos abaixo.
FIN-UX-001: ADR-005, migração aditiva e camada inicial do painel de dívida
foram criados; build, teste financeiro e cargo check passaram. Próximo passo:
aplicar/validar migration + RPC em Supabase, então converter os disclosures de
cadastro em diálogos e testar o planejamento em celular.

Entrega independente concluída em 2026-11-17: site público com identidade Feira
e prints demonstrativos em https://gustavo-abreu-ribeiro.github.io/lista-compras/.
Workflow Pages 44123748143 passou; HTTP 200 confirmado. Fontes em `website/`;
detalhes em `docs/product-site.md`. As pendências CLOUD-001 abaixo permanecem.

1. Reiniciar `npm run tauri dev` e conferir criação de categoria, limite, lançamento e exclusão no fluxo financeiro.
2. Validar Auth/RLS e importar a cópia local em Ajustes, conferindo as contagens.
3. Só então usar a ação explícita para remover o SQLite deste dispositivo.

## Regra de retomada

1. Confirme `git status`, este arquivo e `docs/development/`.
2. Verifique a prova indicada antes de confiar nela.
