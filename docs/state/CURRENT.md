# Estado atual da Lista de Compras

> Última verificação documental: 2026-09-17
>
> Este é um resumo para retomada. Código, testes e comandos reproduzíveis são a
> prova do comportamento da revisão atual.

## Implementado

- Aplicativo Tauri 2 com frontend React/TypeScript e rotas base consolidadas.
- A experiência principal de compras foi unida à interface principal (rota padrão `/`), removendo a tela introdutória desnecessária.
- Inicialização de SQLite no diretório de dados da aplicação.
- Categorias, itens e links de lojas com UUID e timestamps.
- Criação, listagem, remoção e upsert por UUID expostos por comandos Tauri.
- Consultas auxiliares de preço por URL e Google Shopping/SerpApi.
- Cliente Supabase opcional, condicionado a variáveis Vite.
- Fase 1 Financeira concluída: Dashboard, cálculo de Saldo Real, Seguro para Gastar, Comprometido e Projeção mensal, incluindo gestão de parcelas e metas mínimas, e validado por testes unitários e de integração locais.

## Limites verificados

- Não há sincronização automática contínua nativa (o uso de Supabase é manual/experimental e não integra o fluxo local de dados como fonte da verdade).
- O módulo financeiro realiza controle manual e não utiliza Open Finance.

## Próximo passo sugerido

Avançar para a Fase 2 do Financeiro ou refinar funcionalidades de compras (edição/drag-and-drop), de acordo com a prioridade do negócio. O ambiente está limpo e a navegação principal está focada na funcionalidade de "Compras".
