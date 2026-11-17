# Distribuição do aplicativo

O workflow manual [Build and publish app release](https://github.com/Gustavo-Abreu-Ribeiro/lista-compras/actions/workflows/release.yml)
compila instalador NSIS Windows x64 e APK Android ARM64 no mesmo commit. A
publicação depende do sucesso dos dois jobs. A versão deve coincidir no npm,
locks, Cargo e Tauri; as notas ficam em `docs/releases/<versão>.md`.

## Fluxo

1. Atualizar versão, locks, changelog e notas; executar build frontend e
   `cargo check --manifest-path src-tauri/Cargo.toml --locked`.
2. Fazer commit/push e executar o workflow nessa revisão. O job Windows verifica
   também o início do executável por 12 s; o Android verifica assinatura e
   metadados do APK com as ferramentas do SDK.
3. O job final cria tag anotada `v<versão>`, gera `SHA256SUMS.txt` e publica os
   dois instaladores. Uma tag existente precisa apontar para o mesmo commit.
4. Executar `node scripts/release/verify-downloads.mjs v<versão>` para baixar por
   streaming os assets públicos, conferir tamanho, formato e SHA-256.

O frontend precisa de URL e chave **publicável/anon** Supabase no build. O guard
`scripts/release/check-config.mjs` rejeita service_role/secret e consulta Auth.
Nenhum `SERPAPI_KEY`, sessão ou dado pessoal entra no build.

## Configuração de assinatura e CI

Secrets do repositório:

| Secret | Finalidade |
| --- | --- |
| `VITE_SUPABASE_URL` | URL usada pelo cliente Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave pública do cliente, com RLS |
| `ANDROID_KEYSTORE_BASE64` | Keystore PKCS12 da identidade Android |
| `ANDROID_KEYSTORE_PASSWORD` | Senha do keystore e chave |
| `ANDROID_KEY_ALIAS` | Alias da chave Android |

A chave da primeira distribuição e a senha estão no backup privado local
`~/.codex/private/lista-compras/android-release.p12` e `android-release.json`.
O diretório tem ACL restrita ao usuário no Windows. Fazer backup privado seguro
dos dois arquivos: a mesma identidade é necessária para atualizar instalações
Android existentes. Não versionar, publicar ou substituir essa chave.

`scripts/release/provision.mjs` provisiona os secrets usando Git Credential
Manager em memória e sealed box com a chave pública do GitHub; não imprime
valores. Usa `node-forge` e `libsodium-wrappers` instalados em diretório de
ferramentas **fora do repositório**, passado como argumento. Não adiciona
dependências ao aplicativo. Se há chave remota e não há backup local, recusa
substituí-la. Execuções posteriores reutilizam o backup.

No runner, `android-signing.mjs` restaura o PKCS12 em `$RUNNER_TEMP`, grava as
propriedades ignoradas e o Gradle assina o APK. Material privado não é artefato
nem cache do build. Configurações JKS anteriores continuam sendo aceitas pelo
Gradle se `storeType` não for informado.

Windows é distribuído sem certificado comercial Authenticode. Android é
assinado com chave própria para instalação direta; não é release na Play Store.
Não há distribuição iOS nesta frente.

Referências: [build Tauri](https://v2.tauri.app/distribute/),
[assinatura Android](https://v2.tauri.app/distribute/sign/android/),
[setup Android](https://github.com/android-actions/setup-android).

## Limites de validação

Compilação, assinatura, início do processo e teste da tela de login não provam
CRUD/RLS com duas contas nem migração de dados em dispositivos reais. Essas
pendências continuam em CLOUD-001 e nas notas da versão. Nenhuma cópia SQLite
é removida para produzir uma release.
