# DOING — handoff operacional

Leia este arquivo antes de iniciar uma mudança. Ele é o resumo de execução mais
curto do repositório; código, testes e Git continuam sendo a prova final.

## Atividade Atual: CLOUD-001 (Migração para Supabase)

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
