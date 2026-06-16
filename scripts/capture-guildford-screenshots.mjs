import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "projects", "gallery", "guildford-landing");
const site = "https://guildfordeyeclinic.ca";

fs.mkdirSync(outDir, { recursive: true });

const shots = [
  {
    file: "01.jpg",
    viewport: { width: 1440, height: 900 },
    fullPage: false,
    prepare: async (page) => {
      await page.goto(site, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(1200);
    },
  },
  {
    file: "02.jpg",
    viewport: { width: 1440, height: 900 },
    fullPage: false,
    prepare: async (page) => {
      await page.goto(`${site}/#services`, { waitUntil: "networkidle", timeout: 60000 });
      await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.85));
      await page.waitForTimeout(1000);
    },
  },
  {
    file: "03.jpg",
    viewport: { width: 1440, height: 900 },
    fullPage: false,
    prepare: async (page) => {
      await page.goto(`${site}/#contact`, { waitUntil: "networkidle", timeout: 60000 });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
    },
  },
  {
    file: "04.jpg",
    viewport: { width: 390, height: 844 },
    fullPage: false,
    prepare: async (page) => {
      await page.goto(site, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(1200);
    },
  },
];

const browser = await chromium.launch({ headless: true });

try {
  for (const shot of shots) {
    const page = await browser.newPage({
      viewport: shot.viewport,
      deviceScaleFactor: 2,
    });
    await shot.prepare(page);
    await page.screenshot({
      path: path.join(outDir, shot.file),
      fullPage: shot.fullPage,
      type: "jpeg",
      quality: 90,
    });
    await page.close();
    console.log(`Captured ${shot.file}`);
  }
} finally {
  await browser.close();
}

console.log(`Guildford screenshots saved to ${outDir}`);