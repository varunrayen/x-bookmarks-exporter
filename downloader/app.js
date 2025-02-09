const Queue = require('bull');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const express = require('express');
const { fetchBookmarks } = require('./bookmarks');
// Initialize express app
const app = express();
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

// Create a queue
const bookmarkQueue = new Queue('bookmark-fetching', process.env.REDIS_URL);

bookmarkQueue.process(async (job) => {
  console.log('Running scheduled bookmark fetch:', new Date().toISOString());
  try {
    const result = await fetchBookmarks();
    return { result };
  } catch (error) {
    console.error('Scheduled fetch failed:', error);
    // Log additional error details if available
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    // Mark the job as failed
    throw new Error(`Bookmark fetch failed: ${error.message}`);
  }
});

bookmarkQueue.add({}, {
  repeat: {
    every: 60 * 1000 // 60 seconds in milliseconds
  }
});

// Add API endpoints
app.post('/api/bookmarks/fetch', async (req, res) => {
  try {
    console.log('Manual bookmark fetch triggered:', new Date().toISOString());
    const result = await fetchBookmarks();
    res.json({ success: true, message: 'Bookmark fetch completed', result });
  } catch (error) {
    console.error('Manual fetch failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Bookmark fetch failed', 
      error: error.message 
    });
  }
});

// Initialize Bull Board
const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [new BullAdapter(bookmarkQueue)],
  serverAdapter: serverAdapter,
});

// Mount the Bull Board UI
app.use('/admin/queues', serverAdapter.getRouter());

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bull Board is running on http://localhost:${PORT}/admin/queues`);
});

