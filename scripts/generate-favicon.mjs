import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const appDir = join(root, "src", "app");
const svg = readFileSync(join(appDir, "icon.svg"));

function buildIco(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const entries = [];
  let offset = 6 + count * 16;

  for (const { size, buffer } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map(({ buffer }) => buffer)]);
}

async function writePng(size, filename) {
  await sharp(svg).resize(size, size).png().toFile(join(appDir, filename));
}

async function writeIco() {
  const sizes = [16, 32, 48];
  const pngBuffers = await Promise.all(
    sizes.map(async (size) => ({
      size,
      buffer: await sharp(svg).resize(size, size).png().toBuffer(),
    }))
  );

  writeFileSync(join(appDir, "favicon.ico"), buildIco(pngBuffers));
}

await writePng(180, "apple-icon.png");
await writePng(512, "icon.png");
await writeIco();

console.log("Generated favicon.ico, icon.png, and apple-icon.png from icon.svg");