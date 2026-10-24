(function () {
  'use strict';

  var DEFAULT_LANG = 'es-ES';
  var STORAGE_KEY = 'rekalp_lang';

  function resolve(dict, path) {
    var parts = path.split('.');
    var value = dict;
    for (var i = 0; i < parts.length; i++) {
      if (value == null) return undefined;
      value = value[parts[i]];
    }
    return value;
  }

  function applyDict(dict) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var text = resolve(dict, el.getAttribute('data-i18n'));
      if (typeof text === 'string') el.textContent = text;
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var sep = pair.indexOf(':');
        if (sep === -1) return;
        var attr = pair.slice(0, sep).trim();
        var key = pair.slice(sep + 1).trim();
        var value = resolve(dict, key);
        if (typeof value === 'string') el.setAttribute(attr, value);
      });
    });

    // The waitlist forms' hidden consent-text (sent to the backend as
    // proof of what was agreed to) must track whichever language is
    // currently displayed, not stay frozen in whatever language the page
    // first loaded in — otherwise switching to English and submitting
    // would silently record Spanish consent text that was never shown.
    document.querySelectorAll('[data-consent-text-key]').forEach(function (el) {
      var value = resolve(dict, el.getAttribute('data-consent-text-key'));
      if (typeof value === 'string') el.setAttribute('data-consent-text', value);
    });
  }

  // Figure out where this very script was loaded from (an absolute URL by
  // the time the browser exposes it via .src, whether that's file://,
  // http://localhost, or https://rekalp.com) and resolve `locales/` as a
  // sibling of its parent `js/` folder — works identically from root pages
  // (`js/i18n.js`) and one-level-deep pages (`../js/i18n.js`) with zero
  // per-page configuration.
  var scriptEl = document.currentScript;
  var localesBase = scriptEl
    ? scriptEl.src.replace(/js\/i18n\.js(\?.*)?(#.*)?$/, '')
    : '';

  window.Rekalp = window.Rekalp || {};
  window.Rekalp.currentLang = null;
  window.Rekalp.loadLocale = function (lang) {
    lang = lang || window.Rekalp.currentLang || localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
    return fetch(localesBase + 'locales/' + lang + '.json')
      .then(function (res) { return res.json(); })
      .then(function (dict) {
        applyDict(dict);
        window.Rekalp.dict = dict;
        window.Rekalp.currentLang = lang;
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore (private mode etc.) */ }
        document.querySelectorAll('[data-lang-switch]').forEach(function (btn) {
          btn.classList.toggle('active', btn.getAttribute('data-lang-switch') === lang);
        });
        return dict;
      });
  };

  document.addEventListener('DOMContentLoaded', function () {
    window.Rekalp.loadLocale();
    document.querySelectorAll('[data-lang-switch]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.Rekalp.loadLocale(btn.getAttribute('data-lang-switch'));
      });
    });
  });
})();
