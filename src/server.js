const express = require('express');
const connectDB = require('./config/database');
const TextEntry = require('./models/TextEntry');
const { detectDuplicates } = require('./utils/duplicateDetection');
const { crawlWebsite } = require('./utils/webCrawler');
const { compareContent } = require('./utils/contentComparison');

require('dotenv').config();

const app = express();
connectDB();

app.use(express.json());

// Submit text
app.post('/api/text', async (req, res) => {
  try {
    const { content } = req.body;
    const duplicates = detectDuplicates(content);
    const textEntry = new TextEntry({ content });
    await textEntry.save();
    res.json({ uuid: textEntry.uuid, duplicates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve text
app.get('/api/text/:uuid', async (req, res) => {
  try {
    const textEntry = await TextEntry.findOne({ uuid: req.params.uuid });
    if (!textEntry) {
      return res.status(404).json({ error: 'Text entry not found' });
    }
    res.json(textEntry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve all texts
app.get('/api/text', async (req, res) => {
  try {
    const textEntries = await TextEntry.find();
    res.json(textEntries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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