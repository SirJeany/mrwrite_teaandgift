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
// API ENDPOINTS
// ----------------------------------------------------------
const EVENTS_API_URL = 'http://localhost:3000/api/public/events/mr-write/main-calendar';

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
  initDynamicEvents();
  initShopHours();
  initDynamicGallery();
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

// ----------------------------------------------------------
// 7. DYNAMIC EVENTS — Peek carousel loaded from remote API
// ----------------------------------------------------------
function initDynamicEvents() {
  const carouselEl    = document.getElementById('eventsCarousel');
  const trackEl       = document.getElementById('eventsTrack');
  const indicatorsEl  = document.getElementById('eventsIndicators');
  const prevBtn       = document.getElementById('eventsPrev');
  const nextBtn       = document.getElementById('eventsNext');
  const errorEl       = document.getElementById('eventsError');

  // Only run on pages that have the carousel track
  if (!trackEl || !indicatorsEl) return;

  const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN',
                  'JUL','AUG','SEP','OCT','NOV','DEC'];

  /** Parse a YYYY-MM-DD string into a local-midnight Date. */
  function parseDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  /** Build a single event card's inner HTML. */
  function buildEventCard(evt) {
    const d       = parseDate(evt.date);
    const dayNum  = String(d.getDate()).padStart(2, '0');
    const month   = MONTHS[d.getMonth()];
    const dayName = evt.day || d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const iconClass = evt.icon || 'bi-calendar-event';

    // If the API provided a calendarLink, ensure the description is passed through.
    let calendarHref = evt.calendarLink || '';
    if (calendarHref && evt.description) {
      try {
        const url = new URL(calendarHref);
        // Common param names for event description/details
        if (!url.searchParams.has('details') && !url.searchParams.has('description') && !url.searchParams.has('text')) {
          url.searchParams.append('details', evt.description);
        }
        calendarHref = url.toString();
      } catch (e) {
        // If URL parsing fails, append a details param safely
        calendarHref = `${calendarHref}${calendarHref.includes('?') ? '&' : '?'}details=${encodeURIComponent(evt.description)}`;
      }
    }

    return `
      <div class="event-card">
        <div class="event-card-icon"><i class="bi ${iconClass}"></i></div>
        <div class="event-card-date">
          <span class="event-day">${dayName}</span>
          <span class="event-num">${dayNum}</span>
          <span class="event-month">${month}</span>
        </div>
        <h3 class="event-card-title">${evt.title}</h3>
        <p class="event-card-desc">${evt.description}</p>
        <span class="event-card-time"><i class="bi bi-clock"></i> ${evt.time}</span>
        ${calendarHref ? `<a href="${calendarHref}" target="_blank" rel="noopener noreferrer" class="btn btn-calendar"><i class="bi bi-calendar-plus"></i> Add to Calendar</a>` : ''}
      </div>`;
  }

  /** Show the error fallback and hide the carousel. */
  function showError() {
    if (carouselEl) carouselEl.style.display = 'none';
    if (errorEl)    errorEl.style.display = 'block';
  }

  // ------- Peek carousel state & logic -------
  let events = [];
  let currentIndex = 0;
  let autoplayTimer = null;

  /** Assigns peek-left / peek-active / peek-right / peek-hidden classes. */
  function updatePositions() {
    const cards = trackEl.querySelectorAll('.peek-card');
    const total = cards.length;
    if (total === 0) return;

    cards.forEach((card, i) => {
      card.classList.remove('peek-left', 'peek-active', 'peek-right', 'peek-hidden');

      if (i === currentIndex) {
        card.classList.add('peek-active');
      } else if (i === (currentIndex - 1 + total) % total) {
        card.classList.add('peek-left');
      } else if (i === (currentIndex + 1) % total) {
        card.classList.add('peek-right');
      } else {
        card.classList.add('peek-hidden');
      }
    });

    // Update indicator dots
    const dots = indicatorsEl.querySelectorAll('.peek-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function goTo(index) {
    const total = events.length;
    currentIndex = ((index % total) + total) % total;
    updatePositions();
    resetAutoplay();
  }

  function goNext() { goTo(currentIndex + 1); }
  function goPrev() { goTo(currentIndex - 1); }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(goNext, 5000);
  }

  // ------- Fetch & render -------
  fetch(EVENTS_API_URL)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming = data.filter(evt => parseDate(evt.date) >= today);

      if (upcoming.length === 0) {
        showError();
        return;
      }

      upcoming.sort((a, b) => parseDate(a.date) - parseDate(b.date));
      events = upcoming;

      // Build peek cards
      trackEl.innerHTML = upcoming
        .map((evt, i) => {
          const posClass = i === 0 ? 'peek-active'
            : i === upcoming.length - 1 && upcoming.length > 2 ? 'peek-left'
            : i === 1 ? 'peek-right'
            : 'peek-hidden';
          return `<div class="peek-card ${posClass}">${buildEventCard(evt)}</div>`;
        })
        .join('');

      // Build indicator dots
      indicatorsEl.innerHTML = upcoming
        .map((_, i) =>
          `<button class="peek-dot${i === 0 ? ' active' : ''}" aria-label="Event ${i + 1}"></button>`
        )
        .join('');

      // Attach dot click handlers
      indicatorsEl.querySelectorAll('.peek-dot').forEach((dot, i) => {
        dot.addEventListener('click', () => goTo(i));
      });

      // Nav buttons
      if (prevBtn) prevBtn.addEventListener('click', goPrev);
      if (nextBtn) nextBtn.addEventListener('click', goNext);

      // Hide nav if only 1 event
      if (upcoming.length <= 1) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
      }

      // Start autoplay
      resetAutoplay();

      // Pause autoplay on hover
      if (carouselEl) {
        carouselEl.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
        carouselEl.addEventListener('mouseleave', resetAutoplay);
      }
    })
    .catch(() => showError());
}

// ----------------------------------------------------------
// 8. SHOP HOURS — Load from data/hours.json, populate both pages
// ----------------------------------------------------------

/**
 * Shared shop-hours loader.
 * Fetches data/hours.json once and caches the result.
 * Returns a Promise that resolves to the parsed JSON.
 */
function loadShopHours() {
  if (!loadShopHours._promise) {
    loadShopHours._promise = fetch('data/hours.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      });
  }
  return loadShopHours._promise;
}

/**
 * Render trading hours into whichever container exists on the current page.
 */
function initShopHours() {
  loadShopHours()
    .then(data => {
      const hours = data.hours;

      // --- index.html: Trading Hours block ---
      const tradingEl = document.getElementById('tradingHours');
      if (tradingEl) {
        tradingEl.innerHTML = hours.map(h => {
          if (h.label) return `${h.days}: ${h.label}`;
          return `${h.days}: ${h.open} \u2013 ${h.close}`;
        }).join('<br/>');
      }

      // --- booking.html: Compact hours hint ---
      const bookingEl = document.getElementById('bookingHours');
      if (bookingEl) {
        bookingEl.innerHTML = hours.map(h => {
          if (h.label) return `${h.days} ${h.label}`;
          return `${h.days} ${h.open} \u2013 ${h.close}`;
        }).join(' &bull; ');
      }

      // Dispatch a custom event so booking.js can pick up the data
      window.dispatchEvent(new CustomEvent('shopHoursLoaded', { detail: data }));
    })
    .catch(() => {
      // Graceful fallback — set static text
      const tradingEl = document.getElementById('tradingHours');
      if (tradingEl) {
        tradingEl.innerHTML = 'Mon \u2013 Fri: 7:30 \u2013 16:30<br/>Sat: 7:30 \u2013 15:00<br/>Sun: Closed';
      }
      const bookingEl = document.getElementById('bookingHours');
      if (bookingEl) {
        bookingEl.textContent = 'Mon\u2013Fri 7:30 \u2013 16:30 \u2022 Sat 7:30 \u2013 15:00 \u2022 Sun Closed';
      }
      // Still dispatch so booking.js can use hardcoded fallback
      window.dispatchEvent(new CustomEvent('shopHoursLoaded', { detail: null }));
    });
}

// ----------------------------------------------------------
// 9. DYNAMIC GALLERY — Load from data/gallery.json
// ----------------------------------------------------------

/**
 * Gallery state for the lightbox navigation.
 * Holds the currently open category's images and active index.
 */
const galleryState = {
  images: [],
  currentIndex: 0
};

/**
 * Tilt classes for the scrapbook effect.
 * Applied randomly to each card.
 */
const TILT_CLASSES = ['tilt-1', 'tilt-2', 'tilt-3', 'tilt-4', 'tilt-5', 'tilt-6'];

function initDynamicGallery() {
  const gridEl = document.getElementById('galleryGrid');
  const errorEl = document.getElementById('galleryError');

  // Only run on pages that have the gallery grid
  if (!gridEl) return;

  fetch('data/gallery.json')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      const categories = data.categories;

      if (!categories || categories.length === 0) {
        showGalleryError(gridEl, errorEl);
        return;
      }

      // Build category cards
      gridEl.innerHTML = categories.map((cat, idx) => {
        return buildCategoryCard(cat, idx);
      }).join('');

      // Attach click handlers
      attachGalleryClicks(categories);

      // Load thumbnail images (random from each category)
      loadThumbnails(categories);
    })
    .catch(() => showGalleryError(gridEl, errorEl));

  // Lightbox navigation
  initLightboxNav();
}

/**
 * Builds HTML for a single gallery category card.
 * If the category has a `link` property, clicking opens external URL.
 * Otherwise clicking opens the lightbox.
 */
function buildCategoryCard(cat, idx) {
  const tiltClass = TILT_CLASSES[idx % TILT_CLASSES.length];
  const hasLink = !!cat.link;
  const imageCount = cat.images ? cat.images.length : 0;
  const iconColor = isLightColor(cat.color) ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.4)';

  return `
    <div class="col-sm-6 col-lg-4">
      <div class="gallery-card ${tiltClass}" 
           data-category-id="${cat.id}" 
           ${hasLink ? `data-external-link="${cat.link}"` : ''}
           role="button" 
           tabindex="0"
           aria-label="${hasLink ? 'Visit ' + cat.title : 'View ' + cat.title + ' photos'}">
        <div class="gallery-card-img" 
             id="thumb-${cat.id}" 
             style="background-color: ${cat.color};">
          <i class="bi ${cat.icon} gallery-placeholder-icon" style="color: ${iconColor};"></i>
          ${hasLink ? '<span class="gallery-link-badge"><i class="bi bi-box-arrow-up-right"></i> Visit</span>' : ''}
          ${imageCount > 1 ? `<span class="gallery-count-badge"><i class="bi bi-images"></i> ${imageCount}</span>` : ''}
        </div>
        <div class="gallery-card-body">
          <h5>${cat.title}</h5>
          <p>${cat.subtitle}</p>
        </div>
      </div>
    </div>`;
}

/**
 * Loads a random thumbnail image from each category.
 * Falls back to the placeholder icon if the image fails to load.
 */
function loadThumbnails(categories) {
  categories.forEach(cat => {
    if (!cat.images || cat.images.length === 0) return;

    // Pick a random image from the category
    const randomImg = cat.images[Math.floor(Math.random() * cat.images.length)];
    const thumbEl = document.getElementById(`thumb-${cat.id}`);
    if (!thumbEl) return;

    // Create an img element and test if it loads
    const img = new Image();
    img.onload = () => {
      // Replace the placeholder icon with the real image
      thumbEl.innerHTML = '';
      const imgEl = document.createElement('img');
      imgEl.src = randomImg.src;
      imgEl.alt = randomImg.alt;
      imgEl.loading = 'lazy';
      thumbEl.appendChild(imgEl);

      // Re-add badges if needed
      const card = thumbEl.closest('.gallery-card');
      if (card?.dataset.externalLink) {
        thumbEl.insertAdjacentHTML('beforeend', 
          '<span class="gallery-link-badge"><i class="bi bi-box-arrow-up-right"></i> Visit</span>');
      }
      if (cat.images.length > 1) {
        thumbEl.insertAdjacentHTML('beforeend', 
          `<span class="gallery-count-badge"><i class="bi bi-images"></i> ${cat.images.length}</span>`);
      }
    };
    // If image fails, just keep the placeholder icon
    img.src = randomImg.src;
  });
}

/**
 * Attaches click handlers to gallery cards.
 * External-link cards open in a new tab.
 * Regular cards open the lightbox.
 */
function attachGalleryClicks(categories) {
  document.querySelectorAll('.gallery-card').forEach(card => {
    card.addEventListener('click', () => {
      const externalLink = card.dataset.externalLink;
      if (externalLink) {
        window.open(externalLink, '_blank', 'noopener,noreferrer');
        return;
      }

      const catId = card.dataset.categoryId;
      const cat = categories.find(c => c.id === catId);
      if (!cat || !cat.images || cat.images.length === 0) return;

      // Open lightbox with first image
      galleryState.images = cat.images;
      galleryState.currentIndex = 0;
      openLightbox(0);
    });

    // Keyboard accessibility
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
}

/**
 * Opens the lightbox modal at the given image index.
 */
function openLightbox(index) {
  const images = galleryState.images;
  if (!images || images.length === 0) return;

  galleryState.currentIndex = index;
  const img = images[index];

  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');

  if (lightboxImg) {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
  }
  if (lightboxCaption) {
    lightboxCaption.textContent = img.caption;
  }

  // Show/hide nav arrows and counter
  const hasMultiple = images.length > 1;
  if (prevBtn) prevBtn.style.display = hasMultiple ? 'flex' : 'none';
  if (nextBtn) nextBtn.style.display = hasMultiple ? 'flex' : 'none';
  if (lightboxCounter) {
    lightboxCounter.style.display = hasMultiple ? 'block' : 'none';
    lightboxCounter.textContent = `${index + 1} / ${images.length}`;
  }

  // Show the modal
  const modalEl = document.getElementById('galleryLightbox');
  if (modalEl && typeof bootstrap !== 'undefined') {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

/**
 * Initialises lightbox prev/next navigation + keyboard controls.
 */
function initLightboxNav() {
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const images = galleryState.images;
      const newIndex = (galleryState.currentIndex - 1 + images.length) % images.length;
      openLightbox(newIndex);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const images = galleryState.images;
      const newIndex = (galleryState.currentIndex + 1) % images.length;
      openLightbox(newIndex);
    });
  }

  // Keyboard navigation when lightbox is open
  document.addEventListener('keydown', (e) => {
    const modalEl = document.getElementById('galleryLightbox');
    if (!modalEl || !modalEl.classList.contains('show')) return;

    if (e.key === 'ArrowLeft') {
      prevBtn?.click();
    } else if (e.key === 'ArrowRight') {
      nextBtn?.click();
    }
  });
}

/**
 * Shows the gallery error fallback.
 */
function showGalleryError(gridEl, errorEl) {
  if (gridEl) gridEl.style.display = 'none';
  if (errorEl) errorEl.style.display = 'block';
}

/**
 * Rough check if a hex colour is light (for choosing icon contrast).
 */
function isLightColor(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 160;
}
