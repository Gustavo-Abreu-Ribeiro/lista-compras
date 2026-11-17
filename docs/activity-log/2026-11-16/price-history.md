# Histórico e gráfico de preços

## Mudanças

- Migração aditiva cria observações históricas por link de loja e retroalimenta
  a amostra inicial usando preços já salvos.
- Links criados com preço passam a registrar um ponto no histórico.
- O app agenda atualização local ao abrir e a cada hora, processando no máximo
  três links elegíveis por lote e nunca mais de uma vez por dia para o mesmo
  link. A extração usa a URL salva e não faz busca geral automática.
- A lista de lojas do item mostra o gráfico e a data do último preço observado.
- A chave SerpApi é lida no processo Rust, sem ser enviada pelo frontend.
- Registrada a decisão em [ADR-002](../../adr/ADR-002-price-history.md).

## Verificação

- `cargo check --manifest-path src-tauri/Cargo.toml` passou com avisos de itens
  não utilizados já existentes e dos novos comandos Tauri.
- `npm run build` passou.
- `git diff --check` passou; Git reportou somente avisos de normalização LF/CRLF.

## Limites

- O gráfico mostra observações concluídas. Sites podem bloquear extração e não
  existe garantia de preço atual ou atualização em tempo real.
- Atualização automática só ocorre enquanto o app está aberto.
