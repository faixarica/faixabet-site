# Implementation Plan - Stripe Checkout & User Registration Flow in index-2.html

This plan details the integration of Stripe checkout, user registration flow, duplicate validation, and transactional emails (Welcome & Interrupted) for **FaixaBet** using `index-2.html` on the frontend and the Node.js server in `server.js` on the backend.

## User Review Required

> [!IMPORTANT]
> The backend server `server.js` will be modified to support a robust duplicate prevention mechanism. 
> If a user attempts to sign up with an email or username that has a completed registration (`ativo = true`), they will be blocked.
> If they have an incomplete registration (`ativo = false`), the old registration will be automatically cleaned up from `usuarios`, `client_plans`, and `financeiro` tables before inserting the new registration, preventing database unique constraint violations.

> [!TIP]
> To send SMTP emails from the Node.js backend (`server.js`), we will install `nodemailer` as a dependency. The email configuration will reuse the existing environment variables: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, and `EMAIL_PASS`.

---

## Proposed Changes

### 1. Frontend Integration

#### [MODIFY] [index-2.html](file:///c:/Projetos/Faixa/Site-Faixabet/index-2.html)
- Add `data-plan` attributes to the buttons inside the `#planos-faixabet` section to align with `assets/js/main.js`:
  - Free Plan: `data-plan="free"`
  - Silver Plan: `data-plan="silver"`
  - Gold Plan: `data-plan="gold"`
- Add a premium glassmorphic `#formSection` using Tailwind CSS below the planos section.
- Add a premium celebratory `#successMessage` using Tailwind CSS below the FAQ section.
- Add a beautiful `#loading` screen with a custom neon spinner overlay.
- Load `assets/js/main.js` at the bottom of the page before the closing `</body>` tag.

#### [NEW] [cancelado.html](file:///c:/Projetos/Faixa/Site-Faixabet/cancelado.html)
- Create a stunning glassmorphic "Cadastro Interrompido" landing page in Portuguese.
- Retrieve the `user_id` query parameter from the URL.
- Make a background call to the backend at `GET /api/payment-cancel?user_id=...` to trigger the "Cadastro Interrompido" email.
- Display a supportive message in the brand colors (Blue, Green, Yellow) and an easy "Tentar Novamente" button that redirects back to `index-2.html#planos-faixabet`.

---

### 2. Backend Integration

#### [MODIFY] [server.js](file:///C:/Projetos/Faixa/Faixabet_backend/backend/server.js)
- Add `nodemailer` import to handle SMTP emails.
- Update `/api/check-email` to only return `exists: true` for active users (`ativo = true`).
- Update `/api/register-and-checkout`:
  - Perform duplicity check on both `email` and `usuario` (username).
  - Block registration if any record with `ativo = true` exists.
  - Automatically delete incomplete registrations (`ativo = false`) from `client_plans`, `financeiro`, and `usuarios` before creating the new one.
  - Set `ativo = false` for paid plans during user insertion.
  - Update Stripe Session creation to pass `user_id` in `cancel_url`:
    `cancel_url: "https://www.faixabet.com.br/cancelado.html?user_id=" + userId`
- Update `/api/payment-success`:
  - When payment is confirmed, query user data and send the **Welcome Email**.
- Add `/api/payment-cancel` endpoint:
  - Query user details by ID.
  - If `ativo = false`, trigger the **Cadastro Interrompido Email**.

#### [NEW] [emailService.js](file:///C:/Projetos/Faixa/Faixabet_backend/backend/emailService.js)
- Create a dedicated helper module to initialize the `nodemailer` SMTP transporter and send emails.
- Implement HTML email templates styled rigorously under the premium dark theme utilizing company colors (Blue, Green, Yellow) and public assets:
  - **Template 1 (Welcome Email)**: Displays login credentials, payment details, plan benefits, and a CTA button to the app.
  - **Template 2 (Interrupted Registration Email)**: Friendly notification letting them know their incomplete registration is temporarily saved, detailing benefits, and offering a quick CTA link to complete signup.

---

## Technical Details

### Transactional Email Templates Mockup

````carousel
```html
<!-- Welcome Email Template Summary -->
<div style="background-color: #0f172a; color: #e2e8f0; font-family: sans-serif;">
  <div style="background: linear-gradient(135deg, #135bec, #8b5cf6); padding: 25px; text-align: center;">
    <h1 style="color: #fff;">Bem-vindo ao Time VIP fAIxaBet! 🚀</h1>
  </div>
  <div style="padding: 20px;">
    <p>Olá, {{nome}}!</p>
    <p>Sua assinatura VIP foi ativada com sucesso.</p>
    <h3 style="color: #00d26a;">Benefícios do plano:</h3>
    <ul>
      <li>Palpites neurais otimizados com motor Mission-Up V9</li>
      <li>Histórico de palpites exclusivos</li>
    </ul>
    <h3 style="color: #fcd535;">Seus Dados de Acesso:</h3>
    <p>Usuário: {{usuario}} | Valor: R$ {{valor}}</p>
    <a href="https://faixabet9.streamlit.app/" style="background: linear-gradient(90deg, #00d26a, #135bec); padding: 12px 24px; color:#0f172a; font-weight:bold; border-radius:8px;">Acessar Plataforma</a>
  </div>
</div>
```
<!-- slide -->
```html
<!-- Interrupted Registration Email Template Summary -->
<div style="background-color: #0f172a; color: #e2e8f0; font-family: sans-serif;">
  <div style="background: linear-gradient(135deg, #f97316, #135bec); padding: 25px; text-align: center;">
    <h1 style="color: #fff;">Opa! Falta muito pouco... ⚡</h1>
  </div>
  <div style="padding: 20px;">
    <p>Olá, {{nome}}!</p>
    <p>Seu cadastro não foi concluído porque o pagamento foi interrompido.</p>
    <div style="border-left: 4px solid #fcd535; padding: 10px; background:#0f172a;">
      Seus dados básicos foram salvos com segurança. Conclua seu pagamento para liberar acesso.
    </div>
    <a href="https://www.faixabet.com.br/index-2.html#planos-faixabet" style="background: linear-gradient(90deg, #fcd535, #00d26a); padding: 12px 24px; color:#0f172a; font-weight:bold; border-radius:8px;">Finalizar Cadastro</a>
  </div>
</div>
```
````

---

## Verification Plan

### Automated Tests
- Build Node.js backend locally and ensure it starts up without errors.
- Validate JSON outputs for the API routes.

### Manual Verification
- **Sign Up Flow**: Choose a plan on `index-2.html`, fill out the registration form, and ensure the loading state displays.
- **Paid Plan Checkout**: Verify that registering for Silver or Gold successfully redirects to Stripe Checkout and contains the correct price ID and metadata.
- **Success Redirect**: Navigate to `success.html?session_id=...` and verify that the backend activates the user (`ativo = true`), records payment, and fires the welcome email.
- **Cancel Redirect**: Cancel payment on Stripe, land on `cancelado.html?user_id=...`, and verify that the backend receives the cancellation and fires the interrupted registration email.
- **Duplicity Validation**: Try to register with an active email or username, ensuring it is blocked. Try registering with an inactive email, ensuring it cleans up the old record and proceeds perfectly.
