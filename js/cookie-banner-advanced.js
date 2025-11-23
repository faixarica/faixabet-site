// cookie-banner-advanced.js

(function () {
  const savedPrefs = localStorage.getItem('cookiePrefs');
  if (savedPrefs) return; // Já definido

  const css = `
    #cookie-banner-advanced {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #1f2937;
      color: white;
      font-size: 14px;
      z-index: 1000;
      padding: 1.5rem;
      box-shadow: 0 -2px 6px rgba(0,0,0,0.3);
    }
    #cookie-banner-advanced a {
      color: #60a5fa;
      text-decoration: underline;
    }
    #cookie-banner-advanced .btn {
      margin: 0.25rem;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-accept { background: #16a34a; color: white; }
    .btn-decline { background: #dc2626; color: white; }
    .btn-config { background: #374151; color: white; }
    .btn-save { background: #2563eb; color: white; }

    #cookie-settings {
      display: none;
      margin-top: 1rem;
      background: #111827;
      padding: 1rem;
      border-radius: 0.5rem;
    }
    .cookie-toggle {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .cookie-toggle input {
      margin-right: 0.5rem;
    }
  `;

  const styleTag = document.createElement('style');
  styleTag.innerText = css;
  document.head.appendChild(styleTag);

  const banner = document.createElement('div');
  banner.id = 'cookie-banner-advanced';
  banner.innerHTML = `
    <div>
      Usamos cookies para melhorar sua experiência. Escolha como deseja que seus dados sejam usados. 
      Consulte nossa <a href="/politica-de-privacidade" target="_blank">Política de Privacidade</a>.
    </div>
    <div class="mt-2">
      <button class="btn btn-accept" id="acceptAll">Aceitar Todos</button>
      <button class="btn btn-decline" id="declineAll">Recusar Todos</button>
      <button class="btn btn-config" id="toggleSettings">Configurar</button>
    </div>
    <div id="cookie-settings">
      <div class="cookie-toggle">
        <input type="checkbox" id="cookie-functional" disabled checked />
        <label for="cookie-functional">Cookies Funcionais (obrigatórios)</label>
      </div>
      <div class="cookie-toggle">
        <input type="checkbox" id="cookie-analytics" />
        <label for="cookie-analytics">Cookies de Análise</label>
      </div>
      <div class="cookie-toggle">
        <input type="checkbox" id="cookie-marketing" />
        <label for="cookie-marketing">Cookies de Marketing</label>
      </div>
      <button class="btn btn-save mt-2" id="savePrefs">Salvar Preferências</button>
    </div>
  `;

  document.body.appendChild(banner);

  // Event listeners
  document.getElementById('acceptAll').onclick = () => {
    localStorage.setItem('cookiePrefs', JSON.stringify({
      functional: true,
      analytics: true,
      marketing: true
    }));
    banner.remove();
  };

  document.getElementById('declineAll').onclick = () => {
    localStorage.setItem('cookiePrefs', JSON.stringify({
      functional: true,
      analytics: false,
      marketing: false
    }));
    banner.remove();
  };

  document.getElementById('toggleSettings').onclick = () => {
    const settings = document.getElementById('cookie-settings');
    settings.style.display = settings.style.display === 'block' ? 'none' : 'block';
  };

  document.getElementById('savePrefs').onclick = () => {
    const analytics = document.getElementById('cookie-analytics').checked;
    const marketing = document.getElementById('cookie-marketing').checked;
    localStorage.setItem('cookiePrefs', JSON.stringify({
      functional: true,
      analytics,
      marketing
    }));
    banner.remove();
  };
})();
