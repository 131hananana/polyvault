/* Generates PWA icons (192/512, plus maskable) without any deps:
   draws a rounded-square gradient tile with a white "P" mark,
   encodes it as PNG using zlib. Run: node scripts/gen-icons.mjs */
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

function crc32(buf) {
  let c, table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([typeB, data])));
  return Buffer.concat([len, typeB, data, crc]);
}

function png(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

function drawIcon(size, { maskable = false } = {}) {
  const img = Buffer.alloc(size * size * 4);
  const pad = maskable ? 0 : 0; // full-bleed; safe-zone handled by scaling the mark
  const radius = maskable ? 0 : size * 0.22;
  const markScale = maskable ? 0.72 : 1; // shrink mark into maskable safe zone

  const inRounded = (x, y) => {
    if (maskable) return true;
    const r = radius, w = size;
    const cx = Math.min(Math.max(x, r), w - r);
    const cy = Math.min(Math.max(y, r), w - r);
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r || (x >= r && x <= w - r) || (y >= r && y <= w - r)
      ? !((x < r && y < r && (x - r) ** 2 + (y - r) ** 2 > r * r) ||
          (x > w - r && y < r && (x - (w - r)) ** 2 + (y - r) ** 2 > r * r) ||
          (x < r && y > w - r && (x - r) ** 2 + (y - (w - r)) ** 2 > r * r) ||
          (x > w - r && y > w - r && (x - (w - r)) ** 2 + (y - (w - r)) ** 2 > r * r))
      : false;
  };

  // "P" geometry in unit space, centered
  const inP = (ux, uy) => {
    // re-center and scale for maskable safe area
    const x = (ux - 0.5) / markScale + 0.5;
    const y = (uy - 0.5) / markScale + 0.5;
    const stem = x >= 0.33 && x <= 0.47 && y >= 0.22 && y <= 0.80;
    const cx = 0.47, cy = 0.385, ro = 0.175, ri = 0.075;
    const d2 = (x - cx) ** 2 + (y - cy) ** 2;
    const bowl = x >= cx && d2 <= ro * ro && d2 >= ri * ri;
    const bridgeTop = x >= 0.40 && x <= cx && y >= cy - ro && y <= cy - ri;
    const bridgeBot = x >= 0.40 && x <= cx && y >= cy + ri && y <= cy + ro;
    return stem || bowl || bridgeTop || bridgeBot;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      if (!inRounded(x, y)) { img[i + 3] = 0; continue; }
      const t = (x + y) / (2 * size);
      // gradient #6c5ce7 -> #8b7cf7
      let r = Math.round(0x6c + (0x8b - 0x6c) * t);
      let g = Math.round(0x5c + (0x7c - 0x5c) * t);
      let b = Math.round(0xe7 + (0xf7 - 0xe7) * t);
      if (inP((x + pad) / size, (y + pad) / size)) { r = g = b = 255; }
      img[i] = r; img[i + 1] = g; img[i + 2] = b; img[i + 3] = 255;
    }
  }
  return png(size, size, img);
}

writeFileSync("public/icon-192.png", drawIcon(192));
writeFileSync("public/icon-512.png", drawIcon(512));
writeFileSync("public/icon-maskable-512.png", drawIcon(512, { maskable: true }));
console.log("icons written");
