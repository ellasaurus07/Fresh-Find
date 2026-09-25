"""FreshFind asset pipeline: cut transparent sprites out of the supplied sheets,
and compose market photographs from the supplied greenhouse/market paintings.
Run once: python3 tools/build_assets.py  (needs Pillow + scipy)."""
from PIL import Image, ImageEnhance, ImageFilter
import numpy as np
from scipy import ndimage
import os
UP='/mnt/user-data/uploads/'
OUT='public/assets/'
sheets={'big':'BOTANICAL_ASSETS_png.png','small':'BOTANICAL_ASSETS_png1.png','kit':'PLANT_ASSETS_png.png'}
S={k:Image.open(UP+v).convert('RGBA') for k,v in sheets.items()}

def clean(im, dil=7):
    a=np.array(im); m=a[...,3]>18
    lab,n=ndimage.label(ndimage.binary_dilation(m,iterations=dil))
    if n>1:
        sizes=ndimage.sum(m,lab,range(1,n+1)); keep=np.argmax(sizes)+1
        a[...,3]=np.where(lab==keep,a[...,3],0)
    im=Image.fromarray(a); bb=im.getbbox(); return im.crop(bb)

def sprite(sheet, box, name, maxw=None, dil=7, keep_all=False):
    im=S[sheet].crop(box)
    im = im.crop(im.getbbox()) if keep_all else clean(im,dil)
    if maxw and im.width>maxw: im=im.resize((maxw,round(im.height*maxw/im.width)),Image.LANCZOS)
    im.save(OUT+'sprites/'+name+'.webp','WEBP',quality=84,method=6)
    return im.size

# locate sprites by their bounding boxes in the sheets (from connected components)
def comps(sheet):
    a=np.array(S[sheet]); m=a[...,3]>20
    lab,n=ndimage.label(ndimage.binary_dilation(m,iterations=4))
    out=[]
    for s in ndimage.find_objects(lab):
        h=s[0].stop-s[0].start; w=s[1].stop-s[1].start
        if h*w>=1500: out.append((s[0].start,s[1].start,h,w))
    out.sort(); return [(x,y,x+w,y+h) for (y,x,h,w) in out]
C={k:comps(k) for k in S}
pick={
 'big':{0:'hang-pothos',2:'monstera-pot',3:'peace-lily',8:'hang-fern',12:'basket-plant',13:'palm',14:'hang-pearls',15:'hang-ivy',16:'monstera-small',6:'olive-tree'},
 'small':{5:'herb-rosemary',6:'herb-chives',7:'herb-basil',8:'herb-mint',10:'herb-thyme',11:'herb-parsley',21:'seedlings',33:'daisies',35:'geranium',40:'foliage-bush',41:'crate-planter',42:'planter-box',37:'fern-bush',29:'lily-pot',30:'orchid'},
 'kit':{0:'sprig-1',1:'sprig-2',3:'monstera-leaf',5:'sprig-3',7:'sprig-4',8:'leaf-big',10:'sprig-5',12:'daisy',19:'veg-crate',20:'rosemary-pots',21:'veg-basket',22:'chalkboard',23:'note-cream',24:'note-sage',25:'note-heart',26:'note-lined',28:'arrow-sign',29:'washi',42:'frame-leafy',43:'wreath',46:'flower-sprig',48:'divider-leaf',50:'divider-daisy',36:'dash-path',14:'potted-monstera',18:'potted-plant',2:'hang-pot-kit'},
}
sizes={}
for sh,mp in pick.items():
    for i,name in mp.items():
        sizes[name]=sprite(sh,C[sh][i],name,maxw=520,dil=3 if name in ('palm','basket-plant','hang-pearls') else 7)
# merged regions cut by hand from the UI-kit sheet (1448x1086 coordinates)
manual={'vine-garland':(955,15,1360,196),'market-stall':(1058,208,1290,398),'sign-wood':(38,420,305,535),'sign-cream':(318,418,578,538),'glass-arch':(12,618,472,992),'strawberry-no':(0,0,1,1)}
for name,box in manual.items():
    if name.startswith('strawberry'): continue
    sizes[name]=sprite('kit',box,name,maxw=620,keep_all=True)
# lavender + sunflower share a component on the small sheet
lav=C['small'][32]; x0,y0,x1,y1=lav; mid=(x0+x1)//2
sizes['lavender']=sprite('small',(x0,y0,mid,y1),'lavender',dil=3)
sizes['sunflower']=sprite('small',(mid,y0,x1,y1),'sunflower',dil=3)
print(len(sizes),'sprites'); import json; json.dump(sizes,open('tools/sprite_sizes.json','w'),indent=0)

# ---------- environment backdrops ----------
bg1=Image.open(UP+'GREENHOUSE_BACKGROUND_02_png.png').convert('RGB')  # greenhouse, curved wall
bg2=Image.open(UP+'GREENHOUSE_BACKGROUND_01_png.png').convert('RGB')  # market arch
for im,name in [(bg1,'greenhouse'),(bg2,'market-arch')]:
    im.save(OUT+f'env/{name}-1672.webp','WEBP',quality=80,method=6)
    im.resize((960,round(960*im.height/im.width)),Image.LANCZOS).save(OUT+f'env/{name}-960.webp','WEBP',quality=78,method=6)
    im.resize((64,36)).filter(ImageFilter.GaussianBlur(2)).save(OUT+f'env/{name}-lqip.webp','WEBP',quality=50)

# ---------- market photographs: crops of the painted market ----------
crops={
 'stall-sunflowers':(bg2,(0,330,600,780)),
 'stall-peppers':(bg2,(1130,360,1672,766)),
 'market-lane':(bg2,(380,0,1300,690)),
 'awning-lights':(bg2,(0,150,480,510)),
 'terrace-crates':(bg2,(900,560,1672,941)),
 'carrot-corner':(bg2,(0,600,520,941)),
 'flower-cart':(bg2,(1180,500,1672,869)),
 'tent-row':(bg2,(560,380,1160,830)),
 'village-view':(bg2,(640,330,1120,690)),
 'greenhouse-corner':(bg1,(0,360,600,810)),
 'greenhouse-stools':(bg1,(1090,430,1672,866)),
 'greenhouse-dome':(bg1,(260,20,1410,882)),
 'greenhouse-crates':(bg1,(0,590,470,941)),
}
def fit(im,w=720,h=540):
    r=w/h; iw,ih=im.size
    if iw/ih>r: nw=int(ih*r); im=im.crop(((iw-nw)//2,0,(iw-nw)//2+nw,ih))
    else: nh=int(iw/r); im=im.crop((0,(ih-nh)//2,iw,(ih-nh)//2+nh))
    return im.resize((w,h),Image.LANCZOS)
for name,(src,box) in crops.items():
    im=fit(src.crop(box))
    im=ImageEnhance.Sharpness(im).enhance(1.25)
    im.save(OUT+f'markets/{name}.webp','WEBP',quality=80,method=6)
    im.resize((360,270),Image.LANCZOS).save(OUT+f'markets/{name}-sm.webp','WEBP',quality=78,method=6)
print('crops',len(crops))
