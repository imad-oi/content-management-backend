const webCrawlerService = require('../services/webCrawlerService');
const duplicateDetectionService = require('../services/duplicateDetectionService');

exports.crawlAndCompare = async (req, res) => {
  try {
    const { urls } = req.body;

    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of URLs to crawl' });
    }

    const crawledContents = await webCrawlerService.crawlWebsites(urls);
    const comparisonResults = await duplicateDetectionService.compareCrawledContent(crawledContents);

    console.log('Comparison results:', comparisonResults);

    res.json(comparisonResults);
  } catch (error) {
    console.error('Error in crawl and compare:', error);
    res.status(500).json({ error: error.message });
  }
};