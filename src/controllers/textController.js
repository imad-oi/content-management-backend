const TextEntry = require('../models/TextEntry');
const duplicateDetectionService = require('../services/duplicateDetectionService');

exports.submitText = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id; 

    const { internalDuplicates, externalDuplicates } = await duplicateDetectionService.detectDuplicatesAcrossEntries(content,userId);
    
    const textEntry = new TextEntry({ 
      content,
      user:userId,
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
    const { uuid } = req.params;
    const userId = req.user.id;

    const textEntry = await TextEntry.findOne({ uuid, user: userId });

    if (!textEntry) {
      return res.status(404).json({ error: 'Text entry not found' });
    }

    res.json({
      uuid: textEntry.uuid,
      content: textEntry.content,
      createdAt: textEntry.createdAt,
      duplicates: textEntry.duplicates
    });
  } catch (error) {
    console.error('Error retrieving text entry:', error);
    res.status(500).json({ error: 'An error occurred while retrieving the text entry' });
  }
};

exports.getAllTexts = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const textEntries = await TextEntry.find({ user: userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });  // the newest entries first

    const total = await TextEntry.countDocuments({ user: userId });

    res.json({
      textEntries,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalEntries: total
    });
  } catch (error) {
    console.error('Error retrieving texts:', error);
    res.status(500).json({ error: 'An error occurred while retrieving texts' });
  }
};