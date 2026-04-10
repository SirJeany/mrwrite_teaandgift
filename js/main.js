/* ============================================================
   MR. WRITE TEA & GIFT SHOP — Main JavaScript
   ============================================================
   Features:
     1. Sticky navbar scroll effect
     2. Smooth scroll & active nav link highlighting
     3. Tea-O-Meter mood-based recommendation engine
     4. Scroll-triggered fade-in animations
     5. Back-to-top button
     6. Dynamic copyright year
   ============================================================ */

'use strict';

// ----------------------------------------------------------
// DOM READY
// ----------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initSmoothScroll();
  initTeaOMeter();
  initScrollAnimations();
  initBackToTop();
  setCurrentYear();
});

// ----------------------------------------------------------
// 1. NAVBAR — Transparent → solid on scroll
// ----------------------------------------------------------
function initNavbarScroll() {
  const navbar = document.getElementById('mainNav');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 60;

  const updateNavbar = () => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  // Run on load and on scroll
  updateNavbar();
  window.addEventListener('scroll', updateNavbar, { passive: true });
}

// ----------------------------------------------------------
// 2. SMOOTH SCROLL & ACTIVE NAV HIGHLIGHTING
// ----------------------------------------------------------
function initSmoothScroll() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Click handler — smooth scroll + close mobile menu
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');

      // Only handle in-page hash links; let normal links navigate
      if (!href.startsWith('#')) return;

      e.preventDefault();
      const target = document.querySelector(href);

      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }

      // Close mobile nav if open
      const navCollapse = document.getElementById('navbarContent');
      if (navCollapse?.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
        bsCollapse?.hide();
      }
    });
  });

  // Scroll spy — highlight active link based on scroll position
  const highlightActive = () => {
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', highlightActive, { passive: true });
  highlightActive();
}

// ----------------------------------------------------------
// 3. TEA-O-METER — Mood-based tea recommendations
// ----------------------------------------------------------
function initTeaOMeter() {
  const moodButtons = document.querySelectorAll('.mood-btn');
  const moodSelector = document.getElementById('moodSelector');
  const teaResult = document.getElementById('teaResult');
  const resultEmoji = document.getElementById('resultEmoji');
  const resultName = document.getElementById('resultName');
  const resultDesc = document.getElementById('resultDesc');
  const tryAgainBtn = document.getElementById('tryAgainBtn');

  if (!moodSelector || !teaResult) return;

  /**
   * Tea recommendations mapped to moods.
   * Each mood can have multiple options for variety.
   */
  const teaRecommendations = {
    happy: [
      {
        emoji: '🌸',
        name: 'Jasmine Green Tea',
        desc: 'Light, floral, and sunshine in a cup — just like your mood! Perfect for keeping those good vibes going.'
      },
      {
        emoji: '🍑',
        name: 'Peach Oolong',
        desc: 'Sweet, fruity, and smooth — a tea that matches your sunny disposition perfectly.'
      }
    ],
    stressed: [
      {
        emoji: '🌿',
        name: 'Chamomile & Lavender',
        desc: 'Take a deep breath. This gentle herbal blend is like a warm hug for your nerves. You\'ve got this.'
      },
      {
        emoji: '🫖',
        name: 'Peppermint Rooibos',
        desc: 'Caffeine-free and cooling — let the tension melt away with every sip. The ocean is right outside.'
      }
    ],
    sleepy: [
      {
        emoji: '⚡',
        name: 'English Breakfast (Strong!)',
        desc: 'Rise and shine! This bold, malty classic will get your engine running. Two sugars? Go wild.'
      },
      {
        emoji: '🍵',
        name: 'Yerba Maté Boost',
        desc: 'Nature\'s energy drink. Smooth, earthy, and packed with the pick-me-up you need right now.'
      }
    ],
    adventurous: [
      {
        emoji: '🌶️',
        name: 'Chai Masala (Spicy!)',
        desc: 'Bold spices, warm ginger, a kick of pepper — this brew matches your daring spirit. Fortune favours the spiced!'
      },
      {
        emoji: '🫧',
        name: 'Butterfly Pea Flower Tea',
        desc: 'Starts blue, add lemon and watch it turn purple! As wild and wonderful as your adventurous soul.'
      }
    ],
    cozy: [
      {
        emoji: '🍫',
        name: 'Chocolate Rooibos',
        desc: 'Rich, creamy, and caffeine-free — like wrapping yourself in a warm blanket on a rainy Hermanus day.'
      },
      {
        emoji: '🍯',
        name: 'Honeybush & Vanilla',
        desc: 'Sweet, mellow, and uniquely South African. The perfect companion for a good book and a comfy chair.'
      }
    ],
    fancy: [
      {
        emoji: '🫅',
        name: 'Earl Grey Supreme',
        desc: 'Bergamot-kissed, elegant, and refined — pinky up, darling. You deserve nothing less than the finest.'
      },
      {
        emoji: '🌹',
        name: 'Rose Petal Darjeeling',
        desc: 'The "Champagne of Teas" meets delicate rose petals. Exquisite, just like your taste.'
      }
    ]
  };

  // Handle mood selection
  moodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mood = btn.dataset.mood;
      const options = teaRecommendations[mood];

      if (!options) return;

      // Pick a random recommendation from the mood's options
      const tea = options[Math.floor(Math.random() * options.length)];

      // Populate result
      resultEmoji.textContent = tea.emoji;
      resultName.textContent = tea.name;
      resultDesc.textContent = tea.desc;

      // Animate transition
      moodSelector.style.display = 'none';
      teaResult.classList.add('show');
    });
  });

  // "Try Again" button
  tryAgainBtn?.addEventListener('click', () => {
    teaResult.classList.remove('show');
    moodSelector.style.display = 'block';
  });
}

// ----------------------------------------------------------
// 4. SCROLL-TRIGGERED FADE-IN ANIMATIONS
// ----------------------------------------------------------
function initScrollAnimations() {
  // Add fade-in class to all sections except hero
  const sections = document.querySelectorAll(
    '.section-about, .section-events, .section-teaometer, .section-gallery, .section-contact'
  );

  sections.forEach(section => {
    section.classList.add('fade-in-section');
  });

  // Intersection Observer for revealing sections
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Only animate once
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  sections.forEach(section => observer.observe(section));
}

// ----------------------------------------------------------
// 5. BACK TO TOP BUTTON
// ----------------------------------------------------------
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  const SHOW_THRESHOLD = 400;

  window.addEventListener('scroll', () => {
    if (window.scrollY > SHOW_THRESHOLD) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ----------------------------------------------------------
// 6. DYNAMIC COPYRIGHT YEAR
// ----------------------------------------------------------
function setCurrentYear() {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
