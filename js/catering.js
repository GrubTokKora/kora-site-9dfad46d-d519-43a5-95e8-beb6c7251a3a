```javascript
(function () {
  var cfg = window.KORA_SITE_CONFIG || {};
  var apiBaseUrl = (cfg.apiBaseUrl || '').replace(/\/+$/, '');
  var businessId = cfg.businessId || '';
  var siteKey = (cfg.recaptchaSiteKey || '').trim();

  var form = document.querySelector('[data-catering-form]');
  var recaptchaContainer = form ? form.querySelector('[data-recaptcha]') : null;
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
    var errEl = form.querySelector('[data-catering-error]');
    var okEl = form.querySelector('[data-catering-success]');
    var submitBtn = form.querySelector('[type="submit"]');

    function clearMessages() {
      if (errEl) {
        errEl.textContent = '';
        errEl.hidden = true;
      }
      if (okEl) {
        okEl.textContent = '';
        okEl.hidden = true;
      }
    }

    function showError(message) {
      if (okEl) {
        okEl.textContent = '';
        okEl.hidden = true;
      }
      if (errEl) {
        errEl.textContent = message;
        errEl.hidden = false;
      }
    }

    function showSuccess(message) {
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
      clearMessages();

      var fullName = (form.querySelector('[name="full_name"]') || {}).value.trim();
      var email = (form.querySelector('[name="email"]') || {}).value.trim();
      var phone = (form.querySelector('[name="phone"]') || {}).value.trim();
      var eventDate = (form.querySelector('[name="event_date"]') || {}).value.trim();
      var guestCount = (form.querySelector('[name="guest_count"]') || {}).value.trim();
      var message = (form.querySelector('[name="message"]') || {}).value.trim();

      if (!fullName) {
        showError('Please enter your full name.');
        return;
      }
      if (!email || !isEmailValid(email)) {
        showError('Please enter a valid email address.');
        return;
      }
      if (!eventDate) {
        showError('Please select an event date.');
        return;
      }
      if (!guestCount || parseInt(guestCount, 10) < 1) {
        showError('Please enter the number of guests.');
        return;
      }
      if (!message) {
        showError('Please provide details about your event.');
        return;
      }
      if (!siteKey) {
        showError('Form temporarily unavailable.');
        return;
      }
      if (!apiBaseUrl || !businessId) {
        showError('Form is not configured correctly. Please contact us directly.');
        return;
      }

      try {
        if (!recaptchaLoadStarted) {
          await ensureRecaptchaReady();
        } else if (recaptchaReadyPromise) {
          await recaptchaReadyPromise;
        }
      } catch (err) {
        showError('Security check loading—please try again.');
        return;
      }

      if (!window.grecaptcha) {
        showError('Security check loading—please try again.');
        return;
      }

      var token =
        recaptchaWidgetId != null
          ? window.grecaptcha.getResponse(recaptchaWidgetId)
          : window.grecaptcha.getResponse();
      if (!token) {
        showError('Please complete the reCAPTCHA check.');
        return;
      }

      var formData = {
        name: fullName,
        email: email,
        event_date: eventDate,
        guest_count: guestCount,
        message: message,
      };
      if (phone) formData.phone = phone;

      if (submitBtn) submitBtn.disabled = true;
      if (submitBtn) submitBtn.textContent = 'Sending…';

      try {
        var res = await fetch(apiBaseUrl + '/api/v1/public/forms/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: businessId,
            form_type: 'catering',
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
        showSuccess('Thank you! Your catering inquiry has been sent.');
        form.reset();
        if (
          window.grecaptcha &&
          typeof window.grecaptcha.reset === 'function' &&
          recaptchaWidgetId != null
        ) {
          window.grecaptcha.reset(recaptchaWidgetId);
        }
      } catch (err) {
        showError(err.message || 'Something went wrong.');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (submitBtn) submitBtn.textContent = 'Send Inquiry';
      }
    });
  }
})();
```