# ADR-001 — Valores financeiros em centavos

## Status

Aceito — 2026-09-17

## Contexto

O módulo precisa somar parcelas, projeções e metas sem erros de arredondamento.
Valores em ponto flutuante introduzem imprecisão, especialmente ao dividir uma
compra em parcelas.

## Decisão

Persistir valores monetários como inteiros `*_cents` no SQLite e serializá-los
como inteiros para o TypeScript. A UI é responsável apenas por converter para
formato monetário brasileiro.

## Alternativas consideradas

- `REAL`/`f64`: simples, mas sujeito a erro binário acumulado.
- Texto decimal: preserva precisão, mas torna agregações e índices menos diretos.

## Consequências

Contratos financeiros recebem e devolvem centavos. Parcelamentos dividem o
inteiro e distribuem o resto de forma determinística. Qualquer integração futura
deve normalizar valores nesse formato antes de persistir.
