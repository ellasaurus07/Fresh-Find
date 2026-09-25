#!/usr/bin/env python3
"""
Normalise the nine painted-sprite produce images (herbs, sunflowers, lavender,
microgreens) onto the same 400x420 canvas, scale and ground shadow as the
generated SVG produce art, so every card / globe tile frames its picture the
same way.

  python3 tools/normalize_sprite_produce.py

Reads  public/assets/sprites/<sprite>.webp   (extracted from the concept sheet)
Writes public/assets/produce/<id>.webp       (400x420, art fitted to a fixed box)

The sunflower sprite was extracted with a hard vertical edge on its left (the
neighbouring plant was sliced off). Its left side is trimmed with a soft, curved
mask so no straight cut edge shows.
"""
import numpy as np
from PIL import Image, ImageFilter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SPR = ROOT / 'public/assets/sprites'
OUT = ROOT / 'public/assets/produce'
W, H = 400, 420
BOX_W, BOX_H = 250, 296          # art is fitted inside this box (matches the median SVG art)
BASE_Y = 372                     # art rests here, just above the ground shadow

ITEMS = {  # produce id -> sprite
    'basil': 'herb-basil', 'mint': 'herb-mint', 'rosemary': 'herb-rosemary',
    'thyme': 'herb-thyme', 'parsley': 'herb-parsley', 'chives': 'herb-chives',
    'sunflowers': 'sunflower', 'lavender': 'lavender', 'microgreens': 'seedlings',
}

def ground_shadow():
    """Reuse the soft ellipse shadow baked into the generated art (apple.webp)."""
    a = np.array(Image.open(OUT / 'apple.webp').convert('RGBA'))
    a[:372, :, :] = 0
    return Image.fromarray(a)

def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)

def clean_sunflower(im):
    a = np.array(im).astype(np.float32)
    h, w = a.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    # A curved, feathered silhouette on the damaged left half: it removes the
    # sliced-off neighbouring flower and turns the straight cut of the leaves
    # into a soft rounded edge. The right half is untouched.
    cx, cy, rx, ry = w * 0.60, h * 0.62, w * 0.50, h * 0.66
    d = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
    mask = 1 - smoothstep(0.86, 1.0, d)
    left = xx < cx
    a[..., 3] = np.where(left, a[..., 3] * mask, a[..., 3])
    out = Image.fromarray(a.astype(np.uint8))
    return out.crop(out.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox())

def build(pid, sprite):
    im = Image.open(SPR / f'{sprite}.webp').convert('RGBA')
    if sprite == 'sunflower':
        im = clean_sunflower(im)
    bb = im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    im = im.crop(bb)
    s = min(BOX_W / im.width, BOX_H / im.height)
    im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    canvas = ground_shadow()
    canvas.alpha_composite(im, ((W - im.width) // 2, BASE_Y - im.height))
    canvas.save(OUT / f'{pid}.webp', 'WEBP', quality=90, method=6)
    print(f'{pid:12} <- {sprite:14} art {im.width}x{im.height}')

if __name__ == '__main__':
    for pid, sprite in ITEMS.items():
        build(pid, sprite)
