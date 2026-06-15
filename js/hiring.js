(function () {
  var cfg = window.KORA_SITE_CONFIG || {};
  var apiBaseUrl = (cfg.apiBaseUrl || '').replace(/\/+$/, '');
  var businessId = cfg.businessId || '';
  var siteKey = (cfg.recaptchaSiteKey || '').trim();

  var form = document.querySelector('[data-hiring-form]');
  var recaptchaContainer = document.querySelector('[data-recaptcha]');
  var recaptchaWidgetId = null;
  var recaptchaLoadStarted = false;
  var recaptchaReadyPromise = null;

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
    if (!siteKey || !recaptchaContainer || recaptchaWidgetId != null) return;
    try {
      var id = window.grecaptcha.render(recaptchaContainer, {
        sitekey: siteKey,
      });
      if (typeof id === 'number') recaptchaWidgetId = id;
    } catch (e) {}
  }

  function ensureRecaptchaReady() {
    if (!siteKey || !recaptchaContainer) {
      return Promise.reject(new Error('Form temporarily unavailable.'));
    }
    if (recaptchaReadyPromise) return recaptchaReadyPromise;
    recaptchaLoadStarted = true;
    recaptchaReadyPromise = loadRecaptchaScript()
      .then(waitForGrecaptcha)
      .then(function () {
        if (typeof window.grecaptcha.ready === 'function') {
          return new Promise(function (resolve) {
            window.grecaptcha.ready(function () {
              renderWidget();
              resolve();
            });
          });
        }
        renderWidget();
      });
    return recaptchaReadyPromise;
  }

  if (form && siteKey && recaptchaContainer) {
    form.addEventListener(
      'focusin',
      function () {
        ensureRecaptchaReady().catch(function () {});
      },
      { once: true }
    );
  }

  function isEmailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
  }

  if (form) {
    var errEl = form.querySelector('[data-hiring-error]');
    var okEl = form.querySelector('[data-hiring-success]');
    var submitBtn = form.querySelector('[type="submit"]');

    function clearHiringMessages() {
      if (errEl) {
        errEl.textContent = '';
        errEl.hidden = true;
      }
      if (okEl) {
        okEl.textContent = '';
        okEl.hidden = true;
      }
    }

    function showHiringError(message) {
      if (okEl) {
        okEl.textContent = '';
        okEl.hidden = true;
      }
      if (errEl) {
        errEl.textContent = message;
        errEl.hidden = false;
      }
    }

    function showHiringSuccess(message) {
      if (errEl) {
        errEl.textContent = '';
        errEl.hidden = true;
      }
      if (okEl) {
        okEl.textContent = message;
        okEl.hidden = false;
      }
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      clearHiringMessages();

      var fullName = (form.querySelector('[name="full_name"]') || {}).value.trim();
      var email = (form.querySelector('[name="email"]') || {}).value.trim();
      var phone = (form.querySelector('[name="phone"]') || {}).value.trim();
      var position = (form.querySelector('[name="position"]') || {}).value.trim();
      var message = (form.querySelector('[name="message"]') || {}).value.trim();

      if (!fullName) {
        showHiringError('Please enter your full name.');
        return;
      }
      if (!email || !isEmailValid(email)) {
        showHiringError('Please enter a valid email address.');
        return;
      }
      if (!message) {
        showHiringError('Please enter your message.');
        return;
      }
      if (!siteKey) {
        showHiringError('Form temporarily unavailable.');
        return;
      }
      if (!apiBaseUrl || !businessId) {
        showHiringError('Form is not configured correctly. Please contact us directly.');
        return;
      }

      try {
        if (!recaptchaLoadStarted) {
          await ensureRecaptchaReady();
        } else if (recaptchaReadyPromise) {
          await recaptchaReadyPromise;
        }
      } catch (err) {
        showHiringError('Security check loading—please try again.');
        return;
      }

      if (!window.grecaptcha) {
        showHiringError('Security check loading—please try again.');
        return;
      }

      var token =
        recaptchaWidgetId != null
          ? window.grecaptcha.getResponse(recaptchaWidgetId)
          : window.grecaptcha.getResponse();
      if (!token) {
        showHiringError('Please complete the reCAPTCHA check.');
        return;
      }

      var formData = {
        name: fullName,
        email: email,
        message: message,
      };
      if (phone) formData.phone = phone;
      if (position) formData.position = position;

      if (submitBtn) submitBtn.disabled = true;
      if (submitBtn) submitBtn.textContent = 'Submitting…';

      try {
        var res = await fetch(apiBaseUrl + '/api/v1/public/forms/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: businessId,
            form_type: 'hiring',
            form_data: formData,
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
        showHiringSuccess('Thanks! Your application has been submitted.');
        form.reset();
        if (
          window.grecaptcha &&
          typeof window.grecaptcha.reset === 'function' &&
          recaptchaWidgetId != null
        ) {
          window.grecaptcha.reset(recaptchaWidgetId);
        }
      } catch (err) {
        showHiringError(err.message || 'Something went wrong.');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (submitBtn) submitBtn.textContent = 'Submit';
      }
    });
  }
})();
