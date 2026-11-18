# Playbook — Frontend

1. Leia a rota/layout e o adaptador em `src/features/` relacionados.
2. Chame Supabase somente pelos adaptadores em `src/features/*/api.ts`; não
   invoque SQLite ou Supabase diretamente em um componente.
3. Preserve nomes de payload esperados por comandos nativos em uso.
4. Distinga carregamento, falha de rede e ausência de registros; não crie
   fallback local para dados de negócio.
5. Execute `npm run build` e atualize tipos/contratos quando necessário.

Se a tela exige capacidade inexistente, documente ou proponha primeiro o
comando correspondente; não simule persistência que não existe.
