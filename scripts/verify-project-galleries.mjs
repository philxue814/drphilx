import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const galleryRoot = path.join(root, "public", "projects", "gallery");

const slugs = [
  "guildford-landing",
  "ai-seo",
  "social-automation",
  "coverage-system",
  "options-alerts",
  "childrens-books",
  "video-cleaner",
  "fax-summarizer",
];

let ok = true;

for (const slug of slugs) {
  const dir = path.join(galleryRoot, slug);
  if (!fs.existsSync(dir)) {
    console.error(`MISSING directory: ${slug}`);
    ok = false;
    continue;
  }

  const files = fs
    .readdirSync(dir)
    .filter((name) => fs.statSync(path.join(dir, name)).isFile())
    .sort();

  if (files.length !== 4) {
    console.error(`FAIL ${slug}: expected 4 files, found ${files.length}`);
    ok = false;
    continue;
  }

  console.log(`OK ${slug}: ${files.join(", ")}`);
}

if (!ok) {
  process.exit(1);
}

console.log(`\nAll ${slugs.length} projects have 4 gallery photos.`);