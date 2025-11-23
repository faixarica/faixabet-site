// ========================
// main.js - Configuração inicial da fAIxaBet
// ========================

// URL do backend (Render)
const API_BASE = "https://backend-v8.onrender.com/api";

// Estado global
let selectedPlan = null;

// ======================================================================
// Seleção de Plano
// ======================================================================
document.querySelectorAll("[data-plan]").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();

    const plan = el.getAttribute("data-plan");
    if (!plan) return;

    selectedPlan = plan.toLowerCase();

    // Destaque visual
    document.querySelectorAll(".plan-card").forEach((card) => {
      card.classList.remove("selected");
    });

    const card = el.closest(".plan-card");
    if (card) card.classList.add("selected");

    // Exibe formulário
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

// ======================================================================
// Envio do formulário
// ======================================================================
async function enviarFormulario(event) {
  event.preventDefault();

  const loading = document.getElementById("loading");
  const submitBtn = document.querySelector(".submit-btn");

  if (loading) loading.style.display = "block";
  if (submitBtn) submitBtn.disabled = true;

  const form = event.target;
  const data = new FormData(form);

  const payload = {
    full_name: data.get("full_name"),
    username: data.get("username"),
    birthdate: data.get("birthdate"),
    email: data.get("email"),
    phone: data.get("phone"),
    password: data.get("password"),
    plan: selectedPlan,
  };

  try {
    // ----------------------------
    // 1) Validação de email
    // ----------------------------
    const emailRes = await fetch(`${API_BASE}/check-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: payload.email }),
    });

    if (!emailRes.ok) {
      throw new Error(`Erro ao validar email (${emailRes.status})`);
    }

    const emailData = await emailRes.json();
    if (emailData.exists) {
      throw new Error("Este email já está cadastrado.");
    }

    // ----------------------------
    // 2) Registrar + Checkout (se pago)
    // ----------------------------
    const res = await fetch(`${API_BASE}/register-and-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

    const result = await res.json();

    // ----------------------------
    // 3) Plano FREE
    // ----------------------------
    if (result.userId && !result.checkoutUrl) {
      showSuccessMessage();
      return;
    }

    // ----------------------------
    // 4) Plano Assinatura → Checkout Stripe
    // ----------------------------
    if (result.checkoutUrl) {
      window.location.href = result.checkoutUrl;
      return;
    }

    throw new Error("Resposta inesperada do servidor.");
  } catch (err) {
    alert("Erro: " + err.message);
    if (loading) loading.style.display = "none";
    if (submitBtn) submitBtn.disabled = false;
  }
}

// ======================================================================
// Confirmação de pagamento (retorno Stripe)
// ======================================================================
async function confirmarPagamento() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");

  if (!sessionId) return;

  try {
    const res = await fetch(
      `${API_BASE}/payment-success?session_id=${encodeURIComponent(sessionId)}`
    );

    if (!res.ok) {
      throw new Error("Falha ao confirmar pagamento.");
    }

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

// ======================================================================
// Exibir tela de sucesso
// ======================================================================
function showSuccessMessage() {
  const formSection = document.getElementById("formSection");
  const success = document.getElementById("successMessage");

  if (formSection) formSection.style.display = "none";
  if (success) {
    success.style.display = "block";
    success.scrollIntoView({ behavior: "smooth" });
  }
}

// ======================================================================
// Botão para acessar o app
// ======================================================================
document.getElementById("accessApp")?.addEventListener("click", () => {
  window.location.href = "https://faixabet.streamlit.app/";
});

// ======================================================================
// Inicialização
// ======================================================================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  if (form) form.addEventListener("submit", enviarFormulario);

  confirmarPagamento();
});
