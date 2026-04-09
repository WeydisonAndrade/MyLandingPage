/**
 * Tradução global PT ↔ EN via data-en / data-pt, sincronizada em todas as seções
 * e persistida em localStorage (preferred_language: 'en' | 'pt').
 */
(function () {
  "use strict";

  var STORAGE_KEY = "preferred_language";
  var HTML_LIKE = /<[a-z][\s\S]*>/i;

  function setNodeContent(el, value) {
    if (!value) return;
    if (HTML_LIKE.test(value)) {
      el.innerHTML = value;
    } else {
      el.textContent = value;
    }
  }

  function capturePt(el) {
    if (el.hasAttribute("data-pt")) return;
    el.setAttribute("data-pt", el.innerHTML.trim() === "" ? el.textContent : el.innerHTML);
  }

  function applyLanguage(lang) {
    var toEn = lang === "en";

    document.documentElement.setAttribute("lang", toEn ? "en" : "pt-BR");

    document.querySelectorAll(".section--translatable").forEach(function (section) {
      section.classList.toggle("is-lang-en", toEn);

      section.querySelectorAll("[data-aria-en]").forEach(function (el) {
        if (toEn) {
          if (!el.hasAttribute("data-aria-pt")) {
            el.setAttribute("data-aria-pt", el.getAttribute("aria-label") || "");
          }
          el.setAttribute("aria-label", el.getAttribute("data-aria-en") || "");
        } else {
          var ptAria = el.getAttribute("data-aria-pt");
          if (ptAria != null) el.setAttribute("aria-label", ptAria);
        }
      });

      section.querySelectorAll("[data-en]").forEach(function (el) {
        var en = el.getAttribute("data-en");
        if (!en) return;

        if (toEn) {
          capturePt(el);
          setNodeContent(el, en);
        } else {
          var pt = el.getAttribute("data-pt");
          if (pt != null) setNodeContent(el, pt);
        }
      });
    });
  }

  function syncTranslateButtons(lang) {
    var toEn = lang === "en";
    document.querySelectorAll(".section--translatable .btn-translate").forEach(function (btn) {
      btn.textContent = toEn ? "Ler em Português" : "Read in English";
      btn.setAttribute("aria-pressed", toEn ? "true" : "false");
    });
  }

  function getStoredLanguage() {
    var v = localStorage.getItem(STORAGE_KEY);
    return v === "en" || v === "pt" ? v : "pt";
  }

  /** Idioma atualmente aplicado na página (alinha com o primeiro bloco traduzível). */
  function getCurrentLanguageFromDom() {
    var first = document.querySelector(".section--translatable");
    return first && first.classList.contains("is-lang-en") ? "en" : "pt";
  }

  function initFromStorage() {
    var lang = getStoredLanguage();
    applyLanguage(lang);
    syncTranslateButtons(lang);
  }

  function attachClickHandlers() {
    document.querySelectorAll(".section--translatable .btn-translate").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var current = getCurrentLanguageFromDom();
        var next = current === "en" ? "pt" : "en";
        localStorage.setItem(STORAGE_KEY, next);
        applyLanguage(next);
        syncTranslateButtons(next);
      });
    });
  }

  function boot() {
    initFromStorage();
    attachClickHandlers();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
