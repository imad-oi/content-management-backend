const puppeteer = require('puppeteer');

const crawlWebsite = async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const content = await page.evaluate(() => {
    return document.body.innerText;
  });

  await browser.close();
  return content;
};

module.exports = { crawlWebsite };