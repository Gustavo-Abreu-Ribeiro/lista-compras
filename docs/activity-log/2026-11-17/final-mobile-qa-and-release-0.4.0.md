# QA mobile final e preparo da release 0.4.0

## Responsividade

- Matriz Edge em dez temas, seis rotas e larguras 320, 360, 390 e 480 px:
  240 cenários, sem overflow horizontal ou erros JavaScript.
- Fluxos incluíram navegação móvel, seleção de categoria/item e links, cards de
  jogos, expansão do plano de dívida, formulário e login desconectado.
- A matriz encontrou a navegação inferior escondida em Vaporwave 95 a 320 px.
  Corrigida a regra mobile e repetida a matriz completa com sucesso.
- Capturas de 320 px de Vaporwave 95, Cartucho e Frutiger Aero inspecionadas.
  Teste em aparelho físico e teclado virtual permanece pendente.

## Site e distribuição

- Galeria passou a incluir Vaporwave 95; capturas atuais do app foram geradas
  com fixtures isoladas em desktop e quatro larguras mobile.
- Versões npm, lockfile, Cargo e Tauri alinhadas em 0.4.0; changelog e notas
  descrevem o tema e a melhoria mobile.
- O site consulta dinamicamente os assets da release estável. Após o workflow,
  confirmou links 0.4.0 na página publicada, incluindo APK e instalador Windows.
- Release 0.4.0 publicada: workflows Windows/Android, CI e Pages passaram. Os
  dois downloads e SHA-256 passaram; certificado Android bate com 0.3.0 e o APK
  informa versionCode 4000. Evidência completa em `docs/releases/0.4.0-verification.md`.
- A migration de planos de dívida não foi aplicada à instância Supabase. O app
  mantém o cadastro desabilitado até a migration ser validada; a nova release
  documenta este limite.
