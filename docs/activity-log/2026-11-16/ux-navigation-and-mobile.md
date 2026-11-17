# Navegação e fluxos móveis

## Mudanças

- Unificada a navegação de Compras, Jogos, Finanças e Ajustes em um componente
  compartilhado, com estado ativo e navegação inferior responsiva.
- Removido o bloqueio de cadastro de item sem categoria selecionada. O fluxo
  permite escolher uma categoria existente ou criar uma categoria e o item em
  uma única ação.
- Categorias mostram seleção atual e ficam empilhadas verticalmente em telas pequenas.
- Painel de links só aparece depois que um item é selecionado; sem item selecionado,
  a lista usa a largura disponível.
- Reorganizado o dashboard financeiro para priorizar novo lançamento no celular,
  reduzir a altura dos indicadores e manter o resumo mensal legível.
- Datas padrão de lançamento financeiro usam o dia local, evitando mudança de
  data por conversão UTC.

## Verificação

- `npm run build` passou.
- `git diff --check` passou; o Git exibiu apenas avisos de conversão LF/CRLF.

## Limites

- A revisão melhora navegação e os fluxos de compras e finanças existentes. Não
  adiciona áreas personalizáveis nem modifica persistência ou comandos Tauri.
