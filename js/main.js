window.KORA_SITE_CONFIG = {
  apiBaseUrl: 'https://kora-agent.grubtok.com',
  businessId: '9dfad46d-d519-43a5-95e8-beb6c7251a3a',
  recaptchaSiteKey: '6LcsdJYsAAAAAAur-h7cYlZuGJTmijNHmOi5kFH7',
};

// Backwards-compatible alias used by legacy scripts on this site.
window.VEGA_CONFIG = {
  BUSINESS_ID: window.KORA_SITE_CONFIG.businessId,
  API_BASE_URL: window.KORA_SITE_CONFIG.apiBaseUrl,
  RECAPTCHA_V2_SITE_KEY: window.KORA_SITE_CONFIG.recaptchaSiteKey,
};

(function () {
  var cfg = window.VEGA_CONFIG || {};

  /* Header scroll */
  const header = document.querySelector('[data-site-header]');

  function getHeaderScrollOffset() {
    if (!header) return 0;
    return Math.ceil(header.getBoundingClientRect().height) + 0;
  }

  function updateHeaderScrollPadding() {
    document.documentElement.style.setProperty('--header-scroll-offset', getHeaderScrollOffset() + 'px');
  }

  function scrollToSection(id, behavior) {
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    updateHeaderScrollPadding();
    var top = window.pageYOffset + target.getBoundingClientRect().top - getHeaderScrollOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: behavior || 'smooth' });
  }

  function onScrollHeader() {
    if (!header) return;
    var scrolled = window.scrollY > 100;
    if (scrolled) {
      header.classList.add('is-scrolled', 'bg-vega-bg-dark/95', 'backdrop-blur-sm', 'shadow-lg');
      header.classList.remove('bg-transparent');
    } else {
      header.classList.remove('is-scrolled', 'bg-vega-bg-dark/95', 'backdrop-blur-sm', 'shadow-lg');
      header.classList.add('bg-transparent');
    }
    updateHeaderScrollPadding();
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  window.addEventListener('resize', updateHeaderScrollPadding, { passive: true });
  onScrollHeader();
  if (header && typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(updateHeaderScrollPadding).observe(header);
  }

  /* Mobile menu */
  const mobileBtn = document.querySelector('[data-mobile-menu-btn]');
  const mobilePanel = document.querySelector('[data-mobile-menu]');
  const mobileIconOpen = document.querySelector('[data-icon-menu]');
  const mobileIconClose = document.querySelector('[data-icon-close]');
  function setMobileOpen(open) {
    if (!mobilePanel) return;
    mobilePanel.classList.toggle('hidden', !open);
    if (mobileIconOpen) mobileIconOpen.classList.toggle('hidden', open);
    if (mobileIconClose) mobileIconClose.classList.toggle('hidden', !open);
    requestAnimationFrame(updateHeaderScrollPadding);
  }
  if (mobileBtn && mobilePanel) {
    mobileBtn.addEventListener('click', function () {
      const open = mobilePanel.classList.contains('hidden');
      setMobileOpen(open);
    });
    mobilePanel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        setMobileOpen(false);
      });
    });
  }

  /* In-page anchor links — single offset, correct section after header */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var hash = link.getAttribute('href');
      if (!hash || hash === '#') return;
      var id = hash.slice(1);
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var menuWasOpen = mobilePanel && !mobilePanel.classList.contains('hidden');
      if (menuWasOpen) {
        setMobileOpen(false);
      }
      if (history.pushState) {
        history.pushState(null, '', hash);
      } else {
        location.hash = hash;
      }
      function runScroll() {
        scrollToSection(id, 'smooth');
      }
      if (menuWasOpen) {
        requestAnimationFrame(function () {
          updateHeaderScrollPadding();
          requestAnimationFrame(runScroll);
        });
      } else {
        requestAnimationFrame(runScroll);
      }
    });
  });

  if (location.hash) {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    requestAnimationFrame(function () {
      scrollToSection(location.hash.slice(1), 'auto');
    });
  }

  /* Scroll to top */
  const scrollBtn = document.querySelector('[data-scroll-top]');
  function onScrollTopBtn() {
    if (!scrollBtn) return;
    const show = window.scrollY > 500;
    scrollBtn.classList.toggle('opacity-100', show);
    scrollBtn.classList.toggle('translate-y-0', show);
    scrollBtn.classList.toggle('pointer-events-none', !show);
    scrollBtn.classList.toggle('opacity-0', !show);
    scrollBtn.classList.toggle('translate-y-10', !show);
  }
  window.addEventListener('scroll', onScrollTopBtn, { passive: true });
  onScrollTopBtn();
  if (scrollBtn) {
    scrollBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* Hero load */
  const heroInner = document.querySelector('.hero-inner');
  if (heroInner) {
    requestAnimationFrame(function () {
      heroInner.classList.add('is-loaded');
    });
  }

  /* Hero poster → muted video when ready (cross-browser) */
  const heroMedia = document.querySelector('.hero-media');
  const heroVideo = document.querySelector('.hero-video');
  if (heroMedia && heroVideo) {
    /* Muted + inline required for autoplay (Chrome, Firefox, Safari, iOS) */
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.setAttribute('muted', '');
    heroVideo.setAttribute('playsinline', '');
    heroVideo.setAttribute('webkit-playsinline', '');

    var heroVideoStarted = false;
    function startHeroVideo() {
      if (heroVideoStarted) return;
      heroVideoStarted = true;
      var playPromise = heroVideo.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(function () {
            heroMedia.classList.add('is-video-playing');
          })
          .catch(function () {
            heroVideoStarted = false;
          });
      } else {
        heroMedia.classList.add('is-video-playing');
      }
    }

    function isHeroVideoReady() {
      return heroVideo.readyState >= 4;
    }

    var heroVideoFallbackTimer = setTimeout(function () {
      if (!heroVideoStarted && heroVideo.readyState >= 3) startHeroVideo();
    }, 6000);

    function startHeroVideoAndClearFallback() {
      clearTimeout(heroVideoFallbackTimer);
      startHeroVideo();
    }

    if (isHeroVideoReady()) {
      startHeroVideoAndClearFallback();
    } else {
      heroVideo.addEventListener('canplaythrough', startHeroVideoAndClearFallback, { once: true });
      /* Safari sometimes skips canplaythrough; loadeddata + readyState is a backup */
      heroVideo.addEventListener('loadeddata', function () {
        if (heroVideo.readyState >= 4) startHeroVideoAndClearFallback();
      }, { once: true });
    }

    /* Resume if the browser pauses background video (tab switch, etc.) */
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && heroMedia.classList.contains('is-video-playing')) {
        heroVideo.play().catch(function () {});
      }
    });

    /* On failure, poster image remains visible */
    heroVideo.addEventListener('error', function () {
      heroVideoStarted = true;
    }, { once: true });
  }

  /* Intersection reveals */
  function observeReveals(selector, options) {
    var els = document.querySelectorAll(selector);
    if (!els.length) return;
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            obs.unobserve(e.target);
          }
        });
      },
      options || { threshold: 0.15 }
    );
    els.forEach(function (el) {
      obs.observe(el);
    });
  }
  observeReveals('.js-reveal', { threshold: 0.2 });
  observeReveals('.gallery-item', { threshold: 0.08 });

  /* Gallery lightbox */
  (function initGalleryLightbox() {
    var galleryRoot = document.getElementById('gallery');
    var lightbox = document.querySelector('[data-gallery-lightbox]');
    if (!galleryRoot || !lightbox) return;

    var items = galleryRoot.querySelectorAll('[data-gallery-item]');
    if (!items.length) return;

    var lbImg = lightbox.querySelector('[data-gallery-lightbox-img]');
    var lbCaption = lightbox.querySelector('[data-gallery-caption]');
    var lbCounter = lightbox.querySelector('[data-gallery-counter]');
    var btnClose = lightbox.querySelector('[data-gallery-close]');
    var btnPrev = lightbox.querySelector('[data-gallery-prev]');
    var btnNext = lightbox.querySelector('[data-gallery-next]');
    var backdrop = lightbox.querySelector('[data-gallery-backdrop]');
    var stage = lightbox.querySelector('.gallery-lightbox__stage');

    var slides = [];
    var currentIndex = 0;
    var lastFocus = null;
    var touchStartX = 0;
    var touchStartY = 0;

    items.forEach(function (item, i) {
      var img = item.querySelector('img');
      if (!img) return;
      slides.push({ src: img.src, alt: img.alt || '' });
      item.addEventListener('click', function () {
        openAt(i);
      });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openAt(i);
        }
      });
    });

    if (!slides.length) return;

    function showSlide(index) {
      currentIndex = (index + slides.length) % slides.length;
      var slide = slides[currentIndex];
      if (lbImg) {
        lbImg.src = slide.src;
        lbImg.alt = slide.alt;
      }
      if (lbCaption) lbCaption.textContent = slide.alt;
      if (lbCounter) {
        lbCounter.textContent = currentIndex + 1 + ' / ' + slides.length;
      }
    }

    function openAt(index) {
      lastFocus = document.activeElement;
      showSlide(index);
      lightbox.hidden = false;
      lightbox.setAttribute('aria-hidden', 'false');
      lightbox.classList.add('is-open');
      document.body.classList.add('gallery-lightbox-open');
      requestAnimationFrame(function () {
        if (btnClose) btnClose.focus();
      });
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('gallery-lightbox-open');
      if (lbImg) lbImg.removeAttribute('src');
      window.setTimeout(function () {
        lightbox.hidden = true;
        if (lastFocus && typeof lastFocus.focus === 'function') {
          lastFocus.focus();
        }
      }, 300);
    }

    function goPrev() {
      showSlide(currentIndex - 1);
    }

    function goNext() {
      showSlide(currentIndex + 1);
    }

    if (btnClose) btnClose.addEventListener('click', closeLightbox);
    if (backdrop) backdrop.addEventListener('click', closeLightbox);
    if (btnPrev) btnPrev.addEventListener('click', goPrev);
    if (btnNext) btnNext.addEventListener('click', goNext);

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    });

    if (stage) {
      stage.addEventListener(
        'touchstart',
        function (e) {
          if (!lightbox.classList.contains('is-open') || !e.touches.length) return;
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        },
        { passive: true }
      );
      stage.addEventListener(
        'touchend',
        function (e) {
          if (!lightbox.classList.contains('is-open') || !e.changedTouches.length) return;
          var dx = e.changedTouches[0].clientX - touchStartX;
          var dy = e.changedTouches[0].clientY - touchStartY;
          if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
          if (dx > 0) goPrev();
          else goNext();
        },
        { passive: true }
      );
    }
  })();

  /* Hours banner */
  var hoursBanner = document.querySelector('[data-hours-banner]');
  if (hoursBanner) {
    var hObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('opacity-100');
            hObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    hObs.observe(hoursBanner);
  }

  /* Menu tabs */
  var menuRoot = document.querySelector('[data-menu-root]');
  if (menuRoot) {
    var buttons = menuRoot.querySelectorAll('[data-menu-tab]');
    var panels = menuRoot.querySelectorAll('[data-menu-panel]');
    function activate(id) {
      buttons.forEach(function (b) {
        var active = b.getAttribute('data-menu-tab') === id;
        b.classList.toggle('bg-primary', active);
        b.classList.toggle('text-white', active);
        b.classList.toggle('border-primary', active);
        b.classList.toggle('shadow-sm', active);
        b.classList.toggle('border-purple-200', !active);
        b.classList.toggle('bg-white/80', !active);
        b.classList.toggle('text-gray-800', !active);
      });
      panels.forEach(function (p) {
        var show = p.getAttribute('data-menu-panel') === id;
        p.classList.toggle('is-active', show);
      });
    }
    var initial = 'menu-weekly';
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activate(btn.getAttribute('data-menu-tab'));
      });
    });
    activate(initial);
  }

  /* Press carousel */
  var track = document.querySelector('[data-press-track]');
  var pressRoot = document.querySelector('[data-press-root]');
  if (track && pressRoot) {
    var slides = track.children.length;
    var current = 0;
    var dots = pressRoot.querySelectorAll('[data-press-dot]');
    var prevBtn = pressRoot.querySelector('[data-press-prev]');
    var nextBtn = pressRoot.querySelector('[data-press-next]');

    function goTo(i) {
      current = (i + slides) % slides;
      track.style.transform = 'translateX(-' + current * 100 + '%)';
      dots.forEach(function (d, idx) {
        var on = idx === current;
        d.classList.toggle('bg-white', on);
        d.classList.toggle('scale-125', on);
        d.classList.toggle('bg-white/40', !on);
      });
    }
    var timer = setInterval(function () {
      goTo(current + 1);
    }, 4000);
    if (prevBtn)
      prevBtn.addEventListener('click', function () {
        clearInterval(timer);
        goTo(current - 1);
      });
    if (nextBtn)
      nextBtn.addEventListener('click', function () {
        clearInterval(timer);
        goTo(current + 1);
      });
    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () {
        clearInterval(timer);
        goTo(idx);
      });
    });
    goTo(0);
  }

  /* Order section stagger — handled by js-reveal on h2; cards use js-reveal with inline delay via style */

  /* FAQ Accordion */
  const faqContainer = document.querySelector('[data-faq-container]');
  if (faqContainer) {
    const questions = faqContainer.querySelectorAll('[data-faq-question]');
    questions.forEach(function (question) {
      question.addEventListener('click', function () {
        const answer = this.nextElementSibling;
        if (!answer) {
          return;
        }
        const isOpen = !answer.classList.contains('hidden');
        this.classList.toggle('is-open', !isOpen);
        answer.classList.toggle('hidden');
      });
    });
  }

  /* Newsletter subscribe popup (first visit) */
  (function initSubscribePopup() {
    var popup = document.querySelector('[data-subscribe-popup]');
    if (!popup) return;

    var STORAGE_KEY = 'vega_subscribe_popup_seen';
    var TOAST_URL = 'https://www.toasttab.com/vegamexicancuisine/marketing-signup';
    var SHOW_DELAY_MS = 1500;
    var closeBtns = popup.querySelectorAll('[data-subscribe-close]');
    var cta = popup.querySelector('[data-subscribe-cta]');
    var lastFocus = null;
    var openTimer = null;

    function trackPopupEvent(eventName, params) {
      if (typeof window.trackEvent === 'function') {
        window.trackEvent(eventName, params);
        return;
      }
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: eventName }, params || {}));
    }

    function markSeen() {
      try {
        localStorage.setItem(STORAGE_KEY, '1');
      } catch (e) {
        /* ignore private browsing */
      }
    }

    function hasSeen() {
      try {
        return localStorage.getItem(STORAGE_KEY) === '1';
      } catch (e) {
        return false;
      }
    }

    function openPopup() {
      lastFocus = document.activeElement;
      popup.hidden = false;
      popup.setAttribute('aria-hidden', 'false');
      popup.classList.add('is-open');
      document.body.classList.add('subscribe-popup-open');
      trackPopupEvent('newsletter_popup_shown', { page_path: window.location.pathname || '/' });
      requestAnimationFrame(function () {
        var closeBtn = popup.querySelector('.subscribe-popup__close');
        if (closeBtn) closeBtn.focus();
      });
    }

    function closePopup(reason) {
      if (openTimer) {
        clearTimeout(openTimer);
        openTimer = null;
      }
      popup.classList.remove('is-open');
      popup.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('subscribe-popup-open');
      markSeen();
      trackPopupEvent('newsletter_popup_closed', {
        page_path: window.location.pathname || '/',
        close_reason: reason || 'unknown',
      });
      window.setTimeout(function () {
        popup.hidden = true;
        if (lastFocus && typeof lastFocus.focus === 'function') {
          lastFocus.focus();
        }
      }, 300);
    }

    closeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var reason = 'close';
        if (btn.classList.contains('subscribe-popup__dismiss')) reason = 'dismiss';
        else if (btn.classList.contains('subscribe-popup__backdrop')) reason = 'backdrop';
        closePopup(reason);
      });
    });

    if (cta) {
      cta.addEventListener('click', function () {
        trackPopupEvent('newsletter_popup_subscribe_click', {
          page_path: window.location.pathname || '/',
          link_url: TOAST_URL,
        });
        closePopup('subscribe');
      });
    }

    document.addEventListener('keydown', function (e) {
      if (!popup.classList.contains('is-open')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closePopup('escape');
      }
    });

    if (!hasSeen()) {
      openTimer = window.setTimeout(openPopup, SHOW_DELAY_MS);
    }
  })();


})();
