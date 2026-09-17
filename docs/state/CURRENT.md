# Estado atual da Lista de Compras

> Última verificação documental: 2026-09-17
>
> Este é um resumo para retomada. Código, testes e comandos reproduzíveis são a
> prova do comportamento da revisão atual.

## Implementado

- Aplicativo Tauri 2 com frontend React/TypeScript e rotas base.
- Inicialização de SQLite no diretório de dados da aplicação.
- Categorias, itens e links de lojas com UUID e timestamps.
- Criação, listagem, remoção e upsert por UUID expostos por comandos Tauri.
- Consultas auxiliares de preço por URL e Google Shopping/SerpApi.
- Cliente Supabase opcional, condicionado a variáveis Vite.
- Fase 1 Financeira concluída: Dashboard, cálculo de Saldo Real, Seguro para Gastar, Comprometido e Projeção mensal, incluindo gestão de parcelas e metas mínimas, e validado por testes unitários e de integração locais.

## Limites verificados

- A tela principal é introdutória; a experiência completa de lista não está
  demonstrada pela interface atual.
- Não há sincronização automática, resolução de conflitos, conta obrigatória ou
  garantia de preços externos.
- O uso efetivo de Supabase não integra o fluxo local de dados.
- O módulo financeiro realiza controle manual e não utiliza Open Finance.

## Próximo passo sugerido

Consolidar a experiência principal da Lista de Compras. A fundação de compras (itens e categorias) deve ser unida à interface principal e tornar-se a prioridade. Alternativamente, avançar para a Fase 2 do Financeiro, dependendo da prioridade do usuário/negócio. O ambiente local está estável, com build passando e os primeiros testes configurados em Rust.
