/**
 * track-events.js — tracking GA4 (gtag) para site estático (defer, sem módulos).
 *
 * Padrão de parâmetros (todos os eventos):
 *   engagement_surface — onde ocorreu a interação (ex.: header_nav, footer).
 *   engagement_detail  — o quê foi acionado (ex.: sobre, ecofabrica).
 *
 * Dimensões personalizadas sugeridas no GA4: engagement_surface, engagement_detail.
 */

function trackEvent(action, params = {}) {
  if (typeof window.gtag === "function") {
    window.gtag("event", action, params);
  } else {
    console.warn("gtag não disponível");
  }
}

(function () {
  "use strict";

  /** Clique primário sem modificadores (não interceptar meio-direito, Ctrl+clique, etc.). */
  function isPrimaryUnmodifiedClick(e, el) {
    if (e.defaultPrevented) return false;
    if (e.button != null && e.button !== 0) return false;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    if (el.getAttribute("target") === "_blank") return false;
    if (el.getAttribute("download") != null && el.getAttribute("download") !== "") return false;
    return true;
  }

  /** Navegação que só altera o hash no mesmo documento (não exige event_callback). */
  function isSameDocumentHashOnly(anchor) {
    try {
      var next = new URL(anchor.href);
      var cur = new URL(window.location.href);
      next.hash = "";
      cur.hash = "";
      return next.href === cur.href;
    } catch (err) {
      return false;
    }
  }

  /**
   * engagement_detail a partir do href do menu.
   * Suporta: #inicio, index.html#sobre, /#projetos, artigos.html (hash tem prioridade).
   * Regras: fragmento após #; artigos.html sem hash → artigos; fallback → outro.
   */
  function menuEngagementDetail(href) {
    if (!href || typeof href !== "string") return "outro";
    var trimmed = href.trim();
    if (!trimmed) return "outro";

    try {
      var u = new URL(trimmed, window.location.href);
      var file = (u.pathname || "").split("/").filter(Boolean).pop() || "";
      file = file.toLowerCase();
      var frag = (u.hash || "").replace(/^#/, "").toLowerCase();
      var fragSlug = frag.replace(/[^a-z0-9_-]/g, "");

      if (fragSlug) return fragSlug;
      if (file === "artigos.html") return "artigos";
    } catch (err) {
      /* continua para fallback textual */
    }

    var lower = trimmed.toLowerCase();
    var i = lower.indexOf("#");
    if (i !== -1) {
      var slug = lower
        .slice(i + 1)
        .replace(/[^a-z0-9_-]/g, "");
      if (slug) return slug;
    }
    if (lower.indexOf("artigos.html") !== -1 && lower.indexOf("#") === -1) return "artigos";
    return "outro";
  }

  /**
   * Envia o hit e só depois navega, para não perder o evento em mudança de página.
   * Mesmo documento só com hash: não intercepta (comportamento nativo do browser).
   */
  function trackMenuLinkWithNavigationGuard(e, anchor, payload) {
    if (!isPrimaryUnmodifiedClick(e, anchor)) {
      trackEvent("click_menu", payload);
      return;
    }
    if (isSameDocumentHashOnly(anchor)) {
      trackEvent("click_menu", payload);
      return;
    }

    if (typeof window.gtag !== "function") {
      trackEvent("click_menu", payload);
      return;
    }

    e.preventDefault();
    var dest = anchor.href;
    var done = false;

    function navigate() {
      if (done) return;
      done = true;
      window.location.assign(dest);
    }

    var safetyMs = 1500;
    var timer = window.setTimeout(navigate, safetyMs);

    window.gtag(
      "event",
      "click_menu",
      Object.assign({}, payload, {
        event_callback: function () {
          window.clearTimeout(timer);
          navigate();
        },
      })
    );
  }

  function bindEngagementClicks(selector, eventName, params) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.addEventListener("click", function () {
        trackEvent(eventName, params);
      });
    });
  }

  /* ——— Redes e contato (nova aba ou ancoragem local: hit síncrono costuma bastar) ——— */

  bindEngagementClicks(".site-footer__social-link--linkedin", "click_linkedin", {
    engagement_surface: "footer",
    engagement_detail: "perfil_linkedin",
  });
  bindEngagementClicks(".site-footer__social-link--instagram", "click_instagram", {
    engagement_surface: "footer",
    engagement_detail: "perfil_instagram",
  });
  bindEngagementClicks(".site-footer__social-link--github", "click_github", {
    engagement_surface: "footer",
    engagement_detail: "perfil_github",
  });
  bindEngagementClicks(".contact-whatsapp", "click_whatsapp", {
    engagement_surface: "contact",
    engagement_detail: "contato_whatsapp",
  });

  /* ——— Menu principal ——— */

  var headerNav = document.getElementById("headerNav");
  if (headerNav) {
    headerNav.addEventListener("click", function (e) {
      var t = e.target;
      if (!t || typeof t.closest !== "function") return;
      var link = t.closest("a[href]");
      if (!link || !headerNav.contains(link)) return;

      var detail = menuEngagementDetail(link.getAttribute("href") || "");
      var payload = {
        engagement_surface: "header_nav",
        engagement_detail: detail,
      };

      trackMenuLinkWithNavigationGuard(e, link, payload);
    });
  }

  /* ——— Menu mobile: estado após o handler inline (registado antes deste script) ——— */

  var menuToggle = document.getElementById("menuToggle");
  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      var aberto = menuToggle.getAttribute("aria-expanded") === "true";
      trackEvent("click_menu", {
        engagement_surface: "header_nav",
        engagement_detail: aberto ? "menu_mobile_aberto" : "menu_mobile_fechado",
      });
    });
  }

  /* ——— Projetos (delegação) ——— */

  var projectsCarousel = document.getElementById("projectsCarousel");
  if (projectsCarousel) {
    projectsCarousel.addEventListener("click", function (e) {
      var t = e.target;
      if (!t || typeof t.closest !== "function") return;
      var cardLink = t.closest("a.project-card__link[data-ga-project]");
      if (!cardLink || !projectsCarousel.contains(cardLink)) return;

      var projectId = cardLink.getAttribute("data-ga-project");
      if (!projectId) return;

      trackEvent("click_projeto", {
        engagement_surface: "projects_section",
        engagement_detail: projectId,
      });
    });
  }
})();
