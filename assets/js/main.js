/* ============================================================
   LAUNDRIX
   MAIN.JS
   ------------------------------------------------------------
   Shared JavaScript engine.

   Includes:
   - Theme persistence
   - Dark / light mode
   - RTL persistence
   - Home dropdown
   - Mobile navigation
   - Mobile Home submenu
   - Header scroll state
   - Scroll reveal
   - Toast notifications
   - Modal engine
   - Form validation
   - Password visibility
   - Active navigation
   - Back-to-top
   - Smooth internal links
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
});

/* ============================================================
   02. THEME ENGINE
   ============================================================ */

function initTheme() {
  const root = document.documentElement;

  const themeButtons = document.querySelectorAll('[data-theme-toggle]');

  /*
   * Determine saved theme.
   */

  const savedTheme = localStorage.getItem('laundrix-theme');

  /*
   * Respect system preference
   * if no saved preference exists.
   */

  const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  const initialTheme = savedTheme || (systemDark ? 'dark' : 'light');

  applyTheme(initialTheme, false);

  /*
   * Toggle.
   */

  themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const current = root.classList.contains('dark') ? 'dark' : 'light';

      const next = current === 'dark' ? 'light' : 'dark';

      applyTheme(next, true);
    });
  });

  /*
   * Listen for system theme changes
   * only when user has not manually selected one.
   */

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      if (localStorage.getItem('laundrix-theme')) {
        return;
      }

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

  /*
   * Update all theme button icons.
   */

  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    const icon = button.querySelector('i');

    if (!icon) {
      return;
    }

    icon.classList.toggle('fa-moon', !isDark);

    icon.classList.toggle('fa-sun', isDark);

    button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  });

  /*
   * Notify other scripts.
   */

  document.dispatchEvent(
    new CustomEvent('laundrix:themechange', {
      detail: {
        theme,
      },
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
      detail: {
        direction,
      },
    })
  );
}

/* ============================================================
   04. HOME DROPDOWN
   ============================================================ */

function initHomeDropdown() {
  const trigger = document.querySelector('[data-home-dropdown]');

  const wrapper = trigger?.closest('.lx-nav-dropdown');

  if (!trigger || !wrapper) {
    return;
  }

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

  /*
   * Prevent dropdown from closing when
   * clicking inside it.
   */

  wrapper.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  /*
   * Global outside click.
   */

  document.addEventListener('click', () => {
    closeAllHomeDropdowns();
  });

  /*
   * Escape key.
   */

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
      return;
    }

    closeAllHomeDropdowns();
  });
}

/* ============================================================
   CLOSE HOME DROPDOWNS
   ============================================================ */

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

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener('click', (event) => {
    event.preventDefault();

    event.stopPropagation();

    const isOpen = menu.classList.contains('is-open');

    setMobileMenuState(!isOpen);
  });

  /*
   * Do not close the menu when clicking
   * inside its card.
   */

  menu.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  /*
   * Close after navigation.
   */

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      setMobileMenuState(false);
    });
  });

  /*
   * Close outside.
   */

  document.addEventListener('click', (event) => {
    if (!menu.contains(event.target) && !toggle.contains(event.target)) {
      setMobileMenuState(false);
    }
  });

  /*
   * Escape.
   */

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMobileMenuState(false);
    }
  });

  /*
   * Reset when switching to desktop.
   */

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      setMobileMenuState(false);
    }
  });
}

/* ============================================================
   SET MOBILE MENU STATE
   ============================================================ */

function setMobileMenuState(open) {
  const toggle = document.querySelector('[data-menu-toggle]');

  const menu = document.querySelector('[data-mobile-menu]');

  if (!toggle || !menu) {
    return;
  }

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

  if (!wrapper || !trigger) {
    return;
  }

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

  if (!header) {
    return;
  }

  const update = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  };

  update();

  window.addEventListener('scroll', update, {
    passive: true,
  });
}

/* ============================================================
   08. SCROLL REVEAL
   ============================================================ */

function initScrollReveal() {
  const elements = document.querySelectorAll('[data-reveal]');

  if (!elements.length) {
    return;
  }

  /*
   * Reduced motion users should see
   * everything immediately.
   */

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach((element) => {
      element.classList.add('is-visible');
    });

    return;
  }

  /*
   * IntersectionObserver.
   */

  if (!('IntersectionObserver' in window)) {
    elements.forEach((element) => {
      element.classList.add('is-visible');
    });

    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('is-visible');

        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,

      rootMargin: '0px 0px -50px 0px',
    }
  );

  elements.forEach((element) => {
    observer.observe(element);
  });
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

    window.setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);

  toast.addEventListener('click', () => {
    clearTimeout(timeout);

    toast.remove();
  });

  return toast;
}

/* ============================================================
   TOAST ICON
   ============================================================ */

function getToastIcon(type) {
  switch (type) {
    case 'error':
      return 'fa-solid fa-circle-exclamation';

    case 'warning':
      return 'fa-solid fa-triangle-exclamation';

    case 'info':
      return 'fa-solid fa-circle-info';

    default:
      return 'fa-solid fa-circle-check';
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

        showToast('Please check the highlighted fields.', {
          type: 'error',
        });

        return;
      }

      /*
       * For template/demo forms,
       * don't actually submit.
       */

      if (form.dataset.demo === 'true') {
        event.preventDefault();

        showToast(form.dataset.success || 'Your request has been submitted successfully.', {
          type: 'success',
        });
      }
    });

    /*
     * Real-time validation.
     */

    form.querySelectorAll('input, textarea, select').forEach((field) => {
      field.addEventListener('blur', () => {
        validateField(field);
      });

      field.addEventListener('input', () => {
        if (field.classList.contains('is-invalid')) {
          validateField(field);
        }
      });
    });
  });
}

/* ============================================================
   VALIDATE FORM
   ============================================================ */

function validateForm(form) {
  let valid = true;

  const fields = form.querySelectorAll('input, textarea, select');

  fields.forEach((field) => {
    if (!validateField(field)) {
      valid = false;
    }
  });

  return valid;
}

/* ============================================================
   VALIDATE FIELD
   ============================================================ */

function validateField(field) {
  if (field.disabled || field.type === 'hidden') {
    return true;
  }

  const value = field.value.trim();

  let valid = true;

  /*
   * Required.
   */

  if (field.hasAttribute('required') && !value) {
    valid = false;
  }

  /*
   * Email.
   */

  if (valid && field.type === 'email' && value) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(value)) {
      valid = false;
    }
  }

  /*
   * Minimum length.
   */

  if (valid && field.minLength > 0 && value.length < field.minLength) {
    valid = false;
  }

  /*
   * Password confirmation.
   */

  if (valid && field.matches('[data-password-confirm]')) {
    const password = document.querySelector(field.dataset.passwordConfirm);

    if (password && field.value !== password.value) {
      valid = false;
    }
  }

  field.classList.toggle('is-invalid', !valid);

  return valid;
}

/* ============================================================
   11. PASSWORD VISIBILITY
   ============================================================ */

function initPasswordToggles() {
  const buttons = document.querySelectorAll('[data-password-toggle]');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const selector = button.dataset.passwordToggle;

      const input = selector
        ? document.querySelector(selector)
        : button.closest('.lx-password-field')?.querySelector('input');

      if (!input) {
        return;
      }

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
  const openButtons = document.querySelectorAll('[data-modal-open]');

  const closeButtons = document.querySelectorAll('[data-modal-close]');

  openButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();

      const selector = button.dataset.modalOpen;

      const modal = document.querySelector(selector);

      if (modal) {
        openModal(modal);
      }
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const modal = button.closest('.lx-modal');

      if (modal) {
        closeModal(modal);
      }
    });
  });

  /*
   * Close by clicking overlay.
   */

  document.querySelectorAll('.lx-modal').forEach((modal) => {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });

  /*
   * Escape.
   */

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
      return;
    }

    document.querySelectorAll('.lx-modal.is-open').forEach((modal) => {
      closeModal(modal);
    });
  });
}

/* ============================================================
   OPEN MODAL
   ============================================================ */

function openModal(modal) {
  modal.classList.add('is-open');

  document.body.style.overflow = 'hidden';

  modal.setAttribute('aria-hidden', 'false');
}

/* ============================================================
   CLOSE MODAL
   ============================================================ */

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

  if (!button) {
    return;
  }

  const update = () => {
    button.classList.toggle('is-visible', window.scrollY > 500);
  };

  update();

  window.addEventListener('scroll', update, {
    passive: true,
  });

  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
}

/* ============================================================
   14. SMOOTH INTERNAL LINKS
   ============================================================ */

function initSmoothLinks() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');

      if (!href || href === '#') {
        return;
      }

      const target = document.querySelector(href);

      if (!target) {
        return;
      }

      event.preventDefault();

      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  });
}

/* ============================================================
   15. ACTIVE NAVIGATION
   ============================================================ */

function initActiveNavigation() {
  const currentPage = window.location.pathname.split('/').pop().toLowerCase();

  if (!currentPage) {
    return;
  }

  document.querySelectorAll('.lx-nav a[href], .lx-mobile-menu a[href]').forEach((link) => {
    const href = link.getAttribute('href')?.split('/').pop().toLowerCase();

    if (href && href === currentPage) {
      link.classList.add('active');
    }
  });
}

/*
 * Run after DOM is available.
 */

initActiveNavigation();

/* ============================================================
   16. GLOBAL KEYBOARD HELP
   ============================================================ */

document.addEventListener('keydown', (event) => {
  /*
   * "/" focuses a page search field.
   */

  if (
    event.key === '/' &&
    !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)
  ) {
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
