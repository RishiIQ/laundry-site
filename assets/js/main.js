/* ============================================================
   LAUNDRIX
   MAIN.JS
   ------------------------------------------------------------
   Shared JavaScript engine with dynamic laundry atmospheric effects:
   - Floating soap bubbles generator
   - Steam/heat evaporation particles on hover
   - Water ripple feedback on buttons
   - Theme persistence & dark/light mode
   - RTL persistence
   - Home dropdown & mobile navigation
   - Header scroll & scroll reveal
   - Toast notifications & modal engine
   - Form validation & password visibility
   ============================================================ */

'use strict';

/* ============================================================
   01. DOM READY
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRTL();
  initHomeDropdown();
  initMobileNavigation();
  initHeaderScroll();
  initScrollReveal();
  initForms();
  initPasswordToggles();
  initModal();
  initBackToTop();
  initSmoothLinks();
  initLaundryAtmosphericEffects(); // <-- Added dynamic laundry effects
});

/* ============================================================
   LAUNDRY ATMOSPHERIC EFFECTS (BUBBLES, STEAM & WATER RIPPLES)
   ============================================================ */

function initLaundryAtmosphericEffects() {
  const body = document.body;
  if (!body) return;

  // 1. Create floating soap bubbles container
  const bubbleContainer = document.createElement('div');
  bubbleContainer.className = 'lx-ambient-bubbles';
  bubbleContainer.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:1; overflow:hidden;';
  body.appendChild(bubbleContainer);

  // Generate random floating bubbles periodically
  setInterval(() => {
    if (document.querySelectorAll('.lx-floating-bubble').length < 15) {
      const bubble = document.createElement('div');
      bubble.className = 'lx-floating-bubble';
      const size = Math.floor(Math.random() * 24) + 10; // 10px to 34px
      const posX = Math.random() * window.innerWidth;
      const duration = Math.random() * 4 + 3; // 3s to 7s

      bubble.style.cssText = `
        position: absolute;
        bottom: -40px;
        left: ${posX}px;
        width: ${size}px;
        height: ${size}px;
        border: 2px solid var(--lx-border);
        border-radius: 50%;
        background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(0,180,216,0.3));
        box-shadow: inset -2px -2px 0px rgba(0,0,0,0.1), 2px 2px 0px var(--lx-border);
        animation: ambientBubbleUp ${duration}s ease-in-out forwards;
      `;

      bubbleContainer.appendChild(bubble);
      setTimeout(() => bubble.remove(), duration * 1000);
    }
  }, 900);

  // Inject keyframe animations for bubbles and heat/steam into head
  if (!document.getElementById('lx-effects-style')) {
    const style = document.createElement('style');
    style.id = 'lx-effects-style';
    style.innerHTML = `
      @keyframes ambientBubbleUp {
        0% { transform: translateY(0) translateX(0) scale(0.5); opacity: 0; }
        30% { opacity: 0.8; }
        100% { transform: translateY(-105vh) translateX(${Math.random() * 60 - 30}px) scale(1.2); opacity: 0; }
      }
      
      @keyframes ambientSteamRise {
        0% { transform: translateY(0) scaleX(0.8) rotate(0deg); opacity: 0; }
        40% { opacity: 0.5; }
        100% { transform: translateY(-70px) scaleX(1.4) rotate(15deg); opacity: 0; }
      }

      .lx-steam-particle {
        position: absolute;
        pointer-events: none;
        background: radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(0,180,216,0.2) 70%, transparent 100%);
        border-radius: 50%;
        animation: ambientSteamRise 2.2s ease-out forwards;
        z-index: 2;
      }
    `;
    document.head.appendChild(style);
  }

  // 2. Add Steam / Heat Evaporation effect on mouse hover over interactive cards and buttons
  document.addEventListener('mousemove', (e) => {
    if (Math.random() < 0.06) {
      const target = e.target.closest('.home-service-card, .dash-metric-card, .auth-card, .lx-button, button');
      if (target) {
        const rect = target.getBoundingClientRect();
        const steam = document.createElement('div');
        steam.className = 'lx-steam-particle';
        const pSize = Math.floor(Math.random() * 18) + 12;
        
        steam.style.cssText = `
          top: ${e.clientY - rect.top}px;
          left: ${e.clientX - rect.left}px;
          width: ${pSize}px;
          height: ${pSize}px;
        `;
        target.style.position = 'relative';
        target.appendChild(steam);
        setTimeout(() => steam.remove(), 2200);
      }
    }
  });

  // 3. Water Ripple Effect on all clickable buttons and action items
  document.querySelectorAll('button, .lx-button, .home-primary-button, .home-secondary-button, .dash-btn, .auth-submit-btn').forEach(btn => {
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';

    btn.addEventListener('click', function(e) {
      const circle = document.createElement('span');
      const diameter = Math.max(this.clientWidth, this.clientHeight);
      const radius = diameter / 2;

      circle.style.cssText = `
        position: absolute;
        width: ${diameter}px;
        height: ${diameter}px;
        left: ${e.clientX - this.getBoundingClientRect().left - radius}px;
        top: ${e.clientY - this.getBoundingClientRect().top - radius}px;
        border-radius: 50%;
        background: rgba(0, 180, 216, 0.35);
        transform: scale(0);
        animation: waterRippleEffect 0.6s linear;
        pointer-events: none;
      `;

      const existingRipple = this.querySelector('.lx-ripple-effect');
      if (existingRipple) existingRipple.remove();

      circle.className = 'lx-ripple-effect';
      this.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    });
  });

  if (!document.getElementById('lx-ripple-style')) {
    const rippleStyle = document.createElement('style');
    rippleStyle.id = 'lx-ripple-style';
    rippleStyle.innerHTML = `
      @keyframes waterRippleEffect {
        to { transform: scale(4); opacity: 0; }
      }
    `;
    document.head.appendChild(rippleStyle);
  }
}

/* ============================================================
   02. THEME ENGINE
   ============================================================ */

function initTheme() {
  const root = document.documentElement;
  const themeButtons = document.querySelectorAll('[data-theme-toggle]');
  const savedTheme = localStorage.getItem('laundrix-theme');
  const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemDark ? 'dark' : 'light');

  applyTheme(initialTheme, false);

  themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const current = root.classList.contains('dark') ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next, true);
    });
  });

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      if (localStorage.getItem('laundrix-theme')) return;
      applyTheme(event.matches ? 'dark' : 'light', false);
    });
  }
}

/* ============================================================
   APPLY THEME
   ============================================================ */

function applyTheme(theme, save = true) {
  const root = document.documentElement;
  const isDark = theme === 'dark';

  root.classList.toggle('dark', isDark);
  root.dataset.theme = isDark ? 'dark' : 'light';

  if (save) {
    localStorage.setItem('laundrix-theme', theme);
  }

  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    const icon = button.querySelector('i');
    if (!icon) return;

    icon.classList.toggle('fa-moon', !isDark);
    icon.classList.toggle('fa-sun', isDark);
    button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  });

  document.dispatchEvent(
    new CustomEvent('laundrix:themechange', {
      detail: { theme },
    })
  );
}

/* ============================================================
   03. RTL ENGINE
   ============================================================ */

function initRTL() {
  const root = document.documentElement;
  const buttons = document.querySelectorAll('[data-rtl-toggle]');
  const saved = localStorage.getItem('laundrix-direction');

  if (saved === 'rtl') {
    applyDirection('rtl', false);
  } else {
    applyDirection('ltr', false);
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const next = root.dir === 'rtl' ? 'ltr' : 'rtl';
      applyDirection(next, true);
    });
  });
}

/* ============================================================
   APPLY DIRECTION
   ============================================================ */

function applyDirection(direction, save = true) {
  const root = document.documentElement;
  root.dir = direction;
  root.dataset.direction = direction;

  if (save) {
    localStorage.setItem('laundrix-direction', direction);
  }

  document.querySelectorAll('[data-rtl-toggle]').forEach((button) => {
    button.setAttribute('aria-label', direction === 'rtl' ? 'Switch to LTR' : 'Switch to RTL');
  });

  document.dispatchEvent(
    new CustomEvent('laundrix:directionchange', {
      detail: { direction },
    })
  );
}

/* ============================================================
   04. HOME DROPDOWN
   ============================================================ */

function initHomeDropdown() {
  const trigger = document.querySelector('[data-home-dropdown]');
  const wrapper = trigger?.closest('.lx-nav-dropdown');

  if (!trigger || !wrapper) return;

  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const currentlyOpen = wrapper.classList.contains('is-open');
    closeAllHomeDropdowns();

    if (!currentlyOpen) {
      wrapper.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }
  });

  wrapper.addEventListener('click', (event) => event.stopPropagation());
  document.addEventListener('click', () => closeAllHomeDropdowns());
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAllHomeDropdowns();
  });
}

function closeAllHomeDropdowns() {
  document.querySelectorAll('.lx-nav-dropdown.is-open').forEach((dropdown) => {
    dropdown.classList.remove('is-open');
    dropdown.querySelector('[data-home-dropdown]')?.setAttribute('aria-expanded', 'false');
  });
}

/* ============================================================
   05. MOBILE NAVIGATION
   ============================================================ */

function initMobileNavigation() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    setMobileMenuState(!menu.classList.contains('is-open'));
  });

  menu.addEventListener('click', (event) => event.stopPropagation());
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMobileMenuState(false));
  });

  document.addEventListener('click', (event) => {
    if (!menu.contains(event.target) && !toggle.contains(event.target)) {
      setMobileMenuState(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMobileMenuState(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) setMobileMenuState(false);
  });
}

function setMobileMenuState(open) {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  if (!toggle || !menu) return;

  menu.classList.toggle('is-open', open);
  toggle.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.classList.toggle('lx-menu-open', open);
}

/* ============================================================
   06. MOBILE HOME SUBMENU
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.querySelector('.lx-mobile-home');
  const trigger = document.querySelector('[data-mobile-home-toggle]');
  if (!wrapper || !trigger) return;

  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const open = wrapper.classList.contains('is-open');
    wrapper.classList.toggle('is-open', !open);
    trigger.setAttribute('aria-expanded', String(!open));
  });
});

/* ============================================================
   07. HEADER SCROLL STATE
   ============================================================ */

function initHeaderScroll() {
  const header = document.querySelector('.lx-header');
  if (!header) return;

  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* ============================================================
   08. SCROLL REVEAL
   ============================================================ */

function initScrollReveal() {
  const elements = document.querySelectorAll('[data-reveal]');
  if (!elements.length) return;

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  if (!('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
  );

  elements.forEach((element) => observer.observe(element));
}

/* ============================================================
   09. TOAST SYSTEM
   ============================================================ */

function showToast(message, options = {}) {
  const { type = 'success', duration = 3500 } = options;
  let container = document.querySelector('.lx-toast-container');

  if (!container) {
    container = document.createElement('div');
    container.className = 'lx-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'lx-toast';

  const icon = document.createElement('span');
  icon.className = 'lx-toast-icon';
  const iconElement = document.createElement('i');
  iconElement.className = getToastIcon(type);
  icon.appendChild(iconElement);

  const text = document.createElement('span');
  text.className = 'lx-toast-message';
  text.textContent = message;

  toast.appendChild(icon);
  toast.appendChild(text);
  container.appendChild(toast);

  const timeout = window.setTimeout(() => {
    toast.classList.add('is-leaving');
    window.setTimeout(() => toast.remove(), 300);
  }, duration);

  toast.addEventListener('click', () => {
    clearTimeout(timeout);
    toast.remove();
  });

  return toast;
}

function getToastIcon(type) {
  switch (type) {
    case 'error': return 'fa-solid fa-circle-exclamation';
    case 'warning': return 'fa-solid fa-triangle-exclamation';
    case 'info': return 'fa-solid fa-circle-info';
    default: return 'fa-solid fa-circle-check';
  }
}

/* ============================================================
   10. FORM VALIDATION
   ============================================================ */

function initForms() {
  const forms = document.querySelectorAll('form[data-validate]');
  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      const valid = validateForm(form);
      if (!valid) {
        event.preventDefault();
        showToast('Please check the highlighted fields.', { type: 'error' });
        return;
      }
      if (form.dataset.demo === 'true') {
        event.preventDefault();
        showToast(form.dataset.success || 'Your request has been submitted successfully.', { type: 'success' });
      }
    });

    form.querySelectorAll('input, textarea, select').forEach((field) => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('is-invalid')) validateField(field);
      });
    });
  });
}

function validateForm(form) {
  let valid = true;
  form.querySelectorAll('input, textarea, select').forEach((field) => {
    if (!validateField(field)) valid = false;
  });
  return valid;
}

function validateField(field) {
  if (field.disabled || field.type === 'hidden') return true;
  const value = field.value.trim();
  let valid = true;

  if (field.hasAttribute('required') && !value) valid = false;
  if (valid && field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) valid = false;
  if (valid && field.minLength > 0 && value.length < field.minLength) valid = false;
  if (valid && field.matches('[data-password-confirm]')) {
    const password = document.querySelector(field.dataset.passwordConfirm);
    if (password && field.value !== password.value) valid = false;
  }

  field.classList.toggle('is-invalid', !valid);
  return valid;
}

/* ============================================================
   11. PASSWORD VISIBILITY
   ============================================================ */

function initPasswordToggles() {
  document.querySelectorAll('[data-password-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const selector = button.dataset.passwordToggle;
      const input = selector ? document.querySelector(selector) : button.closest('.lx-password-field')?.querySelector('input');
      if (!input) return;

      const visible = input.type === 'text';
      input.type = visible ? 'password' : 'text';
      const icon = button.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-eye', visible);
        icon.classList.toggle('fa-eye-slash', !visible);
      }
    });
  });
}

/* ============================================================
   12. MODAL ENGINE
   ============================================================ */

function initModal() {
  document.querySelectorAll('[data-modal-open]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const modal = document.querySelector(button.dataset.modalOpen);
      if (modal) openModal(modal);
    });
  });

  document.querySelectorAll('[data-modal-close]').forEach((button) => {
    button.addEventListener('click', () => {
      const modal = button.closest('.lx-modal');
      if (modal) closeModal(modal);
    });
  });

  document.querySelectorAll('.lx-modal').forEach((modal) => {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal(modal);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      document.querySelectorAll('.lx-modal.is-open').forEach((modal) => closeModal(modal));
    }
  });
}

function openModal(modal) {
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal(modal) {
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
  modal.setAttribute('aria-hidden', 'true');
}

/* ============================================================
   13. BACK TO TOP
   ============================================================ */

function initBackToTop() {
  const button = document.querySelector('[data-back-to-top]');
  if (!button) return;

  const update = () => button.classList.toggle('is-visible', window.scrollY > 500);
  update();
  window.addEventListener('scroll', update, { passive: true });
  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ============================================================
   14. SMOOTH INTERNAL LINKS
   ============================================================ */

function initSmoothLinks() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ============================================================
   15. ACTIVE NAVIGATION
   ============================================================ */

function initActiveNavigation() {
  const currentPage = window.location.pathname.split('/').pop().toLowerCase();
  if (!currentPage) return;

  document.querySelectorAll('.lx-nav a[href], .lx-mobile-menu a[href]').forEach((link) => {
    const href = link.getAttribute('href')?.split('/').pop().toLowerCase();
    if (href && href === currentPage) link.classList.add('active');
  });
}

initActiveNavigation();

/* ============================================================
   16. GLOBAL KEYBOARD HELP
   ============================================================ */

document.addEventListener('keydown', (event) => {
  if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
    const search = document.querySelector('[data-site-search]');
    if (search) {
      event.preventDefault();
      search.focus();
    }
  }
});

/* ============================================================
   17. GLOBAL LAUNDRIX API
   ============================================================ */

window.LaundriX = {
  showToast,
  openModal,
  closeModal,
  applyTheme,
  applyDirection,
  setMobileMenuState,
  validateForm,
  validateField,
};