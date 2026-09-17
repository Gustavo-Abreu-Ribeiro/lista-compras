# Playbook — Rust, Tauri e dados

1. Localize comando em `commands/`, registro em `lib.rs`, modelo e adaptador
   TypeScript consumidor.
2. Para dados persistidos, revise `db/migrations.rs` e considere bases já
   existentes antes de alterar esquema.
3. Preserve foreign keys, UUIDs e erros úteis; não exponha segredos.
4. Para consultas externas, mantenha timeout, validação básica de URL e falha
   não bloqueante para o fluxo local.
5. Execute `cargo check --manifest-path src-tauri/Cargo.toml` e build frontend
   quando o contrato atravessar camadas.

Mudança incompatível de esquema, remoção de dados ou contrato exige decisão
explícita e documentação apropriada.
