// トップページの丸アイコン用に、正方形の画像を作る
const sharp = require('sharp');
const SRC = 'C:/Users/mayonery/占いサイト/松山さん/画像・資料';

(async () => {
  // Fortune Labo ロゴ：円形に切っても輪が欠けないよう、少し余白を足す
  const logo = sharp(`${SRC}/Fortune Labo.png`);
  const meta = await logo.metadata();
  const base = await logo.resize(700, 700, { fit: 'cover' }).png().toBuffer();
  await sharp(base)
    .extend({ top: 42, bottom: 42, left: 42, right: 42, background: { r: 15, g: 26, b: 52 } })
    .resize(600, 600)
    .png({ compressionLevel: 9 })
    .toFile('public/images/icon-community.png');
  console.log('icon-community.png（元:', meta.width + 'x' + meta.height, '）');

  // 写真は松山さんが中心に来るよう正方形で切り出す
  const jobs = [
    { src: 'telemarketing.jpg', out: 'icon-telemarketing.jpg', left: 700, top: 30, size: 540 },
    { src: 'sales.jpg', out: 'icon-sales.jpg', left: 800, top: 70, size: 580 },
  ];
  for (const j of jobs) {
    const info = await sharp(`public/images/${j.src}`)
      .extract({ left: j.left, top: j.top, width: j.size, height: j.size })
      .resize(600, 600)
      .jpeg({ quality: 86, mozjpeg: true })
      .toFile(`public/images/${j.out}`);
    console.log(j.out, Math.round(info.size / 1024) + 'KB');
  }
})();
