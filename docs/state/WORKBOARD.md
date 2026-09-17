# Workboard

Registro vivo de propriedade e handoff. Não substitui Git, código, testes,
roadmap ou registro de atividades.

## Regras

- Crie entrada para trabalho concorrente, que atravesse sessões ou possa ficar
  incompleto.
- Uma entrada tem uma pessoa/agente responsável e resultado coerente.
- Atualize-a no mesmo commit de mudança relevante de estado.
- Antes de assumir uma entrada, confira Git e a prova registrada.
- Ao concluir, remova a entrada ou deixe evidência concreta; não use
  "continuar" como próximo passo.

## Trabalho ativo

## FIN-001 — Fundação do financeiro pessoal

- Status: in progress
- Owner/lane: agente atual
- Scope: modelo local, cálculo central inicial, contratos, dashboard e registro
  de lançamentos da Fase 1
- Boundaries: não alterar dados existentes de compras; não implementar Open
  Finance, sincronização financeira ou previsões apresentadas como certeza
- Evidence: `npm run build`, `cargo check`, revisão do contrato de cálculos e
  fluxo local Tauri
- Next step: seguir `DOING.md`: validar em runtime Tauri os dados de exemplo,
  indicadores e persistência; registrar a evidência em
  `docs/development/finance-phase-1.md`
- Updated: 2026-09-17

## Modelo de entrada

```md
## ID — título curto

- Status: open | in progress | blocked | complete
- Owner/lane: pessoa, agente ou branch
- Scope: menor resultado pretendido
- Boundaries: arquivos, dados ou contratos que não devem mudar
- Evidence: teste, comando, revisão ou ADR necessário
- Next step: ação exata, arquivo/contrato e prova esperada
- Updated: YYYY-MM-DD
```
