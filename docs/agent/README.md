# Guia de continuidade para agentes

Este guia torna o trabalho retomável entre pessoas, dispositivos e sessões de
agentes. Ele complementa, mas não substitui, [AGENTS.md](../../AGENTS.md).

## Ordem de leitura

Para implementação, leia nesta ordem:

1. `AGENTS.md`;
2. [`CURRENT.md`](../state/CURRENT.md) e [`WORKBOARD.md`](../state/WORKBOARD.md);
3. código, contratos, documentação e verificações da área afetada;
4. [`roadmap.md`](../roadmap.md), se a tarefa envolver priorização;
5. `git status` e histórico recente.

Conversa antiga, plano não executado ou activity log não comprovam estado atual.
Confirme no repositório.

## Ciclo de tarefa

### Início

- Identifique a camada: UI, adaptador TypeScript, comando Rust, banco ou
  integração externa.
- Confira o workboard antes de tocar em trabalho em andamento.
- Defina escopo mínimo, fronteiras e evidência de conclusão.

### Execução

- Preserve a direção React → Tauri command → SQLite.
- Mantenha mudanças de contrato coordenadas entre TypeScript e Rust.
- Use os playbooks para UI, Rust/dados ou documentação.

### Handoff ou conclusão

- Rode verificações aplicáveis e registre apenas resultado real.
- Atualize `CURRENT.md` se o estado verificável mudou.
- Atualize ou remova a entrada do workboard.
- Registre incremento significativo no activity log.
- Se houver pendência, deixe ação, arquivo e prova exatos.

## Fontes de verdade

| Fonte | Uso |
| --- | --- |
| Solicitação atual e instruções superiores | autorização e restrições |
| `AGENTS.md` | fronteiras, segurança e definição de pronto |
| Código, testes e comandos | comportamento comprovado |
| Contratos e ADRs | integração e decisão aceita |
| Estado e workboard | retomada e propriedade atuais |
| Roadmap e activity log | intenção futura e histórico |

Se fontes conflitarem, não esconda a divergência. Preserve dados e contratos,
documente a descoberta e peça decisão se ela for necessária.

## Playbooks

- [Mudanças de frontend](playbooks/frontend.md)
- [Mudanças Rust e dados](playbooks/rust-data.md)
- [Mudanças de documentação](playbooks/documentation.md)
