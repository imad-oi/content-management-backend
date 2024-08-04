const crypto = require('crypto');

const hashParagraph = (paragraph) => {
  return crypto.createHash('md5').update(paragraph).digest('hex');
};

const detectDuplicates = (text) => {
  const paragraphs = text.split('\n\n');
  const hashes = new Set();
  const duplicates = [];

  paragraphs.forEach((paragraph, index) => {
    const hash = hashParagraph(paragraph);
    if (hashes.has(hash)) {
      duplicates.push({ index, paragraph });
    } else {
      hashes.add(hash);
    }
  });

  return duplicates;
};

module.exports = { detectDuplicates };