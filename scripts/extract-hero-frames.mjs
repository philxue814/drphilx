import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public", "hero", "frames");
const defaultVideo = path.join(ROOT, "public", "hero", "hero-video-2k.mp4");
const video = process.argv[2] || defaultVideo;

if (!fs.existsSync(video)) {
  console.error("Video not found:", video);
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });

for (const file of fs.readdirSync(OUT)) {
  if (file.startsWith("frame_")) fs.unlinkSync(path.join(OUT, file));
}

console.log("Extracting high-quality hero scrub frames from", path.basename(video));
execSync(
  [
    "ffmpeg -y",
    `-i "${video}"`,
    '-vf "fps=24"',
    "-q:v 2",
    `"${path.join(OUT, "frame_%04d.jpg")}"`,
  ].join(" "),
  { stdio: "inherit", cwd: ROOT }
);

const count = fs.readdirSync(OUT).filter((f) => f.endsWith(".jpg")).length;
const bytes = fs
  .readdirSync(OUT)
  .filter((f) => f.endsWith(".jpg"))
  .reduce((sum, f) => sum + fs.statSync(path.join(OUT, f)).size, 0);

console.log(
  `\n${count} frames in public/hero/frames/ (${(bytes / 1024 / 1024).toFixed(1)} MB)`
);