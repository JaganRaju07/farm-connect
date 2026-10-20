/**
 * Farm Connect Backend Entrypoint
 *
 * NOTE: The canonical production backend is located in backend/src/app.js
 * and deployed via railway.toml ("cd backend && npm start").
 * This root entrypoint forwards to the canonical backend to prevent dual-backend divergence.
 */
require("dotenv").config();

console.log("[Farm Connect] Canonical backend initializing from backend/src/app.js...");
const app = require("./backend/src/app");

module.exports = app;
