import { readdir, readFile, stat, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const FOLDERS = ["public/images/verbs", "public/images/animals"];
const VALID_EXTS = new Set([".jpg", ".jpeg", ".png"]);
const MAX_WIDTH = 800;
const QUALITY = 80;

let converted = 0;
let totalBefore = 0;
let totalAfter = 0;

for (const folder of FOLDERS) {
  let files = [];
  try {
    files = await readdir(folder);
  } catch {
    continue;
  }

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!VALID_EXTS.has(ext)) continue;

    const inputPath = path.join(folder, file);
    const baseName = path.basename(file, path.extname(file)).toLowerCase();
    const outputPath = path.join(folder, `${baseName}.webp`);

    const beforeStat = await stat(inputPath);
    const buffer = await readFile(inputPath);

    await sharp(buffer)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(outputPath);

    const afterStat = await stat(outputPath);
    await unlink(inputPath);

    totalBefore += beforeStat.size;
    totalAfter += afterStat.size;
    converted++;
  }
}

const toMB = (bytes) => (bytes / (1024 * 1024)).toFixed(2);
const savedPct = totalBefore
  ? Math.round(((totalBefore - totalAfter) / totalBefore) * 100)
  : 0;

console.log(`Listo: ${converted} imágenes convertidas a WebP.`);
console.log(
  `Peso total: ${toMB(totalBefore)} MB -> ${toMB(totalAfter)} MB (-${savedPct}%)`
);