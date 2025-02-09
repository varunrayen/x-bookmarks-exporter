const express = require('express');
const { fetchBookmarks } = require('./bookmarks');
const app = express();

// Create versioned router
const v1Router = express.Router();
app.use('/api/v1', v1Router);

// Add API endpoints to versioned router
v1Router.post('/bookmarks/trigger-fetch', async (req, res) => {
  try {
    console.log('Bookmark fetch triggered:', new Date().toISOString());
    const result = await fetchBookmarks();
    res.json({ success: true, message: 'Bookmark fetch completed', result });
  } catch (error) {
    console.error('Bookmark fetch failed:', error);
    res.status(500).json({
      success: false,
      message: 'Bookmark fetch failed',
      error: error.message,
    });
  }
});

v1Router.get('/healthz', (req, res) => {
  res
    .status(200)
    .json({ status: 'OK', message: 'X-Marks API is running', uptime: process.uptime() });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
