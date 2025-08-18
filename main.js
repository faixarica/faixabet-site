// ========================
// Configuração inicial
// ========================
const API_BASE = "https://backend-v8.onrender.com/api"; // ajuste se necessário
let selectedPlan = null;

// Cache da instância do Stripe
let stripeInstance = null;
async function getStripe() {
  if (stripeInstance) return stripeInstance;
  const res = await fetch(`${API_BASE}/public-key`);
  const data = await res.json();
  if (!res.ok || !data.publishableKey) {
    throw new Error("Stripe publishable key não configurada no backend");
  }
  stripeInstance = Stripe(data.publishableKey); // pk_test_... ou pk_live_...
  return stripeInstance;
}

// ========================
// Seleção de plano
// ========================
document.querySelectorAll(".plan-card, .btn").forEach((element) => {
  element.addEventListener("click", function (e) {
    e.preventDefault();

    const plan = this.getAttribute("data-plan");
    if (!plan) return;

    selectedPlan = plan.toLowerCase();

    // Atualizar UI dos planos
    document.querySelectorAll(".plan-card").forEach((card) => {
      card.classList.remove("selected");
    });

    const selectedCard = document
      .querySelector(`[data-plan="${selectedPlan}"]`)
      .closest(".plan-card");
    selectedCard.classList.add("selected");

    // Mostrar formulário
    document.getElementById("formSection").classList.add("active");
    document.getElementById("selectedPlan").value =
      selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1);

    // Scroll para o formulário
    document
      .getElementById("formSection")
      .scrollIntoView({ behavior: "smooth" });
  });
});

// ========================
// Envio do formulário de cadastro
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
    plan: selectedPlan,
  };

  try {
    // 1) Validar email
    const emailCheck = await fetch(`${API_BASE}/check-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: payload.email }),
    });
    if (!emailCheck.ok)
      throw new Error(`Erro check-email (${emailCheck.status})`);
    const emailResult = await emailCheck.json();
    if (emailResult.exists) throw new Error("Este email já está cadastrado.");

    // 2) Criar usuário + checkout
    const res = await fetch(`${API_BASE}/register-and-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Erro backend: ${text}`);
    }
const data = await res.json();
console.log("Session response do backend:", data);

// Plano Free → já ativado
if (data.userId && !data.sessionId) {
  showSuccessMessage();
  return;
}

// Plano Pago → redirecionar para Stripe Checkout
if (data.sessionId) {
  const stripe = await getStripe(); // garante que veio do backend
  const { error } = await stripe.redirectToCheckout({
    sessionId: data.sessionId,
  });
  if (error) throw new Error(error.message);
  return;
}

// Se chegou aqui, algo veio fora do esperado:
throw new Error("Resposta inesperada do backend");

  // Se chegou aqui, algo veio fora do esperado:
    throw new Error("Resposta inesperada do backend");
  } catch (err) {
    alert("Erro: " + err.message);
    document.getElementById("loading").style.display = "none";
    document.querySelector(".submit-btn").disabled = false;
  }
}

// ========================
// Confirmar pagamento após redirecionamento do Stripe
// (apenas para feedback visual)
// ========================
async function confirmarPagamento() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session_id");
  if (!sessionId) return;

  try {
    const res = await fetch(`${API_BASE}/payment-success?session_id=${sessionId}`);
    const data = await res.json();

    if (data.error) {
      document.getElementById("successMessage").innerHTML =
        "<p>⚠️ Pagamento não confirmado.</p>";
    } else {
      showSuccessMessage();
    }
  } catch (err) {
    console.error("Erro ao confirmar pagamento:", err);
  }
}

// ========================
// Mostrar mensagem de sucesso
// ========================
function showSuccessMessage() {
  document.getElementById("formSection").style.display = "none";
  document.getElementById("successMessage").style.display = "block";
  document.getElementById("successMessage").scrollIntoView({
    behavior: "smooth",
  });
}

// ========================
// Acessar a aplicação
// ========================
document.getElementById("accessApp").addEventListener("click", function () {
  window.location.href = "https://faixab7.streamlit.app.onrender.com"; // ajuste para a URL real
});

// ========================
// Ativar listeners
// ========================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  if (form) {
    form.addEventListener("submit", enviarFormulario);
  }
  confirmarPagamento();
});
