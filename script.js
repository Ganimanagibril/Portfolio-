// ========== Enhanced Portfolio Script ==========
// Permalink: https://github.com/Ganimanagibril/Portfolio-/blob/d027429fcf9e8b36bac7b1e673b80ede21f279fc/script.js
(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Helper: safe query
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // ========== MOBILE MENU TOGGLE ==========
  const menuToggle = $('#menuToggle');
  const navMenu = $('#navMenu');
  const navLinks = $$('.nav-link');

  function closeMenu() {
    if (!menuToggle || !navMenu) return;
    navMenu.classList.remove('active');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.removeAttribute('aria-pressed');
  }

  function openMenu() {
    if (!menuToggle || !navMenu) return;
    navMenu.classList.add('active');
    menuToggle.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-pressed', 'true');
  }

  if (menuToggle && navMenu) {
    // Ensure ARIA defaults
    menuToggle.setAttribute('aria-controls', navMenu.id || 'navMenu');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('role', 'button');
    menuToggle.tabIndex = 0;

    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navMenu.classList.contains('active')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        closeMenu();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    // Prevent clicks inside navMenu from bubbling to document (so links still close)
    navMenu.addEventListener('click', (e) => e.stopPropagation());
  }

  // Close menu on nav link click (and handle same-page smooth scroll below)
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // ========== SMOOTH SCROLLING ==========
  // Uses offset to account for fixed header. Respects prefers-reduced-motion.
  const SCROLL_OFFSET = 60; // adjust to your header height
  function scrollToElementWithOffset(el, offset = SCROLL_OFFSET) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top - offset;
    if (prefersReducedMotion) {
      window.scrollTo(0, absoluteTop);
    } else {
      window.scrollTo({ top: absoluteTop, behavior: 'smooth' });
    }
  }

  navLinks.forEach((link) => {
    // Only intercept internal anchors
    const href = link.getAttribute('href') || '';
    if (!href.startsWith('#')) return;

    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        scrollToElementWithOffset(target);
        // Update the URL hash without jumping (history.pushState)
        try {
          history.pushState(null, '', targetId);
        } catch (err) {
          // Some environments may block pushState; ignore
        }
      }
    });
  });

  // If page loads with a hash, scroll to it with offset
  window.addEventListener('load', () => {
    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target) setTimeout(() => scrollToElementWithOffset(target), 50);
    }
  });

  // ========== CONTACT FORM HANDLING ==========
  const contactForm = $('#contactForm');

  function showFormMessage(form, message, type = 'success') {
    if (!form) return;
    let msgEl = form.querySelector('.form-message');
    if (!msgEl) {
      msgEl = document.createElement('div');
      msgEl.className = 'form-message';
      form.prepend(msgEl);
    }
    msgEl.textContent = message;
    msgEl.dataset.type = type;
    // Optionally add a short auto-hide
    if (type === 'success') {
      setTimeout(() => {
        if (msgEl) msgEl.textContent = '';
      }, 6000);
    }
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const name = formData.get('name') || '';
      const email = formData.get('email') || '';
      const message = formData.get('message') || '';

      // Basic client-side validation
      if (!name || !email || !message) {
        showFormMessage(contactForm, 'Please provide your name, email and a message.', 'error');
        return;
      }

      // If form has action/method, try to submit, otherwise simulate success
      const action = contactForm.getAttribute('action') || '';
      const method = (contactForm.getAttribute('method') || 'POST').toUpperCase();

      if (action) {
        try {
          const response = await fetch(action, {
            method,
            headers: { 'Accept': 'application/json' },
            body: formData
          });

          if (response.ok) {
            showFormMessage(contactForm, `Thank you ${name}! Your message has been received. I'll get back to you soon at ${email}!`, 'success');
            contactForm.reset();
          } else {
            const text = await response.text().catch(() => 'Failed to send message.');
            showFormMessage(contactForm, `Error: ${text}`, 'error');
          }
        } catch (err) {
          showFormMessage(contactForm, 'Network error — please try again later.', 'error');
          console.error('Contact form submit error', err);
        }
      } else {
        // No backend configured — fall back to friendly inline message
        showFormMessage(contactForm, `Thank you ${name}! Your message has been received. I'll get back to you soon at ${email}!`, 'success');
        contactForm.reset();
      }
    });
  }

  // ========== SCROLL ANIMATIONS (IntersectionObserver) ==========
  const animatedElements = $$('section, .project-card, .skill, .contact-item');

  if (prefersReducedMotion) {
    // If user prefers reduced motion, make elements visible without animation
    animatedElements.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  } else if ('IntersectionObserver' in window) {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target); // animate once
        }
      });
    }, observerOptions);

    animatedElements.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  } else {
    // Fallback for environments without IntersectionObserver
    animatedElements.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  // ========== ACTIVE NAV LINK ON SCROLL ==========
  let ticking = false;
  function updateActiveNav() {
    const sections = $$('section[id]');
    let currentId = '';
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop;

    // Choose the section the user is currently viewing (top-most that passed threshold)
    sections.forEach((section) => {
      const offsetTop = section.offsetTop;
      if (scrollPos >= offsetTop - 120) {
        currentId = section.id;
      }
    });

    // If at the bottom of the page, highlight last section
    if ((window.innerHeight + scrollPos) >= (document.documentElement.scrollHeight - 5)) {
      const last = sections[sections.length - 1];
      if (last) currentId = last.id;
    }

    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveNav();
        ticking = false;
      });
      ticking = true;
    }
  }

  // Use passive listener where appropriate
  window.addEventListener('scroll', onScroll, { passive: true });

  // Initial highlight
  updateActiveNav();

  // ========== TYPING EFFECT (OPTIONAL) ==========
  const subtitleElement = document.querySelector('.subtitle');
  if (subtitleElement && !prefersReducedMotion) {
    const text = subtitleElement.textContent || '';
    const speed = parseInt(subtitleElement.dataset.typeSpeed || '100', 10);
    const startDelay = parseInt(subtitleElement.dataset.startDelay || '1000', 10);

    subtitleElement.textContent = '';
    let i = 0;
    let typingTimeout = null;

    function typeWriter() {
      if (i < text.length) {
        subtitleElement.textContent += text.charAt(i);
        i += 1;
        typingTimeout = setTimeout(typeWriter, speed);
      }
    }

    // Start typing after page load
    window.addEventListener('load', () => {
      setTimeout(typeWriter, startDelay);
    });

    // If the user interacts (scrolls or clicks), finish typing immediately
    const finishTyping = () => {
      if (typingTimeout) clearTimeout(typingTimeout);
      subtitleElement.textContent = text;
      window.removeEventListener('scroll', finishTyping);
      window.removeEventListener('click', finishTyping);
    };

    window.addEventListener('scroll', finishTyping, { passive: true });
    window.addEventListener('click', finishTyping);
  } else if (subtitleElement) {
    // If reduced motion, leave text as-is (no typing)
    // Nothing to do since we cleared it only when not reduced-motion
  }

  console.log('Portfolio loaded successfully! ✨ (upgraded script)');
})();
