/**
 * Itens "conhecimentos" com definição expansível (botão + painel aria-controls).
 */
(function () {
  "use strict";

  document.querySelectorAll(".know-how-item__disclosure-trigger").forEach(function (btn) {
    var panelId = btn.getAttribute("aria-controls");
    var panel = panelId ? document.getElementById(panelId) : null;
    var item = btn.closest(".know-how-item--def-disclosure");
    if (!panel) return;

    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      var next = !open;
      btn.setAttribute("aria-expanded", next ? "true" : "false");
      panel.hidden = !next;
      if (item) item.classList.toggle("is-open", next);
    });
  });
})();
