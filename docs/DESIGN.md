# Identidade visual: Cartucho

O tema **Cartucho** é selecionado por um botão em Ajustes > Aparência. Ele usa
as molduras edgy fornecidas pelo usuário como referência de composição. A moldura
vertical original é usada na área de Jogos. As demais telas usam CSS leve para
reproduzir a linguagem de cantos cortados, linhas, etiquetas e código de barras.

## Tokens

| Papel | Valor |
| --- | --- |
| Fundo | `#0e0e10` |
| Navegação | `#0a0a0b` |
| Painel | `#17171a` |
| Painel elevado | `#1f1f23` |
| Linhas | `#34343a` |
| Texto | `#ede3ce` |
| Texto secundário | `#a39c8c` |
| Ação | `#ff4a3d` |
| Dinheiro positivo | `#4dffa0` |
| Destaque financeiro | `#f2a900` |

## Componentes e layout

- Navegação numerada em sidebar de 216 px; abaixo de 900 px, barra superior
  compacta e navegação principal no rodapé.
- Painéis e botões têm chanfros, borda fina e nenhum arredondamento suave.
- Início coloca o saldo real como painel dominante e agrupa os demais resumos ao
  lado; no celular todos se empilham.
- Finanças usa o painel âmbar para dinheiro seguro e mantém indicadores com
  texto/legenda, além de cor.
- Jogos usa `public/themes/cartucho/game-frame.png`, cópia da moldura vertical
  fornecida, com o nome e os controles já existentes por cima.
- Scanlines são decorativas e não interceptam clique. Movimentos respeitam
  `prefers-reduced-motion`.

## Limites

O tema não altera dados, fórmulas, APIs, rotas nem a função dos controles. A
tipografia usa Impact/Bahnschrift/Consolas e alternativas do sistema para não
depender de rede; as famílias mencionadas no protótipo não foram incorporadas.
