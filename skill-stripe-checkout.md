2. Conteúdo da Skill (Para salvar como skill-stripe-checkout.md)
Skill: Fluxo de Cadastro e Checkout Stripe (FaixaBet)
Contexto Geral
Este documento define as regras de negócio e a arquitetura técnica para a aquisição de planos (Free, Silver e Gold) na plataforma FaixaBet, integrando o cadastro inicial do usuário ao Stripe.

Fluxo do Usuário
Seleção e Cadastro: Ao escolher um plano e clicar em "Assinar", um formulário aparece para preenchimento dos dados básicos do novo usuário.

Persistência de Dados: Após a confirmação dos dados pelo usuário, o sistema grava as informações imediatamente em duas tabelas:

Tabela usuarios: Salva as credenciais para acessos futuros.

Tabela financeiro: Salva o valor do plano e tipo de pagamento.

Gateway de Pagamento: O sistema carrega o arquivo checkout.php para processar o pagamento no Stripe.

Finalização: Após o processamento, o sistema valida o sucesso ou falha da transação.