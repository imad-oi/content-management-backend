const puppeteer = require('puppeteer');

/**
 * WebCrawlerService
 * 
 * This service provides functionality to crawl websites and extract their text content.
 * It uses Puppeteer to launch a headless browser and navigate to specified URLs.
 */
class WebCrawlerService {
    /**
     * Crawls a list of websites and extracts their text content.
     * 
     * @param {string[]} urls - An array of URLs to crawl.
     * @returns {Promise<Array<{url: string, content: string}|{url: string, error: string}>>} 
     *          An array of objects containing the URL and either its content or an error message.
     */
    async crawlWebsites(urls) {
        const browser = await puppeteer.launch();
        const results = [];

        for (const url of urls) {
            try {
                // Open a new page
                const page = await browser.newPage();
                
                // Navigate to the URL and wait for network to be idle
                await page.goto(url, { waitUntil: 'networkidle0', timeout: 50000 });

                // Wait for the body element to be present
                await page.waitForSelector('body');

                // Extract the text content of the page
                const content = await page.evaluate(() => {
                    // Remove script and style elements to get only visible text
                    const scripts = document.getElementsByTagName('script');
                    const styles = document.getElementsByTagName('style');

                    for (const element of [...scripts, ...styles]) {
                        element.remove();
                    }
                    // Return the inner text of the body
                    return document.body.innerText;
                });

                // Add the result to the array
                results.push({ url, content });
                
                // Close the page to free up resources
                await page.close();
            } catch (error) {
                // Log and store any errors that occur during crawling
                console.error(`Error crawling ${url}:`, error);
                results.push({ url, error: error.message });
            }
        }

        // Close the browser
        await browser.close();
        
        // Return the results
        return results;
    }
}

// Export a new instance of the WebCrawlerService
module.exports = new WebCrawlerService();