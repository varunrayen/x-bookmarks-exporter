const express = require('express');
const { fetchBookmarks } = require('./bookmarks');
const logger = require('./config/logger');
const expressPino = require('express-pino-logger');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

// Add pino logger middleware
app.use(expressPino({ logger }));

// API version configuration
const API_VERSION = 'v1';
const API_PREFIX = `/api/${API_VERSION}`;

// Add API endpoints
app.post(`${API_PREFIX}/bookmarks/fetch`, async (req, res) => {
  try {
    logger.info('Bookmark fetch triggered:', new Date().toISOString());
    const result = await fetchBookmarks();
    res.json({ success: true, message: 'Bookmark fetch completed', result });
  } catch (error) {
    logger.error('Bookmark fetch failed:', error);
    res.status(500).json({
      success: false,
      message: 'Bookmark fetch failed',
      error: error.message,
    });
  }
});

app.get(`${API_PREFIX}/healthz`, (req, res) => {
  res
    .status(200)
    .json({ status: 'OK', message: 'X-Marks API is running', uptime: process.uptime() });
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
