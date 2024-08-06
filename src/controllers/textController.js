const TextEntry = require('../models/TextEntry');
const duplicateDetectionService = require('../services/duplicateDetectionService');

exports.submitText = async (req, res) => {
  try {
    const { content } = req.body;
    const { internalDuplicates, externalDuplicates } = await duplicateDetectionService.detectDuplicatesAcrossEntries(content);
    
    const textEntry = new TextEntry({ 
      content,
      duplicates: {
        internal: internalDuplicates,
        external: externalDuplicates
      }
    });
    await textEntry.save();

    res.json({
      uuid: textEntry.uuid,
      internalDuplicates,
      externalDuplicates
    });
  } catch (error) {
    console.error('Error in text submission:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getTextByUuid = async (req, res) => {
  try {
    const textEntry = await TextEntry.findOne({ uuid: req.params.uuid });
    if (!textEntry) {
      return res.status(404).json({ error: 'Text entry not found' });
    }
    res.json(textEntry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllTexts = async (req, res) => {
  try {
    const textEntries = await TextEntry.find();
    res.json(textEntries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};