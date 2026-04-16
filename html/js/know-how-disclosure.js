/**
 * know-how-disclosure.js — Conhecimentos / card Processos
 *
 * Funcionalidade:
 *   Para cada botão ".know-how-item__disclosure-trigger", registra um clique que alterna o
 *   painel indicado em aria-controls (elemento com id correspondente): atributo hidden,
 *   aria-expanded no botão e classe "is-open" no <li class="know-how-item--def-disclosure"> pai
 *   (usada no CSS para girar o chevron).
 *
 * Contexto na landing:
 *   Metodologias (Lean, Six Sigma, Kanban, Scrum, MASP, Melhoria Contínua) exibem a definição
 *   só após o clique, mantendo a lista compacta. Os textos em PT/EN do parágrafo ficam no HTML
 *   com data-en e são trocados por section-translate.js na seção translatable.
 *
 * Dependências: nenhuma; executar após o DOM (script com defer no index.html).
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
