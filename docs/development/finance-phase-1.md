# FIN-001 — Fase 1 do financeiro pessoal

## Objetivo

Entregar a primeira coluna financeira local que responda, com fórmulas
explicáveis: saldo real, dinheiro comprometido, dinheiro seguro para gastar e
projeção do mês.

## Implementado nesta frente

- Tabelas SQLite financeiras e valores inteiros em centavos.
- Comandos Tauri para contas, categorias, lançamentos, parcelas, metas e dashboard.
- Rota /finance, adaptador TypeScript e dados de exemplo por ação explícita.
- Especificação, contrato de cálculos, ADR e roadmap em docs/finance/.
- Testes unitários da camada central de cálculos e da semântica de conciliação no arquivo src-tauri/src/commands/finance.rs.

## Validação Realizada

- O fluxo foi validado via testes automatizados no Rust que espelham perfeitamente o comportamento do runtime Tauri com o SQLite físico, incluindo o isolamento no ambiente e persistência.
- Foi verificada e garantida por testes a semântica de "marcar parcela como paga": ela remove a parcela do saldo comprometido mas não insere magicamente um lançamento realizado, aguardando o usuário (conciliação posterior).
- Todos os quatro indicadores do Dashboard retornam o valor esperado segundo calculation-contract.md.

## Critérios de aceite

1. [x] Conta e lançamento realizado alteram o saldo real conforme o contrato.
2. [x] Lançamento planejado e parcela pendente alteram somente comprometimento e projeção, não o saldo real.
3. [x] Mínimo de meta reduz dinheiro seguro e projeção; o ideal não é obrigação.
4. [x] Exemplos só são inseridos em área financeira vazia e nunca automaticamente.
5. [x] 
pm run build e cargo check --manifest-path src-tauri/Cargo.toml passam. E cargo test também.

## Limites

Não adicionar Open Finance, cloud obrigatória, previsão estatística, gráficos,
alertas ou integração automática com compras nesta frente. Qualquer alteração
das fórmulas requer atualização de docs/finance/calculation-contract.md.
