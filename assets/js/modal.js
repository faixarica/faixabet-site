// modals.js – Modal "Gerar Palpite Exclusivo" (versão final)
document.addEventListener("DOMContentLoaded", () => {
  
  // ========================
  // BASE DE DADOS (MOCK DE IA)
  // ========================
  const predictionPool = [
    {
      numbers: [2, 5, 7, 9, 11, 13, 14, 15, 17, 18, 20, 22, 23, 24, 25],
      analysis: [
        "🔹 9 números quentes nos últimos 30 sorteios",
        "🔹 6 números frios estratégicos",
        "🔹 Baixa repetição em apostas populares",
        "🔹 Equilíbrio ímpar/par: 8-7"
      ]
    },
    {
      numbers: [1, 3, 4, 6, 8, 10, 12, 16, 19, 21, 22, 23, 24, 25, 26],
      analysis: [
        "🔹 Forte faixa central (11–20)",
        "🔹 4 ímpares consecutivos — padrão raro",
        "🔹 Sem sequência longa — evita partilha",
        "🔹 Alta cobertura de dezenas atrasadas"
      ]
    },
    {
      numbers: [5, 6, 7, 8, 9, 13, 14, 15, 16, 17, 18, 19, 20, 21, 25],
      analysis: [
        "🔹 Bloco central poderoso (05–21)",
        "🔹 11 dezenas na zona quente",
        "🔹 Apenas 1 dezena abaixo de 05",
        "🔹 Alta densidade estatística"
      ]
    }
  ];

  // ========================
  // BOTÃO QUE ABRE O MODAL
  // ========================
  const openBtn = document.getElementById("gerarPalpiteBtn");
  if (!openBtn) return; // página sem o botão → ignora

  // ========================
  // CRIAÇÃO DINÂMICA DO MODAL
  // ========================
  const modal = document.createElement("div");
  modal.id = "predictionModal";
  modal.className =
    "fixed inset-0 hidden flex items-center justify-center bg-black/70 z-50 backdrop-blur-md";

  modal.innerHTML = `
    <div class="bg-gray-900 border border-green-500/40 rounded-3xl shadow-2xl 
                w-11/12 max-w-md p-6 text-center relative overflow-hidden">

      <button id="closeModal" 
              class="absolute top-3 right-3 text-gray-300 hover:text-white text-2xl">
        ×
      </button>

      <h2 class="text-2xl font-bold text-green-400 mb-4">💡 Palpite Exclusivo</h2>

      <div id="loadingStep" class="space-y-3">
        <p id="progressText" class="text-gray-400">Analisando padrões históricos...</p>
        <div class="w-full bg-gray-800 h-3 rounded-full overflow-hidden">
          <div id="progressBar" class="bg-green-500 h-3 w-0 transition-all duration-300"></div>
        </div>
      </div>

      <div id="resultStep" class="hidden">

        <div id="generatedNumbers" 
             class="flex flex-wrap justify-center gap-2 mb-4"></div>

        <ul id="analysisText" 
            class="text-left text-sm text-gray-300 list-disc list-inside mb-4"></ul>

        <a id="whatsappBtn" target="_blank"
          class="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 
                 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg w-full mb-3">
          📲 Receber via WhatsApp
        </a>

        <button id="closeModalFinal"
          class="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-2 rounded-xl">
          Fechar
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // ========================
  // ELEMENTOS DO MODAL
  // ========================
  const closeBtn = modal.querySelector("#closeModal");
  const closeFinal = modal.querySelector("#closeModalFinal");
  const loadingStep = modal.querySelector("#loadingStep");
  const resultStep = modal.querySelector("#resultStep");
  const progressBar = modal.querySelector("#progressBar");
  const progressText = modal.querySelector("#progressText");
  const generatedNumbers = modal.querySelector("#generatedNumbers");
  const analysisText = modal.querySelector("#analysisText");
  const whatsappBtn = modal.querySelector("#whatsappBtn");

  // ========================
  // ABRIR MODAL
  // ========================
  openBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    startGeneration();
  });

  // ========================
  // FECHAR MODAL
  // ========================
  const fecharModal = () => {
    modal.classList.add("hidden");
    resetModal();
  };

  closeBtn.addEventListener("click", fecharModal);
  closeFinal.addEventListener("click", fecharModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) fecharModal();
  });

  // ========================
  // SIMULAÇÃO "IA PROCESSANDO"
  // ========================
  function startGeneration() {
    let progress = 0;
    progressBar.style.width = "0%";
    progressText.textContent = "Analisando padrões...";

    const interval = setInterval(() => {
      progress += Math.random() * 15;

      if (progress >= 100) {
        clearInterval(interval);
        progressBar.style.width = "100%";
        setTimeout(showResult, 350);
        return;
      }

      progressBar.style.width = progress + "%";

      if (progress < 30) progressText.textContent = "Analisando padrões...";
      else if (progress < 60) progressText.textContent = "Gerando combinações...";
      else if (progress < 85) progressText.textContent = "Aplicando IA...";
      else progressText.textContent = "Finalizando...";
    }, 180);
  }

  // ========================
  // MOSTRAR RESULTADO GERADO
  // ========================
  function showResult() {
    loadingStep.classList.add("hidden");
    resultStep.classList.remove("hidden");

    const prediction =
      predictionPool[Math.floor(Math.random() * predictionPool.length)];

    // dezenas
    generatedNumbers.innerHTML = "";
    prediction.numbers.forEach((num) => {
      const ball = document.createElement("span");
      ball.className =
        "w-9 h-9 bg-green-700 text-white font-bold rounded-full flex items-center justify-center text-sm shadow-md";
      ball.textContent = num.toString().padStart(2, "0");
      generatedNumbers.appendChild(ball);
    });

    // análise
    analysisText.innerHTML = "";
    prediction.analysis.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      analysisText.appendChild(li);
    });

    // WhatsApp
    const whatsappNumber = "5511910435421";
    const message = encodeURIComponent(
      `Olá! Gerei meu palpite exclusivo no fAIxaBet:\n${prediction.numbers.join(
        " - "
      )}\n\nQuero receber os próximos no WhatsApp!`
    );
    whatsappBtn.href = `https://wa.me/${whatsappNumber}?text=${message}`;
  }

  // ========================
  // RESET DO MODAL
  // ========================
  function resetModal() {
    loadingStep.classList.remove("hidden");
    resultStep.classList.add("hidden");
    progressBar.style.width = "0%";
    progressText.textContent = "Iniciando...";
  }
});
