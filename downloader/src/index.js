const { PrismaClient } = require('@prisma/client');
const express = require('express');
const expressPino = require('express-pino-logger');
const morgan = require('morgan');

const logger = require('./config/logger');
const bookmarksRouter = require('./routes/bookmarks');

const prisma = new PrismaClient();
const app = express();

// Add pino logger middleware
// app.use(expressPino({ logger }));

// Add morgan logger middleware
app.use(morgan('dev'));

// API version configuration
const API_VERSION = 'v1';
const API_PREFIX = `/api/${API_VERSION}`;

// Add API endpoints
app.use(`${API_PREFIX}/bookmarks`, bookmarksRouter);

app.get(`${API_PREFIX}/healthz`, (req, res) => {
  res
    .status(200)
    .json({ message: 'X-Marks API is running', status: 'OK', uptime: process.uptime() });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});

// Gracefully shutdown Prisma Client
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
