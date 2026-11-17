# Correção da carga financeira no executável desktop

- O executável em `src-tauri/src/main.rs` mantinha um segundo registro de
  comandos Tauri incompleto. A tela financeira chama recorrências, histórico,
  orçamentos e dívidas em uma carga conjunta; a ausência de qualquer comando
  fazia a carga inteira falhar e mantinha os indicadores antigos.
- `main.rs` agora delega a inicialização para `lista_compras_lib::run()`, que
  mantém um único registro para desktop e mobile.
- O gráfico foi rotulado como realizado nos últimos seis meses: recorrências
  planejadas alteram a projeção, mas não reescrevem o histórico realizado.
- Valores do dashboard vêm do SQLite. Dados demonstrativos já salvos por uma
  versão anterior não são apagados automaticamente.
- Verificação: `npm run build`, `cargo check --manifest-path src-tauri/Cargo.toml`
  e `git diff --check` passaram. É necessário reiniciar o runtime Tauri para
  carregar o novo executável; validação manual ainda pendente.
