# Formulário de conta após o cadastro

- O cartão agora apresenta apenas a lista de contas e mantém o formulário de saldo recolhido.
- Sem contas, a ação é “Cadastrar saldo inicial”; com conta cadastrada, vira “Adicionar conta”. O convite inicial continua condicionado à ausência de conta, lançamento e recorrência.
- Verificação do SQLite local: a fixture antiga não está mais presente; uma transação financeira não associada à fixture foi preservada.
- Validação de frontend: `npm run build`.
