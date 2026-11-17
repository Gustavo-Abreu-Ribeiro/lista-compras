# Lista de Compras

Aplicativo de gestão pessoal com interface React executada pelo Tauri. A
migração em andamento move compras, jogos e finanças para Supabase Auth/Postgres
com isolamento por usuário; o SQLite permanece legado até a migração dos dados.

## Estado atual

- Compras, jogos, histórico de preços e finanças usam Supabase Auth/Postgres
  com isolamento por usuário. O SQLite antigo serve apenas como origem da
  importação e só é removido após conferência explícita.
- Há consultas auxiliares de preços por URL e, opcionalmente, Google Shopping
  via SerpApi. Elas dependem de rede e não garantem preço ou estoque.
- A estrutura de rotas existe, mas a interface completa da lista está em evolução.

Consulte o [estado verificado](docs/state/CURRENT.md) antes de assumir que uma
funcionalidade está pronta.

Em **Ajustes > Aparência**, o botão **Cartucho** aplica a identidade escura com
sidebar numerada, painéis chanfrados e moldura na área de Jogos. A seleção é
salva no dispositivo. Veja [as regras visuais](docs/DESIGN.md).

O módulo [Financeiro pessoal](docs/finance/README.md) já possui contas,
movimentos, planejamento, metas e dívidas. A integração cloud depende de aplicar
o SQL do Supabase e validar os fluxos no runtime. Veja [DOING.md](DOING.md) para
o próximo passo.

## Arquitetura-alvo (em migração)

```text
React + TypeScript (src/) -- Supabase Auth + Postgres/RLS
        |
        +-- Tauri (buscas externas de preço, sem persistência de negócio)
```

Veja [ADR-005](docs/adr/ADR-005-supabase-cloud-data.md), a
[arquitetura](docs/architecture.md) e os [contratos](docs/contracts/README.md).

## Desenvolvimento

Pré-requisitos: Node.js/npm, Rust e os pré-requisitos do Tauri na plataforma.

```bash
npm install
npm run tauri dev
```

Configure `.env.local` com base em `.env.example` antes de acessar dados cloud.

```bash
npm run build
npm run tauri build
cargo check --manifest-path src-tauri/Cargo.toml
```

`npm run dev` inicia somente o Vite; use `npm run tauri dev` para a integração
com comandos nativos.

## Configuração Supabase

Não versione chaves ou URLs privadas.

| Variável | Uso |
| --- | --- |
| `VITE_SUPABASE_URL` | habilita o cliente Supabase no frontend |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | chave pública para o cliente Supabase (com RLS ativo) |
| `VITE_SUPABASE_ANON_KEY` | nome legado aceito durante a transição |
| `SERPAPI_KEY` | consulta Google Shopping no processo Rust |

Execute `supabase/migrations/202611160001_initial_cloud_schema.sql` no projeto
destino. Nunca use `service_role` ou secret key no frontend. A migração dos dados
locais deve ser conferida antes da remoção do SQLite.

## Trabalho colaborativo e agentes

Antes de alterar código, leia [AGENTS.md](AGENTS.md), o
[handoff operacional](DOING.md), o
[guia de continuidade](docs/agent/README.md), o
[estado atual](docs/state/CURRENT.md) e o
[workboard](docs/state/WORKBOARD.md).

## Documentação

- [Arquitetura](docs/architecture.md)
- [Roadmap](docs/roadmap.md)
- [Contratos](docs/contracts/README.md)
- [Versionamento](docs/versioning.md)
- [Contribuição](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
- [Registro de atividades](docs/activity-log/README.md)
- [Visão e roadmap financeiro](docs/finance/README.md)
- [Trabalho em desenvolvimento](docs/development/README.md)
