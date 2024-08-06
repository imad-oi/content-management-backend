const express = require('express');
const connectDB = require('./config/database');
const TextEntry = require('./models/TextEntry');
const { crawlWebsite } = require('./utils/webCrawler');
const { compareContent } = require('./utils/contentComparison');

const textRoutes = require('./routes/textRoutes');


require('dotenv').config();

const app = express();
connectDB();

app.use(express.json());

// use text routes
app.use('/api',textRoutes)


// Crawl and compare
app.post('/api/compare', async (req, res) => {
  try {
    const { uuid, url } = req.body;
    console.log('uuid', uuid , 'url', url);
    const textEntry = await TextEntry.findOne({ uuid });
    if (!textEntry) {
      return res.status(404).json({ error: 'Text entry not found' });
    }
    const crawledContent = await crawlWebsite(url);
    const similarities = compareContent(textEntry.content, crawledContent);
    res.json({ similarities });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));