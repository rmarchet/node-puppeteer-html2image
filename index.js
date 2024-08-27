#!/usr/bin/env node
const puppeteer = require('puppeteer')

const args = process.argv.slice(2)
if (args.length !== 2) {
  console.error('Usage: node index.js <input.html> <output.xyz>')
  return
}

const HTML = __dirname + "/" + args[0]
const OUTFILE = args[1]

const sourcepath = `file://${HTML}`

const detectOS = (os) => {
  const platform = process.platform
  return platform === os
}

const launchOptions = {
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  ...(detectOS('darwin') ? { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' } : {})
}

async function generatePdf(err, data) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  // visit the page and wait till all asset & XHR calls are done.
  try {
    await page.goto(sourcepath, { waitUntil: 'networkidle2' })
    await page.setViewport({
      width: 2000,
      height: 4000,
    })
    await page.pdf({
      path: OUTFILE,
      format: 'A3',
      printBackground: true,
      margin: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      }
    })
    await browser.close()
    await console.log("[ DONE ]")
  } catch (e) {
    console.error(e)
  }
}

async function generatePng(err, data) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  try {
    await page.goto(sourcepath)
    await page.screenshot({ path: OUTFILE, fullPage: true })
    await browser.close()
    await console.log("[ DONE ]")
  } catch (e) {
    console.error(e)
  }
}

OUTFILE.includes(".pdf") && generatePdf()
OUTFILE.includes(".png") && generatePng()
