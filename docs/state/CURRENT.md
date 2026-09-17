# Estado atual da Lista de Compras

> Última verificação documental: 2026-09-16
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

## Limites verificados

- A tela principal é introdutória; a experiência completa de lista não está
  demonstrada pela interface atual.
- Não há testes automatizados configurados no repositório.
- Não há sincronização automática, resolução de conflitos, conta obrigatória ou
  garantia de preços externos.
- O uso efetivo de Supabase não integra o fluxo local de dados.

## Próximo passo sugerido

Inspecionar a intenção da UI de compras e entregar uma fatia vertical pequena
que use adaptadores existentes, validada com build TypeScript e `cargo check`.
