/**
 * Template "business" — charge un data.json et injecte les informations
 * du commerce dans la page. Aucune dépendance, aucun backend.
 *
 * Pour changer de commerce : ne touchez pas ce fichier, modifiez uniquement
 * le data.json ciblé (voir la balise <meta name="data-source"> dans index.html).
 */
(function () {
  "use strict";

  function getDataUrl() {
    var params = new URLSearchParams(window.location.search);
    if (params.get("data")) return params.get("data");

    var meta = document.querySelector('meta[name="data-source"]');
    if (meta && meta.content) return meta.content;

    return "data.json";
  }

  function getPath(obj, path) {
    return path.split(".").reduce(function (acc, key) {
      return acc && acc[key] !== undefined ? acc[key] : undefined;
    }, obj);
  }

  function renderTemplate(templateId, values) {
    var tpl = document.getElementById(templateId);
    if (!tpl) return "";
    var html = tpl.innerHTML;
    return html.replace(/\{\{(\w+)\}\}/g, function (match, key) {
      var value = values[key];
      return value === undefined || value === null ? "" : String(value);
    });
  }

  function applyDynamicColors(root) {
    root.querySelectorAll("[data-color]").forEach(function (el) {
      el.style.backgroundColor = el.getAttribute("data-color");
    });
  }

  function renderStars(container) {
    var stars = container.querySelectorAll("[data-stars]");
    stars.forEach(function (el) {
      var rating = parseInt(el.getAttribute("data-stars"), 10) || 0;
      var full = "★".repeat(Math.max(0, Math.min(5, rating)));
      var empty = "☆".repeat(Math.max(0, 5 - rating));
      el.textContent = full + empty;
      el.setAttribute("aria-label", rating + " sur 5 étoiles");
    });
  }

  function bindText(root, data) {
    root.querySelectorAll("[data-bind]").forEach(function (el) {
      var path = el.getAttribute("data-bind");
      var value = getPath(data, path);
      if (value !== undefined) el.textContent = value;
    });
  }

  function bindHref(root, data) {
    root.querySelectorAll("[data-bind-href]").forEach(function (el) {
      var path = el.getAttribute("data-bind-href");
      var prefix = el.getAttribute("data-href-prefix") || "";
      var value = getPath(data, path);
      if (value !== undefined) el.setAttribute("href", prefix + value);
    });
  }

  function bindLists(root, data) {
    root.querySelectorAll("[data-list]").forEach(function (container) {
      var path = container.getAttribute("data-list");
      var templateName = container.getAttribute("data-item-template");
      var items = getPath(data, path);
      if (!Array.isArray(items)) return;

      var html = items
        .map(function (item) {
          var values = typeof item === "object" && item !== null ? item : { value: item };
          return renderTemplate("tpl-" + templateName, values);
        })
        .join("");

      container.innerHTML = html;
    });
  }

  function render(data) {
    bindText(document, data);
    bindHref(document, data);
    bindLists(document, data);
    applyDynamicColors(document);
    renderStars(document);
  }

  function showError() {
    var main = document.querySelector("main");
    if (!main) return;
    var banner = document.createElement("div");
    banner.className = "data-error";
    banner.textContent =
      "Impossible de charger les informations du commerce (data.json introuvable ou invalide).";
    main.prepend(banner);
  }

  function init() {
    fetch(getDataUrl())
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(render)
      .catch(function (err) {
        console.error("Erreur de chargement des données du commerce :", err);
        showError();
      });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
