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
    /**
     * Detects duplicates in new text against existing entries
     * @param {string} newText - The new text to check for duplicates
     * @param {string} userId - The ID of the user submitting the text
     * @returns {Object} Object containing internal and external duplicates
     */
    async detectDuplicatesAcrossEntries(newText, userId) {
        // Detect internal duplicates within the new text
        const { hashes: newHashes, duplicates: internalDuplicates } = detectDuplicatesInText(newText);
        const externalDuplicates = [];

        // Fetch all existing text entries for the user
        const existingEntries = await TextEntry.find({ user: userId });

        // Split the new text into paragraphs
        const newParagraphs = this.splitIntoParagraphs(newText);

        // Compare new text with each existing entry
        for (const entry of existingEntries) {
            const existingParagraphs = this.splitIntoParagraphs(entry.content);

            // Check for exact matches
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
                        // Avoid duplicate entries if an exact match was already found
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

    /**
     * Updates duplicate flags in the database for a text entry
     * @param {string} textEntryId - The ID of the text entry to update
     * @param {Object} duplicates - The duplicate information to store
     */
    async updateDuplicateFlags(textEntryId, duplicates) {
        await TextEntry.findByIdAndUpdate(textEntryId, { $set: { duplicates } });
    }

    /**
     * Splits text into paragraphs or sentences for analysis
     * @param {string} text - The text to split
     * @returns {string[]} An array of paragraphs or sentences
     */
    splitIntoParagraphs(text) {
        // First, split by newlines
        let paragraphs = text.split(/\n+/);

        // Then, for each paragraph, split by periods if it's a long paragraph
        paragraphs = paragraphs.flatMap(para => {
            if (para.length > 100) {  // Only split long paragraphs
                // Split by period followed by a space, trim each sentence, and remove empty ones
                return para.split(/\.(?=\s)/).map(sentence => sentence.trim()).filter(Boolean);
            }
            return para;
        });

        return paragraphs;
    }

    /**
     * Compares crawled content against stored text entries
     * @param {Object[]} crawledContents - Array of objects containing crawled content
     * @returns {Object[]} Array of objects with duplicate information for each crawled content
     */
    async compareCrawledContent(crawledContents) {
        const results = [];

        for (const { url, content } of crawledContents) {
            if (!content) {
                results.push({ url, error: 'No content crawled' });
                continue;
            }
            // Detect duplicates for the crawled content
            const { duplicates } = await this.detectDuplicatesAcrossEntries(content);
            results.push({ url, duplicates });
        }

        return results;
    }
}

// Export a new instance of the DuplicateDetectionService
module.exports = new DuplicateDetectionService();