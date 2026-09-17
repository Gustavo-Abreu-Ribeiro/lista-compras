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

## Parcelas

Uma compra de `R$ 1.200,00` em 12 parcelas cria doze obrigações mensais. Cada
obrigação recebe seu próprio valor em centavos; os centavos restantes são
distribuídos nas primeiras parcelas. Marcar uma parcela como paga é uma ação
explícita e, na fase de conciliação, deve gerar o lançamento realizado
correspondente sem duplicação.

## Metas e investimentos

Uma meta possui valor-alvo, valor já reservado, prazo, prioridade, contribuição
mínima e ideal. O mínimo entra no cálculo de dinheiro seguro; o ideal é uma
recomendação. Uma redução na capacidade de poupança deve explicar a diferença
entre planejado e possível, sem alterar contribuições automaticamente.

## Projeções e cenários

Toda projeção é uma estimativa e deve informar a base usada. Os cenários
conservador, realista e otimista serão introduzidos apenas quando recorrências e
histórico tiverem regras verificáveis. Não apresente previsão como certeza.
