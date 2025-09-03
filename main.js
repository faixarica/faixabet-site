// ========================
// Configuração inicial
// ========================
const API_BASE = "https://backend-v8.onrender.com/api";
let selectedPlan = null;

// Cache da instância do Stripe
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
    document.querySelectorAll(".plan-card").forEach((const planoKey = card) => card.classList.remove("selected"));
    const selectedCard = el.closest(".plan-card");
    if (selectedCard) selectedCard.classList.add("selected");

    // Mostrar formulário
    document.getElementById("formSection").classList.add("active");
    document.getElementById("selectedPlan").value =
      selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1);

    document.getElementById("formSection").scrollIntoView({ behavior: "smooth" });
  });
});

// ========================
// Envio do formulário
// ========================
async function enviarFormulario(event) {
  event.preventDefault();

  document.getElementById("loading").style.display = "block";
  document.querySelector(".submit-btn").disabled = true;

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
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email: payload.email }),
    });
    if (!emailResp.ok) throw new Error(`Erro check-email (${emailResp.status})`);
    const emailResult = await emailResp.json();
    if (emailResult.exists) throw new Error("Este email já está cadastrado.");

    // 2) Registrar usuário e (se pago) criar checkout
    const res = await fetch(`${API_BASE}/register-and-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // tenta extrair JSON; se não der, usa texto
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

    // Plano Free → ativado
    if (data.userId && !data.checkoutUrl) {
      showSuccessMessage();
      return;
    }

    // Plano Pago → redirecionar para Stripe
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl; // redireciona direto
      return;
    }

    // Se nada acima, algo está errado
    throw new Error("Resposta inesperada do backend");
  } catch (err) {
    alert("Erro: " + err.message);
    document.getElementById("loading").style.display = "none";
    document.querySelector(".submit-btn").disabled = false;
  }
}

// ========================
// Confirmar pagamento (feedback visual)
// ========================
async function confirmarPagamento() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session_id");
  if (!sessionId) return;

  try {
    const res = await fetch(`${API_BASE}/payment-success?session_id=${encodeURIComponent(sessionId)}`);
    if (!res.ok) throw new Error("Não foi possível confirmar pagamento");
    const data = await res.json();
    if (data?.status === "complete") {
      showSuccessMessage();
    } else {
      document.getElementById("successMessage").innerHTML = "<p>⚠️ Pagamento não confirmado.</p>";
    }
  } catch (err) {
    console.error("Erro ao confirmar pagamento:", err);
  }
}

function showSuccessMessage() {
  document.getElementById("formSection").style.display = "none";
  document.getElementById("successMessage").style.display = "block";
  document.getElementById("successMessage").scrollIntoView({ behavior: "smooth" });
}

document.getElementById("accessApp")?.addEventListener("click", function () {
  // ajuste para a URL real da sua aplicação
  window.location.href = "https://faixabet.streamlit.app/";
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  if (form) form.addEventListener("submit", enviarFormulario);
  confirmarPagamento();
});
