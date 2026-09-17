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
- Especificação e fundação de dados do módulo financeiro em andamento; ela não
  representa ainda uma funcionalidade financeira completamente validada ao usuário.

## Limites verificados

- A tela principal é introdutória; a experiência completa de lista não está
  demonstrada pela interface atual.
- Não há testes automatizados configurados no repositório.
- Não há sincronização automática, resolução de conflitos, conta obrigatória ou
  garantia de preços externos.
- O uso efetivo de Supabase não integra o fluxo local de dados.

## Próximo passo sugerido

Concluir a Fase 1 financeira seguindo `docs/finance/`: registrar comandos,
adaptador e dashboard mínimo sobre a fundação de dados já compilados; validar
manualmente exemplos, persistência e semântica das parcelas no Tauri, conforme
o próximo passo em `DOING.md`.
