/**
 * @deprecated Legacy root application prototype.
 * NOTE: The canonical production backend is located in backend/src/app.js
 * and deployed via railway.toml ("cd backend && npm start").
 * This file is retained with full security middleware for backward compatibility.
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

// --- Route Imports ---
const authRoutes = require("./routes/authroutes");
const farmerRoutes = require("./routes/farmerroutes");
const productRoutes = require("./routes/productroutes"); 
const consumerRoutes = require("./routes/consumerroutes");
const adminRoutes = require("./routes/adminroutes");

const app = express();

// --- Global Middleware ---
app.use(helmet());
app.use(cors());
app.use(express.json());

// --- Health / Test Route ---
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        message: "Server is healthy",
        note: "Legacy entrypoint. Canonical backend is at backend/src/app.js"
    });
});

// --- API Route Mounting ---
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/farmers", farmerRoutes);
app.use("/api/v1/products", productRoutes); 
app.use("/api/v1/consumers", consumerRoutes);
app.use("/api/v1/admin", adminRoutes);

module.exports = app;
