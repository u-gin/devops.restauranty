const client = require('prom-client');
const User = require('./models/User.model');

// ----------------- User Gauge -----------------
const userCountGauge = new client.Gauge({
  name: 'users_total',
  help: 'Total number of users',
});

// Function to query and update user count
async function updateUserCount() {
  try {
    const count = await User.countDocuments();
    userCountGauge.set(count);
  } catch (error) {
    console.error('Error updating user count:', error);
  }
}

// Update every minute
const UPDATE_INTERVAL_MS = 60000;
setInterval(updateUserCount, UPDATE_INTERVAL_MS);
updateUserCount();

// ----------------- HTTP Counters -----------------
const totalHttpRequestsCounter = new client.Counter({
  name: 'http_requests_overall_total',
  help: 'Overall total number of HTTP requests',
});

const httpRequestsCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests with labels',
  labelNames: ['method', 'route', 'statusCode'],
});

function httpMetricsMiddleware(req, res, next) {
  res.on('finish', () => {
    const method = req.method;
    const route = req.originalUrl || req.url;
    const statusCode = res.statusCode.toString();

    httpRequestsCounter.labels(method, route, statusCode).inc();
    totalHttpRequestsCounter.inc();
  });
  next();
}

// ----------------- Custom Login Counter -----------------
const loginCounter = new client.Counter({
  name: 'auth_logins_total',
  help: 'Number of successful logins',
});

// ----------------- Exports -----------------
module.exports = {
  client,
  userCountGauge,
  totalHttpRequestsCounter,
  httpRequestsCounter,
  httpMetricsMiddleware,
  loginCounter,
};
