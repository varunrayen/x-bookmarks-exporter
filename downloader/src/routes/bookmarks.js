const { PrismaClient } = require('@prisma/client');
const express = require('express');
const BookmarkService = require('../services/bookmark-service');
const logger = require('../config/logger');

const router = express.Router();
const prisma = new PrismaClient();

router.post('/fetch', async (req, res) => {
  let fetchEntry = null;
  try {
    logger.info(`Bookmark fetch triggered at ${new Date().toISOString()}`);
    fetchEntry = await prisma.bookmarkFetchHistory.create({
      data: {
        status: 'STARTED',
        timestamp: new Date(),
      },
    });

    const result = await BookmarkService.fetchBookmarks();

    await prisma.bookmarkFetchHistory.update({
      data: {
        status: 'SUCCESS',
        timestamp: new Date(),
      },
      where: { id: fetchEntry.id },
    });
    res.json({ message: 'Bookmark fetch completed', result });
  } catch (error) {
    logger.error('Error fetching bookmarks:', error);

    if (fetchEntry) {
      await prisma.bookmarkFetchHistory.update({
        data: {
          status: 'FAILED',
          error: error?.message,
          timestamp: new Date(),
        },
        where: { id: fetchEntry.id },
      });
    }

    res.status(500).json({
      error: error?.message || 'Unknown error',
      message: 'Bookmark fetch failed',
      success: false,
    });
  }
});

module.exports = router;
