require("dotenv").config();
require("./db");

const express = require("express");
const cors = require('cors');
const { client, loginCounter, httpMetricsMiddleware } = require('./metrics.cjs');
const app = express();

app.use(cors({ origin: '*' }));
app.use(httpMetricsMiddleware);

// Config middleware
require("./config")(app);

// Health check
app.get("/api/auth", (req, res) => res.json("Auth Server UP!"));

// Routes
const authRoutes = require("./routes/auth.routes");
const UsersRoutes = require("./routes/users.routes");

// Increment login counter in login route
authRoutes.post("/login", async (req, res, next) => {
  loginCounter.inc();
  next();
});

// Attach routes
app.use("/api/auth", authRoutes);
app.use("/api/auth/users", UsersRoutes);

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// Error handling
require("./error-handling")(app);

module.exports = app;
