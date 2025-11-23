// ========================
// Configuração inicial
// ========================
const API_BASE = "https://backend-v8.onrender.com/api";
let selectedPlan = null;

// Cache da instância do Stripe (futuro; hoje não está sendo usada)
let stripeInstance = null;
async function getStripe() {
  if (stripeInstance) return stripeInstance;
  const res = await fetch(`${API_BASE}/public-key`, { method: "GET" });
  if (!res.ok) throw new Error(`Falha ao obter publishable key (${res.status})`);
  const data = await res.json();
  if (!data.publishableKey || !data.publishableKey.startsWith("pk_")) {
    throw new Error("Publishable key inválida no backend");
  }
  stripeInstance = Stripe(data.publishableKey);
  return stripeInstance;
}

// ========================
// Seleção de plano
// ========================
document.querySelectorAll("[data-plan]").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    const plan = el.getAttribute("data-plan");
    if (!plan) return;

    selectedPlan = plan.toLowerCase();

    // Atualizar UI
    document.querySelectorAll(".plan-card").forEach((card) => {
      card.classList.remove("selected");
    });
    const selectedCard = el.closest(".plan-card");
    if (selectedCard) selectedCard.classList.add("selected");

    // Mostrar formulário
    const formSection = document.getElementById("formSection");
    if (formSection) {
      formSection.classList.add("active");
      const inputPlan = document.getElementById("selectedPlan");
      if (inputPlan) {
        inputPlan.value =
          selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1);
      }
      formSection.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// ========================
// Envio do formulário
// ========================
async function enviarFormulario(event) {
  event.preventDefault();

  const loading = document.getElementById("loading");
  const submitBtn = document.querySelector(".submit-btn");
  if (loading) loading.style.display = "block";
  if (submitBtn) submitBtn.disabled = true;

  const form = event.target;
  const formData = new FormData(form);

  const payload = {
    full_name: formData.get("full_name"),
    username: formData.get("username"),
    birthdate: formData.get("birthdate"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    plan: selectedPlan?.toLowerCase(), // garante lowercase sempre
  };

  try {
    // 1) Validação de email
    const emailResp = await fetch(`${API_BASE}/check-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email: payload.email }),
    });
    if (!emailResp.ok) {
      throw new Error(`Erro check-email (${emailResp.status})`);
    }
    const emailResult = await emailResp.json();
    if (emailResult.exists) {
      throw new Error("Este email já está cadastrado.");
    }

    // 2) Registrar usuário e (se pago) criar checkout
    const res = await fetch(`${API_BASE}/register-and-checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let msg = `Erro backend (${res.status})`;
      try {
        const j = await res.json();
        if (j?.error) msg = j.error;
      } catch {
        const t = await res.text();
        if (t) msg = t;
      }
      throw new Error(msg);
    }

    const data = await res.json();

    // Plano Free → ativado direto
    if (data.userId && !data.checkoutUrl) {
      showSuccessMessage();
      return;
    }

    // Plano Pago → redireciona Stripe
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
      return;
    }

    // Se nada disso, algo estranho
    throw new Error("Resposta inesperada do backend");
  } catch (err) {
    alert("Erro: " + err.message);
    if (loading) loading.style.display = "none";
    if (submitBtn) submitBtn.disabled = false;
  }
}

// ========================
// Confirmar pagamento (Stripe success_url)
// ========================
async function confirmarPagamento() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session_id"); // Stripe manda isso no success_url
  if (!sessionId) return;

  try {
    const res = await fetch(
      `${API_BASE}/payment-success?session_id=${encodeURIComponent(sessionId)}`
    );
    if (!res.ok) throw new Error("Não foi possível confirmar pagamento");
    const data = await res.json();

    if (data?.status === "complete") {
      showSuccessMessage();
    } else {
      const success = document.getElementById("successMessage");
      if (success) {
        success.innerHTML = "<p>⚠️ Pagamento não confirmado.</p>";
      }
    }
  } catch (err) {
    console.error("Erro ao confirmar pagamento:", err);
  }
}

function showSuccessMessage() {
  const formSection = document.getElementById("formSection");
  const success = document.getElementById("successMessage");
  if (formSection) formSection.style.display = "none";
  if (success) {
    success.style.display = "block";
    success.scrollIntoView({ behavior: "smooth" });
  }
}

// Acessar App
document.getElementById("accessApp")?.addEventListener("click", function () {
  window.location.href = "https://faixabet.streamlit.app/";
});

// Bootstrap do main.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  if (form) form.addEventListener("submit", enviarFormulario);
  confirmarPagamento();
});
