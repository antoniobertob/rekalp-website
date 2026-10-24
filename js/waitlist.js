(function () {
  'use strict';

  var API_URL = 'https://api.rekalp.com/api/rest/1_0/waitlist/';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function qsParam(name, fallback) {
    var value = new URLSearchParams(window.location.search).get(name);
    return value || fallback;
  }

  function showError(errorEl, text) {
    if (!errorEl) return;
    errorEl.textContent = text;
    errorEl.style.display = text ? '' : 'none';
  }

  // Attaches the shared subscribe flow to a <form>. `options`:
  //   listType: 'usuarios' | 'entrenadores'
  //   messages: { invalidEmail, consentRequired, generic, submitting, submitDefault }
  //   extraFields: () => object of trainer-only fields (name/city/work_mode/...)
  //   redirectTo: path to send the visitor to on success (e.g. '/thanks')
  //   redirectWithTipo: append ?tipo=entrenador to redirectTo for this listType
  window.Rekalp = window.Rekalp || {};
  window.Rekalp.attachWaitlistForm = function (formEl, options) {
    if (!formEl) return;

    var emailInput = formEl.querySelector('[data-field="email"]');
    var consentInput = formEl.querySelector('[data-field="consent"]');
    var honeypotInput = formEl.querySelector('[data-field="honeypot"]');
    var errorEl = formEl.querySelector('[data-field="error"]');
    var submitBtn = formEl.querySelector('[type="submit"]');
    var submitDefaultText = options.messages.submitDefault;

    formEl.addEventListener('submit', function (event) {
      event.preventDefault();
      showError(errorEl, '');

      var email = (emailInput.value || '').trim();
      if (!EMAIL_RE.test(email)) {
        showError(errorEl, options.messages.invalidEmail);
        emailInput.focus();
        return;
      }
      if (consentInput && !consentInput.checked) {
        showError(errorEl, options.messages.consentRequired);
        return;
      }

      var honeypot = honeypotInput ? honeypotInput.value : '';
      var body = Object.assign(
        {
          email: email,
          list_type: options.listType,
          consent_text: consentInput ? consentInput.getAttribute('data-consent-text') || '' : '',
          src: qsParam('src', 'directo'),
          utm_source: qsParam('utm_source', ''),
          utm_medium: qsParam('utm_medium', ''),
          utm_campaign: qsParam('utm_campaign', ''),
          honeypot: honeypot
        },
        options.extraFields ? options.extraFields() : {}
      );

      submitBtn.disabled = true;
      submitBtn.textContent = options.messages.submitting;

      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
        .then(function (res) {
          if (res.status === 201) {
            var target = options.redirectTo;
            if (options.redirectWithTipo) target += '?tipo=entrenador';
            window.location.href = target;
            return;
          }
          return res.json().catch(function () { return {}; }).then(function (data) {
            if (data.error === 'invalid_email') {
              showError(errorEl, options.messages.invalidEmail);
            } else if (data.error === 'consent_required') {
              showError(errorEl, options.messages.consentRequired);
            } else {
              showError(errorEl, options.messages.generic);
            }
          });
        })
        .catch(function () {
          showError(errorEl, options.messages.generic);
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = submitDefaultText;
        });
    });
  };
})();
