// assets/js/main.js – Planos + Formulário + Checkout Stripe
const API_BASE = "https://backend-v8.onrender.com/api";

let selectedPlan = null;
let isSubmitting = false;

// ========================
// Seleção de plano
// ========================
function setSelectedPlan(planKey) {
  if (!planKey) return;

  selectedPlan = planKey.toLowerCase();

  // Atualiza visual das cards
  document.querySelectorAll(".plan-card").forEach((card) => {
    card.classList.remove("selected");
  });
  const selectedCard = document.querySelector(
    `.plan-card[data-plan="${selectedPlan}"]`
  );
  if (selectedCard) selectedCard.classList.add("selected");

  // Atualiza input "Plano Selecionado"
  const inputPlan = document.getElementById("selectedPlan");
  if (inputPlan) {
    const nameCap =
      selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1);
    inputPlan.value = nameCap;
  }

  // Mostra formulário e reseta estados
  const formSection = document.getElementById("formSection");
  const form = document.getElementById("registerForm");
  const loading = document.getElementById("loading");
  const success = document.getElementById("successMessage");

  if (success) success.style.display = "none";
  if (loading) loading.style.display = "none";

  if (form) form.reset();
  if (inputPlan) {
    const nameCap =
      selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1);
    inputPlan.value = nameCap;
  }

  if (formSection) {
    formSection.classList.add("active");
    formSection.style.display = "block";
    formSection.scrollIntoView({ behavior: "smooth" });
  }
}

// ========================
// Envio do formulário
// ========================
async function enviarFormulario(event) {
  event.preventDefault();
  if (isSubmitting) return;

  const form = event.target;
  const loading = document.getElementById("loading");
  const submitBtn = form.querySelector(".submit-btn");

  if (!selectedPlan) {
    alert("Por favor, selecione um plano antes de continuar.");
    return;
  }

  isSubmitting = true;
  if (loading) loading.style.display = "block";
  if (submitBtn) submitBtn.disabled = true;

  const formData = new FormData(form);

  const payload = {
    full_name: formData.get("full_name"),
    username: formData.get("username"),
    birthdate: formData.get("birthdate"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    plan: selectedPlan.toLowerCase(), // garante lowercase
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
      throw new Error("Este e-mail já está cadastrado na plataforma.");
    }

    // 2) Registrar usuário e, se necessário, criar checkout
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
        try {
          const t = await res.text();
          if (t) msg = t;
        } catch {
          /* ignore */
        }
      }
      throw new Error(msg);
    }

    const data = await res.json();

    // Plano Free → já está tudo certo
    if (data.userId && !data.checkoutUrl) {
      showSuccessMessage();
      return;
    }

    // Planos pagos → redireciona para Stripe
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
      return;
    }

    throw new Error("Resposta inesperada do backend.");
  } catch (err) {
    alert("Erro: " + err.message);
    if (loading) loading.style.display = "none";
    if (submitBtn) submitBtn.disabled = false;
    isSubmitting = false;
  }
}

// ========================
// Confirmação pós Stripe (success_url)
// ========================
async function confirmarPagamento() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session_id");
  if (!sessionId) return;

  try {
    const res = await fetch(
      `${API_BASE}/payment-success?session_id=${encodeURIComponent(sessionId)}`
    );
    if (!res.ok) throw new Error("Não foi possível confirmar o pagamento.");

    const data = await res.json();

    if (data?.status === "complete") {
      showSuccessMessage();
    } else {
      const success = document.getElementById("successMessage");
      if (success) {
        success.style.display = "block";
        success.innerHTML =
          "<p>⚠️ Pagamento não confirmado. Caso o valor tenha sido debitado, entre em contato com o suporte.</p>";
      }
    }
  } catch (err) {
    console.error("Erro ao confirmar pagamento:", err);
  }
}

// ========================
// UI de sucesso
// ========================
function showSuccessMessage() {
  const formSection = document.getElementById("formSection");
  const success = document.getElementById("successMessage");
  const loading = document.getElementById("loading");

  if (loading) loading.style.display = "none";
  if (formSection) {
    formSection.style.display = "none";
    formSection.classList.remove("active");
  }
  if (success) {
    success.style.display = "block";
    success.scrollIntoView({ behavior: "smooth" });
  }

  isSubmitting = false;
}

// ========================
// Bootstrapping
// ========================
document.addEventListener("DOMContentLoaded", () => {
  // Click nos planos (cards + botões)
  document.querySelectorAll("[data-plan]").forEach((el) => {
    el.addEventListener("click", (e) => {
      const plan = el.getAttribute("data-plan");
      // ignora platinum desabilitado
      if (!plan || plan.toLowerCase() === "platinum" || el.disabled) return;
      e.preventDefault();
      setSelectedPlan(plan);
    });
  });

  // Formulário
  const form = document.getElementById("registerForm");
  if (form) {
    form.addEventListener("submit", enviarFormulario);
  }

  // Botão "Acessar plataforma"
  const accessBtn = document.getElementById("accessApp");
  if (accessBtn) {
    accessBtn.addEventListener("click", () => {
      window.location.href = "https://faixabet.streamlit.app/";
    });
  }

  // Verificar se voltou do Stripe (session_id na URL)
  confirmarPagamento();
});
