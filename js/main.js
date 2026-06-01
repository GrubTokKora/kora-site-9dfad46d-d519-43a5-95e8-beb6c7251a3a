window.VEGA_CONFIG = {
  BUSINESS_ID: '437abada-e3c2-4e30-bb68-2f5a4c7f5984',
  API_BASE_URL: 'https://kora-agent.grubtok.com',
  RECAPTCHA_V2_SITE_KEY: '6LfRt44sAAAAACVTvFvGjoufmEcZqZk_pT4T_5Xd',
};

(function () {
  var cfg = window.VEGA_CONFIG || {};

  /* Header scroll */
  const header = document.querySelector('[data-site-header]');
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
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

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

  /* Newsletter */
  var form = document.querySelector('[data-newsletter-form]');
  if (form && cfg.API_BASE_URL && cfg.BUSINESS_ID) {
    var msgEl = form.querySelector('[data-newsletter-message]');
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var email = (form.querySelector('[name="email"]') || {}).value || '';
      var phone = (form.querySelector('[name="phone"]') || {}).value || '';
      var emailOptIn = form.querySelector('[name="email_opt_in"]') && form.querySelector('[name="email_opt_in"]').checked;
      var smsOptIn = form.querySelector('[name="sms_opt_in"]') && form.querySelector('[name="sms_opt_in"]').checked;
      var submitBtn = form.querySelector('[type="submit"]');
      if (msgEl) {
        msgEl.textContent = '';
        msgEl.className = 'mt-4 text-sm min-h-[1.25rem]';
      }
      if (!emailOptIn && !smsOptIn) {
        if (msgEl) {
          msgEl.textContent = 'Please select at least one subscription option.';
          msgEl.className = 'mt-4 text-sm text-red-400 min-h-[1.25rem]';
        }
        return;
      }
      if (emailOptIn && !email.trim()) {
        if (msgEl) {
          msgEl.textContent = 'Please provide an email address.';
          msgEl.className = 'mt-4 text-sm text-red-400 min-h-[1.25rem]';
        }
        return;
      }
      if (smsOptIn && !phone.trim()) {
        if (msgEl) {
          msgEl.textContent = 'Please provide a phone number for SMS updates.';
          msgEl.className = 'mt-4 text-sm text-red-400 min-h-[1.25rem]';
        }
        return;
      }
      if (!email.trim() && !phone.trim()) {
        if (msgEl) {
          msgEl.textContent = 'Please provide an email or phone number.';
          msgEl.className = 'mt-4 text-sm text-red-400 min-h-[1.25rem]';
        }
        return;
      }
      if (submitBtn) submitBtn.disabled = true;
      if (submitBtn) submitBtn.textContent = 'Subscribing...';
      try {
        var res = await fetch(cfg.API_BASE_URL + '/api/v1/public/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: cfg.BUSINESS_ID,
            email: emailOptIn ? email : null,
            phone_number: smsOptIn ? phone : null,
            email_opt_in: emailOptIn,
            sms_opt_in: smsOptIn,
            source: 'WEBSITE',
          }),
        });
        var data = await res.json().catch(function () {
          return {};
        });
        if (!res.ok) {
          throw new Error(data.message || 'Subscription failed.');
        }
        if (msgEl) {
          msgEl.textContent = data.message || 'Successfully subscribed!';
          msgEl.className = 'mt-4 text-sm text-green-400 min-h-[1.25rem]';
        }
        form.reset();
        var emailCb = form.querySelector('[name="email_opt_in"]');
        var smsCb = form.querySelector('[name="sms_opt_in"]');
        if (emailCb) emailCb.checked = true;
        if (smsCb) smsCb.checked = false;
      } catch (err) {
        if (msgEl) {
          msgEl.textContent = err.message || 'Subscription failed. Please try again.';
          msgEl.className = 'mt-4 text-sm text-red-400 min-h-[1.25rem]';
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (submitBtn) submitBtn.textContent = 'Subscribe';
      }
    });
  }
})();
