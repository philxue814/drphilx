import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public", "hero");

const SIZES = [
  { w: 2560, h: 1440, suffix: "2k" },
  { w: 1920, h: 1080, suffix: "1080" },
];

fs.mkdirSync(OUT, { recursive: true });

const pythonScript = `
import os
from PIL import Image, ImageFilter

ROOT = r"${ROOT.replace(/\\/g, "\\\\")}"
OUT = r"${OUT.replace(/\\/g, "\\\\")}"

SIZES = [(2560, 1440, "2k"), (1920, 1080, "1080")]

def crop_16_9(img):
    w, h = img.size
    target = 16 / 9
    current = w / h
    if current > target:
        nw = int(h * target)
        left = (w - nw) // 2
        return img.crop((left, 0, left + nw, h))
    nh = int(w / target)
    top = (h - nh) // 2
    return img.crop((0, top, w, top + nh))

def process_image(src_name, base_name):
    src = os.path.join(ROOT, src_name)
    img = Image.open(src).convert("RGB")
    img = crop_16_9(img)
    for w, h, suffix in SIZES:
        up = img.resize((w, h), Image.Resampling.LANCZOS)
        up = up.filter(ImageFilter.UnsharpMask(radius=1.8, percent=130, threshold=2))
        jpg = os.path.join(OUT, f"{base_name}-{suffix}.jpg")
        webp = os.path.join(OUT, f"{base_name}-{suffix}.webp")
        up.save(jpg, quality=90, optimize=True, progressive=True)
        up.save(webp, quality=88, method=6)
        print(f"  {base_name}-{suffix}: {w}x{h}")

process_image("hero start.jpg", "hero-poster")
process_image("hero end.jpg", "hero-end")
print("Images done.")
`;

const pyPath = path.join(ROOT, "scripts", "_upscale_images.py");
fs.writeFileSync(pyPath, pythonScript);
execSync(`python "${pyPath}"`, { stdio: "inherit", cwd: ROOT });
fs.unlinkSync(pyPath);

// Symlink-style copies for simple paths used in components
for (const ext of ["webp", "jpg"]) {
  fs.copyFileSync(
    path.join(OUT, `hero-poster-2k.${ext}`),
    path.join(OUT, `hero-poster.${ext}`)
  );
  fs.copyFileSync(
    path.join(OUT, `hero-end-2k.${ext}`),
    path.join(OUT, `hero-end.${ext}`)
  );
}

const videoIn = path.join(ROOT, "hero video.mp4");
const vf4k =
  "scale=3840:2160:force_original_aspect_ratio=increase:flags=lanczos," +
  "crop=3840:2160," +
  "unsharp=7:7:0.55:7:7:0.0";
const vf2k =
  "scale=2560:1440:force_original_aspect_ratio=increase:flags=lanczos," +
  "crop=2560:1440," +
  "unsharp=7:7:0.65:7:7:0.0";
const vf1080 =
  "scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos," +
  "crop=1920:1080," +
  "unsharp=7:7:0.65:7:7:0.0";

const encode = (out, vf, { level = "4.2", crf = 16 } = {}) => {
  execSync(
    [
      "ffmpeg -y",
      `-i "${videoIn}"`,
      `-vf "${vf}"`,
      `-c:v libx264 -profile:v high -level ${level}`,
      `-crf ${crf} -preset slow -pix_fmt yuv420p`,
      "-movflags +faststart -an",
      `"${out}"`,
    ].join(" "),
    { stdio: "inherit", cwd: ROOT }
  );
};

console.log("Upscaling video to 3840x2160 (4K)...");
encode(path.join(OUT, "hero-video-4k.mp4"), vf4k, { level: "5.1", crf: 17 });

console.log("Upscaling video to 2560x1440...");
encode(path.join(OUT, "hero-video-2k.mp4"), vf2k);

console.log("Upscaling video to 1920x1080...");
encode(path.join(OUT, "hero-video.mp4"), vf1080);

// Default alias
fs.copyFileSync(
  path.join(OUT, "hero-video.mp4"),
  path.join(OUT, "hero-video-1080.mp4")
);

console.log("Extracting hero audio...");
execSync(
  [
    "ffmpeg -y",
    `-i "${videoIn}"`,
    "-vn -c:a copy",
    `"${path.join(OUT, "hero-audio.m4a")}"`,
  ].join(" "),
  { stdio: "inherit", cwd: ROOT }
);

console.log("Extracting scroll-scrub frame sequence...");
execSync("node scripts/extract-hero-frames.mjs", { stdio: "inherit", cwd: ROOT });

console.log("\nHero assets ready in public/hero/");