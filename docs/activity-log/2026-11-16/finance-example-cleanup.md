# Limpeza segura da amostra financeira antiga

- Adicionada detecção da fixture histórica pelos valores, vínculos e registros completos originais.
- A interface oferece a remoção apenas quando todos os dados da amostra estão intactos e não existem transações, parcelas, limites ou recorrências adicionais ligados à conta/categorias.
- O usuário confirma a limpeza. O Rust revalida a fixture dentro de transação e remove apenas seus registros; se ela foi editada ou ampliada, preserva os dados.
- Comandos públicos: `has_financial_example_fixture` e `remove_financial_example_fixture`.
- Verificações: `npm run build` e `cargo check --manifest-path src-tauri/Cargo.toml`.
- Validação visual no `npm run tauri dev` continua pendente.
