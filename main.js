// ========================
// Configuração inicial
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

        // 2) Criar usuário no backend
        console.log("🆕 Registrando usuário:", payload);
        let res = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const j = await res.json();
        console.log("📦 Resposta registro:", j);
        if (!res.ok) throw new Error(j.error || 'Erro ao cadastrar');

        const client_id = j.client_id;

        // 3) Fluxo por tipo de plano
        if (selectedPlan === 'free') {
            console.log("🎁 Ativando plano Free...");
            let r2 = await fetch(`${API_BASE}/process-free-plan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ client_id, plan: 'free', email: payload.email })
            });
            const ok2 = await r2.json();
            console.log("📦 Resposta plano free:", ok2);
            if (!r2.ok) throw new Error(ok2.error || 'Erro ao ativar plano Free');
            alert('Plano Free ativado — bem-vindo!');
            window.location.href = '/dashboard';
        } else {
            console.log("💳 Criando sessão Stripe para plano:", selectedPlan);
            let r3 = await fetch(`${API_BASE}/create-checkout-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ client_id, plan: selectedPlan })
            });
            const j3 = await r3.json();
            console.log("📦 Resposta Stripe:", j3);
            if (!r3.ok || !j3.url) throw new Error(j3.error || 'Erro criando sessão de pagamento');
            window.location.href = j3.url; // redireciona para checkout Stripe
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
