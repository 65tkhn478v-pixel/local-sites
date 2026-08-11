import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { generateSite } from "./server/generateSite.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Racine du repository (un niveau au-dessus de dashboard/), là où vivent
// templates/ et prospects/.
const repoRoot = path.resolve(__dirname, "..");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

/**
 * Plugin dev-only (aucun effet en build/preview) qui :
 * 1. expose POST /api/generate-site pour générer réellement le site d'un
 *    prospect à partir de templates/business/ (voir server/generateSite.js) ;
 * 2. sert /prospects/** et /templates/** directement depuis le disque, pour
 *    que le bouton "Voir le site" ouvre le site généré sans avoir à lancer
 *    un second serveur statique.
 *
 * Tout reste local : aucun backend externe, aucune base de données, aucun
 * appel réseau — uniquement le serveur de dev Vite qui tourne déjà.
 */
function localSiteGeneratorPlugin() {
  return {
    name: "local-site-generator",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method === "POST" && req.url === "/api/generate-site") {
          try {
            const prospect = await readJsonBody(req);
            const result = generateSite(prospect, { repoRoot });
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(result));
          } catch (err) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: err.message || "Erreur inconnue" }));
          }
          return;
        }

        if (
          req.method === "GET" &&
          (req.url.startsWith("/prospects/") || req.url.startsWith("/templates/"))
        ) {
          const urlPath = decodeURIComponent(req.url.split("?")[0]);
          const filePath = path.normalize(path.join(repoRoot, urlPath));

          if (!filePath.startsWith(repoRoot)) {
            next();
            return;
          }

          fs.readFile(filePath, (err, content) => {
            if (err) {
              next();
              return;
            }
            res.setHeader(
              "Content-Type",
              MIME_TYPES[path.extname(filePath)] || "application/octet-stream"
            );
            res.end(content);
          });
          return;
        }

        next();
      });
    },
  };
}

// Dashboard interne — V1 données locales uniquement, aucun backend externe.
// Le plugin localSiteGeneratorPlugin() ajoute uniquement de la génération de
// fichiers locale (voir server/generateSite.js) — pas d'IA, pas d'API
// Anthropic, pas de base de données, pas de Cloudflare/GitHub.
export default defineConfig({
  plugins: [react(), localSiteGeneratorPlugin()],
  server: {
    port: 5173,
  },
});
