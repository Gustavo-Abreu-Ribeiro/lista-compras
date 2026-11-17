# CLOUD-001 — Supabase como banco principal

## Decisão e objetivo

ADR-005 define Supabase Auth + Postgres/RLS por usuário como fonte única dos
dados de negócio. Compras, histórico de preços, jogos e finanças devem sair do
SQLite/localStorage. Preferências de interface podem continuar locais.

## Estado verificado

- O projeto Supabase foi criado pelo usuário e `VITE_SUPABASE_URL` mais a chave
  publicável estão em `.env.local`, arquivo ignorado pelo Git.
- `src/services/supabase.ts` instancia o cliente com chave publicável e sessão
  persistente.
- `supabase/migrations/202611160001_initial_cloud_schema.sql` define tabelas
  `app_*`, relações compostas por usuário e políticas RLS.
- Os adapters de compras, links/histórico de preços, jogos e finanças usam
  tabelas Supabase com RLS; as rotas pessoais exigem sessão Supabase Auth.
- O runtime Tauri não inicializa SQLite. O banco antigo é aberto somente para
  exportação de migração e remoção explicitamente confirmada.
- O comprovante remoto da importação é individual por instalação, para não
  permitir apagar a cópia de outro dispositivo sem importá-la.
- O usuário executou o SQL inicial com sucesso; os fluxos Auth/RLS e CRUD ainda
  precisam de validação em runtime.
- Dados locais serão preservados e importados após autenticação; SQLite só será
  removido depois de comparar contagens, UUIDs e relações.

## Próximos incrementos

1. Validar políticas RLS e CRUD no runtime com duas contas.
2. Importar os dados legados em Ajustes e conferir contagens e relações.
3. Remover SQLite somente pela ação confirmada
   desta instalação.

## Critérios de aceite

- Dois usuários autenticados nunca leem nem alteram dados um do outro.
- Dados persistem entre dispositivos e sessões usando a mesma conta.
- Falha de configuração/rede não grava em SQLite nem `localStorage`.
- Migração não apaga cópia local até a conferência remota ser concluída.
- `npm run build`, `cargo check --manifest-path src-tauri/Cargo.toml` e prova
  manual de Auth/RLS passam.
