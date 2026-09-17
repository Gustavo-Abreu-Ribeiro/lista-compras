# Playbook — Frontend

1. Leia a rota/layout e o adaptador em `src/features/` relacionados.
2. Reutilize o adaptador Tauri; não invoque SQLite ou serviço externo em um
   componente.
3. Preserve nomes de payload esperados pelo comando Rust.
4. Trate carregamento, falha e ausência de rede sem impedir a lista local.
5. Execute `npm run build` e atualize tipos/contratos quando necessário.

Se a tela exige capacidade inexistente, documente ou proponha primeiro o
comando correspondente; não simule persistência que não existe.
