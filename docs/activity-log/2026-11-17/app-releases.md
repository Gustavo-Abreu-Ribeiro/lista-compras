# Releases Windows e Android — 0.2.0

- Versões npm/Cargo/Tauri e locks alinhadas em 0.2.0, com changelog e notas.
- CI manual compila NSIS Windows x64 e APK Android ARM64 no mesmo commit,
  verifica Auth/configuração pública, arranque Windows, assinatura/metadados APK
  e publica somente após os dois builds passarem.
- Primeira chave Android RSA 3072 preservada em backup privado fora do Git e
  secrets criptografados no Actions. Windows sem Authenticode comercial.
- Corrigida a seleção do pacote SDK Android: `platform-tools` substitui o
  pacote obsoleto `tools` solicitado pela ação antiga de setup.
- Build frontend e cargo check locais passaram; UI de produção chegou ao login
  em desktop/celular sem gravação de dados. CI 44133883561 concluiu com sucesso.
- Tag anotada v0.2.0 no commit 732cc08, dois instaladores e SHA256SUMS.txt públicos.
  Assets baixados por streaming e conferidos por tamanho/formato/SHA-256.
- Site publicado reconhece os dois links reais, confirmado no Chrome.
- Evidência detalhada em `docs/releases/0.2.0-verification.md` e procedimento em
  `docs/releases/README.md`. CRUD/RLS, migração e dispositivos reais continuam
  com as próprias pendências; nenhum dado de usuário foi apagado.
