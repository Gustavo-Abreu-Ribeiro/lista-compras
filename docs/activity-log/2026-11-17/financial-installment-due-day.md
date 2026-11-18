# Vencimento das parcelas e acompanhamento da revisão

- REV-01 da revisão de confiabilidade foi corrigido no adaptador financeiro.
  Cada parcela preserva o dia do primeiro vencimento; meses curtos usam o último
  dia e os meses seguintes retomam o dia original quando possível.
- A distribuição dos centavos entre as parcelas permanece exata.
- Verificações: `npm run test:finance` (3 testes), `npm run build` e
  `cargo check --manifest-path src-tauri/Cargo.toml` passaram em 2026-11-17.
- A revisão foi registrada em `docs/development/project-review-2026-11-17.md`,
  com REV-01 riscado e os demais achados pendentes.
- Próxima prova: REV-06, atualizar o gráfico financeiro após movimentações sem
  trocar de mês. A validação Auth/RLS e da importação segue em CLOUD-001.
