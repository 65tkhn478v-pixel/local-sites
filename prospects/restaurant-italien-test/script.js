/**
 * La Bella Napoli — Ristorante & Pizzeria (Vieux-Lille)
 * JavaScript vanilla, sans dépendance. Toutes les fonctions sont défensives
 * (vérification d'existence des éléments) afin de ne jamais produire
 * d'erreur dans la console, même si le balisage venait à changer.
 */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  /* ---------- En-tête : ombre au scroll ---------- */
  function initHeaderScroll() {
    var header = document.getElementById("site-header");
    if (!header) return;

    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ---------- Navigation mobile ---------- */
  function initMobileNav() {
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    function closeNav() {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    function openNav() {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    }

    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      if (isOpen) closeNav();
      else openNav();
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 900) closeNav();
    });
  }

  /* ---------- Lien de navigation actif au scroll ---------- */
  function initActiveNav() {
    var navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
    if (!navLinks.length || !("IntersectionObserver" in window)) return;

    var map = {};
    navLinks.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      var section = document.getElementById(id);
      if (section) map[id] = link;
    });

    var ids = Object.keys(map);
    if (!ids.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            link.classList.remove("is-active");
          });
          var link = map[entry.target.id];
          if (link) link.classList.add("is-active");
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    ids.forEach(function (id) {
      observer.observe(document.getElementById(id));
    });
  }

  /* ---------- Animations au scroll (reveal) ---------- */
  function initReveal() {
    var selector = [
      ".section-head",
      ".about-visual",
      ".about-text",
      ".menu-card",
      ".gallery-item",
      ".review-card",
      ".hours-text",
      ".hours-table",
      ".location-map",
      ".location-card",
      ".contact-card",
      ".contact-cta",
    ].join(", ");

    var elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    if (!("IntersectionObserver" in window)) return;

    elements.forEach(function (el, index) {
      el.classList.add("reveal-init");
      el.style.transitionDelay = (index % 4) * 0.08 + "s";
    });

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- Horaires : jour courant ---------- */
  var DAY_LABELS = {
    0: "dimanche",
    1: "lundi",
    2: "mardi",
    3: "mercredi",
    4: "jeudi",
    5: "vendredi",
    6: "samedi",
  };

  function initHoursHighlight() {
    var table = document.getElementById("hours-table");
    var heroHours = document.getElementById("hero-today-hours");
    if (!table) return;

    var today = new Date().getDay();
    var rows = table.querySelectorAll("tr[data-day]");
    var todayHoursText = "";

    rows.forEach(function (row) {
      var day = parseInt(row.getAttribute("data-day"), 10);
      if (day === today) {
        row.classList.add("is-today");
        var cell = row.querySelector("td:last-child");
        todayHoursText = cell ? cell.textContent.trim() : "";
      }
    });

    if (heroHours) {
      var label = "Aujourd'hui (" + DAY_LABELS[today] + ")";
      if (!todayHoursText || /ferm/i.test(todayHoursText)) {
        heroHours.textContent = label + " : fermé";
      } else {
        heroHours.textContent = label + " : " + todayHoursText;
      }
    }
  }

  /* ---------- Année du footer ---------- */
  function initFooterYear() {
    var el = document.getElementById("footer-year");
    if (!el) return;
    el.textContent = String(new Date().getFullYear());
  }

  /* ---------- Repli si une image ne charge pas ---------- */
  function initImageFallback() {
    var images = document.querySelectorAll(
      ".hero-media img, .about-visual img, .menu-card-media img, .gallery-item img"
    );
    images.forEach(function (img) {
      img.addEventListener(
        "error",
        function () {
          var container = img.closest(
            ".hero-media, .about-visual, .menu-card-media, .gallery-item"
          );
          if (container) container.classList.add("img-broken");
        },
        { once: true }
      );
    });
  }

  /* ---------- Galerie : lightbox ---------- */
  function initLightbox() {
    var lightbox = document.getElementById("lightbox");
    var lightboxImg = document.getElementById("lightbox-img");
    var lightboxCaption = document.getElementById("lightbox-caption");
    var closeBtn = document.getElementById("lightbox-close");
    var items = document.querySelectorAll(".gallery-item");
    if (!lightbox || !lightboxImg || !closeBtn || !items.length) return;

    var lastFocused = null;

    function openLightbox(item) {
      var img = item.querySelector("img");
      if (!img) return;
      lastFocused = document.activeElement;
      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt || "";
      if (lightboxCaption) {
        lightboxCaption.textContent = item.getAttribute("data-caption") || "";
      }
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function closeLightbox() {
      if (lightbox.hidden) return;
      lightbox.hidden = true;
      document.body.style.overflow = "";
      lightboxImg.src = "";
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    }

    items.forEach(function (item) {
      item.addEventListener("click", function () {
        openLightbox(item);
      });
    });

    closeBtn.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeLightbox();
    });
  }

  ready(function () {
    initHeaderScroll();
    initMobileNav();
    initActiveNav();
    initReveal();
    initHoursHighlight();
    initFooterYear();
    initImageFallback();
    initLightbox();
  });
})();
