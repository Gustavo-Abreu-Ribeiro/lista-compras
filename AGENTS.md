# AGENTS.md — Lista de Compras

> Contexto permanente e regras de trabalho para pessoas e agentes.
> Leia este arquivo antes de modificar código ou documentação técnica.

## Propósito

**Lista de Compras** organiza categorias, itens, links de lojas, jogos e dados
financeiros em uma conta Supabase. Dados de negócio devem estar disponíveis em
mais de um dispositivo; preferências visuais podem permanecer no dispositivo.

O objetivo atual é consolidar uma coluna funcional simples e confiável, não
criar um comparador universal, uma plataforma de comércio eletrônico ou uma
sincronização distribuída.

## Arquitetura e fronteiras

```text
src/                         React + TypeScript, rotas e adaptadores de feature
src/services/supabase.ts     cliente Supabase e sessão Supabase Auth
supabase/migrations/         esquema remoto e políticas RLS
src-tauri/src/commands/      capacidades nativas sem persistência de negócio
```

- O frontend chama Supabase somente por adaptadores em `src/features/*/api.ts`.
- Dados de negócio persistem em Supabase. Tauri pode oferecer busca de preços,
  mas não é fonte de verdade nem fallback de dados.
- Cada comando nativo registrado em `src-tauri/src/lib.rs` é um contrato público
  entre TypeScript e Rust. Alterá-lo exige atualizar os dois lados e a documentação.
- Registros remotos usam UUID portátil e `owner_id`; RLS deriva o usuário da
  sessão autenticada e impede acesso entre contas.
- SQLite existente é legado de migração. Não o remova até verificar a importação
  para Supabase e os vínculos dos dados existentes.
- O financeiro possui sua visão, arquitetura e contrato em `docs/finance/`.
  Leia-os antes de alterar cálculos, dados financeiros ou sua integração com
  compras/desejos.

Não mova responsabilidades entre essas camadas sem decisão documentada.

## Princípios

- **Cloud-first:** dados de negócio pertencem à conta; falha de rede não grava
  silenciosamente em outro armazenamento.
- **Menor mudança útil:** não antecipar UI, sincronização, autenticação ou
  abstrações que não atendam a uma necessidade presente.
- **Dados preservados:** importações devem preservar registros, UUIDs e relações;
  só remova a cópia local após verificação explícita.
- **Contratos explícitos:** mantenha nomes, payloads, erros e limites claros.
- **Segurança por padrão:** nunca versione tokens, bancos locais ou dados do
  usuário; não transfira `SERPAPI_KEY` para o frontend.

## Dados e integrações

- Mantenha foreign keys habilitadas nas conexões que dependem das relações.
- Categoria removida remove seus itens e links em cascata; não banalize essa
  ação na UI sem confirmação adequada.
- Toda mudança de esquema deve ser segura para bases existentes; não recrie o
  banco do usuário como atalho.
- Consultas externas possuem timeout e não podem bloquear operações de dados já
  carregados; falhas de Supabase devem ser mostradas, sem modo offline implícito.

## Processo de trabalho

### Antes

1. Leia `DOING.md`, `docs/agent/README.md`, `docs/state/CURRENT.md` e o workboard.
2. Inspecione código, contratos e verificações afetados.
3. Escolha o menor incremento verificável.
4. Registre ou respeite a propriedade no workboard em trabalho concorrente.
5. Audite `docs/development/`: itens ali ainda exigem implementação ou prova;
   itens em `docs/development/future/` são intenção, não autorização.

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
5. Ao iniciar uma frente de produto extensa, crie ou atualize visão, arquitetura,
   contrato, roadmap e workboard antes de expandir o código.
6. Deixe `DOING.md` com um próximo passo exato, arquivo afetado e prova esperada
   antes de encerrar uma unidade incompleta.

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
| `DOING.md` | handoff curto, trabalho atual e próximo passo verificável |
| `docs/development/` | trabalho em curso com pendências e critérios de aceite |
| `docs/development/future/` | planejamento que ainda não está em execução |
| Roadmap | intenção futura, não implementação |
| Activity log | histórico de incrementos |

Na dúvida, prefira a alternativa simples e reversível. Pare e peça direção se
a decisão afetar privacidade, dados, segurança, contrato público ou escopo.
