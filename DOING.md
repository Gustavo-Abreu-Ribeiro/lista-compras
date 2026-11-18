# DOING — handoff operacional

Leia este arquivo antes de iniciar uma mudança. Ele é o resumo de execução mais
curto do repositório; código, testes e Git continuam sendo a prova final.

## Atividade Atual: CLOUD-001 / REVIEW-001 (pendências pós-release)

**REL-004 em curso:** versão 0.5.0 preparada para Windows/Android, com gestão
dedicada de dívidas e correções visuais. A revisão ganhou incrementos em
REV-12/24; a prova visual da rota e a publicação dos instaladores estão em
andamento. Próximo passo: conferir o QA, enviar o commit e executar/validar o
workflow `release.yml`, depois verificar os downloads públicos e o site.

**FIN-UX-001 atualizada em 2026-11-18:** Planejamento agora mantém apenas
resumo/cadastro rápido de dívidas; gestão completa fica em `/finance/debts`,
com cards recolhidos, total, restante derivado das parcelas, checkboxes mensais
e previsão de seis meses. Dívidas antigas podem receber um plano; a migration
pausa a recorrência antiga e preserva fatos realizados. Build passou. Próxima
ação exata: aplicar `202611170002_financial_debt_installment_plans.sql` e
`202611180001_attach_legacy_debt_plans.sql` no Supabase e validar Mercado Pago.

**FIX-UI-001 concluída em 2026-11-18:** corrigidos contraste dos ícones Aero,
grade do resumo financeiro, controles/limites do card Cartucho e listas mobile
em coluna (categorias e jogos). Consulta mensal deixa de exigir `debt_id`, sem
bloquear Início/Finanças no schema inicial. Build, três testes financeiros e
40 cenários Edge com fixtures passaram. Provas em
`docs/activity-log/2026-11-18/reported-ui-fixes.md`. Alterações locais, sem nova
release; planos de dívida ainda dependem da migração remota. O próximo passo
de REV-25 e as pendências CLOUD-001/FIN-UX-001 abaixo permanecem.

QA Edge passou para 10 aparências × 6 rotas × 4 larguras (240 cenários), com
fluxos de compras, jogos, dívida e login desconectado. A matriz revelou e
corrigiu a navegação Vaporwave 95 sobreposta pelo painel; release 0.4.0 e site
foram publicados. Commit 490071b, CI 44220414797, release 44220473964, Pages
44220414743, downloads/checksums e assinatura do APK verificados. Evidência em
`docs/releases/0.4.0-verification.md`.

PRÓXIMO PASSO: concluir REV-25 em `docs/development/project-review-2026-11-17.md`
com teste em um aparelho real e teclado virtual, registrando larguras/fluxos e
capturas que provem ausência de corte/overflow. A migration financeira não foi
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

Concluir REV-25 em `docs/development/project-review-2026-11-17.md`: testar em um
aparelho real, inclusive com teclado virtual, registrar os fluxos e capturas e
confirmar ausência de corte/overflow. Só então avaliar se o critério está
completo. Outras pendências de REVIEW-001 e CLOUD-001 continuam no workboard;
nenhuma cópia SQLite foi removida.

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
