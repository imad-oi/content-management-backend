const { distance } = require('fastest-levenshtein');

const compareContent = (storedContent, crawledContent) => {
  const storedParagraphs = storedContent.split('\n\n');
  const crawledParagraphs = crawledContent.split('\n\n');
  const similarities = [];

  storedParagraphs.forEach((storedParagraph, storedIndex) => {
    crawledParagraphs.forEach((crawledParagraph, crawledIndex) => {
      const similarityScore = 1 - distance(storedParagraph, crawledParagraph) / Math.max(storedParagraph.length, crawledParagraph.length);
      if (similarityScore > 0.8) {
        similarities.push({ storedIndex, crawledIndex, similarityScore });
      }
    });
  });

  return similarities;
};

module.exports = { compareContent };