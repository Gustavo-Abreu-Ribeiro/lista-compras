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

Nenhum trabalho ativo registrado.

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
