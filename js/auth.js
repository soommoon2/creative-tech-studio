/* ═══════════════════════════════════════════════
   CREATIVE TECH STUDIO — Auth JS
   localStorage-based auth (replace with real API)
   ═══════════════════════════════════════════════ */

// ── Tab Switch ────────────────────────────────
function switchTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  if (!loginForm || !registerForm) return;
  if (tab === 'login') {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
  }
}
window.switchTab = switchTab;

// ── Toggle Password Visibility ────────────────
function togglePassword(inputId, icon) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  icon.innerHTML = isHidden
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
}
window.togglePassword = togglePassword;

// ── Password Strength Checker ─────────────────
function checkPasswordStrength(pw) {
  const fill = document.getElementById('pwStrengthFill');
  const text = document.getElementById('pwStrengthText');
  if (!fill || !text) return;
  let strength = 0;
  if (pw.length >= 8) strength++;
  if (/[A-Z]/.test(pw)) strength++;
  if (/[0-9]/.test(pw)) strength++;
  if (/[^A-Za-z0-9]/.test(pw)) strength++;
  const levels = [
    { color: '#FF4444', label: 'Weak', width: '25%' },
    { color: '#FF9A00', label: 'Fair', width: '50%' },
    { color: '#FFD700', label: 'Good', width: '75%' },
    { color: '#00C896', label: 'Strong', width: '100%' },
  ];
  const lvl = levels[Math.max(0, strength - 1)] || levels[0];
  fill.style.width = pw.length ? lvl.width : '0';
  fill.style.background = lvl.color;
  text.textContent = pw.length ? `Password strength: ${lvl.label}` : '';
  text.style.color = lvl.color;
}
window.checkPasswordStrength = checkPasswordStrength;

// ── User Storage Helpers ──────────────────────
function getUsers() { return JSON.parse(localStorage.getItem('cts_users') || '[]'); }
function saveUsers(users) { localStorage.setItem('cts_users', JSON.stringify(users)); }
function setCurrentUser(user) { localStorage.setItem('cts_currentUser', JSON.stringify(user)); }
function getCurrentUser() { return JSON.parse(localStorage.getItem('cts_currentUser') || 'null'); }

// ── Handle Login ──────────────────────────────
function handleLogin() {
  const email = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;
  let valid = true;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('loginEmailError')?.classList.add('show');
    document.getElementById('loginEmail')?.classList.add('error');
    valid = false;
  } else {
    document.getElementById('loginEmailError')?.classList.remove('show');
    document.getElementById('loginEmail')?.classList.remove('error');
  }
  if (!password) {
    document.getElementById('loginPasswordError')?.classList.add('show');
    document.getElementById('loginPassword')?.classList.add('error');
    valid = false;
  } else {
    document.getElementById('loginPasswordError')?.classList.remove('show');
    document.getElementById('loginPassword')?.classList.remove('error');
  }
  if (!valid) return;

  const btn = document.getElementById('loginBtn');
  btn?.classList.add('loading');

  setTimeout(() => {
    btn?.classList.remove('loading');
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      setCurrentUser(user);
      showToast('Login successful! Welcome back 🎬', 'success');
      setTimeout(() => window.location.href = 'dashboard.html', 1000);
    } else {
      // Demo: create if first time
      if (users.length === 0) {
        const demoUser = { firstName: 'Demo', lastName: 'User', email, password, enrolledCourses: ['photoshop','illustrator'] };
        saveUsers([demoUser]);
        setCurrentUser(demoUser);
        showToast('Demo login successful! 🎬', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 1000);
      } else {
        showToast('Email vaa password galat cha. Pheri check garnuhos.', 'error');
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginPassword')?.classList.add('error');
      }
    }
  }, 1200);
}
window.handleLogin = handleLogin;

// ── Handle Register ───────────────────────────
function handleRegister() {
  const firstName = document.getElementById('regFirstName')?.value.trim();
  const lastName  = document.getElementById('regLastName')?.value.trim();
  const email     = document.getElementById('regEmail')?.value.trim();
  const phone     = document.getElementById('regPhone')?.value.trim();
  const password  = document.getElementById('regPassword')?.value;
  const confirm   = document.getElementById('regConfirmPassword')?.value;
  const terms     = document.getElementById('regTerms')?.checked;
  let valid = true;

  if (!firstName) {
    document.getElementById('regFirstNameError')?.classList.add('show');
    document.getElementById('regFirstName')?.classList.add('error');
    valid = false;
  } else {
    document.getElementById('regFirstNameError')?.classList.remove('show');
    document.getElementById('regFirstName')?.classList.remove('error');
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('regEmailError')?.classList.add('show');
    document.getElementById('regEmail')?.classList.add('error');
    valid = false;
  } else {
    document.getElementById('regEmailError')?.classList.remove('show');
    document.getElementById('regEmail')?.classList.remove('error');
  }
  if (!password || password.length < 8) {
    document.getElementById('regPasswordError')?.classList.add('show');
    document.getElementById('regPassword')?.classList.add('error');
    valid = false;
  } else {
    document.getElementById('regPasswordError')?.classList.remove('show');
    document.getElementById('regPassword')?.classList.remove('error');
  }
  if (password !== confirm) {
    document.getElementById('regConfirmError')?.classList.add('show');
    document.getElementById('regConfirmPassword')?.classList.add('error');
    valid = false;
  } else {
    document.getElementById('regConfirmError')?.classList.remove('show');
    document.getElementById('regConfirmPassword')?.classList.remove('error');
  }
  if (!terms) {
    document.getElementById('regTermsError')?.classList.add('show');
    valid = false;
  } else {
    document.getElementById('regTermsError')?.classList.remove('show');
  }
  if (!valid) return;

  const btn = document.getElementById('registerBtn');
  btn?.classList.add('loading');

  setTimeout(() => {
    btn?.classList.remove('loading');
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      showToast('Yo email already registered cha. Login garnuhos.', 'error');
      return;
    }
    const newUser = { firstName, lastName, email, phone, password, enrolledCourses: ['photoshop','illustrator'], joinedAt: new Date().toISOString() };
    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);
    showToast('Account created! Swagat cha Creative Tech Studio maa 🎉', 'success');
    setTimeout(() => window.location.href = 'payment.html', 1200);
  }, 1400);
}
window.handleRegister = handleRegister;

// ── Logout ────────────────────────────────────
function logout() {
  localStorage.removeItem('cts_currentUser');
  showToast('Logout successful!', 'success');
  setTimeout(() => window.location.href = 'login.html', 800);
}
window.logout = logout;

// ── Enter Key Submit ──────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm?.style.display !== 'none' && document.getElementById('loginEmail')) handleLogin();
    else if (registerForm?.style.display !== 'none') handleRegister();
  }
});

// ── Toast (shared) ────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span><span class="toast-message">${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => setTimeout(() => toast.classList.add('show'), 10));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3500);
}
window.showToast = showToast;
