// ========================
// Configuração inicial 15/08/2025
// ========================

const API_BASE = "https://backend-v8.onrender.com/api"; // URL correta
let selectedPlan = null;

// ========================
// Captura cliques nos botões de plano
// ========================
document.querySelectorAll("[data-plan]").forEach(btn => {
    btn.addEventListener("click", e => {
        e.preventDefault();
        
        selectedPlan = btn.getAttribute("data-plan")?.trim().toLowerCase();

        // Mostra formulário de cadastro
        const formSection = document.getElementById("formSection");
        if (formSection) {
            formSection.classList.remove("hidden", "opacity-0", "scale-95");
            formSection.scrollIntoView({ behavior: "smooth" });
        }

        console.log("Plano selecionado:", selectedPlan);
    });
});

// ========================
// Envio do formulário de cadastro
// ========================
async function enviarFormulario(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    const payload = {
        full_name: formData.get('full_name'),
        username: formData.get('username'),
        birthdate: formData.get('birthdate'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password'),
        plan: selectedPlan
    };

    // Validação básica
    if (!payload.full_name || !payload.username || !payload.email || !payload.password) {
        alert('Preencha todos os campos obrigatórios.');
        return;
    }
    if (!payload.plan) {
        alert('Selecione um plano antes de continuar.');
        return;
    }

    try {
        console.log("🔍 Verificando email:", payload.email);
        
        // 1) Verificar se o email já existe
        let emailCheck = await fetch(`${API_BASE}/check-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: payload.email })
        });

        if (!emailCheck.ok) throw new Error(`Falha na verificação de e-mail (status ${emailCheck.status})`);

        const emailResult = await emailCheck.json();
        console.log("📩 Resultado check-email:", emailResult);
        if (emailResult.exists) {
            throw new Error('Este email já está cadastrado. Faça login ou use outro email.');
        }

        // 2) Registrar usuário e iniciar checkout (novo endpoint unificado)
        console.log("🆕 Registrando usuário e iniciando checkout:", payload);

        const response = await fetch(`${API_BASE}/register-and-checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const text = await response.text(); // captura até erro em HTML
          throw new Error(`Erro backend: ${text}`);
        }

        const data = await response.json();
        console.log("📦 Resposta register-and-checkout:", data);

        // Redireciona para o checkout ou confirma Free
        if (data.checkout_url) {
            window.location.href = data.checkout_url;
        } else if (data.plan === 'free') {
            alert('Plano Free ativado — bem-vindo!');
            window.location.href = '/dashboard';
        } else {
            throw new Error('Resposta inesperada do backend');
        }

    } catch (err) {
        console.error("❌ Erro no cadastro:", err);
        alert('Erro: ' + err.message);
    }
}

// ========================
// Ativar listener no formulário
// ========================
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#formSection form");
    if (form) {
        form.addEventListener("submit", enviarFormulario);
    }
});
    