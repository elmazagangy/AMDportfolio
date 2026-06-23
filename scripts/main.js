/* ===== STATE ===== */
const state = {
  lang: localStorage.getItem('portfolio-lang') || 'en',
  theme: localStorage.getItem('portfolio-theme') || 'light',
};

/* ===== DOM REFS ===== */
const html = document.documentElement;
const langToggle = document.getElementById('langToggle');
const themeToggle = document.getElementById('themeToggle');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

/* ===== LANGUAGE ===== */
function setLang(lang) {
  state.lang = lang;
  html.lang = lang;
  html.dir = lang === 'ar' ? 'rtl' : 'ltr';
  localStorage.setItem('portfolio-lang', lang);
  langToggle.textContent = lang === 'ar' ? 'EN' : 'العربية';
  document.querySelectorAll('[lang]').forEach(el => {
    el.hidden = el.getAttribute('lang') !== lang;
  });
  const titleEl = document.querySelector('title[lang="' + lang + '"]');
  if (titleEl) document.title = titleEl.textContent;
  // Update mockup auth placeholders
  const ph = {
    'authLoginEmail': { en: 'Email', ar: 'البريد الإلكتروني' },
    'authLoginPass': { en: 'Password', ar: 'كلمة السر' },
    'authRegEmail': { en: 'Email', ar: 'البريد الإلكتروني' },
    'authRegPhone': { en: 'Phone (optional)', ar: 'رقم الهاتف (اختياري)' },
    'authRegPass': { en: 'Password', ar: 'كلمة السر' },
  };
  Object.keys(ph).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.placeholder = ph[id][lang];
  });
  if (document.querySelector('.project-card')) initScrollNav();
}

langToggle.addEventListener('click', () => setLang(state.lang === 'ar' ? 'en' : 'ar'));

/* ===== THEME ===== */
function setTheme(theme) {
  state.theme = theme;
  html.setAttribute('data-theme', theme);
  localStorage.setItem('portfolio-theme', theme);
  themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
}

themeToggle.addEventListener('click', () => setTheme(state.theme === 'light' ? 'dark' : 'light'));

/* ===== MOBILE MENU ===== */
menuToggle.addEventListener('click', () => navLinks.classList.toggle('nav__links--open'));
document.querySelectorAll('.nav__links a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('nav__links--open')));

/* ===== SCROLL REVEAL ===== */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.service-card, .project, .section__title, .section__sub, .contact__grid').forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

/* ===== PROJECT 4: TABS DEMO ===== */
document.querySelectorAll('.mockup-tabs-demo__tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const bar = tab.closest('.mockup-tabs-demo__bar');
    bar.querySelectorAll('.mockup-tabs-demo__tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const content = tab.closest('.mockup-tabs-demo').querySelector('.mockup-tabs-demo__content');
    content.querySelectorAll('.mockup-tabs-demo__panel').forEach(p => p.classList.remove('active'));
    const panel = content.querySelector(`[data-panel="${tab.dataset.tab}"]`);
    if (panel) panel.classList.add('active');
  });
});

/* ===== CONTACT FORM ===== */
const INS_BASE = 'https://ih9kxwm2.eu-central.insforge.app';
const INS_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNDcxNjd9.MKXdkYOaSmXGechECwLZloVcKqhPRP6KiYdsAbabC-A';

const validators = {
  name: v => v.trim().length >= 2 ? '' : state.lang === 'ar' ? 'الاسم مطلوب (حرفين على الأقل)' : 'Name required (min 2 characters)',
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : state.lang === 'ar' ? 'بريد إلكتروني غير صحيح' : 'Invalid email address',
  message: v => v.trim().length >= 10 ? '' : state.lang === 'ar' ? 'الرسالة مطلوبة (10 أحرف على الأقل)' : 'Message required (min 10 characters)',
};

function validateField(field) {
  const error = field.parentElement.querySelector('.form-error');
  const fn = validators[field.name];
  if (!fn) return true;
  const msg = fn(field.value);
  error.textContent = msg;
  field.classList.toggle('error', !!msg);
  return !msg;
}

contactForm.querySelectorAll('input, textarea').forEach(field => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => { if (field.classList.contains('error')) validateField(field); });
});

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  let valid = true;
  contactForm.querySelectorAll('input[required], textarea[required]').forEach(f => { if (!validateField(f)) valid = false; });
  if (!valid) return;

  formStatus.className = 'form-status';
  formStatus.style.display = 'block';
  formStatus.textContent = state.lang === 'ar' ? 'جاري الإرسال...' : 'Sending...';

  const data = {
    name: contactForm.name.value.trim(),
    email: contactForm.email.value.trim(),
    subject: contactForm.subject.value.trim() || null,
    message: contactForm.message.value.trim(),
  };

  try {
    const res = await fetch(`${INS_BASE}/api/database/records/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${INS_ANON}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${errBody}`);
    }

    // Notification: check the admin panel at /admin.html for new messages.
    // EmailJS is disabled because Yahoo blocks its emails.

    formStatus.className = 'form-status success';
    formStatus.textContent = state.lang === 'ar' ? 'تم إرسال رسالتك بنجاح! سأتواصل معك قريباً.' : 'Message sent successfully! I will get back to you soon.';
    contactForm.reset();
  } catch (err) {
    formStatus.className = 'form-status error';
    formStatus.textContent = state.lang === 'ar' ? 'حدث خطأ. حاول مرة أخرى أو راسلني مباشرة.' : 'Something went wrong. Please try again or reach out directly.';
  }
});

/* ===== INTERACTIVE SHEETS (Project 3) ===== */
const sheetsData = [
  { id: 'A', v1: 15, v2: 25 },
  { id: 'B', v1: 100, v2: 50 },
  { id: 'C', v1: 42, v2: 8 },
];

const sheetsGrid = document.getElementById('sheetsGrid');
const sheetsAddRow = document.getElementById('sheetsAddRow');
const sheetsSearchInput = document.getElementById('sheetsSearchInput');
const sheetsSearchResults = document.getElementById('sheetsSearchResults');

function getNextId() {
  const used = sheetsData.map(r => r.id);
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i);
    if (!used.includes(letter)) return letter;
  }
  return 'Z' + (used.length - 25);
}

function computeResults() {
  const all = sheetsData.flatMap(r => [r.v1, r.v2]).filter(n => typeof n === 'number' && !isNaN(n));
  const sumEl = document.getElementById('calcSum');
  const avgEl = document.getElementById('calcAvg');
  const maxEl = document.getElementById('calcMax');
  const minEl = document.getElementById('calcMin');
  const cntEl = document.getElementById('calcCount');
  if (!sumEl) return;
  if (all.length === 0) {
    sumEl.textContent = '0'; avgEl.textContent = '0'; maxEl.textContent = '0'; minEl.textContent = '0'; cntEl.textContent = '0';
    return;
  }
  sumEl.textContent = all.reduce((a, b) => a + b, 0);
  avgEl.textContent = (all.reduce((a, b) => a + b, 0) / all.length).toFixed(1);
  maxEl.textContent = Math.max(...all);
  minEl.textContent = Math.min(...all);
  cntEl.textContent = sheetsData.length;
}

function renderSheets() {
  const rows = sheetsGrid.querySelectorAll('.mockup-sheets__row');
  rows.forEach(r => r.remove());

  sheetsData.forEach((row, idx) => {
    const div = document.createElement('div');
    div.className = 'mockup-sheets__row';
    div.innerHTML = `
      <span class="mockup-sheets__label">${row.id}</span>
      <input class="mockup-sheets__cell" type="number" value="${row.v1}" data-idx="${idx}" data-col="v1">
      <input class="mockup-sheets__cell" type="number" value="${row.v2}" data-idx="${idx}" data-col="v2">
      <span class="mockup-sheets__result">${row.v1 + row.v2}</span>
    `;
    sheetsGrid.appendChild(div);
  });

  computeResults();
  sheetsGrid.querySelectorAll('.mockup-sheets__cell').forEach(input => {
    input.addEventListener('input', onCellChange);
  });
  // Apply current language to any new elements with [lang]
  document.querySelectorAll('[lang]').forEach(el => {
    el.hidden = el.getAttribute('lang') !== state.lang;
  });
}

function onCellChange(e) {
  const idx = parseInt(e.target.dataset.idx);
  const col = e.target.dataset.col;
  const val = parseFloat(e.target.value) || 0;
  if (sheetsData[idx]) {
    sheetsData[idx][col] = val;
    const row = e.target.closest('.mockup-sheets__row');
    const result = row.querySelector('.mockup-sheets__result');
    const v1 = parseFloat(row.querySelector('[data-col="v1"]').value) || 0;
    const v2 = parseFloat(row.querySelector('[data-col="v2"]').value) || 0;
    result.textContent = v1 + v2;
    computeResults();
    doSearch();
  }
}

function doSearch() {
  const q = sheetsSearchInput?.value?.toLowerCase().trim() || '';
  if (!q) {
    if (sheetsSearchResults) sheetsSearchResults.innerHTML = '<span class="mockup-sheets__search-hint">' + (state.lang === 'ar' ? 'اكتب كلمة للبحث في القيم' : 'Type to search values') + '</span>';
    return;
  }
  const results = sheetsData.filter(r => String(r.v1).includes(q) || String(r.v2).includes(q) || String(r.v1 + r.v2).includes(q) || r.id.toLowerCase().includes(q));
  if (results.length === 0) {
    sheetsSearchResults.innerHTML = '<span class="mockup-sheets__search-hint">' + (state.lang === 'ar' ? 'لا توجد نتائج' : 'No results') + '</span>';
    return;
  }
  sheetsSearchResults.innerHTML = results.map(r =>
    `<div class="mockup-sheets__search-result"><strong>${r.id}</strong>: ${r.v1} + ${r.v2} = ${r.v1 + r.v2}</div>`
  ).join('');
}

// Sheets tabs
document.querySelectorAll('.mockup-sheets__tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.mockup-sheets__tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.mockup-sheets__panel').forEach(p => p.classList.remove('active'));
    const panel = document.querySelector(`[data-sheets-panel="${tab.dataset.sheetsTab}"]`);
    if (panel) panel.classList.add('active');
    if (tab.dataset.sheetsTab === 'search') doSearch();
  });
});

// Add row
if (sheetsAddRow) {
  sheetsAddRow.addEventListener('click', () => {
    const id = getNextId();
    sheetsData.push({ id, v1: 0, v2: 0 });
    renderSheets();
    doSearch();
  });
}

// Search input
if (sheetsSearchInput) {
  sheetsSearchInput.addEventListener('input', doSearch);
}

// Init sheets
renderSheets();

/* ===== EMAIL NOTIFICATION (OPTIONAL) ===== */
/* EmailJS is commented out because Yahoo blocks its emails.
   Instead of email notifications, just check the admin panel
   at /admin.html (password: admindeveloper2026) for new messages.
   The panel also shows Smart Gate leads and contact form submissions.
*/
const EMAILJS_CONFIG = {
  publicKey: 'zFuvj8vULtX86m4AF',
  serviceId: 'service_fthqr9i',
  templateId: 'template_5q0x6qd',
  notifyEmail: 'alaa.elattar@yahoo.com',
};
// EmailJS won't be initialized - Yahoo blocks the emails.
// If you switch to Gmail/Outlook, uncomment the line below:
// if (EMAILJS_CONFIG.publicKey) emailjs.init(EMAILJS_CONFIG.publicKey);

function authGenerateCode() { return String(Math.floor(100000 + Math.random() * 900000)); }

async function authSendOtp(email, code, lang) {
  if (EMAILJS_CONFIG.publicKey) {
    try {
      await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
        to_email: email,
        from_name: 'Alaa Portfolio',
        from_email: EMAILJS_CONFIG.notifyEmail,
        subject: lang === 'ar' ? 'رمز التحقق الخاص بك' : 'Your Verification Code',
        message: lang === 'ar' ? `رمز التحقق الخاص بك هو: ${code}` : `Your verification code is: ${code}`,
      });
      return true;
    } catch (_) { /* EmailJS failed, try fallback */ }
  }
  try {
    const r = await fetch(`${INS_BASE}/api/email/send-raw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${INS_ANON}` },
      body: JSON.stringify({ to: email, subject: lang === 'ar' ? 'رمز التحقق الخاص بك' : 'Your Verification Code', html: `<h2>${lang === 'ar' ? 'رمز التحقق' : 'Verification Code'}</h2><p>${lang === 'ar' ? 'رمز التحقق الخاص بك هو:' : 'Your verification code is:'} <strong>${code}</strong></p>`, replyTo: '' }),
    });
    return r.ok;
  } catch { return false; }
}

/* ===== AUTH VERIFICATION DEMO (Project 6) ===== */
const authState = { email: '', method: 'email', code: '' };

document.querySelectorAll('.mockup-auth__tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.mockup-auth__tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.mockup-auth__panel').forEach(p => p.classList.remove('active'));
    const panel = document.querySelector(`[data-auth-panel="${tab.dataset.authTab}"]`);
    if (panel) panel.classList.add('active');
    document.getElementById('authVerifyBox')?.classList.remove('active');
    document.getElementById('authSuccessBox')?.classList.remove('active');
    document.getElementById('authLoginHint').textContent = '';
    document.getElementById('authRegHint').textContent = '';
  });
});

document.getElementById('authRegBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('authRegEmail').value.trim();
  const phone = document.getElementById('authRegPhone').value.trim();
  const pass = document.getElementById('authRegPass').value.trim();
  const method = document.querySelector('input[name="authMethod"]:checked')?.value || 'email';
  const hint = document.getElementById('authRegHint');
  if (!email || !pass) { hint.textContent = state.lang === 'ar' ? 'املأ البريد وكلمة السر' : 'Fill email and password'; return; }
  if (pass.length < 6) { hint.textContent = state.lang === 'ar' ? 'كلمة السر 6 أحرف على الأقل' : 'Password min 6 chars'; return; }

  hint.textContent = state.lang === 'ar' ? 'جاري الإرسال...' : 'Sending...';
  const code = authGenerateCode();
  const sent = await authSendOtp(email, code, state.lang);

  const users = JSON.parse(localStorage.getItem('authDemoUsers') || '[]');
  users.push({ email, phone, pass, code, method, verified: false });
  localStorage.setItem('authDemoUsers', JSON.stringify(users));
  localStorage.setItem('authDemoCode', code);
  localStorage.setItem('authDemoMethod', method);
  localStorage.setItem('authDemoEmail', email);

  authState.email = email; authState.method = method; authState.code = code;
  document.querySelectorAll('.mockup-auth__panel').forEach(p => p.classList.remove('active'));
  document.getElementById('authVerifyBox').classList.add('active');
  document.getElementById('authVerifySub').textContent = sent
    ? (state.lang === 'ar' ? `تم إرسال الرمز إلى ${email}` : `Code sent to ${email}`)
    : (state.lang === 'ar' ? `تجريبي — الرمز: ${code}` : `Demo — Code: ${code}`);
  document.getElementById('authVerifyHint').textContent = sent
    ? (state.lang === 'ar' ? 'تحقق من بريدك الإلكتروني' : 'Check your email')
    : (state.lang === 'ar' ? `رمز التجربة: ${code}` : `Demo code: ${code}`);
  hint.textContent = '';
});

document.getElementById('authLoginBtn')?.addEventListener('click', () => {
  const email = document.getElementById('authLoginEmail').value.trim();
  const pass = document.getElementById('authLoginPass').value.trim();
  const hint = document.getElementById('authLoginHint');
  hint.style.color = '';
  if (!email || !pass) { hint.textContent = state.lang === 'ar' ? 'أدخل البريد وكلمة السر' : 'Enter email and password'; return; }
  const users = JSON.parse(localStorage.getItem('authDemoUsers') || '[]');
  const user = users.find(u => u.email === email && u.pass === pass);
  if (!user) { hint.textContent = state.lang === 'ar' ? 'مستخدم غير موجود أو كلمة سر خاطئة' : 'User not found or wrong password'; return; }
  if (!user.verified) { hint.textContent = state.lang === 'ar' ? 'الحساب غير مفعل. تحقق من الرمز أولاً.' : 'Account not verified. Verify code first.'; return; }
  hint.textContent = state.lang === 'ar' ? `مرحباً! تم التحقق من ${user.email}` : `Welcome! Verified ${user.email}`;
  hint.style.color = '#22c55e';
});

// Verify code
document.getElementById('authVerifyBtn')?.addEventListener('click', () => {
  const code = Array.from(document.querySelectorAll('.mockup-auth__code-input')).map(i => i.value).join('');
  const hint = document.getElementById('authVerifyHint');
  if (code.length !== 6) { return; }
  if (code === authState.code) {
    // Mark user as verified in localStorage
    const users = JSON.parse(localStorage.getItem('authDemoUsers') || '[]');
    const idx = users.findIndex(u => u.email === authState.email);
    if (idx !== -1) { users[idx].verified = true; localStorage.setItem('authDemoUsers', JSON.stringify(users)); }
    document.getElementById('authVerifyBox').classList.remove('active');
    document.getElementById('authSuccessBox').classList.add('active');
    document.getElementById('authSuccessEmail').textContent = authState.email;
  } else {
    hint.textContent = state.lang === 'ar' ? 'رمز خاطئ، حاول مرة أخرى' : 'Wrong code, try again';
  }
});

// Code input auto-advance
document.querySelectorAll('.mockup-auth__code-input').forEach((input, idx, arr) => {
  input.addEventListener('input', () => {
    input.classList.toggle('filled', !!input.value);
    if (input.value && idx < arr.length - 1) arr[idx + 1].focus();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backward' || e.key === 'Backspace') {
      if (!input.value && idx > 0) { arr[idx - 1].focus(); arr[idx - 1].value = ''; arr[idx - 1].classList.remove('filled'); }
    }
  });
});

document.getElementById('authBackBtn')?.addEventListener('click', () => {
  document.getElementById('authVerifyBox').classList.remove('active');
  document.getElementById('authSuccessBox').classList.remove('active');
  document.querySelector('[data-auth-panel="register"]')?.classList.add('active');
  document.querySelector('[data-auth-tab="register"]')?.classList.add('active');
  document.querySelector('[data-auth-tab="login"]')?.classList.remove('active');
  document.querySelector('[data-auth-panel="login"]')?.classList.remove('active');
  document.querySelectorAll('.mockup-auth__code-input').forEach(i => { i.value = ''; i.classList.remove('filled'); });
});

/* ===== DEVICE FRAME SWITCHER ===== */
function initDeviceSwitchers() {
  document.querySelectorAll('.device-switcher').forEach(sw => {
    sw.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        sw.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const frame = sw.closest('.project-detail')?.querySelector('.device-frame') || sw.nextElementSibling;
        if (frame && frame.classList.contains('device-frame')) {
          frame.className = 'device-frame ' + btn.dataset.device;
        }
      });
    });
  });
}
initDeviceSwitchers();

/* ===== SMART EMAIL GATE ===== */
const smartGate = document.getElementById('smartGate');
const smartGateEmail = document.getElementById('smartGateEmail');
const smartGateBtn = document.getElementById('smartGateBtn');
const smartGateClose = document.getElementById('smartGateClose');
const smartGateHint = document.getElementById('smartGateHint');
const smartGateSuccess = document.getElementById('smartGateSuccess');

let gateInteractions = parseInt(sessionStorage.getItem('gateCount') || '0');

// Track clicks on project and service cards
document.querySelectorAll('.project-card, .service-card, .project__link, [href="#projects"], [href="#services"]').forEach(el => {
  el.addEventListener('click', () => {
    gateInteractions++;
    sessionStorage.setItem('gateCount', gateInteractions);
    if (gateInteractions >= 3) showSmartGate();
  });
});

function showSmartGate() {
  if (sessionStorage.getItem('gateDone')) return;
  setTimeout(() => {
    smartGate.classList.add('active');
    document.body.style.overflow = 'hidden';
  }, 600);
}

function hideSmartGate() {
  smartGate.classList.remove('active');
  document.body.style.overflow = '';
}

smartGateClose.addEventListener('click', hideSmartGate);
smartGate.querySelector('.smart-gate__overlay').addEventListener('click', hideSmartGate);

smartGateBtn.addEventListener('click', async () => {
  const email = smartGateEmail.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    smartGateHint.textContent = state.lang === 'ar' ? 'بريد إلكتروني غير صحيح' : 'Invalid email address';
    return;
  }
  smartGateHint.textContent = state.lang === 'ar' ? 'جاري التحقق...' : 'Validating...';
  smartGateBtn.disabled = true;
  smartGateBtn.textContent = '...';

  try {
    const valRes = await fetch(`${INS_BASE}/functions/validate-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const valData = await valRes.json();

    if (!valData.valid) {
      const msg = state.lang === 'ar'
        ? (valData.reason === 'Disposable email not allowed' ? 'البريد المؤقت غير مسموح' :
           valData.reason === 'Domain not found' ? 'نطاق البريد غير موجود' :
           valData.reason === 'Domain does not accept email' ? 'النطاق لا يستقبل بريداً' :
           'بريد إلكتروني غير صحيح')
        : (valData.reason === 'Disposable email not allowed' ? 'Disposable email not allowed' :
           valData.reason === 'Domain not found' ? 'Email domain not found' :
           valData.reason === 'Domain does not accept email' ? 'Domain does not accept email' :
           'Invalid email address');
      smartGateHint.textContent = msg;
      smartGateBtn.disabled = false;
      smartGateBtn.textContent = state.lang === 'ar' ? 'عرض المشاريع' : 'Show Projects';
      return;
    }

    await fetch(`${INS_BASE}/api/database/records/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${INS_ANON}` },
      body: JSON.stringify({
        name: state.lang === 'ar' ? 'زائر مهتم' : 'Interested Visitor',
        email,
        subject: state.lang === 'ar' ? 'اشتراك من البوابة الذكية' : 'Smart Gate Lead',
        message: state.lang === 'ar' ? 'تم التسجيل بعد 3 نقرات على المشاريع' : 'Signed up after 3 project clicks',
      }),
    });

    smartGateSuccess.classList.add('active');
    smartGateEmail.style.display = 'none';
    smartGateBtn.style.display = 'none';
    sessionStorage.setItem('gateDone', '1');
    setTimeout(() => { hideSmartGate(); window.location.hash = '#projects'; }, 1500);
  } catch {
    smartGateHint.textContent = state.lang === 'ar' ? 'حدث خطأ، حاول مرة أخرى' : 'Error, try again';
    smartGateBtn.disabled = false;
    smartGateBtn.textContent = state.lang === 'ar' ? 'عرض المشاريع' : 'Show Projects';
  }
});

smartGateEmail.addEventListener('keydown', e => {
  if (e.key === 'Enter') smartGateBtn.click();
});

/* ===== RESUME MODAL ===== */
const resumeBtn = document.getElementById('resumeBtn');
const resumeModal = document.getElementById('resumeModal');
const resumeModalClose = document.getElementById('resumeModalClose');
const resumeModalOverlay = document.getElementById('resumeModalOverlay');

if (resumeBtn && resumeModal) {
  resumeBtn.addEventListener('click', () => {
    resumeModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
  function closeResumeModal() {
    resumeModal.classList.remove('active');
    document.body.style.overflow = '';
  }
  resumeModalClose.addEventListener('click', closeResumeModal);
  resumeModalOverlay.addEventListener('click', closeResumeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && resumeModal.classList.contains('active')) closeResumeModal();
  });
}

/* ===== INIT ===== */
setLang(state.lang);
setTheme(state.theme);
