// cookie-banner.js

(function () {
  const hasConsent = localStorage.getItem('cookieConsent') === 'true';

  if (hasConsent) return;

  const banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.style.position = 'fixed';
  banner.style.bottom = '0';
  banner.style.left = '0';
  banner.style.right = '0';
  banner.style.backgroundColor = '#1f2937'; // Tailwind gray-900
  banner.style.color = '#fff';
  banner.style.padding = '1rem';
  banner.style.fontSize = '0.875rem';
  banner.style.display = 'flex';
  banner.style.justifyContent = 'space-between';
  banner.style.alignItems = 'center';
  banner.style.zIndex = '1000';
  banner.style.boxShadow = '0 -2px 6px rgba(0,0,0,0.3)';

  banner.innerHTML = `
    <div style="max-width: 90%; line-height: 1.5;">
      Utilizamos cookies para melhorar sua experiência e analisar o tráfego do site. Ao continuar navegando, você concorda com nossa
      <a href="/politica-de-privacidade" style="color:#60a5fa; text-decoration: underline;">Política de Privacidade</a>.
    </div>
    <button id="accept-cookies" style="
      background-color: #2563eb;
      color: white;
      padding: 0.5rem 1rem;
      margin-left: 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    ">
      Aceitar
    </button>
  `;

  document.body.appendChild(banner);

  document.getElementById('accept-cookies').addEventListener('click', function () {
    localStorage.setItem('cookieConsent', 'true');
    document.getElementById('cookie-banner').remove();
  });
})();
