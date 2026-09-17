# Lista de Compras

Aplicativo local-first para organizar categorias, itens e links de compra, com
interface React executada pelo Tauri e persistência SQLite no dispositivo.

## Estado atual

- Categorias, itens e links de lojas são persistidos localmente.
- Cada registro possui UUID para suportar importação/sincronização explícita no
  futuro; não há sincronização automática implementada.
- Há consultas auxiliares de preços por URL e, opcionalmente, Google Shopping
  via SerpApi. Elas dependem de rede e não garantem preço ou estoque.
- A estrutura de rotas existe, mas a interface completa da lista está em evolução.

Consulte o [estado verificado](docs/state/CURRENT.md) antes de assumir que uma
funcionalidade está pronta.

## Arquitetura

```text
React + TypeScript (src/)
        |
        | Tauri invoke
        v
Rust commands (src-tauri/src/commands/)
        |
        v
SQLite local (dados do aplicativo)
```

O frontend não acessa SQLite diretamente. Os comandos Rust são a fronteira
entre interface e dados. Veja a [arquitetura](docs/architecture.md) e os
[contratos](docs/contracts/README.md).

## Desenvolvimento

Pré-requisitos: Node.js/npm, Rust e os pré-requisitos do Tauri na plataforma.

```bash
npm install
npm run tauri dev
```

```bash
npm run build
npm run tauri build
cargo check --manifest-path src-tauri/Cargo.toml
```

`npm run dev` inicia somente o Vite; use `npm run tauri dev` para a integração
com comandos nativos.

## Configuração opcional

Não versione chaves ou URLs privadas.

| Variável | Uso |
| --- | --- |
| `VITE_SUPABASE_URL` | habilita o cliente Supabase no frontend |
| `VITE_SUPABASE_ANON_KEY` | chave pública/anon do cliente Supabase |
| `SERPAPI_KEY` | consulta Google Shopping no processo Rust |

Sem Supabase, o cliente fica indisponível. Sem `SERPAPI_KEY`, consultas SerpApi
retornam resultado vazio.

## Trabalho colaborativo e agentes

Antes de alterar código, leia [AGENTS.md](AGENTS.md), o
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
