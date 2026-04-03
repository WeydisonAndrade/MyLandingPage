/**
 * Rede de partículas conectadas — Canvas 2D, sem dependências.
 *
 * Representa dados, conexões e sistemas: nós com brilho suave, linhas só entre
 * vizinhos próximos (opacidade por distância), movimento contínuo baseado em tempo.
 *
 * Performance:
 * - O(n²) com n moderado (contagem adaptativa à viewport)
 * - Sem shadowBlur por frame; brilho via traço duplo + gradientes radiais nos nós
 * - Pausa com aba oculta; respeita prefers-reduced-motion; DPR limitado a 2
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
  var lastTimeMs = 0;

  /** Distância máxima para traçar linha (px, espaço lógico) */
  var LINK_DIST = 128;
  var LINK_DIST_SQ = LINK_DIST * LINK_DIST;

  /** Velocidade típica em px/s (independente de FPS) */
  var SPEED_PX_S = 13;

  function particleCount() {
    if (prefersReduced) return Math.min(28, Math.floor((width * height) / 42000));
    if (width < 480) return 40;
    if (width < 768) return 56;
    if (width < 1200) return 72;
    return 88;
  }

  function randomVel() {
    return (Math.random() - 0.5) * 2 * SPEED_PX_S;
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
        r: Math.random() * 0.9 + 0.65,
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
    lastTimeMs = 0;
  }

  var resizeTimer;
  function onResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 100);
  }

  /**
   * Linhas: halo largo (glow) + núcleo fino; opacidade só quando próximos (t²).
   */
  function drawLinks() {
    var i, j, a, b, dx, dy, distSq, dist, t, glowA, coreA;

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
        t = t * t;
        glowA = t * 0.14;
        coreA = t * 0.42;

        ctx.lineCap = "round";

        ctx.lineWidth = 2.25;
        ctx.strokeStyle = "rgba(100, 175, 255, " + glowA + ")";
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        ctx.lineWidth = 0.55;
        ctx.strokeStyle = "rgba(190, 230, 255, " + coreA + ")";
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  /** Nó com gradiente radial (brilho sem shadowBlur). */
  function drawNodes() {
    var i, p, rad, g;
    for (i = 0; i < particles.length; i++) {
      p = particles[i];
      rad = p.r + 3.8;
      g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
      g.addColorStop(0, "rgba(230, 245, 255, 0.95)");
      g.addColorStop(0.4, "rgba(130, 195, 255, 0.32)");
      g.addColorStop(0.75, "rgba(90, 160, 255, 0.1)");
      g.addColorStop(1, "rgba(130, 185, 255, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function step(dtSec) {
    if (prefersReduced) return;
    var i, p;
    for (i = 0; i < particles.length; i++) {
      p = particles[i];
      p.x += p.vx * dtSec;
      p.y += p.vy * dtSec;
      if (p.x < -8) p.x = width + 8;
      if (p.x > width + 8) p.x = -8;
      if (p.y < -8) p.y = height + 8;
      if (p.y > height + 8) p.y = -8;
    }
  }

  function frame(nowMs) {
    if (!isVisible) return;

    var dtSec = lastTimeMs ? Math.min((nowMs - lastTimeMs) / 1000, 0.048) : 1 / 60;
    lastTimeMs = nowMs;

    ctx.clearRect(0, 0, width, height);
    step(dtSec);
    drawLinks();
    drawNodes();
    rafId = window.requestAnimationFrame(frame);
  }

  function start() {
    window.cancelAnimationFrame(rafId);
    resize();
    lastTimeMs = 0;
    rafId = window.requestAnimationFrame(frame);
  }

  document.addEventListener("visibilitychange", function () {
    isVisible = document.visibilityState === "visible";
    if (isVisible) {
      lastTimeMs = 0;
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
