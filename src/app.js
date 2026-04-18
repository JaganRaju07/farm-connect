const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

// --- Corrected Route Imports ---
// Since app.js is already inside /src, just use "./routes/..."
const authRoutes = require("./routes/authroutes");
const farmerRoutes = require("./routes/farmerroutes");
const productRoutes = require("./routes/productroutes"); 
const consumerRoutes = require("./routes/consumerroutes");

const app = express();

// --- Global Middleware ---
app.use(helmet());
app.use(cors());
app.use(express.json());

// --- Health / Test Route ---
app.get("/health", (req, res) => {
    res.status(200).json({ status: "UP", message: "Server is healthy" });
});

// --- API Route Mounting ---
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/farmers", farmerRoutes);
app.use("/api/v1/products", productRoutes); 
app.use("/api/v1/consumers", consumerRoutes);

module.exports = app;