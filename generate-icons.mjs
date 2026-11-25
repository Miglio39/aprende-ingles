import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const svgPath = path.resolve("public/favicon.svg");
const svgBuffer = fs.readFileSync(svgPath);

const outputs = [
  { file: "public/icon-192.png", size: 192 },
  { file: "public/icon-512.png", size: 512 },
  { file: "public/apple-touch-icon.png", size: 180 },
];

for (const { file, size } of outputs) {
  await sharp(svgBuffer).resize(size, size).png().toFile(path.resolve(file));
  console.log(`Generado: ${file} (${size}x${size})`);
}
