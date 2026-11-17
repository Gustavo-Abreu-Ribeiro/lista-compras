# ADR-005: Supabase como fonte única dos dados do usuário

- Status: accepted
- Data: 2026-11-16

## Contexto

O app hoje persiste compras e finanças em SQLite, jogos em `localStorage` e
sincroniza partes de compras/jogos com Supabase de forma opcional. Isso pode
mostrar estados diferentes entre dispositivos e deixa dados dependentes do
dispositivo. O objetivo do produto mudou para contas que acessam seus próprios
dados em mais de um dispositivo, sem banco local de negócio.

## Decisão

- Supabase Postgres é a fonte única para categorias, itens, links e histórico de
  preços, jogos e dados financeiros.
- Supabase Auth é o provedor de login inicial. Todas as linhas de negócio têm
  `owner_id` e políticas RLS que limitam leitura e escrita ao usuário autenticado.
- O frontend chama Supabase por adaptadores de feature; Tauri continua somente
  com capacidades locais necessárias, como consultar preço externo, sem guardar
  dados de negócio.
- SQLite local deixa de ser fonte de verdade e será removido depois de uma
  migração verificada dos dados locais. Preferências de aparência podem continuar
  em `localStorage`; dados de negócio não podem ter fallback local silencioso.
- A chave pública/publishable do Supabase pode estar no cliente apenas com RLS
  ativo. Chaves secret/service-role nunca entram no frontend nem no repositório.

## Consequências

- Criar conta ou entrar passa a ser requisito para acessar dados de negócio.
- Sem configuração ou conexão Supabase, o app deve explicar o impedimento e não
  gravar localmente.
- A migração SQLite → Supabase deve preservar UUIDs e relações e só remover o
  arquivo local após confirmação de que a importação foi concluída e conferida.
- Consultas e gravações deixam de funcionar offline. Uma futura sincronização
  offline exige decisão própria sobre fila, conflito e reconciliação.

## Provas exigidas

- RLS impede um usuário de ler, criar, alterar ou apagar dados de outra conta.
- Compras, jogos, preços e finanças funcionam com Supabase configurado.
- Falha de rede/configuração apresenta estado útil e não aciona SQLite/localStorage
  como banco alternativo.
- Migração de dados existentes confere contagens e UUIDs antes da limpeza local.

## Referências

- [Arquitetura](../architecture.md)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
