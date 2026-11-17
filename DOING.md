# DOING — handoff operacional

Leia este arquivo antes de iniciar uma mudança. Ele é o resumo de execução mais
curto do repositório; código, testes e Git continuam sendo a prova final.

## Atividade Atual: CLOUD-001 (Migração para Supabase)

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
