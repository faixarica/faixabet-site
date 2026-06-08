# Skill: Estrutura Simplificada do Header e Marquee (Mobile-First)

## Contexto Geral
Como parte da otimização para dispositivos móveis e redução de ruído visual na landing page principal (`index.html`), o cabeçalho superior (Header) e a barra de resultados (Ticker/Marquee) foram simplificados e reestruturados para melhorar a UX/UI da plataforma.

---

## 1. Simplificação do Cabeçalho (Header)
O objetivo principal é a remoção de elementos secundários que causavam dispersão cognitiva e problemas de quebra de layout em telas mobile/tablet.

### Elementos Removidos
* **Campo de Busca (`#buscar-concurso`)**: Removido para diminuir a fricção visual no menu superior.
* **Botão Secundário "Entrar"**: Removido. O foco de autenticação agora está unificado no botão principal.
* **Ícone da Extrema Direita (Carteira/Wallet)**: Removido para simplificar as ações no topo da página.

### Ajustes de Navegação
* **Loterias $\rightarrow$ Ganhadores**: O link para o mapa de calor de ganhadores foi renomeado de "Loterias" para **"Ganhadores"** e o ícone alterado de `format_list_numbered` para um troféu (`trophy` com realce `text-accent-yellow`).
* **Planos Faixabet IA $\rightarrow$ Planos**: Texto do link encurtado para "Planos" para melhor aproveitamento de espaço.
* **Como Funciona (Visibilidade)**: O link "Como Funciona" é oculto em dispositivos móveis e tablets (`hidden lg:flex`), mantendo o foco do usuário nos resultados e conversão.

### Diretrizes de Responsividade (Mobile-First)
* **Mobile (telas pequenas)**:
  * O texto da marca `"fAIxaBet"` ao lado do logotipo é ocultado (`hidden sm:block`), mantendo apenas o ícone circular com o ponto de pulso verde.
  * O menu de navegação central colapsa de forma elegante: os textos são ocultados (`hidden md:inline`) e apenas os ícones limpos de **Resultados** (`check_circle`), **Ganhadores** (`trophy`) e **Planos** (`workspace_premium`) são mostrados na barra.
* **CTA de Login**: O botão principal foi reduzido de "Acessar fAIxaBet" para **"Login"** (mantendo o ícone de login $\rightarrow$), apontando diretamente para o aplicativo Streamlit: `https://faixabet9.streamlit.app/`.

---

## 2. Animação Contínua de Resultados (Marquee/Ticker)
Para garantir uma leitura fluida dos resultados recentes das loterias em telas mobile e desktop, a barra de resultados usa uma animação puramente CSS baseada em keyframes lineares infinitos.

### Implementação do Loop Perfeito (Sem Saltos)
Para evitar quebras visuais e saltos quando o conteúdo reinicia, a lógica foi dividida da seguinte forma:
1. **Container HTML (`#marqueeContent`)**: Atua como container flexível sem espaçamento interno (`flex animate-marquee`).
2. **Duplicação de Conteúdo**: O JavaScript de renderização (`carregarResultados`) divide o conteúdo em duas metades idênticas, cada uma envolta em um elemento flex com espaçamento interno e externo idênticos (`<div class="flex gap-8 pr-8 shrink-0">`).
3. **Animação CSS**:
   * O container desliza de `translate3d(0, 0, 0)` até `translate3d(-50%, 0, 0)`.
   * Como a segunda metade começa na posição exata de `-50%` e tem margem de transição equivalente ao gap (`pr-8`), a transição no fim do ciclo é 100% contínua e sem saltos visuais.
   * Ao passar o cursor (`:hover`), a animação é pausada temporariamente para permitir uma leitura tranquila dos dados.
