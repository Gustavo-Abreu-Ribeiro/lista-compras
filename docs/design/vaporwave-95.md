# Vaporwave 95

## Visão

Uma aparência completa que combina a nostalgia de uma interface Windows 95 com
uma paisagem digital de pôr do sol, horizonte quadriculado e cores suaves. O
resultado deve lembrar tecnologia doméstica de outra época reinterpretada como
um ambiente atual, sem depender de neon agressivo ou referências futuristas dos
anos 1980.

## Arquitetura e contrato

`data-theme="vaporwave"` no HTML, persistido pela preferência visual existente
`lista-compras:theme`. Estilos em `src/styles/vaporwave.css`, importados depois
dos estilos base e escopados ao tema. A seleção acontece em Ajustes > Aparência;
nenhum dado, cálculo, autenticação ou contrato nativo muda.

## Direção visual

- Desktop com barra de tarefas, controles com relevo e superfícies de janela.
- Céu rosa e azul, horizonte pixelado e tons de lavanda, cinza e azul clássico.
- Retícula em blocos de 12 px e sol em silhueta escalonada reforçam o acabamento
  pixelado sem comprometer a leitura dos controles.
- Compras, jogos, finanças, ajustes e navegação usam a mesma linguagem.
- Em celular, navegação e grades se adaptam à largura; abaixo de 380 px os
  resumos e cards de jogo passam a uma coluna para preservar leitura e controles.
- Respeitar foco visível e movimento reduzido.

## Verificação

`npm run build` passou em 2026-11-17. Falta conferir a aparência renderizada em
larguras pequenas e em um dispositivo real como parte da revisão REV-25.
