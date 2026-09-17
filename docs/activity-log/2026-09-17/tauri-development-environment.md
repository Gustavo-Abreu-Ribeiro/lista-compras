# Ambiente de desenvolvimento Tauri

## Contexto

O projeto não iniciava em modo Tauri porque o `cargo` não estava disponível no
`PATH`; após habilitar o toolchain Rust, a compilação revelou a ausência do
linker MSVC (`link.exe`).

## Mudança

- Configurado o toolchain `stable-x86_64-pc-windows-msvc` pelo Rustup.
- Instalado o workload C++ do Visual Studio Build Tools necessário ao linker.

## Validação

- `cargo --version`: 1.98.1.
- `rustc --version`: 1.98.1.
- `npm run build`: concluído com sucesso.
- `cargo check --manifest-path src-tauri/Cargo.toml`: concluído com sucesso.
- `npm run tauri dev`: Vite iniciado em `http://localhost:1420/` e o binário
  `target\\debug\\lista-compras.exe` iniciado.

## Observações

O compilador reporta cinco avisos de funções Rust não usadas. Eles não impedem
o build nem a inicialização e não foram alterados neste incremento de ambiente.
