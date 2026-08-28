# -*- coding: utf-8 -*-
"""イベント写真の顔をぼかす（YuNet + Haar の併用で取りこぼしを減らす）"""
import os
import sys

import cv2
import numpy as np

SRC = r'C:\Users\mayonery\占いサイト\松山さん\画像・資料'
OUT = r'C:\Users\mayonery\占いサイト\松山さん\ourin-site\public\images\community'
MODEL = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'yunet.onnx')  # 顔検出モデル（同じフォルダに同梱）

JOBS = [
    ('LINE_ALBUM_Instagram用　素材_260828_2_0.jpg', 'community-1.jpg'),
    ('558862.jpg', 'community-2.jpg'),
    ('558864_0.jpg', 'community-3.jpg'),
]

# 自動検出で拾えなかった箇所を手で指定（縮小後の座標: x, y, 幅, 高さ）
EXTRA = {
    'community-2.jpg': [
        (105, 620, 100, 95),    # 左手前のキャップの男性
        (150, 342, 200, 125),   # 左のモニター（個人写真と生年月日が写っている）
        (852, 298, 258, 130),   # 右のモニター
        (330, 995, 155, 58),    # 手前下のキャップの人
    ],
}

os.makedirs(OUT, exist_ok=True)


def detect_yunet(img, score=0.55):
    h, w = img.shape[:2]
    det = cv2.FaceDetectorYN.create(MODEL, "", (w, h), score, 0.3, 5000)
    det.setInputSize((w, h))
    _, faces = det.detect(img)
    boxes = []
    if faces is not None:
        for f in faces:
            x, y, fw, fh = f[:4]
            boxes.append((int(x), int(y), int(fw), int(fh)))
    return boxes


def detect_multi(img, score=0.62):
    """全体・拡大・タイル分割の3通りで検出して、小さい顔の取りこぼしを減らす"""
    boxes = []
    boxes += detect_yunet(img, score)

    # 2倍に拡大して検出（小さい顔対策）
    big = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    for (x, y, w, h) in detect_yunet(big, score):
        boxes.append((x // 2, y // 2, w // 2, h // 2))

    # 2x2のタイルに分けて検出（重なりを持たせる）
    H, W = img.shape[:2]
    for ty in range(2):
        for tx in range(2):
            x0 = int(tx * W * 0.42)
            y0 = int(ty * H * 0.42)
            x1 = min(W, x0 + int(W * 0.62))
            y1 = min(H, y0 + int(H * 0.62))
            tile = img[y0:y1, x0:x1]
            tile2 = cv2.resize(tile, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
            for (x, y, w, h) in detect_yunet(tile2, score):
                boxes.append((x0 + x // 2, y0 + y // 2, w // 2, h // 2))
    return boxes


def size_filter(boxes, W, H):
    """顔としてありえない大きさの枠を除く（誤検出で画面が広くぼける事故を防ぐ）"""
    lo = 0.012 * min(W, H)
    hi = 0.20 * W
    return [b for b in boxes if lo <= b[2] <= hi and lo <= b[3] <= hi * 1.4]


def merge(boxes, iou_thr=0.3):
    """重なった枠をまとめる"""
    out = []
    for b in sorted(boxes, key=lambda b: -b[2] * b[3]):
        x, y, w, h = b
        keep = True
        for (ox, oy, ow, oh) in out:
            ix = max(0, min(x + w, ox + ow) - max(x, ox))
            iy = max(0, min(y + h, oy + oh) - max(y, oy))
            inter = ix * iy
            if inter / float(min(w * h, ow * oh)) > iou_thr:
                keep = False
                break
        if keep:
            out.append(b)
    return out


def blur_regions(img, boxes, pad=0.35):
    h, w = img.shape[:2]
    for (x, y, bw, bh) in boxes:
        px, py = int(bw * pad), int(bh * pad)
        x0, y0 = max(0, x - px), max(0, y - py)
        x1, y1 = min(w, x + bw + px), min(h, y + bh + py)
        if x1 <= x0 or y1 <= y0:
            continue
        roi = img[y0:y1, x0:x1]
        # モザイク＋強いぼかしの二段で、確実に個人が分からないようにする
        small = cv2.resize(roi, (max(3, (x1 - x0) // 14), max(3, (y1 - y0) // 14)), interpolation=cv2.INTER_LINEAR)
        roi = cv2.resize(small, (x1 - x0, y1 - y0), interpolation=cv2.INTER_NEAREST)
        k = max(15, ((x1 - x0) // 4) | 1)
        roi = cv2.GaussianBlur(roi, (k, k), 0)
        # 楕円マスクで自然になじませる
        mask = np.zeros(roi.shape[:2], np.uint8)
        cv2.ellipse(mask, ((x1 - x0) // 2, (y1 - y0) // 2), ((x1 - x0) // 2, (y1 - y0) // 2), 0, 0, 360, 255, -1)
        mask = cv2.GaussianBlur(mask, (21, 21), 0).astype(np.float32) / 255.0
        mask = mask[:, :, None]
        img[y0:y1, x0:x1] = (roi * mask + img[y0:y1, x0:x1] * (1 - mask)).astype(np.uint8)
    return img


for src, out in JOBS:
    path = os.path.join(SRC, src)
    img = cv2.imread(path)
    if img is None:
        # 日本語パス対策
        img = cv2.imdecode(np.fromfile(path, dtype=np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        print('読み込み失敗:', src)
        sys.exit(1)

    # 長辺1400pxに縮小してから処理
    h, w = img.shape[:2]
    scale = 1400.0 / max(h, w)
    if scale < 1:
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

    H2, W2 = img.shape[:2]
    boxes = merge(size_filter(detect_multi(img), W2, H2)) + EXTRA.get(out, [])
    img = blur_regions(img, boxes)

    dest = os.path.join(OUT, out)
    ok, buf = cv2.imencode('.jpg', img, [int(cv2.IMWRITE_JPEG_QUALITY), 86])
    buf.tofile(dest)
    print(f'{out}: 検出 {len(boxes)}件 / {img.shape[1]}x{img.shape[0]} / {os.path.getsize(dest)//1024}KB')
