/**
 * 36 Chambers Barbershop
 * main.js — nav, scroll effects, animations
 */

(function () {
  'use strict';

  // ── Footer year ──────────────────────────────────────────────────────────

  var yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── Sticky header ────────────────────────────────────────────────────────

  var header = document.getElementById('site-header');
  if (header) {
    function updateHeader() {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  // ── Hamburger nav ────────────────────────────────────────────────────────

  var hamburger = document.getElementById('hamburger');
  var mainNav   = document.getElementById('main-nav');

  if (hamburger && mainNav) {
    hamburger.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      hamburger.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close nav when a link is clicked
    mainNav.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Open navigation menu');
        document.body.style.overflow = '';
      });
    });

    // Close nav on ESC key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mainNav.classList.contains('open')) {
        mainNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Open navigation menu');
        document.body.style.overflow = '';
        hamburger.focus();
      }
    });
  }

  // ── Scroll-triggered fade-in animations ─────────────────────────────────

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
    );

    document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right').forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show everything immediately
    document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ── Stagger service & barber cards ──────────────────────────────────────

  document.querySelectorAll('.services-grid .service-card, .team-grid .barber-card').forEach(function (card, i) {
    card.style.transitionDelay = (i * 0.07) + 's';
  });

})();
