// ======================================================================
// brevo.js — Cookie Banner + Brevo Tracker
// ======================================================================

// Evita carregar o Brevo mais de uma vez
window.brevoTrackerLoaded = false;

// ======================================================================
// Carregar Brevo Tracker
// ======================================================================
function loadBrevoTracker() {
  if (window.brevoTrackerLoaded) return;
  window.brevoTrackerLoaded = true;

  // Carregar SDK oficial do Brevo
  const sdkScript = document.createElement("script");
  sdkScript.src = "https://cdn.brevo.com/js/sdk-loader.js";
  sdkScript.async = true;
  document.head.appendChild(sdkScript);

  // Inicialização do Brevo
  window.Brevo = window.Brevo || [];
  window.Brevo.push([
    "init",
    {
      client_key: "g8hmydu90ttp1b95werp9qad",
    },
  ]);
}

// ======================================================================
// Controle de consentimento
// ======================================================================
function setConsent(status) {
  try {
    localStorage.setItem("cookiesConsentFaixabet", status);
  } catch (e) {
    console.warn("LocalStorage indisponível:", e);
  }
}

function getConsent() {
  try {
    return localStorage.getItem("cookiesConsentFaixabet");
  } catch (e) {
    console.warn("Falha ao ler localStorage:", e);
    return null;
  }
}

// ======================================================================
// Lógica do Banner (DOMContentLoaded)
// ======================================================================
document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("cookie-banner");
  const btnAceitar = document.getElementById("acceptCookies");
  const btnRecusar = document.getElementById("rejectCookies");

  const consent = getConsent();

  // Já aceitou → carrega o Brevo
  if (consent === "accepted") {
    loadBrevoTracker();
  }

  // Já recusou → não faz nada
  else if (consent === "rejected") {
    // Não carrega tracker
  }

  // Nunca escolheu → exibir banner
  else if (banner) {
    banner.style.display = "flex";
  }

  // -----------------------------
  // Botão Aceitar
  // -----------------------------
  if (btnAceitar) {
    btnAceitar.addEventListener("click", () => {
      setConsent("accepted");
      if (banner) banner.style.display = "none";
      loadBrevoTracker();
    });
  }

  // -----------------------------
  // Botão Recusar
  // -----------------------------
  if (btnRecusar) {
    btnRecusar.addEventListener("click", () => {
      setConsent("rejected");
      if (banner) banner.style.display = "none";
    });
  }
});
