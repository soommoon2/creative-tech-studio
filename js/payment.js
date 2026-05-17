/* ═══════════════════════════════════════════════
   CREATIVE TECH STUDIO — Payment JS
   eSewa | Khalti | Connect IPS
   ═══════════════════════════════════════════════ */

let selectedMethod = null;

// ── Select Payment Method ─────────────────────
function selectMethod(method) {
  selectedMethod = method;
  // Reset all
  document.querySelectorAll('.pay-method').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll('.payment-form-section').forEach(el => el.classList.remove('active'));
  // Activate selected
  document.getElementById('pm-' + method)?.classList.add('selected');
  document.getElementById('form-' + method)?.classList.add('active');
}
window.selectMethod = selectMethod;

// ════════════════════════════════════════════════
// 1. eSEWA PAYMENT
// Docs: https://developer.esewa.com.np
// ════════════════════════════════════════════════
function payWithEsewa() {
  /*
   * HOW TO SETUP eSEWA:
   * 1. Register at merchant.esewa.com.np
   * 2. Get your Merchant Code (scd)
   * 3. Replace 'EPAYTEST' below with your code
   * 4. Change action URL to https://esewa.com.np/epay/main for PRODUCTION
   *
   * REQUIRED PARAMS:
   * - tAmt: total amount
   * - amt:  base amount (without tax)
   * - txAmt: tax amount
   * - pAmt: product/service charge
   * - sAmt: shipping charge
   * - scd:  merchant code
   * - pid:  unique product ID per transaction
   * - su:   success URL (your server must verify)
   * - fu:   failure URL
   */
  const amount = 9999;
  const pid    = 'CTS-' + Date.now(); // Unique transaction ID

  const form = document.getElementById('esewaForm');
  if (form) {
    form.querySelector('[name="tAmt"]').value = amount;
    form.querySelector('[name="amt"]').value  = amount;
    form.querySelector('[name="pid"]').value  = pid;
    // PRODUCTION: change action to https://esewa.com.np/epay/main
    form.action = 'https://uat.esewa.com.np/epay/main'; // UAT / Test
    showToast('eSewa payment page khuldai cha...', 'success');
    setTimeout(() => form.submit(), 800);
  }
}
window.payWithEsewa = payWithEsewa;

// ════════════════════════════════════════════════
// 2. KHALTI PAYMENT
// Docs: https://docs.khalti.com
// ════════════════════════════════════════════════
function payWithKhalti() {
  /*
   * HOW TO SETUP KHALTI:
   * 1. Register at khalti.com/merchant
   * 2. Get Public Key from Dashboard
   * 3. Replace 'YOUR_KHALTI_PUBLIC_KEY' below
   * 4. For PRODUCTION: use khalti-checkout.js (not .uat.js)
   *
   * IMPORTANT: On success, verify payment on YOUR SERVER using:
   * POST https://khalti.com/api/v2/payment/verify/
   * with secret key (NEVER expose secret key in frontend)
   */

  const config = {
    // ⚠️ Replace with your actual Khalti PUBLIC key
    publicKey: 'YOUR_KHALTI_PUBLIC_KEY',
    productIdentity: 'CTS-PRO-BUNDLE',
    productName: 'Creative Tech Studio — Pro Bundle',
    productUrl: window.location.origin,
    eventHandler: {
      onSuccess(payload) {
        // payload contains: token, amount, mobile, etc.
        console.log('Khalti Success:', payload);
        // TODO: Send payload.token to your server for verification
        // POST /api/verify-khalti { token: payload.token, amount: payload.amount }
        showToast('Payment successful! Verify maa janudai cha...', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 1500);
      },
      onError(error) {
        console.log('Khalti Error:', error);
        showToast('Payment failed. Pheri try garnuhos.', 'error');
      },
      onClose() {
        console.log('Khalti widget closed');
      }
    },
    paymentPreference: ['KHALTI', 'EBANKING', 'MOBILE_BANKING', 'CONNECT_IPS', 'SCT'],
  };

  // Check if Khalti SDK loaded
  if (typeof KhaltiCheckout !== 'undefined') {
    const checkout = new KhaltiCheckout(config);
    checkout.show({ amount: 999900 }); // Amount in paisa (999900 paisa = Rs 9999)
  } else {
    // Fallback if Khalti SDK not loaded (offline dev)
    showToast('Khalti SDK load bhayena. Internet check garnuhos.', 'error');
    console.log('Demo mode: Khalti payment config:', config);
  }
}
window.payWithKhalti = payWithKhalti;

// ════════════════════════════════════════════════
// 3. CONNECT IPS PAYMENT
// Docs: https://connectips.com/documentation
// ════════════════════════════════════════════════
function payWithCIPS() {
  /*
   * HOW TO SETUP CONNECT IPS:
   * 1. Register at connectips.com as merchant
   * 2. Get: MERCHANTID, APPID, APPNAME, TXNID, credentials
   * 3. Generate HMAC token on YOUR SERVER (never on frontend)
   * 4. POST to https://uat.connectips.com (test) or
   *    https://connectips.com (production)
   *
   * Server-side token generation (Node.js example):
   * const msg = `MERCHANTID=${id},APPID=${appId},APPNAME=${name},TXNID=${txnId},TXNDATE=${date},TXNCRNCY=NPR,TXNAMT=${amount},REFERENCEID=${ref},REMARKS=${remark},PARTICULARS=${particular},TOKEN=TOKEN`;
   * const token = crypto.createSign('RSA-SHA256').update(msg).sign(privateKey, 'base64');
   */

  const bank = document.querySelector('#form-cips select')?.value;
  if (!bank) { showToast('Bank choose garnuhos', 'error'); return; }

  // In production: fetch token from your server, then submit form
  // Example server endpoint: POST /api/get-cips-token
  const demoPayload = {
    MERCHANTID: 'YOUR_MERCHANT_ID',
    APPID: 'YOUR_APP_ID',
    APPNAME: 'CreativeTechStudio',
    TXNID: 'CTS' + Date.now(),
    TXNDATE: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
    TXNCRNCY: 'NPR',
    TXNAMT: 99900, // Amount in paisa
    REFERENCEID: 'REF' + Date.now(),
    REMARKS: 'Pro Bundle Purchase',
    PARTICULARS: 'Video Editing Course',
  };

  console.log('Connect IPS payload (send to server):', demoPayload);
  showToast(`${bank} maa payment redirect hunudai cha...`, 'success');

  // Production:
  // 1. POST above payload to your server
  // 2. Server generates HMAC token
  // 3. Server returns token
  // 4. Create form and POST to Connect IPS gateway
  // const form = document.createElement('form');
  // form.action = 'https://uat.connectips.com/connectipswebgw/loginpage';
  // form.method = 'POST';
  // Object.entries({...demoPayload, TOKEN: serverToken}).forEach(([k,v]) => {
  //   const input = document.createElement('input');
  //   input.type = 'hidden'; input.name = k; input.value = v;
  //   form.appendChild(input);
  // });
  // document.body.appendChild(form);
  // form.submit();

  setTimeout(() => {
    showToast('Connect IPS: Server-side setup garna parcha. README.md padnuhos.', 'error');
  }, 2000);
}
window.payWithCIPS = payWithCIPS;

// ── Toast ─────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span><span class="toast-message">${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => setTimeout(() => toast.classList.add('show'), 10));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 4000);
}
window.showToast = showToast;
