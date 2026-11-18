# Capturas reportadas: Aero, Cartucho e listas mobile

## Entrega

- Aero: ícones com traço branco mais espesso e sombra; removida a regra que
  aplicava azul sobre os fundos coloridos. Grade financeira com 12 px entre
  blocos, fundo transparente e largura mínima controlada.
- Cartucho: largura do card contida na coluna, link contido na arte e estados
  posicionados dentro da faixa acima do número de série. Títulos ficam abaixo
  do detalhe decorativo; até 760 px, cards compactos empilhados.
- Mobile: categorias de Compras Aero em coluna, sem altura flexível de 160 px;
  listas de jogos Aero/Cartucho/Vaporwave também usam uma coluna até 760 px.
- Finanças: consulta mensal usa as colunas do schema inicial; indicador mensal
  de dívida usa a consulta separada dos planos filtrada pelo mês. Isso elimina
  a dependência de `debt_id` na carga geral de Início/Finanças. Não houve
  migração remota, mudança de persistência ou alteração das fórmulas.

## Provas

- `npm run build`: passou; permanece o aviso de bundle acima de 500 kB.
- `npm run test:finance`: três testes passaram.
- `node scripts/site/verify-reported-ui.mjs <modulo-playwright-core> http://127.0.0.1:1422`:
  40 cenários Edge passaram. Aero/Cartucho em 1440/1000/768/680/480/390/320 px;
  categorias e jogos em coluna em Feira/Aero/Cartucho/Vaporwave nas larguras
  390/600/760 px; Início/Finanças nos schemas simulado inicial e com planos.
  Sem overflow nas páginas verificadas. Conferidos traços dos ícones, limites
  dos controles e bloqueio do cadastro de dívida quando falta a coluna.
- Capturas desktop/mobile inspecionadas em `dist/reported-ui-qa/` (ignorado).
- Fixtures bloqueiam o host Supabase real. Nenhum dado de conta foi usado.
  Playwright Core instalado apenas em pasta temporária, sem dependência nova
  no projeto. Rust não foi alterado; `cargo check` não foi executado.

## Limites e retomada

Alterações locais, sem nova release. A migração de planos continua pendente em
FIN-UX-001; validação autenticada em CLOUD-001 e aparelho físico/teclado virtual
em REV-25. A edição existente em `src-tauri/Cargo.toml` foi preservada.
