# REL-001 — Distribuição Windows e Android

## Visão, arquitetura e contrato

Distribuir a versão 0.2.0 como instalador NSIS Windows x64 e APK Android ARM64
assinado. Compilação em runners GitHub Actions, sem novas dependências do app.
O workflow manual usa um único commit para os dois builds e publica somente
quando ambos terminam com sucesso. Tag anotada e checksums SHA-256 identificam
os arquivos. Nenhum dado do usuário é utilizado nos builds.

O frontend recebe exclusivamente a URL e a chave publicável/anon do Supabase;
um guard rejeita chaves privadas. A API Auth é consultada antes de compilar.
As credenciais de assinatura são secrets criptografados do Actions. A chave
Android foi criada para esta primeira distribuição, com backup privado fora do
Git em `~/.codex/private/lista-compras/`. Preservar chave e senha em atualizações.
Instalador Windows sem certificado Authenticode comercial.

## Roadmap e aceite

1. Alinhar versões 0.2.0, changelog e notas de release.
2. Configurar secrets e workflow; compilar e verificar ambos os artefatos.
3. Conferir APK com apksigner e arranque do executável Windows no CI.
4. Publicar tag/release, conferir assets e links de download no site.

O APK não é publicação na Play Store; iOS exige outra frente. Esta distribuição
não conclui CLOUD-001 e deve manter as limitações de validação real nas notas.

## Estado

`cargo check --locked` passou antes do bump de versão. Configuração Supabase
publicável validada contra Auth. Build e publicação CI ainda pendentes.
