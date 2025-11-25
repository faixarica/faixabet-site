// assets/js/brevo.js – Cookie banner + Brevo Tracker (CORRIGIDO)
window.brevoTrackerLoaded = false;

function loadBrevoTracker() {
  if (window.brevoTrackerLoaded) return;
  window.brevoTrackerLoaded = true;

  const sdkScript = document.createElement("script");
  sdkScript.src = "https://cdn.brevo.com/js/sdk-loader.js";
  sdkScript.async = true;
  document.head.appendChild(sdkScript);

  window.Brevo = window.Brevo || [];
  window.Brevo.push([
    "init",
    {
      client_key: "g8hmydu90ttp1b95werp9qad"
    }
  ]);
}

function setConsent(status) {
  // status = "aceito" ou "negado"
  try {
    localStorage.setItem("cookiesConsentFaixabet", status);
  } catch (e) {
    console.warn("Não foi possível acessar localStorage:", e);
  }
}

function getConsent() {
  try {
    return localStorage.getItem("cookiesConsentFaixabet");
  } catch (e) {
    console.warn("Não foi possível ler localStorage:", e);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("cookie-banner");
  const btnAceitar = document.getElementById("acceptCookies");
  const btnRecusar = document.getElementById("rejectCookies");

  const consent = getConsent();

  // SE O USUÁRIO JÁ ACEITOU — carregue automaticamente
  if (consent === "aceito") {
    loadBrevoTracker();
  }

  // SE NÃO HOUVE DECISÃO — mostrar banner
  else if (!consent && banner) {
    banner.style.display = "flex";
  }

  // EVENTO: ACEITAR
  if (btnAceitar) {
    btnAceitar.addEventListener("click", () => {
      setConsent("aceito");
      if (banner) banner.style.display = "none";
      loadBrevoTracker(); // aqui carrega o SDK
    });
  }

  // EVENTO: RECUSAR
  if (btnRecusar) {
    btnRecusar.addEventListener("click", () => {
      setConsent("negado");
      if (banner) banner.style.display = "none";
      // não carrega o tracker
    });
  }
});
