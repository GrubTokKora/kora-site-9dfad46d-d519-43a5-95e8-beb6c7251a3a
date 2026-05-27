(function () {
  var cfg = window.VEGA_CONFIG || {};
  var form = document.querySelector('[data-hiring-form]');
  var recaptchaContainer = document.querySelector('[data-recaptcha]');
  var recaptchaWidgetId = null;

  function loadRecaptchaScript() {
    return new Promise(function (resolve, reject) {
      var src = 'https://www.google.com/recaptcha/api.js';
      if (document.querySelector('script[src="' + src + '"]')) {
        resolve();
        return;
      }
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.defer = true;
      s.onload = function () {
        resolve();
      };
      s.onerror = function () {
        reject(new Error('Failed to load reCAPTCHA script.'));
      };
      document.head.appendChild(s);
    });
  }

  function waitForGrecaptcha() {
    var start = Date.now();
    return new Promise(function (resolve, reject) {
      function tick() {
        if (window.grecaptcha && window.grecaptcha.render) {
          resolve();
          return;
        }
        if (Date.now() - start > 5000) {
          reject(new Error('reCAPTCHA timeout'));
          return;
        }
        setTimeout(tick, 150);
      }
      tick();
    });
  }

  function renderWidget() {
    if (!cfg.RECAPTCHA_V2_SITE_KEY || !cfg.RECAPTCHA_V2_SITE_KEY.trim() || !recaptchaContainer) return;
    try {
      var id = window.grecaptcha.render(recaptchaContainer, {
        sitekey: cfg.RECAPTCHA_V2_SITE_KEY,
      });
      if (typeof id === 'number') recaptchaWidgetId = id;
    } catch (e) {}
  }

  if (cfg.RECAPTCHA_V2_SITE_KEY && cfg.RECAPTCHA_V2_SITE_KEY.trim() && recaptchaContainer) {
    loadRecaptchaScript()
      .then(waitForGrecaptcha)
      .then(function () {
        if (typeof window.grecaptcha.ready === 'function') {
          window.grecaptcha.ready(renderWidget);
        } else {
          renderWidget();
        }
      })
      .catch(function () {});
  }

  function isEmailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
  }

  if (form) {
    var errEl = form.querySelector('[data-hiring-error]');
    var okEl = form.querySelector('[data-hiring-success]');
    var submitBtn = form.querySelector('[type="submit"]');

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (errEl) errEl.textContent = '';
      if (okEl) okEl.textContent = '';

      var fullName = (form.querySelector('[name="full_name"]') || {}).value.trim();
      var email = (form.querySelector('[name="email"]') || {}).value.trim();
      var phone = (form.querySelector('[name="phone"]') || {}).value.trim();
      var position = (form.querySelector('[name="position"]') || {}).value;
      var message = (form.querySelector('[name="message"]') || {}).value.trim();

      if (!fullName) {
        if (errEl) errEl.textContent = 'Please enter your full name.';
        return;
      }
      if (!email || !isEmailValid(email)) {
        if (errEl) errEl.textContent = 'Please enter a valid email address.';
        return;
      }
      if (!message) {
        if (errEl) errEl.textContent = 'Please enter your message.';
        return;
      }
      if (!cfg.RECAPTCHA_V2_SITE_KEY || !cfg.RECAPTCHA_V2_SITE_KEY.trim()) {
        if (errEl) errEl.textContent = 'Form temporarily unavailable.';
        return;
      }

      var token = '';
      if (window.grecaptcha) {
        token =
          recaptchaWidgetId != null
            ? window.grecaptcha.getResponse(recaptchaWidgetId)
            : window.grecaptcha.getResponse();
      }
      if (!token) {
        if (errEl) errEl.textContent = 'Please complete the reCAPTCHA check.';
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      if (submitBtn) submitBtn.textContent = 'Submitting…';

      try {
        var res = await fetch(cfg.API_BASE_URL + '/api/v1/public/forms/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: cfg.BUSINESS_ID,
            form_type: 'hiring',
            form_data: {
              full_name: fullName,
              phone: phone || null,
              email: email,
              position: position || null,
              message: message,
            },
            submitter_email: email || null,
            captcha_token: token,
          }),
        });
        var data = await res.json().catch(function () {
          return null;
        });
        if (!res.ok) {
          throw new Error((data && (data.detail || data.message)) || 'Submission failed.');
        }
        if (okEl) okEl.textContent = 'Thanks! Your application has been submitted.';
        form.reset();
        if (window.grecaptcha && typeof window.grecaptcha.reset === 'function' && recaptchaWidgetId != null) {
          window.grecaptcha.reset(recaptchaWidgetId);
        }
      } catch (err) {
        if (errEl) errEl.textContent = err.message || 'Something went wrong.';
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (submitBtn) submitBtn.textContent = 'Submit';
      }
    });
  }
})();
