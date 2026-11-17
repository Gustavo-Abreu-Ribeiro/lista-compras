# Roadmap

Este roadmap é intenção ordenada, não comprovação de comportamento entregue.

## Agora — migrar dados e autenticação para Supabase

- Aplicar esquema cloud com RLS por usuário e autenticação Supabase.
- Substituir gravações SQLite/localStorage por adapters Supabase em compras,
  jogos, histórico de preço e finanças.
- Importar dados existentes conferindo UUIDs e relações; só depois remover a
  persistência SQLite de negócio.
- Cobrir isolamento RLS e estado de erro sem fallback local.

## Próximo — melhorar a experiência de compra

- Validar a nova navegação entre Compras, Finanças e Jogos com tarefas frequentes
  em desktop e celular; manter Ajustes e Conta em um acesso secundário consistente.
- Exibir consultas de preço como informação opcional, com carregamento e erro
  sem bloquear a lista.
- Definir provedores externos aceitáveis e configuração de chaves por plataforma.
- Exportação manual continua possível; operação offline depende de decisão futura.

## Futuro — somente mediante decisão explícita

- Evoluir o app para uma base de gerenciamento personalizável: permitir criar
  novas áreas ou abas do zero, escolhendo os recursos e moldes de dados usados
  para acompanhar qualquer tema, além de iniciar por modelos prontos. Jogos
  permanece como uma área importante desse conceito. Uma galeria de modelos
  populares pode ajudar na descoberta; critérios de popularidade e qualquer
  coleta de buscas ficam para uma decisão posterior de produto e privacidade.
- Fila offline e resolução de conflitos, somente se houver necessidade de produto.
- Distribuição mobile além dos artefatos gerados pelo Tauri.

Esses itens não autorizam implementação antecipada nem definem arquitetura de
sincronização, autenticação ou cloud.
