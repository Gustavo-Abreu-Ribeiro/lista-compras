# DOING — handoff operacional

Leia este arquivo antes de iniciar uma mudança. Ele é o resumo de execução mais
curto do repositório; código, testes e Git continuam sendo a prova final.

## FIN-001 — Fase 1 do financeiro pessoal

- Estado: EM CURSO
- Dono/lane: próxima sessão ou agente que reivindicar a tarefa
- Escopo confirmado: contas, categorias, lançamentos, parcelas, metas,
  dashboard de dinheiro real/comprometido/projetado e exemplos opt-in locais.
- Já existe: esquema SQLite, comandos Rust, adaptador TypeScript, rota
  `/finance`, interface inicial e documentação em `docs/finance/`.
- Prova já obtida: `npm run build` e
  `cargo check --manifest-path src-tauri/Cargo.toml` concluídos em 2026-09-17.
- Não fazer nesta unidade: Open Finance, sincronização financeira, previsões por
  histórico, gráficos, alertas, dívidas ou integração automática com desejos.

## PRÓXIMO PASSO

Executar `npm run tauri dev` em um terminal com Cargo disponível, abrir
`/finance`, inserir os exemplos opt-in e verificar que os quatro indicadores,
lançamentos, parcela e meta atualizam sem erro. Registrar o resultado em
`docs/development/finance-phase-1.md`; se houver falha, registrar a causa e o
menor passo de reprodução antes de alterar a regra de cálculo.

## Regra de retomada

1. Confirme `git status`, este arquivo e `docs/development/`.
2. Verifique a prova indicada antes de confiar nela.
3. Reivindique a unidade no mesmo commit do primeiro passo, se houver trabalho
   concorrente.
4. Termine uma unidade coesa: implementar, validar, atualizar este arquivo e
   o workboard. Não deixe uma alteração sem prova ou handoff exato.
