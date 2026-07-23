import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "public", "icon.png");
const ICONS_DIR = path.join(ROOT, "public", "icons");

const BRAND_NAVY = "#0E3863";

const STANDARD_SIZES = [16, 32, 48, 64, 96, 128, 180, 192, 256, 384, 512];

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function generateStandardIcon(size) {
  const buffer = await sharp(SRC)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await writeFile(path.join(ICONS_DIR, `icon-${size}x${size}.png`), buffer);
  return buffer;
}

async function generateMaskableIcon(size) {
  // Maskable icons need the artwork inside a ~66% "safe zone" on a solid background.
  const inner = Math.round(size * 0.65);
  const logo = await sharp(SRC)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const buffer = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BRAND_NAVY,
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toBuffer();

  await writeFile(path.join(ICONS_DIR, `maskable-icon-${size}x${size}.png`), buffer);
}

async function generateAppleTouchIcon() {
  // Apple touch icons look best on an opaque background.
  const size = 180;
  const inner = Math.round(size * 0.78);
  const logo = await sharp(SRC)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const buffer = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: "#FFFFFF",
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toBuffer();

  await writeFile(path.join(ROOT, "public", "apple-touch-icon.png"), buffer);
}

async function generateFavicoIco() {
  const sizes = [16, 32, 48];
  const buffers = await Promise.all(
    sizes.map((size) =>
      sharp(SRC)
        .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()
    )
  );
  const ico = await pngToIco(buffers);
  await writeFile(path.join(ROOT, "app", "favicon.ico"), ico);
}

async function main() {
  await ensureDir(ICONS_DIR);

  await Promise.all(STANDARD_SIZES.map(generateStandardIcon));
  await Promise.all([512, 192].map(generateMaskableIcon));
  await generateAppleTouchIcon();
  await generateFavicoIco();

  console.log("Generated favicon + PWA icon set in public/icons, public/apple-touch-icon.png and app/favicon.ico");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
