# Arquitetura financeira

O módulo é local-first e desacoplado da lista de compras. Sua única integração
direta inicial é a análise de impacto de um desejo ou produto, nunca a mistura
de tabelas ou regras de domínio.

```text
FinanceLayout / componentes de finanças
              |
              v
src/features/finance/api.ts  (contrato Tauri)
              |
              v
src-tauri/src/commands/finance.rs
              |
       +------+------+
       |             |
       v             v
 cálculos centrais   SQLite financeiro
```

## Responsabilidades

| Camada | Responsabilidade |
| --- | --- |
| UI | capturar intenção, apresentar explicações e simulações; não calcular saldo por conta própria |
| Adaptador TypeScript | nomear e tipar chamadas Tauri |
| Comandos Rust | validar entradas, coordenar persistência e expor contratos |
| Camada de cálculo | calcular saldo, comprometimento, projeções, orçamento e impacto |
| SQLite | fatos financeiros, configurações e histórico imutável |

## Domínios

O módulo cresce por fronteiras explícitas: contas, categorias, lançamentos,
recorrências, contas a pagar, parcelas, investimentos, metas, orçamentos,
projeções, análises, dívidas, notificações e integração com desejos.

`financial_transactions` registra fatos ou previsões. `financial_installments`
representa compromissos mensais futuros. Metas não movem dinheiro sozinhas: a
contribuição só ocorre mediante lançamento confirmado pelo usuário.

## Regras de evolução

- Valores monetários persistidos são inteiros em centavos.
- Datas são ISO `YYYY-MM-DD`; relatórios usam o mês `YYYY-MM`.
- Alterações de salário, categoria ou regra futura não podem reescrever fatos
  ou projeções históricas já confirmadas.
- Integrações bancárias futuras devem entrar como importadores que produzem
  lançamentos normalizados; não terão acesso direto à UI ou a cálculos.
- Um cálculo compartilhado pertence ao Rust. A interface apenas formata o
  resultado.
