# Arquitetura

## Visão geral

Lista de Compras é um aplicativo Tauri 2 cujo armazenamento de negócio vive no
Supabase; Tauri mantém capacidades nativas pontuais:

```text
Interface React/Vite                  Supabase             Processo Tauri
---------------------                 --------             --------------
rotas e layouts  -- adapters/SDK --> Postgres + RLS       busca de preços
tipos TypeScript                      Auth por usuário     sem persistência
```

SQLite em `app_data_dir/database.sqlite` é legado. O runtime não inicializa o
banco; comandos de legado só o abrem em leitura para importar e o removem após
confirmação. A conexão cloud só funciona após aplicar o SQL do projeto e
configurar Auth.

## Frontend

- `src/main.tsx` inicializa React e o roteador.
- `src/app/routes/index.tsx` declara `/`, `/shopping`, `/games`, `/login` e
  `/settings`.
- `src/features/*/api.ts` concentra as chamadas ao Supabase por domínio; a
  exceção é `features/migration/api.ts`, que exporta a base antiga via Tauri.
- `src/types/` descreve valores recebidos dos comandos nativos.
- `src/services/supabase.ts` cria cliente com URL e chave publicável configuradas.
  A sessão Supabase Auth identifica a conta; RLS separa os dados.

Componentes de UI não devem conhecer SQL, caminho do banco ou chaves secretas.

## Backend Tauri

- `src-tauri/src/lib.rs` registra apenas comandos nativos que não persistem
  dados de negócio.
- `src-tauri/src/main.rs` delega ao `run()` da biblioteca para que o binário
  desktop e as builds mobile usem o mesmo registro de comandos.
- `commands/` mantém consultas externas de preço com timeout; dados e histórico
  de preços devem ser escritos pelo adapter Supabase do usuário autenticado.
- `db/` é legado e não é inicializado no runtime atual. `commands/legacy.rs`
  exporta a base existente para a importação explícita.
- `models/` define a serialização enviada ao frontend.

## Dados na nuvem

```text
app_categories (id, uuid, owner_id, name)
    1 └── N app_items (id, uuid, owner_id, category_id, name)
                 1 └── N app_item_links (owner_id, item_id, store_name, url, price)
                              1 └── N app_item_link_price_history (price, observed_at)
```

As relações são protegidas por chaves estrangeiras compostas com `owner_id` e
políticas RLS para a conta autenticada. Preferências de tema e o identificador
da migração desta instalação podem ficar no `localStorage`; dados de negócio não.

## Limites de rede

- `fetch_price_from_url` busca uma página HTTP(S) e tenta extrair preço.
- Comandos Google Shopping usam SerpApi e requerem chave.
- Falha de rede, HTML diferente, ausência de chave ou resposta malsucedida
  resultam em ausência de oferta, não em falha da lista local.

Não exponha `SERPAPI_KEY` ao frontend nem prometa exatidão de dados externos.

Mudança de comando Tauri, migração ou modelo serializado é mudança de contrato.
Atualize o [índice de contratos](contracts/README.md) e use ADR para decisões
difíceis de reverter.

## Financeiro

O módulo financeiro é uma fronteira independente, documentada em
[docs/finance](finance/README.md). Os dados ficam em tabelas próprias no
Supabase; cálculos agregados e gravações atômicas serão movidos dos comandos Rust
para adapters/funções SQL. A integração futura com desejos ocorre por contrato
explícito de impacto de compra.
