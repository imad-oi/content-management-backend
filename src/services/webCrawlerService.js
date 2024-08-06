const puppeteer = require('puppeteer');

class WebCrawlerService {
    async crawlWebsites(urls) {
        const browser = await puppeteer.launch();
        const results = [];

        for (const url of urls) {
            try {
                const page = await browser.newPage();
                await page.goto(url, { waitUntil: 'networkidle0', timeout: 50000 });

                // Wait for the body to load
                await page.waitForSelector('body');

                const content = await page.evaluate(() => {
                    // Remove script and style elements
                    const scripts = document.getElementsByTagName('script');
                    const styles = document.getElementsByTagName('style');

                    for (const element of [...scripts, ...styles]) {
                        element.remove();
                    }
                    return document.body.innerText;
                });

                results.push({ url, content });
                await page.close();
            } catch (error) {
                console.error(`Error crawling ${url}:`, error);
                results.push({ url, error: error.message });
            }
        }

        await browser.close();
        return results;
    }
}

module.exports = new WebCrawlerService();