# Faixabet — Site Institucional (Topo de Funil)

## 📌 Visão Geral
O site institucional do Faixabet.com.br atua como camada de aquisição de usuários (topo de funil), responsável por:

- Apresentar a proposta da plataforma
- Demonstrar valor (IA aplicada à loteria)
- Converter visitantes em assinantes
- Direcionar para pagamento via Stripe

---

## 🧱 Stack Tecnológica

- HTML5
- CSS3 / Tailwind (quando aplicável)
- JavaScript (vanilla ou leve)
- Integração com Stripe Checkout
- Hospedagem: (Render / estático / CDN)

---

## ⚙️ Funcionamento

### Fluxo principal:

1. Usuário acessa landing page
2. Visualiza proposta de valor
3. Seleciona plano
4. Clique em "Assinar"
5. Redirecionamento para Stripe Checkout
6. Após pagamento:
   - success_url → backend
   - webhook → backend

---

## 💳 Integração com Stripe

### Tipos de plano:
- Free (limitado)
- Silver
- Gold
- Platinum

### Fluxo técnico:

```text
Frontend → Stripe Checkout → Webhook → Backend → DB

### Pontos críticos:
success_url
cancel_url
webhook endpoint

### Pontos de atenção
Garantir responsividade (mobile-first)
Clareza da proposta (IA + probabilidade)
Tempo de carregamento
Copy de conversão

🚀 Melhorias futuras
A/B test de landing page
SEO (palavras-chave: lotofácil, previsão, IA)
Prova social (resultados históricos)
Integração com blog

🧠 Skill básica
- Entendimento de funil de conversão (topo de funil e landing pages de conversão)
- Integração com Stripe (Checkout sessions, redirects e tratamento de webhooks)
- Noções avançadas de UX/UI (layouts limpos, efeitos de brilho/glow, glassmorphism e animações fluidas)
- Estruturação de componentes semânticos e modulares em HTML5 e Tailwind CSS
- Design consistente com paletas de cores escuras e realces de gradientes vibrantes (Electric Blue, Purple, Green, Yellow)

---

## 🏛️ Estrutura de Componentes da Home (`index-2.html`)
A arquitetura visual da Home page é organizada nas seguintes seções:
1. **Header**: Menu de navegação translúcido (glassmorphism) com links dinâmicos e controle de carteira.
2. **Hero Section**: Apresentação de valor do sistema de IA aplicada à loteria com chamadas diretas para ação (CTA).
3. **Resultados Recentes**: Painel dinâmico que puxa resultados oficiais das loterias e palpites premiados.
4. **Mapa de Ganhadores**: Visualização de mapa de calor interativo integrado à API de vencedores oficiais.
5. **Como Funciona (Cards Premium)**: Seção passo a passo detalhando as 4 etapas de onboarding em formato de cards translúcidos independentes com micro-interações de glow e numerações flutuantes.
6. **Planos Faixabet IA**: Tabela de precificação com destaque visual de benefícios por plano (Free, Silver, Gold, Platinum).
7. **Perguntas Frequentes (FAQ)**: Acordeões interativos para dúvidas frequentes.
8. **Banner CTA Final**: Seção rápida de conversão.
9. **Footer**: Rodapé corporativo com links e avisos de Jogo Responsável.