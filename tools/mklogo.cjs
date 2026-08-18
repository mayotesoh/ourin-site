const sharp = require('sharp');
const src = process.argv[2];
const outDir = process.argv[3];

(async () => {
  // 余白を落として、扱いやすいサイズに縮小
  const base = sharp(src).trim({ threshold: 20 }).resize({ width: 1100, withoutEnlargement: true });
  const { data, info } = await base
    .clone()
    .greyscale()
    .negate() // 墨の部分が白(255) = 不透明、紙の部分が黒(0) = 透明
    .raw()
    .toBuffer({ resolveWithObject: true });

  async function tint(hex, out) {
    await sharp({
      create: { width: info.width, height: info.height, channels: 3, background: hex },
    })
      .joinChannel(data, { raw: { width: info.width, height: info.height, channels: 1 } })
      .png({ compressionLevel: 9, palette: true, quality: 85 })
      .toFile(out);
  }

  await tint('#141414', `${outDir}/ourin-logo-ink.png`);
  await tint('#d4af6a', `${outDir}/ourin-logo-gold.png`);
  await tint('#ffffff', `${outDir}/ourin-logo-white.png`);
  console.log('size', info.width, 'x', info.height);
})();
