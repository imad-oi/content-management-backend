const crypto = require('crypto');

const hashParagraph = (paragraph) => {
  return crypto.createHash('md5').update(paragraph).digest('hex');
};

const generateShingles = (text, k = 5) => {
  const words = text.toLowerCase().split(/\s+/);
  const shingles = new Set();
  for (let i = 0; i <= words.length - k; i++) {
    const shingle = words.slice(i, i + k).join(' ');
    shingles.add(hashParagraph(shingle));
  }
  return shingles;
};

const jaccardSimilarity = (set1, set2) => {
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
};

const detectSimilarSections = (text1, text2, similarityThreshold = 0.8) => {
  const shingles1 = generateShingles(text1);
  const shingles2 = generateShingles(text2);
  const similarity = jaccardSimilarity(shingles1, shingles2);
  return similarity >= similarityThreshold && similarity < 1.0 ; // Exclude exact matches
};

const detectDuplicatesInText = (text) => {
  // First, split by newlines
  let paragraphs = text.split(/\n+/);
  
  // Then, for each paragraph, split by periods if it's a long paragraph
  paragraphs = paragraphs.flatMap(para => {
    if (para.length > 100) {
      return para.split(/\.(?=\s)/).map(sentence => sentence.trim()).filter(Boolean);
    }
    return para;
  });
  const hashes = new Map();
  const duplicates = [];

  paragraphs.forEach((paragraph, index) => {
    const hash = hashParagraph(paragraph);
    if (hashes.has(hash)) {
      duplicates.push({ index, paragraph, originalIndex: hashes.get(hash), type : 'exact' });
    } else {
      hashes.set(hash, index);
    }
  });

  // Detect similar sections
  for (let i = 0; i < paragraphs.length; i++) {
    for (let j = i + 1; j < paragraphs.length; j++) {
      if (detectSimilarSections(paragraphs[i], paragraphs[j])) {
        duplicates.push({ 
          index: j, 
          paragraph: paragraphs[j], 
          originalIndex: i, 
          type: 'similar' 
        });
      }
    }
  }

  return { hashes, duplicates };
};

module.exports = { hashParagraph, detectDuplicatesInText, detectSimilarSections };