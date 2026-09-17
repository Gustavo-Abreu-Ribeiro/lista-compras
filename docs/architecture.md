# Arquitetura

## Visão geral

Lista de Compras é um aplicativo Tauri 2 com duas camadas executáveis:

```text
Interface React/Vite                  Processo nativo Tauri
---------------------                 ---------------------
rotas e layouts                       comandos públicos
adapters de features   -- invoke -->  regras de dados e rede
tipos TypeScript                       SQLite e modelos serializados
```

O banco fica no diretório de dados da aplicação, com o nome `database.sqlite`;
ele não pertence ao repositório.

## Frontend

- `src/main.tsx` inicializa React e o roteador.
- `src/app/routes/index.tsx` declara `/`, `/shopping`, `/games`, `/login` e
  `/settings`.
- `src/features/*/api.ts` concentra chamadas a `@tauri-apps/api/core`.
- `src/types/` descreve valores recebidos dos comandos nativos.
- `src/services/supabase.ts` cria cliente somente se variáveis públicas Vite
  foram fornecidas. Ele não substitui SQLite como fonte local de verdade.

Componentes de UI não devem conhecer SQL, caminho do banco ou segredos.

## Backend Tauri

- `src-tauri/src/lib.rs` inicializa o diretório de dados, executa migrações e
  registra os comandos invocáveis.
- `commands/` implementa categorias, itens, links, upserts e consultas de preço.
- `db/connection.rs` centraliza a abertura SQLite e habilita foreign keys.
- `db/migrations.rs` cria e evolui o esquema existente.
- `models/` define a serialização enviada ao frontend.

## Dados locais

```text
categories (id, uuid, name, created_at)
    1 └── N items (id, uuid, category_id, name, notes, created_at)
                 1 └── N item_links (id, uuid, item_id, store_name, url, price)
```

As relações têm deleção em cascata. `id` é chave local; `uuid` identifica o
registro em operações de upsert. As operações atuais não formam sincronização
bidirecional, resolução de conflitos ou exclusão remota.

## Limites de rede

- `fetch_price_from_url` busca uma página HTTP(S) e tenta extrair preço.
- Comandos Google Shopping usam SerpApi e requerem chave.
- Falha de rede, HTML diferente, ausência de chave ou resposta malsucedida
  resultam em ausência de oferta, não em falha da lista local.

Não exponha `SERPAPI_KEY` ao frontend nem prometa exatidão de dados externos.

Mudança de comando Tauri, migração ou modelo serializado é mudança de contrato.
Atualize o [índice de contratos](contracts/README.md) e use ADR para decisões
difíceis de reverter.
