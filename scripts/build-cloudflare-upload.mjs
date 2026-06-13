import { execSync } from "child_process";
import { cpSync, existsSync, rmSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "out");
const uploadDir = join(root, "cloudflare-upload");

console.log("Building static site for Cloudflare Pages...\n");
execSync("npx next build", { stdio: "inherit", cwd: root, env: process.env });

if (!existsSync(outDir)) {
  throw new Error("Build finished but out/ was not created.");
}

if (existsSync(uploadDir)) {
  rmSync(uploadDir, { recursive: true, force: true });
}

cpSync(outDir, uploadDir, { recursive: true });

writeFileSync(
  join(uploadDir, "_headers"),
  [
    "/hero/*",
    "  Cache-Control: public, max-age=31536000, immutable",
    "/backscroll/*",
    "  Cache-Control: public, max-age=31536000, immutable",
    "/projects/*",
    "  Cache-Control: public, max-age=604800",
    "/*.mp4",
    "  Cache-Control: public, max-age=31536000, immutable",
  ].join("\n")
);

console.log("\nUpload folder ready:");
console.log(uploadDir);
console.log("\nCloudflare Pages → Create → Direct Upload → drag the cloudflare-upload folder.");