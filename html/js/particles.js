/**
 * Rede de partículas conectadas — Canvas 2D, sem dependências.
 * Performance: O(n²) com n moderado; pausa com aba oculta; respeita prefers-reduced-motion.
 */
(function () {
  "use strict";

  var canvas = document.getElementById("particle-network");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d", { alpha: true });
  var prefersReduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var width = 0;
  var height = 0;
  var dpr = 1;
  var particles = [];
  var rafId = 0;
  var isVisible = true;

  /** Distância máxima para traçar linha (px) */
  var LINK_DIST = 118;
  var LINK_DIST_SQ = LINK_DIST * LINK_DIST;

  /** Velocidade base (px/frame @ ~60fps) */
  var SPEED = 0.22;

  function particleCount() {
    if (prefersReduced) return Math.min(32, Math.floor((width * height) / 35000));
    if (width < 480) return 42;
    if (width < 768) return 58;
    if (width < 1200) return 78;
    return 96;
  }

  function randomVel() {
    return (Math.random() - 0.5) * SPEED * 2;
  }

  function initParticles() {
    var n = particleCount();
    particles.length = 0;
    for (var i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: prefersReduced ? 0 : randomVel(),
        vy: prefersReduced ? 0 : randomVel(),
        r: Math.random() * 1.1 + 0.75,
      });
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
  }

  var resizeTimer;
  function onResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 120);
  }

  /** Linhas finas; opacidade ↑ quando mais perto (aparecem só ao aproximar) */
  function drawLinks() {
    var i, j, a, b, dx, dy, distSq, dist, t, alpha;
    ctx.lineWidth = 0.5;
    ctx.lineCap = "round";

    for (i = 0; i < particles.length; i++) {
      for (j = i + 1; j < particles.length; j++) {
        a = particles[i];
        b = particles[j];
        dx = a.x - b.x;
        dy = a.y - b.y;
        distSq = dx * dx + dy * dy;
        if (distSq > LINK_DIST_SQ) continue;
        dist = Math.sqrt(distSq);
        t = 1 - dist / LINK_DIST;
        alpha = t * t * 0.4;
        ctx.strokeStyle = "rgba(34, 211, 238, " + alpha * 0.75 + ")";
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  /** Ponto + halo suave (sem shadowBlur por frame — mais leve) */
  function drawNodes() {
    var i, p, g;
    for (i = 0; i < particles.length; i++) {
      p = particles[i];
      g = 2.8;
      ctx.fillStyle = "rgba(34, 211, 238, 0.12)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r + g, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(180, 220, 255, 0.92)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function step() {
    var i, p;
    if (!prefersReduced) {
      for (i = 0; i < particles.length; i++) {
        p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -5) p.x = width + 5;
        if (p.x > width + 5) p.x = -5;
        if (p.y < -5) p.y = height + 5;
        if (p.y > height + 5) p.y = -5;
      }
    }
  }

  function frame() {
    if (!isVisible) return;
    ctx.clearRect(0, 0, width, height);
    step();
    drawLinks();
    drawNodes();
    rafId = window.requestAnimationFrame(frame);
  }

  function start() {
    window.cancelAnimationFrame(rafId);
    resize();
    rafId = window.requestAnimationFrame(frame);
  }

  function stop() {
    window.cancelAnimationFrame(rafId);
  }

  document.addEventListener("visibilitychange", function () {
    isVisible = document.visibilityState === "visible";
    if (isVisible) {
      rafId = window.requestAnimationFrame(frame);
    } else {
      window.cancelAnimationFrame(rafId);
    }
  });

  window.addEventListener("resize", onResize, { passive: true });

  if (prefersReduced) {
    resize();
    ctx.clearRect(0, 0, width, height);
    drawLinks();
    drawNodes();
  } else {
    start();
  }
})();
