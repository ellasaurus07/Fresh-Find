// Demo-only ordering metadata + general storage guidance.
// No live inventory or payment is involved; prices are illustrative.

const UNIT = {
  strawberry: '500 g', blueberries: '250 g', fig: '500 g', grapes: '500 g', mulberries: '250 g',
  watermelon: 'each', melon: 'each', pumpkin: 'each', 'sweet-corn': '4 ears',
  'leafy-greens': 'bunch', lettuce: 'head', basil: 'bunch', mint: 'bunch', rosemary: 'bunch', thyme: 'bunch', parsley: 'bunch', chives: 'bunch', coriander: 'bunch', dill: 'bunch', jarjeer: 'bunch', purslane: 'bunch',
  cheese: '250 g', akkawi: '250 g', labneh: '500 g', yogurt: '500 g', milk: '1 L', 'camel-milk': '1 L', laban: '1 L', eggs: '6 pack',
  honey: '350 g jar', sourdough: 'loaf', regag: 'pack', loomi: '100 g', 'date-syrup': '350 ml', sunflowers: 'bunch', lavender: 'bunch', microgreens: 'punnet', mushrooms: '250 g',
}

const PRICE = {
  strawberry: 14, apple: 8, peach: 12, blueberries: 16, lemon: 7, fig: 15, watermelon: 14, pear: 10,
  tomato: 7, carrot: 6, 'leafy-greens': 7, beetroot: 7, pumpkin: 12, 'sweet-corn': 8, eggplant: 8, 'bell-pepper': 9, radish: 6, cucumber: 6,
  basil: 5, mint: 4, rosemary: 5, thyme: 5, parsley: 4, chives: 5,
  cheese: 18, milk: 9, eggs: 11, yogurt: 10,
  honey: 28, sourdough: 16, mushrooms: 12, sunflowers: 18, lavender: 16, microgreens: 12,
  dates: 22, pomegranate: 11, mango: 13, grapes: 12, oranges: 9, guava: 10, mulberries: 16, melon: 12,
  okra: 9, zucchini: 8, cauliflower: 9, cabbage: 7, potatoes: 6, onions: 6, 'green-beans': 9, lettuce: 7, chili: 7, 'sweet-potato': 8,
  coriander: 4, dill: 4, jarjeer: 5, purslane: 5,
  labneh: 13, 'camel-milk': 14, laban: 9, akkawi: 18,
  loomi: 9, regag: 10, 'date-syrup': 24,
}

const defaults = {
  fruits: { storage: 'Keep cool and dry; refrigerate ripe or cut fruit in a clean covered container.', best: 'Enjoy while firm, fragrant and free from soft spots.', tip: 'Wash only what you are ready to eat, then dry well.', watch: 'Discard fruit with spreading mould, leaking flesh or an off smell.' },
  vegetables: { storage: 'Refrigerate most vegetables in the crisper drawer, dry and loosely wrapped.', best: 'Use while crisp and brightly coloured.', tip: 'Keep excess moisture low to slow wilting and spoilage.', watch: 'Discard pieces that become slimy, mouldy or strongly off-smelling.' },
  herbs: { storage: 'Refrigerate loosely wrapped in a slightly damp towel or ventilated container.', best: 'Use while leaves are bright and aromatic.', tip: 'Trim tired stems and keep leaves from sitting in water.', watch: 'Remove blackened, slimy or mouldy leaves.' },
  dairy: { storage: 'Keep refrigerated at 4°C or below and return it to the fridge promptly after use.', best: 'Follow the package use-by date and use opened products promptly.', tip: 'Keep containers tightly closed and use clean utensils.', watch: 'Discard if the package is swollen, leaking, mouldy or smells unusual.' },
  other: { storage: 'Store according to the product type in a clean, dry place or refrigerator as appropriate.', best: 'Check freshness before use and follow any package date or storage label.', tip: 'Keep food sealed from heat, moisture and direct sunlight.', watch: 'Discard food showing mould, unusual odour or damaged packaging.' },
}

const special = {
  strawberry: { storage: 'Refrigerate unwashed in a shallow, ventilated container.', best: 'Best within about 3–5 days.', tip: 'Wash only just before eating and remove damaged berries early.' },
  blueberries: { storage: 'Refrigerate unwashed in a ventilated container.', best: 'Best within about 5–7 days.', tip: 'Keep them dry until you are ready to rinse and eat.' },
  fig: { storage: 'Refrigerate ripe figs in a single layer.', best: 'Best within about 1–2 days once ripe.', tip: 'Handle gently; figs bruise very easily.' },
  apple: { storage: 'Refrigerate for longer keeping, away from leafy greens.', best: 'Best while crisp and firm.', tip: 'Keep bruised apples separate from the rest.' },
  peach: { storage: 'Ripen at room temperature, then refrigerate once ripe.', best: 'Use ripe peaches within a few days.', tip: 'Do not stack soft peaches heavily.' },
  mango: { storage: 'Ripen at room temperature, then refrigerate when ripe.', best: 'Use within a few days after ripening.', tip: 'Keep cut mango covered and refrigerated.' },
  tomato: { storage: 'Keep ripe whole tomatoes at room temperature away from direct sun.', best: 'Use when fragrant and just tender.', tip: 'Refrigerate after cutting, or if very ripe and you need to slow softening.' },
  'leafy-greens': { storage: 'Refrigerate dry in a breathable bag or container with a clean paper towel.', best: 'Best while leaves are crisp.', tip: 'Remove wilted leaves and avoid storing them wet.' },
  lettuce: { storage: 'Refrigerate dry in the crisper drawer with a clean paper towel.', best: 'Best while leaves are crisp.', tip: 'Do not wash until needed unless you can dry it thoroughly.' },
  carrot: { storage: 'Remove leafy tops and refrigerate the roots in the crisper drawer.', best: 'Best while firm and crisp.', tip: 'Keeping the tops off reduces moisture loss.' },
  potatoes: { storage: 'Keep in a cool, dark, ventilated place away from onions.', best: 'Use before they become soft or heavily sprouted.', tip: 'Do not store in direct sunlight.' },
  onions: { storage: 'Keep whole onions in a cool, dry, ventilated place.', best: 'Use while firm with dry skins.', tip: 'Keep them separate from potatoes to reduce moisture buildup.' },
  basil: { storage: 'Keep stems in a small glass of water at cool room temperature, away from direct sun.', best: 'Use while leaves are bright and fragrant.', tip: 'Basil can darken quickly in a very cold refrigerator.' },
  mint: { storage: 'Refrigerate with stems wrapped in a slightly damp towel or standing in a little water.', best: 'Use while leaves are vivid and aromatic.', tip: 'Loosely cover to reduce drying.' },
  mushrooms: { storage: 'Refrigerate in a paper bag or breathable container.', best: 'Use while firm and dry to the touch.', tip: 'Avoid sealed wet plastic, which traps moisture.' },
  microgreens: { storage: 'Refrigerate dry in their punnet or a ventilated container.', best: 'Use as soon as possible for best texture.', tip: 'Keep them cold and avoid crushing the leaves.' },
  eggs: { storage: 'Keep refrigerated in their original carton.', best: 'Follow the date on the carton.', tip: 'Store on an interior shelf rather than the refrigerator door.' },
  milk: { storage: 'Keep refrigerated at 4°C or below.', best: 'Follow the use-by date and consume promptly after opening.', tip: 'Return the bottle to the fridge immediately after pouring.' },
  'camel-milk': { storage: 'Keep refrigerated at 4°C or below.', best: 'Follow the package use-by date.', tip: 'Keep sealed and chilled continuously.' },
  laban: { storage: 'Keep refrigerated at 4°C or below.', best: 'Follow the package use-by date.', tip: 'Keep tightly closed and use clean utensils.' },
  yogurt: { storage: 'Keep refrigerated at 4°C or below.', best: 'Follow the package use-by date.', tip: 'Use a clean spoon and close the container after serving.' },
  labneh: { storage: 'Keep refrigerated in a tightly closed container.', best: 'Follow the package use-by date.', tip: 'Use a clean spoon each time to reduce contamination.' },
  cheese: { storage: 'Keep refrigerated and well wrapped or sealed.', best: 'Follow the package use-by date.', tip: 'Rewrap after each use to limit drying and odour transfer.' },
  akkawi: { storage: 'Keep refrigerated in a sealed container.', best: 'Follow the package use-by date.', tip: 'Keep it chilled and use clean utensils.' },
  honey: { storage: 'Keep tightly closed at room temperature in a cool, dry cupboard.', best: 'Naturally keeps well when protected from moisture.', tip: 'Crystallisation is normal and does not mean the honey has spoiled.' },
  'date-syrup': { storage: 'Keep tightly sealed in a cool, dry place; refrigerate after opening if the label advises it.', best: 'Follow the package guidance after opening.', tip: 'Use a clean, dry spoon to keep moisture out.' },
  loomi: { storage: 'Keep dried loomi airtight in a cool, dark, dry cupboard.', best: 'Best while strongly aromatic and fully dry.', tip: 'Keep away from steam and humidity.' },
  sourdough: { storage: 'Keep at room temperature in a bread bag or box; freeze slices for longer storage.', best: 'Best within about 1–2 days for peak texture.', tip: 'Avoid refrigerating bread unless necessary; it can stale faster.' },
  regag: { storage: 'Keep sealed and dry at room temperature; freeze if storing longer.', best: 'Best while crisp and fresh.', tip: 'Protect from humidity so it does not soften.' },
  sunflowers: { storage: 'Trim stems and place in clean water away from direct heat.', best: 'Refresh the water regularly.', tip: 'Remove leaves that sit below the water line.', watch: 'For decoration only unless specifically sold as edible.' },
  lavender: { storage: 'For fresh bunches, keep stems in clean water; for dried lavender, keep cool and dry.', best: 'Use while fragrant and clean.', tip: 'Keep dried bunches away from humidity.', watch: 'Only consume products specifically labelled as food-grade.' },
}

export function orderMetaFor(p) {
  // Fresh Basket is a prototype only, so keep the displayed demo prices modest
  // rather than implying live or premium Qatar market pricing.
  const defaultPrice = { fruits: 7, vegetables: 5, herbs: 3, dairy: 8, other: 9 }[p.category] || 7
  const defaultUnit = { fruits: '1 kg', vegetables: '1 kg', herbs: 'bunch', dairy: 'pack', other: 'item' }[p.category] || 'item'
  const listed = PRICE[p.id] ?? defaultPrice
  const price = Math.max(2, Math.round(listed * 0.65))
  return { price, unit: UNIT[p.id] ?? defaultUnit }
}

export function freshnessFor(p) {
  return { ...defaults[p.category], ...(special[p.id] || {}) }
}
