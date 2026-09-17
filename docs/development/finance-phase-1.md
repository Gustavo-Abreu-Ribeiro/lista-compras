# FIN-001 — Fase 1 do financeiro pessoal

## Objetivo

Entregar a primeira coluna financeira local que responda, com fórmulas
explicáveis: saldo real, dinheiro comprometido, dinheiro seguro para gastar e
projeção do mês.

## Implementado nesta frente

- Tabelas SQLite financeiras e valores inteiros em centavos.
- Comandos Tauri para contas, categorias, lançamentos, parcelas, metas e
  dashboard.
- Rota `/finance`, adaptador TypeScript e dados de exemplo por ação explícita.
- Especificação, contrato de cálculos, ADR e roadmap em `docs/finance/`.

## Pendente

- Validar o fluxo em runtime Tauri usando os exemplos, incluindo a persistência
  após reiniciar o aplicativo.
- Conferir manualmente a semântica de “marcar parcela como paga”: hoje ela muda
  o compromisso e solicita um lançamento realizado separado; a conciliação
  automática é uma decisão de fase posterior.
- Adicionar testes unitários para a camada central de cálculo antes de ampliar
  regras de projeção.

## Critérios de aceite

1. Conta e lançamento realizado alteram o saldo real conforme o contrato.
2. Lançamento planejado e parcela pendente alteram somente comprometimento e
   projeção, não o saldo real.
3. Mínimo de meta reduz dinheiro seguro e projeção; o ideal não é obrigação.
4. Exemplos só são inseridos em área financeira vazia e nunca automaticamente.
5. `npm run build` e `cargo check --manifest-path src-tauri/Cargo.toml` passam.

## Limites

Não adicionar Open Finance, cloud obrigatória, previsão estatística, gráficos,
alertas ou integração automática com compras nesta frente. Qualquer alteração
das fórmulas requer atualização de `docs/finance/calculation-contract.md`.
