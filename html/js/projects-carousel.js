(function () {
  var carousel = document.getElementById("projectsCarousel");
  var prev = document.getElementById("projectsPrev");
  var next = document.getElementById("projectsNext");
  if (!carousel || !prev || !next) return;

  function getScrollStep() {
    var card = carousel.querySelector(".project-card");
    if (!card) return Math.min(320, carousel.clientWidth * 0.85);
    var styles = window.getComputedStyle(carousel);
    var gap = parseFloat(styles.gap || styles.columnGap || "0") || 0;
    return card.offsetWidth + gap;
  }

  function updateNavState() {
    var maxScroll = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
    var left = carousel.scrollLeft;
    var eps = 3;
    prev.disabled = left <= eps;
    next.disabled = left >= maxScroll - eps;
  }

  prev.addEventListener("click", function () {
    carousel.scrollBy({ left: -getScrollStep(), behavior: "smooth" });
  });

  next.addEventListener("click", function () {
    carousel.scrollBy({ left: getScrollStep(), behavior: "smooth" });
  });

  carousel.addEventListener("scroll", updateNavState, { passive: true });
  window.addEventListener("resize", function () {
    window.requestAnimationFrame(updateNavState);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateNavState);
  } else {
    updateNavState();
  }
  window.addEventListener("load", updateNavState);

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
