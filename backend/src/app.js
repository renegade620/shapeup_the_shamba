require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const fieldRoutes = require("./routes/fields");
const updateRoutes = require("./routes/updates");
const userRoutes = require("./routes/users");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Global
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/fields", fieldRoutes);
app.use("/api/v1/updates", updateRoutes);
app.use("/api/v1/users", userRoutes);

// Health check
app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// Error handler
app.use(errorHandler);

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Shamba API running on http://localhost:${PORT}`);
});

module.exports = app;
