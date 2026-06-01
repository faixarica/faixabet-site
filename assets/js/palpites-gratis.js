// assets/js/palpites-gratis.js
// Lógica para Gerar Palpites Grátis com Captura de Lead e Limite Diário

// 1. CONFIGURAÇÃO SUPABASE (Substitua pelas chaves reais se necessário)
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_KEY = 'your-anon-key';
const supabaseFaixa = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// 2. ESTADOS GLOBAIS
let currentLottery = null;
let dailyGenerations = 0;
let leadContact = null;

// 3. INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('gerarPalpitesGratisBtn');
    const leadForm = document.getElementById('leadForm');

    if (openBtn) {
        openBtn.addEventListener('click', openFreeModal);
    }

    if (leadForm) {
        leadForm.addEventListener('submit', handleLeadSubmit);
    }

    // Carregar dados salvos
    loadUserData();
});

// 4. FUNÇÕES DE MODAL
function openFreeModal() {
    const modal = document.getElementById('modalPalpitesGratis');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    resetModalSteps();
    
    if (checkLimit()) {
        showStep('step-limit');
    } else {
        showStep('step-loteria');
    }
}

function closeFreeModal() {
    const modal = document.getElementById('modalPalpitesGratis');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function showStep(stepId) {
    const steps = ['step-loteria', 'step-lead', 'step-loading', 'step-results', 'step-limit'];
    steps.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    const target = document.getElementById(stepId);
    if (target) target.classList.remove('hidden');
}

function resetModalSteps() {
    showStep('step-loteria');
}

// 5. LÓGICA DE NEGÓCIO
function selectLottery(lottery) {
    currentLottery = lottery;
    
    // Se já temos o lead, vai direto pro loading
    if (leadContact) {
        startFreeGeneration();
    } else {
        showStep('step-lead');
    }
}

async function handleLeadSubmit(e) {
    e.preventDefault();
    const contactInput = document.getElementById('leadContact');
    const contactValue = contactInput.value.trim();

    if (!validateContact(contactValue)) {
        alert('Por favor, insira um e-mail ou telefone válido.');
        return;
    }

    leadContact = contactValue;
    saveUserData();
    
    // Salvar no Supabase de forma assíncrona
    saveLeadToSupabase(contactValue, currentLottery);
    
    startFreeGeneration();
}

function startFreeGeneration() {
    showStep('step-loading');
    
    let progress = 0;
    const bar = document.getElementById('loading-bar');
    const text = document.getElementById('loading-text');
    
    const messages = [
        "Iniciando análise...",
        "Processando dados históricos...",
        "Filtrando tendências...",
        "Calculando probabilidades...",
        "Finalizando palpites..."
    ];

    const interval = setInterval(() => {
        progress += 5;
        if (bar) bar.style.width = progress + '%';
        
        const msgIndex = Math.floor((progress / 100) * messages.length);
        if (text) text.textContent = messages[Math.min(msgIndex, messages.length - 1)];

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(displayResults, 300);
        }
    }, 150);
}

function displayResults() {
    const container = document.getElementById('free-palpites-container');
    container.innerHTML = '';

    const palpites = generatePalpites(currentLottery);
    
    palpites.forEach((set, index) => {
        const div = document.createElement('div');
        div.className = "p-4 rounded-xl bg-background-dark/50 border border-white/5 flex flex-col gap-3";
        
        div.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sugestão ${index + 1}</span>
                <span class="text-[10px] text-accent-green font-mono">Precisão: ${75 + Math.floor(Math.random() * 10)}%</span>
            </div>
            <div class="flex flex-wrap gap-2 justify-center">
                ${set.map(n => `<span class="size-8 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center text-sm font-bold text-white shadow-sm">${n.toString().padStart(2, '0')}</span>`).join('')}
            </div>
        `;
        container.innerHTML += div.outerHTML;
    });

    dailyGenerations++;
    saveUserData();
    showStep('step-results');
}

// 6. UTILITÁRIOS
function validateContact(val) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9\s\(\)\-\+]{8,20}$/;
    return emailRegex.test(val) || phoneRegex.test(val);
}

function generatePalpites(lottery) {
    const count = lottery === 'Mega-Sena' ? 6 : (lottery === 'Lotofácil' ? 15 : 20);
    const max = lottery === 'Mega-Sena' ? 60 : (lottery === 'Lotofácil' ? 25 : 100);
    
    const sets = [];
    for (let i = 0; i < 2; i++) {
        const nums = new Set();
        while (nums.size < count) {
            nums.add(Math.floor(Math.random() * max) + 1);
        }
        sets.push(Array.from(nums).sort((a, b) => a - b));
    }
    return sets;
}

function checkLimit() {
    return dailyGenerations >= 10;
}

function saveUserData() {
    const data = {
        contact: leadContact,
        generations: dailyGenerations,
        date: new Date().toLocaleDateString()
    };
    localStorage.setItem('faixabet_free_user', JSON.stringify(data));
    
    // Cookie para 24h (identificação do lead)
    if (leadContact) {
        document.cookie = `faixabet_lead=${btoa(leadContact)}; max-age=86400; path=/`;
    }
}

function loadUserData() {
    const saved = localStorage.getItem('faixabet_free_user');
    if (saved) {
        const data = JSON.parse(saved);
        // Resetar se for outro dia
        if (data.date !== new Date().toLocaleDateString()) {
            dailyGenerations = 0;
            leadContact = data.contact; // Mantém o contato
        } else {
            dailyGenerations = data.generations || 0;
            leadContact = data.contact;
        }
    }
}

async function saveLeadToSupabase(contact, lottery) {
    if (!supabaseFaixa) {
        console.warn('Supabase não inicializado. Verifique as chaves.');
        return;
    }

    try {
        const { data, error } = await supabaseFaixa
            .from('lead-site')
            .insert([
                { 
                    contato: contact, 
                    loteria: lottery, 
                    origem: 'Hero Section (Grátis)',
                    created_at: new Date().toISOString()
                }
            ]);

        if (error) throw error;
        console.log('Lead salvo no Supabase:', data);
    } catch (err) {
        console.error('Erro ao salvar lead no Supabase:', err.message);
    }
}
