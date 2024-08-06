/**
 * DuplicateDetectionService
 * 
 * This service provides functionality for detecting duplicate and similar content
 * within a single text entry and across multiple text entries stored in the database.
 * 
 * Key Features:
 * - Detects exact duplicates using hash comparison
 * - Identifies similar content using Jaccard similarity of text shingles
 * - Handles both internal duplicates (within a single text) and external duplicates (across multiple texts)
 * - Supports flexible text splitting, considering both newline and period-based separators
 * 
 * Main Methods:
 * - detectDuplicatesAcrossEntries(newText: string): Detects duplicates in new text against existing entries
 * - splitIntoParagraphs(text: string): Splits text into paragraphs or sentences for analysis
 * - updateDuplicateFlags(textEntryId: string, duplicates: object): Updates duplicate flags in the database
 * 
 * Duplicate Object Structure:
 * {
 *   internal: [
 *     {
 *       index: number,        // Position of the duplicate in the new text
 *       paragraph: string,    // The duplicate content
 *       originalIndex: number,// Position of the original occurrence in the new text
 *       type: 'exact' | 'similar'
 *     }
 *   ],
 *   external: [
 *     {
 *       sourceUuid: string,   // UUID of the source text entry
 *       sourceParagraphIndex: number, // Position of the duplicate in the source text
 *       paragraph: string,    // The duplicate content
 *       newTextIndex: number, // Position of the duplicate in the new text
 *       type: 'exact' | 'similar'
 *     }
 *   ]
 * }
 * 
 * Usage:
 * const duplicateService = new DuplicateDetectionService();
 * const { internalDuplicates, externalDuplicates } = await duplicateService.detectDuplicatesAcrossEntries(newText);
 * 
 * Note: This service relies on the TextEntry model and utility functions from duplicateDetection.js.
 * Ensure that the necessary dependencies are properly imported and configured.
 * 
 * @module DuplicateDetectionService
 */


const TextEntry = require('../models/TextEntry');
const { hashParagraph, detectDuplicatesInText, detectSimilarSections } = require('../utils/duplicateDetection');

class DuplicateDetectionService {
    async detectDuplicatesAcrossEntries(newText) {
        const { hashes: newHashes, duplicates: internalDuplicates } = detectDuplicatesInText(newText);
        const externalDuplicates = [];

        // Get all existing text entries
        const existingEntries = await TextEntry.find({}, 'uuid content');

        const newParagraphs = this.splitIntoParagraphs(newText);

        for (const entry of existingEntries) {
            const existingParagraphs = this.splitIntoParagraphs(entry.content);

            existingParagraphs.forEach((paragraph, index) => {
                const hash = hashParagraph(paragraph);
                if (newHashes.has(hash)) {
                    externalDuplicates.push({
                        sourceUuid: entry.uuid,
                        sourceParagraphIndex: index,
                        paragraph,
                        newTextIndex: newHashes.get(hash),
                        type: 'exact'
                    });
                }
            });

            // Detect similar sections
            for (let i = 0; i < existingParagraphs.length; i++) {
                for (let j = 0; j < newParagraphs.length; j++) {
                    if (detectSimilarSections(existingParagraphs[i], newParagraphs[j])) {
                        if (!externalDuplicates.some(d => d.sourceParagraphIndex === i && d.newTextIndex === j)) {
                            externalDuplicates.push({
                                sourceUuid: entry.uuid,
                                sourceParagraphIndex: i,
                                paragraph: existingParagraphs[i],
                                newTextIndex: j,
                                type: 'similar'
                            });
                        }
                    }
                }
            }
        }

        return { internalDuplicates, externalDuplicates };
    }

    async updateDuplicateFlags(textEntryId, duplicates) {
        await TextEntry.findByIdAndUpdate(textEntryId, { $set: { duplicates } });
    }

    splitIntoParagraphs(text) {
        // First, split by newlines
        let paragraphs = text.split(/\n+/);

        // Then, for each paragraph, split by periods if it's a long paragraph
        paragraphs = paragraphs.flatMap(para => {
            if (para.length > 100) { 
                return para.split(/\.(?=\s)/).map(sentence => sentence.trim()).filter(Boolean);
            }
            return para;
        });

        return paragraphs;
    }
}

module.exports = new DuplicateDetectionService();