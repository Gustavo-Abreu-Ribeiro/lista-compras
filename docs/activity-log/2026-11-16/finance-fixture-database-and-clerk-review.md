# Remoção de dados demonstrativos e verificação de persistência/login

- Removido o botão para popular Finanças com exemplos e removido o comando
  `seed_financial_example` do contrato Tauri de produção. A fixture segue
  disponível apenas para os testes Rust existentes.
- SQLite fica em `app_data_dir/database.sqlite`; o início do Tauri cria o
  diretório, abre a conexão e executa migrações. Cada conexão de domínio também
  habilita foreign keys.
- O teste financeiro existente passou usando diretório temporário: abriu banco,
  migrou esquema e executou consultas e gravações. Isso confirma o fluxo local,
  não a base instalada de um usuário.
- Não há `.env` na raiz nem variáveis `VITE_SUPABASE_URL`/
  `VITE_SUPABASE_ANON_KEY` nesta execução; portanto a conexão remota Supabase e
  suas políticas RLS não foram verificadas.
- Clerk é compatível com frontend React/Vite. Para este app, substituir Supabase
  Auth requer adaptar os consumidores de sessão e emitir o token Clerk ao cliente
  Supabase, além de configurar o provider Clerk e as políticas RLS. OAuth no
  Tauri exigiria validar deep links em builds empacotados; Clerk documenta esse
  fluxo para Electron em beta, sem integração Tauri pronta.
- Referências oficiais: [Clerk React/Vite](https://clerk.com/docs/react/getting-started/quickstart),
  [Clerk com Supabase](https://clerk.com/docs/guides/development/integrations/databases/supabase),
  [OAuth por deep link do Clerk](https://clerk.com/docs/guides/configure/auth-strategies/oauth-deep-links),
  [deep links Tauri](https://v2.tauri.app/plugin/deep-linking/).
- Verificação: `npm run build`, `cargo check --manifest-path src-tauri/Cargo.toml`,
  teste financeiro Rust isolado e `git diff --check` passaram. A checagem Rust
  mantém avisos `dead_code` preexistentes.
