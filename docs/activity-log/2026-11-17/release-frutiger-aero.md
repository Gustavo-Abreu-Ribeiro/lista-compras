# Frutiger Aero distribuído — 0.3.0

- Commit descritivo `444fb0c` enviado ao GitHub: aparência completa, seleção e
  persistência em um toque, QA e documentação, versões/locks alinhados em 0.3.0.
- Build frontend/cargo check locais passaram; QA visual repetida passou em seis
  rotas e quatro larguras, com fixtures isoladas sem dados reais.
- Workflow 44141028050 concluiu Windows/Android/publicação com sucesso. NSIS x64
  gerado e arranque do executável conferido; APK ARM64 0.3.0/versionCode 3000
  preserva o certificado da versão anterior, confirmado pelo apksigner.
- Tag anotada v0.3.0 aponta para 444fb0c. Release contém dois instaladores e
  SHA256SUMS.txt. Downloads públicos conferidos por formato/tamanho/SHA-256.
- Pages 44141025843 atualizou o site. Chrome confirmou botões apontando para os
  dois instaladores 0.3.0 reais, sem mocks da API de releases.
- Detalhes em `docs/releases/0.3.0-verification.md`. Sem remoção de dados, nova
  chave de assinatura ou alteração da release 0.2.0.
