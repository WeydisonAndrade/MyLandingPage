/**
 * Tradução in-place por seção: alterna PT ↔ EN via data-en / data-pt, sem recarregar.
 */
(function () {
  "use strict";

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

  document.querySelectorAll(".section--translatable .btn-translate").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var section = btn.closest(".section--translatable");
      if (!section) return;

      var toEn = !section.classList.contains("is-lang-en");

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

      section.classList.toggle("is-lang-en", toEn);
      btn.textContent = toEn ? "Ler em Português" : "Read in English";
      btn.setAttribute("aria-pressed", toEn ? "true" : "false");
    });
  });
})();
