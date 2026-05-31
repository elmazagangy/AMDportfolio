const state = {
  lang: localStorage.getItem('portfolio-lang') || 'ar',
  theme: localStorage.getItem('portfolio-theme') || 'light',
};
const html = document.documentElement;
const langToggle = document.getElementById('langToggle');
const themeToggle = document.getElementById('themeToggle');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

function setLang(lang) {
  state.lang = lang;
  html.lang = lang;
  html.dir = lang === 'ar' ? 'rtl' : 'ltr';
  localStorage.setItem('portfolio-lang', lang);
  langToggle.textContent = lang === 'ar' ? 'EN' : 'العربية';
  document.querySelectorAll('[lang]').forEach(el => {
    el.hidden = el.getAttribute('lang') !== lang;
  });
}

function setTheme(theme) {
  state.theme = theme;
  html.setAttribute('data-theme', theme);
  localStorage.setItem('portfolio-theme', theme);
  themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
}

langToggle.addEventListener('click', () => setLang(state.lang === 'ar' ? 'en' : 'ar'));
themeToggle.addEventListener('click', () => setTheme(state.theme === 'light' ? 'dark' : 'light'));
if (menuToggle) {
  menuToggle.addEventListener('click', () => navLinks.classList.toggle('nav__links--open'));
  document.querySelectorAll('.nav__links a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('nav__links--open')));
}

setLang(state.lang);
setTheme(state.theme);
