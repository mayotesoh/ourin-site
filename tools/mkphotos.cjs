// 提供写真をサイト用に最適化（幅1400px・JPEG品質82）
const sharp = require('sharp');
const path = require('path');
const SRC = 'C:/Users/mayonery/占いサイト/松山さん/画像・資料';
const OUT = 'public/images';
const jobs = [
  ['DSC07168_0.jpg', 'sales.jpg'],
  ['ef64d009-fb7e-4ee7-ade9-9201b654598b_0.png', 'telemarketing.jpg'],
  ['S__60678187.jpg', 'ourin-session.jpg'],
  ['S__60678189.jpg', 'ourin-cards.jpg'],
];
(async () => {
  for (const [src, out] of jobs) {
    const info = await sharp(path.join(SRC, src))
      .rotate()
      .resize({ width: 1400, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(OUT, out));
    console.log(out, info.width + 'x' + info.height, Math.round(info.size / 1024) + 'KB');
  }
})();
