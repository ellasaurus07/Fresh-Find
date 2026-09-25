# Paints botanical planting over the figures in the market-arch plate so the
# homepage backdrop has no people. Uses the project's own sprite set.
from PIL import Image, ImageFilter, ImageEnhance
SP='public/assets/sprites/'
SRC='market-arch-original.png'  # the supplied market-arch painting (GREENHOUSE_BACKGROUND_01)
def put(base, name, cx, bottom, h, haze=0.0, blur=0.0, flip=False, sat=1.0):
    s = Image.open(SP+name+'.webp').convert('RGBA')
    bb = s.getbbox(); s = s.crop(bb)
    w = round(s.width * h / s.height)
    s = s.resize((w, h), Image.LANCZOS)
    if flip: s = s.transpose(Image.FLIP_LEFT_RIGHT)
    if sat != 1.0:
        a = s.getchannel('A'); rgb = ImageEnhance.Color(s.convert('RGB')).enhance(sat); s = rgb.convert('RGBA'); s.putalpha(a)
    if haze:
        a = s.getchannel('A'); tint = Image.new('RGB', s.size, (236, 232, 214))
        rgb = Image.blend(s.convert('RGB'), tint, haze); s = rgb.convert('RGBA'); s.putalpha(a)
    if blur: s = s.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(s, (round(cx - w/2), round(bottom - h)))

def build(out_full):
    im = Image.open(SRC).convert('RGBA')
    # ---- far end of the lane: a low planted border (small, hazy) ----
    far = [
        ('rosemary-pots', 600, 600, 70), ('foliage-bush', 650, 606, 62), ('lavender', 700, 602, 66),
        ('fern-bush', 752, 610, 62), ('herb-thyme', 800, 604, 62), ('rosemary-pots', 846, 610, 64),
        ('daisies', 893, 606, 60), ('herb-basil', 932, 606, 64), ('foliage-bush', 975, 612, 60),
    ]
    for n, x, b, h in far: put(im, n, x, b, h, haze=0.28, blur=0.7, sat=0.85)
    # second, nearer border row where the lane meets the stalls
    near = [
        ('fern-bush', 615, 580, 72), ('herb-rosemary', 646, 574, 54), ('foliage-bush', 783, 618, 60),
        ('herb-mint', 806, 617, 46), ('potted-plant', 1020, 590, 74), ('herb-basil', 1042, 578, 46),
        ('herb-thyme', 972, 604, 64), ('herb-parsley', 772, 594, 46),
        ('rosemary-pots', 944, 634, 76), ('herb-chives', 977, 632, 60),
    ]
    for n, x, b, h in near: put(im, n, x, b, h, haze=0.2, blur=0.55, sat=0.88)
    put(im, 'daisies', 956, 646, 42, haze=0.16, blur=0.5)
    # ---- mid-ground on both sides of the lane ----
    mid = [
        ('potted-plant', 520, 592, 96), ('lily-pot', 560, 596, 92),
        ('olive-tree', 1010, 610, 118), ('herb-parsley', 1060, 624, 80),
        ('peace-lily', 1112, 648, 176), ('palm', 1163, 624, 120),
    ]
    for n, x, b, h in mid: put(im, n, x, b, h, haze=0.14, blur=0.4, sat=0.92)
    # ---- left stall: plants on the counter ----
    left = [('basket-plant', 62, 548, 128), ('sunflower', 150, 548, 132), ('peace-lily', 228, 552, 140), ('potted-plant', 292, 546, 112)]
    for n, x, b, h in left: put(im, n, x, b, h, haze=0.06, blur=0.25)
    # ---- right stall: plants on the shelf ----
    put(im, 'monstera-small', 1525, 590, 150, haze=0.06, blur=0.25)
    im.convert('RGB').save(out_full)
build('market-arch-planted.png')  # then export 1672/960/lqip webp + market crops as in build_assets.py
