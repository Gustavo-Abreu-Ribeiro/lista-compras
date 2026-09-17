# AGENTS.md — Lista de Compras

> Contexto permanente e regras de trabalho para pessoas e agentes.
> Leia este arquivo antes de modificar código ou documentação técnica.

## Propósito

**Lista de Compras** é um aplicativo de compras local-first. Ele organiza
categorias, itens e links de lojas no dispositivo. Consultas de preços externos
são auxiliares; a lista local não depende de cloud ou serviço de preços.

O objetivo atual é consolidar uma coluna funcional simples e confiável, não
criar um comparador universal, uma plataforma de comércio eletrônico ou uma
sincronização distribuída.

## Arquitetura e fronteiras

```text
src/                         React + TypeScript, rotas e adaptadores Tauri
src-tauri/src/commands/      comandos públicos chamados por `invoke`
src-tauri/src/db/            conexão, esquema e evolução do SQLite
src-tauri/src/models/        dados serializados de saída
```

- O frontend chama capacidades nativas somente por adaptadores em
  `src/features/*/api.ts`.
- SQLite, migrações, rede de preços e regras de persistência pertencem ao Rust.
- Cada comando registrado em `src-tauri/src/lib.rs` é um contrato público entre
  TypeScript e Rust. Alterá-lo exige atualizar os dois lados e a documentação.
- IDs inteiros são locais ao banco; UUIDs são a identidade portátil para
  operações explícitas de upsert.
- Supabase é opcional e não é a fonte local de verdade atual.

Não mova responsabilidades entre essas camadas sem decisão documentada.

## Princípios

- **Local-first:** a lista deve ser útil sem conta, rede ou API externa.
- **Menor mudança útil:** não antecipar UI, sincronização, autenticação ou
  abstrações que não atendam a uma necessidade presente.
- **Dados preservados:** migrações devem preservar bases e UUIDs existentes.
- **Contratos explícitos:** mantenha nomes, payloads, erros e limites claros.
- **Segurança por padrão:** nunca versione tokens, bancos locais ou dados do
  usuário; não transfira `SERPAPI_KEY` para o frontend.

## Dados e integrações

- Mantenha foreign keys habilitadas nas conexões que dependem das relações.
- Categoria removida remove seus itens e links em cascata; não banalize essa
  ação na UI sem confirmação adequada.
- Toda mudança de esquema deve ser segura para bases existentes; não recrie o
  banco do usuário como atalho.
- Consultas externas possuem timeout, podem falhar e não podem bloquear o fluxo
  de lista local.

## Processo de trabalho

### Antes

1. Leia `docs/agent/README.md`, `docs/state/CURRENT.md` e o workboard.
2. Inspecione código, contratos e verificações afetados.
3. Escolha o menor incremento verificável.
4. Registre ou respeite a propriedade no workboard em trabalho concorrente.

### Durante

- Mantenha TypeScript estrito e alinhado aos modelos Rust.
- Não renomeie comandos ou campos de payload silenciosamente.
- Não adicione dependência, serviço externo ou operação destrutiva sem
  necessidade e documentação explícita.
- Para decisão duradoura ou incompatível, crie um ADR em `docs/adr/` antes da
  implementação.

### Depois

1. Execute as verificações proporcionais à mudança.
2. Atualize contratos, README ou arquitetura se o comportamento mudou.
3. Atualize `CURRENT.md` e o workboard quando estado ou propriedade mudou.
4. Registre incrementos significativos em `docs/activity-log/YYYY-MM-DD/`.

## Qualidade mínima

Frontend: `npm run build`.

Rust/Tauri:

```bash
cargo check --manifest-path src-tauri/Cargo.toml
```

Para mudança entre camadas, execute ambos e, quando possível, valide com
`npm run tauri dev`. Registre impedimentos reais; não alegue validação não feita.

## Git e fontes de verdade

Use Conventional Commits e SemVer conforme [docs/versioning.md](docs/versioning.md).
Prefira commits pequenos e verificáveis.

| Fonte | Responsabilidade |
| --- | --- |
| Código e comandos reproduzíveis | comportamento presente |
| `AGENTS.md` | regras permanentes e fronteiras |
| Contratos e ADRs | compromissos de integração e decisões aceitas |
| `docs/state/CURRENT.md` | retrato verificado para retomada |
| `docs/state/WORKBOARD.md` | trabalho ativo, dono e próximo passo |
| Roadmap | intenção futura, não implementação |
| Activity log | histórico de incrementos |

Na dúvida, prefira a alternativa simples e reversível. Pare e peça direção se
a decisão afetar privacidade, dados, segurança, contrato público ou escopo.
