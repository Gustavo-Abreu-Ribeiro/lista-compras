# Contrato de cálculos financeiros

## Precisão e sinais

Todo valor persistido é `amount_cents` inteiro e não usa ponto flutuante. Valores
de renda aumentam o saldo; gastos e investimentos reduzem. Valores de exibição
usam formatação monetária somente na interface.

## Fórmulas iniciais

```text
saldo real = saldos iniciais das contas
             + receitas realizadas
             - gastos realizados
             - investimentos realizados

comprometido no mês = despesas planejadas no mês
                      + parcelas pendentes no mês
                      + limite de categoria ainda não coberto por compromissos

dinheiro seguro = max(0, saldo real - comprometido - mínimos de metas)

saldo projetado = saldo real
                  + receitas planejadas do mês
                  - comprometido no mês
                  - mínimos de metas
```

Essas fórmulas são a primeira versão do motor. A margem de segurança, despesas
recorrentes, cenários e previsão por histórico serão adicionados em fases
posteriores e devem entrar explicitamente na fórmula, nunca como comportamento
oculto.

## Recorrências mensais (FIN-002)

- Cada regra ativa gera no máximo um lançamento `planned` por mês, a partir do
  mês inicial escolhido. A chave local da ocorrência é `(recurrence_id, mês)`.
- Uma ocorrência usa o valor e a descrição da regra no momento em que foi
  materializada. Pausar a regra impede novas ocorrências; não apaga previsões
  já criadas nem reescreve meses anteriores.
- Renda recorrente planejada entra na projeção. Gastos recorrentes entram no
  comprometido. O usuário confirma a ocorrência como realizada no fluxo de
  lançamentos; a restrição única impede que a regra gere uma cópia.
- O dia é limitado ao último dia do mês quando o mês não possui o dia escolhido.

## Categorias e limites mensais

Categoria é uma classificação opcional do lançamento (por exemplo, Moradia,
Alimentação ou Salário). Não representa uma conta, não altera o saldo e não é
obrigatória para registrar receita ou gasto. Categorias de renda e despesa são
separadas.

O limite mensal reserva somente o valor que ainda não está coberto por gastos
realizados ou compromissos explícitos da mesma categoria:

```text
reserva adicional da categoria = max(0, limite - realizado - previsto)
comprometido total = gastos previstos + parcelas pendentes + reservas adicionais
restante do limite = max(0, limite - realizado - previsto)
```

Assim, uma despesa planejada ou parcela categorizada não é contada novamente
como limite livre. O limite pode exceder o saldo que falta após os compromissos;
nesse caso somente o compromisso explícito entra no cálculo.

## Dívidas acompanhadas (FIN-002)

O saldo da dívida é um valor de acompanhamento inserido/atualizado pelo usuário;
ele não é somado ao saldo bancário nem abatido automaticamente após um gasto.
Se o cadastro incluir pagamento mensal, o mesmo salvamento cria uma recorrência
de gasto com a data de vencimento. A confirmação desse gasto não altera o saldo
da dívida; o usuário atualiza o saldo devedor manualmente para refletir o
extrato do credor. Assim, o pagamento mensal compromete a projeção uma única
vez e não há amortização presumida.

## Parcelas

Planos de dívida também são compromissos mensais: quantidade e valor são
informados pelo usuário, e o total do plano precisa cobrir pelo menos o saldo
atual registrado. O total do plano e o restante das parcelas pendentes são
valores separados do saldo atualizado manualmente pelo credor. A confirmação
reduz o restante do plano e registra um gasto; não recalcula o saldo do credor.
Ver [ADR-005](../adr/ADR-005-financial-debt-plans.md).

Uma compra de `R$ 1.200,00` em 12 parcelas cria doze obrigações mensais. Cada
obrigação recebe seu próprio valor em centavos; os centavos restantes são
distribuídos nas primeiras parcelas. O vencimento mantém o dia informado no
primeiro mês; em meses mais curtos, usa o último dia do mês e volta ao dia
original no mês seguinte quando possível. Confirmar que uma parcela foi paga cria o
gasto realizado e atualiza seu estado na mesma transação PostgreSQL. A chave da
parcela impede um segundo lançamento, inclusive em caso de repetição da ação.

## Metas e investimentos

Uma meta possui valor-alvo, valor já reservado, prazo, prioridade, contribuição
mínima e ideal. O mínimo entra no cálculo de dinheiro seguro; o ideal é uma
recomendação. Uma redução na capacidade de poupança deve explicar a diferença
entre planejado e possível, sem alterar contribuições automaticamente.

## Projeções e cenários

Toda projeção é uma estimativa e deve informar a base usada. Os cenários
conservador, realista e otimista serão introduzidos apenas quando recorrências e
histórico tiverem regras verificáveis. Não apresente previsão como certeza.
