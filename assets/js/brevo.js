// assets/js/brevo.js – Cookie banner + Brevo Tracker
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
      client_key: "g8hmydu90ttp1b95werp9qad",
    },
  ]);
}

function setConsent(status) {
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

  if (consent === "accepted") {
    loadBrevoTracker();
  } else if (consent === "rejected") {
    // não carrega nada
  } else if (banner) {
    banner.style.display = "flex";
  }

  if (btnAceitar) {
    btnAceitar.addEventListener("click", () => {
      setConsent("accepted");
      if (banner) banner.style.display = "none";
      loadBrevoTracker();
    });
  }

  if (btnRecusar) {
    btnRecusar.addEventListener("click", () => {
      setConsent("rejected");
      if (banner) banner.style.display = "none";
    });
  }
});
