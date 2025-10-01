import puppeteer from 'puppeteer'

export async function getDownloadLink(videoUrl) {
  const browser = await puppeteer.launch({ headless: 'new' }) // <-- مهم
  const page = await browser.newPage()

  try {
    await page.goto('https://tuberipper.cc/', { waitUntil: 'networkidle2' })
    await page.type('#videoUrl', videoUrl)
    await page.click('#videoBtn')
    await page.waitForSelector('a.btn-download', { timeout: 15000 })
    const downloadLink = await page.$eval('a.btn-download', el => el.href)
    await browser.close()
    return downloadLink
  } catch (err) {
    console.error('[Puppeteer Error]', err)
    await browser.close()
    return null
  }
}