/**
 * Carrossel horizontal da seção Projetos (index.html).
 *
 * - Rolagem suave por “passo” = largura de um card + gap do flex.
 * - Botões prev/next desabilitam nos extremos do scroll.
 * - Teclado: setas ← / → quando o carrossel tem foco (tabindex no HTML).
 * - Clique em “anterior”: animação visual (classe + CSS @keyframes projects-nav-tap-prev).
 * - Mobile: tabindex do carrossel -1 em viewport estreita; correção de scroll ao abrir links externos.
 *
 * Depende dos ids: projectsCarousel, projectsPrev, projectsNext.
 */
(function () {
  "use strict";

  // Referências ao container rolável e aos dois botões de navegação
  var carousel = document.getElementById("projectsCarousel");
  var prev = document.getElementById("projectsPrev");
  var next = document.getElementById("projectsNext");

  // Se algum elemento obrigatório não existir, não inicializa (evita erros em outras páginas)
  if (!carousel || !prev || !next) return;

  /**
   * Mobile (viewport estreita): o carrossel deixa de ser focável com Tab.
   * Evita que o WebKit/iOS faça scroll da página para “mostrar” o region ao tocar links internos.
   */
  var mqMobile = typeof window.matchMedia === "function" ? window.matchMedia("(max-width: 767.98px)") : null;

  function syncCarouselTabIndex() {
    if (!mqMobile) return;
    carousel.tabIndex = mqMobile.matches ? -1 : 0;
  }

  syncCarouselTabIndex();
  if (mqMobile) {
    if (typeof mqMobile.addEventListener === "function") {
      mqMobile.addEventListener("change", syncCarouselTabIndex);
    } else if (typeof mqMobile.addListener === "function") {
      mqMobile.addListener(syncCarouselTabIndex);
    }
  }

  /**
   * iOS/WebKit: links dentro de overflow-x: auto às vezes deslocam o scroll vertical da janela
   * ao abrir target=_blank. Preserva scrollY nos frames seguintes ao clique (só em viewport mobile).
   */
  carousel.addEventListener(
    "click",
    function (e) {
      if (!mqMobile || !mqMobile.matches) return;
      var t = e.target;
      if (!t || typeof t.closest !== "function") return;
      var a = t.closest("a.project-card__link");
      if (!a || !carousel.contains(a) || a.getAttribute("target") !== "_blank") return;
      var y = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      requestAnimationFrame(function () {
        window.scrollTo(0, y);
        requestAnimationFrame(function () {
          window.scrollTo(0, y);
        });
      });
    },
    true
  );

  document.addEventListener("visibilitychange", function () {
    if (!mqMobile || !mqMobile.matches || document.visibilityState !== "visible") return;
    var ae = document.activeElement;
    if (!ae || ae === document.body || !carousel.contains(ae)) return;
    if (typeof ae.blur === "function") ae.blur();
  });

  // Respeita preferência do sistema/usuário por menos animação (sem nudge no ícone)
  var reduceMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /**
   * Dispara a animação de “toque” no botão anterior: adiciona classe que o CSS
   * associa a @keyframes projects-nav-tap-prev. Remove a classe ao terminar a animação.
   * void offsetWidth força reflow para permitir re-disparar a mesma animação em cliques seguidos.
   */
  function playPrevClickNudge() {
    if (reduceMotion || prev.disabled) return;
    var wrap = prev.querySelector(".projects__nav-icon-wrap");
    if (!wrap) return;
    prev.classList.remove("projects__nav--nudge-left");
    void wrap.offsetWidth;
    prev.classList.add("projects__nav--nudge-left");
    function onAnimEnd(e) {
      if (e.animationName !== "projects-nav-tap-prev") return;
      prev.classList.remove("projects__nav--nudge-left");
      wrap.removeEventListener("animationend", onAnimEnd);
    }
    wrap.addEventListener("animationend", onAnimEnd);
  }

  /**
   * Calcula quantos pixels rolar por clique: largura do primeiro card + gap do flex
   * (lê gap/columnGap do estilo computado). Fallback se não houver card no DOM.
   */
  function getScrollStep() {
    var card = carousel.querySelector(".project-card");
    if (!card) return Math.min(320, carousel.clientWidth * 0.85);
    var styles = window.getComputedStyle(carousel);
    var gap = parseFloat(styles.gap || styles.columnGap || "0") || 0;
    return card.offsetWidth + gap;
  }

  /**
   * Atualiza estado disabled dos botões conforme posição do scroll:
   * no início desabilita “anterior”; no fim desabilita “próximo”.
   * eps evita flutuação por arredondamento de scrollLeft.
   */
  function updateNavState() {
    var maxScroll = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
    var left = carousel.scrollLeft;
    var eps = 3;
    prev.disabled = left <= eps;
    next.disabled = left >= maxScroll - eps;
  }

  // Clique “anterior”: feedback visual + rolagem suave para a esquerda
  prev.addEventListener("click", function () {
    playPrevClickNudge();
    carousel.scrollBy({ left: -getScrollStep(), behavior: "smooth" });
  });

  // Clique “próximo”: rolagem suave para a direita
  next.addEventListener("click", function () {
    carousel.scrollBy({ left: getScrollStep(), behavior: "smooth" });
  });

  // Durante o scroll (touch, trackpad, barra): reavalia extremos dos botões; passive melhora performance
  carousel.addEventListener("scroll", updateNavState, { passive: true });

  // Redimensionamento: recalcula limites após mudança de largura (requestAnimationFrame agrupa com o paint)
  window.addEventListener("resize", function () {
    window.requestAnimationFrame(updateNavState);
  });

  // Estado inicial: após DOM pronto e de novo no load (imagens/fonts podem alterar larguras)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateNavState);
  } else {
    updateNavState();
  }
  window.addEventListener("load", updateNavState);

  // Acessibilidade: com foco no carrossel, setas esquerda/direita rolam como os botões
  carousel.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      carousel.scrollBy({ left: -getScrollStep(), behavior: "smooth" });
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      carousel.scrollBy({ left: getScrollStep(), behavior: "smooth" });
    }
  });
})();
