# Visão e fundação do módulo financeiro

## Contexto

O pedido do produto descreve um controle financeiro pessoal integrado à lista de
compras, com foco em saldo real, comprometimentos, projeções, metas e decisões
de compra explicáveis.

## Mudança

- Registrada a visão canônica, arquitetura, contrato de cálculos, roadmap e ADR
  financeiro.
- Iniciada a fundação SQLite/Rust de contas, categorias, lançamentos, parcelas,
  metas e orçamento em centavos.
- Adicionada a rota financeira com dashboard, lançamentos rápidos, contas,
  categorias, parcelas, metas e exemplos inseridos somente por ação explícita.
- Criado o workboard FIN-001 para que próximas sessões preservem o mesmo escopo.

## Validação

- `npm run build` concluído com sucesso.
- `cargo check --manifest-path src-tauri/Cargo.toml` concluído com sucesso.
- `npm run tauri dev` iniciou o Vite em `http://localhost:1420/` e o binário
  `lista-compras.exe` com a revisão financeira.
- O compilador mantém avisos preexistentes de funções Rust não usadas; eles não
  pertencem ao módulo financeiro e não impedem a compilação.

## Fora de escopo

Não foram declarados como entregues importação bancária, Open Finance, previsão
estatística, alertas, gráficos ou integração pronta com desejos.
