# UI-AERO — Frutiger Aero

## Visão

Uma aparência completa em um toque, inspirada no otimismo tecnológico dos anos
2000: céu, água, natureza, reflexos, vidro e botões brilhantes. A identidade deve
alterar a composição das telas e a navegação, mantendo as ações reconhecíveis.

## Arquitetura e contrato

`data-theme="aero"` no HTML, persistido na preferência visual existente
`lista-compras:theme`. CSS próprio importado depois de Cartucho, sempre escopado
ao tema. Paisagem SVG local e ícones vetoriais sem dependências de runtime.
Seleção em Ajustes > Aparência; aplicação imediata e reversão pelo mesmo seletor.
Nenhuma mudança em Supabase, Tauri, cálculos ou permissões.

## Roadmap e aceite

1. Identidade, navegação com ícones e superfícies de vidro em todas as rotas.
2. Layout desktop e mobile; foco visível, contraste e movimento reduzido.
3. Build e navegador: seleção, persistência após reload, troca para Cartucho e
   Feira, modais/formulários, rotas e ausência de overflow.

## Implementado e verificado

Nona aparência em Ajustes, com aplicação imediata e preferência persistida no
dispositivo. Paisagem SVG local, navegação de vidro no desktop, dock com ícones
no celular, resumo com saldo verde, categorias e lojas em painéis claros,
formulário de jogos ao lado da coleção no desktop, abas financeiras, login e
ajustes próprios. Sem animação contínua nem dependência adicional.

Texto escuro sobre superfícies claras, foco visível, safe area inferior e
movimento reduzido. SVGs decorativos são ocultos da árvore acessível; nomes e
ações dos controles permanecem os mesmos.

`npm run build` passou. Chrome com fixtures isoladas conferiu seis rotas em
1440/768/390/320 px sem overflow, seleção/persistência após reload, modal de
item, formulário financeiro, dock móvel, reversão Cartucho/Feira e movimento
reduzido. Login sem sessão conferido em desktop/mobile. Nenhum dado real usado.

Para reproduzir, execute Vite e use Playwright Core disponível externamente:

```sh
node scripts/site/verify-aero.mjs <caminho-do-modulo-playwright-core>
```

Capturas em `dist/aero-qa/` (ignorado); exemplos em
`docs/screenshots/frutiger-aero/`. Fixtures compartilhadas com captura do site
em `scripts/site/demo-context.mjs`, bloqueando o host Supabase remoto.

Revisão React: componentes sem novos efeitos, chamadas de dados ou hooks
condicionais; ícones decorativos e botões de tema com `aria-pressed`.
Não houve mudança de lógica Rust. A distribuição com esta aparência está sendo
preparada na versão 0.3.0 para Windows e Android, com a assinatura anterior
preservada. A versão 0.2.0 continua disponível como release histórica.
