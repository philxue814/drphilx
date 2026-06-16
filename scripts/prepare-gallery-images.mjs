import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const photosDir = path.join(root, "photos");
const galleryRoot = path.join(root, "public", "projects", "gallery");

const VERTICAL = { width: 1080, height: 1920 };
const CONTAIN_FRAME = { width: 1080, height: 1440 };
const LANDSCAPE = { width: 1440, height: 900 };
const BG = { r: 5, g: 5, b: 5, alpha: 1 };

async function fitContain(inputPath, outputPath, frame) {
  const image = sharp(inputPath);
  const meta = await image.metadata();
  const scale = Math.min(frame.width / meta.width, frame.height / meta.height);
  const width = Math.max(1, Math.round(meta.width * scale));
  const height = Math.max(1, Math.round(meta.height * scale));
  const resized = await image.resize(width, height).toBuffer();

  await sharp({
    create: {
      width: frame.width,
      height: frame.height,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: resized, gravity: "center" }])
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(outputPath);
}

async function fitVertical(inputPath, outputPath) {
  await sharp(inputPath)
    .resize(VERTICAL.width, VERTICAL.height, {
      fit: "cover",
      position: "centre",
    })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(outputPath);
}

async function fitLandscape(inputPath, outputPath) {
  await sharp(inputPath)
    .resize(LANDSCAPE.width, LANDSCAPE.height, {
      fit: "cover",
      position: "centre",
    })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(outputPath);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function resolveInput(candidates) {
  for (const candidate of candidates) {
    const full = path.join(photosDir, candidate);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

const jobs = [
  {
    slug: "ai-seo",
    mode: "contain",
    files: [["SEO1.png", "01.jpg"]],
    fallbackFromGallery: ["02.jpg", "03.jpg", "04.jpg"],
  },
  {
    slug: "social-automation",
    mode: "vertical",
    files: [
      ["instagram1.png", "01.jpg"],
      ["instagram2.png", "02.jpg"],
      ["instagram3.png", "03.jpg"],
      ["instagram4.png", "04.jpg"],
    ],
  },
  {
    slug: "childrens-books",
    mode: "vertical",
    files: [
      ["book1.png", "01.jpg"],
      ["book2.png", "02.jpg"],
      ["book3.jpg", "03.jpg"],
      ["book4.jpg", "04.jpg"],
    ],
  },
  {
    slug: "coverage-system",
    mode: "contain",
    files: [
      ["coverage1.png", "01.jpg"],
      ["coverage2.png", "02.jpg"],
      ["coverage3.png", "03.jpg"],
    ],
    fallbackFromGallery: ["04.jpg"],
  },
  {
    slug: "options-alerts",
    mode: "contain",
    files: [
      ["swingtrade1.png", "01.jpg"],
    ],
    fallbackFromGallery: ["02.jpg", "03.jpg", "04.jpg"],
  },
];

for (const job of jobs) {
  const outDir = path.join(galleryRoot, job.slug);
  ensureDir(outDir);

  for (const [sourceName, outName] of job.files) {
    const input = resolveInput([sourceName]);
    if (!input) {
      console.warn(`Missing source photo: ${sourceName}`);
      continue;
    }

    const output = path.join(outDir, outName);
    if (job.mode === "vertical") {
      await fitVertical(input, output);
    } else {
      await fitContain(input, output, CONTAIN_FRAME);
    }
    console.log(`Prepared ${job.slug}/${outName}`);
  }

  if (job.fallbackFromGallery) {
    for (const outName of job.fallbackFromGallery) {
      const existing = path.join(outDir, outName);
      if (!fs.existsSync(existing)) continue;
      const temp = path.join(outDir, `_tmp_${outName}`);
      await fitContain(existing, temp, CONTAIN_FRAME);
      fs.renameSync(temp, existing);
      console.log(`Reformatted ${job.slug}/${outName}`);
    }
  }
}

console.log("Gallery image preparation complete.");