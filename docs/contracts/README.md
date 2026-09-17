# Índice de contratos

Contratos são fronteiras cuja alteração requer atualização coordenada e
validação real.

| Contrato | Dono | Consumidor | Referência |
| --- | --- | --- | --- |
| Comandos Tauri | `src-tauri/src/commands/` | `src/features/*/api.ts` | `src-tauri/src/lib.rs` |
| Esquema SQLite | `src-tauri/src/db/migrations.rs` | comandos e dados persistidos | [Arquitetura](../architecture.md) |
| Tipos serializados | `src-tauri/src/models/` | `src/types/` e UI | modelos e tipos |
| Configuração externa | ambiente do processo | Supabase e preços | [README](../../README.md#configuração-opcional) |

## Regras de mudança

- Adicionar comando: registre-o em `lib.rs`, crie/ajuste adaptador TypeScript e
  documente entrada, saída e falhas relevantes.
- Renomear comando ou campo: trate como incompatível; atualize os dois lados na
  mesma mudança e considere versão/ADR conforme impacto.
- Alterar esquema: preserve dados e UUIDs, exercite a migração e atualize a
  arquitetura se a estrutura observável mudar.
- Adicionar segredo: não o versione; documente apenas nome, finalidade e onde é
  consumido.
