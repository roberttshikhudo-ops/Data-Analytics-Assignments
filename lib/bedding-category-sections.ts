import type { Product } from "@/lib/types"

type Matcher = (name: string) => boolean

// Bedding series in display order. Mirrors the ordering used by the Bedding
// Catalogue 6 generator so the storefront and the printed catalogue stay
// consistent. A product is assigned to the FIRST series it matches, so the
// order here is significant (branded/specific ranges come before generic
// "Comforter"/"Blanket" catch-alls).
const BEDDING_SERIES: { title: string; match: Matcher }[] = [
  { title: "Moffy Comforter Sets", match: (n) => n.includes("moffy") },
  { title: "Molly Comforter Sets", match: (n) => n.includes("molly") },
  { title: "MoMo Quilt Sets", match: (n) => n.includes("momo") },
  { title: "Rara Quilt Sets", match: (n) => n.includes("rara") },
  {
    title: "Mattress Protectors & Covers",
    match: (n) => n.includes("mattress protector") || n.includes("protector"),
  },
  {
    title: "Reversible Flowers Comforters",
    match: (n) => n.includes("flower reversible"),
  },
  {
    title: "Generic Reversible Comforters",
    match: (n) => n.includes("generic reversible"),
  },
  {
    title: "Geometric Comforters",
    match: (n) => n.includes("geometric comforter"),
  },
  {
    title: "Corduroy Range",
    match: (n) => n.includes("corduroy") || n.includes("cordury"),
  },
  { title: "Comforter Sets", match: (n) => n.includes("comforter") },
  {
    title: "Quilts & Bedspreads",
    match: (n) =>
      n.includes("quilt") ||
      n.includes("bedspread") ||
      n.includes("bed spread") ||
      n.includes("combo bedding"),
  },
  {
    title: "Bedsheets",
    match: (n) =>
      n.includes("bed sheet") ||
      n.includes("bedsheet") ||
      n.includes("frilled combo sheet") ||
      n.includes("sheet set"),
  },
  {
    title: "Throws & Fleece Blankets",
    match: (n) =>
      n.includes("throw") || (n.includes("fleece") && n.includes("blanket")),
  },
  { title: "Kids Character Bedding", match: (n) => n.includes("kids bedding") },
  {
    title: "Winter Blankets",
    match: (n) =>
      n.includes("winter blanket") ||
      n.includes("jia jia") ||
      n.includes("little sheep") ||
      n.includes("quality winter blanket") ||
      n.includes("2ply") ||
      n.includes("2 ply") ||
      (n.includes("blanket") && n.includes("winter")),
  },
  { title: "Other Blankets", match: (n) => n.includes("blanket") },
]

// Kitchenware keywords. Checked only after a product fails to match any
// bedding series, so bedding always wins a tie.
const KITCHENWARE_TERMS = [
  "pot ",
  "pots",
  "kettle",
  "cutlery",
  "plate",
  "bowl",
  "food warmer",
  "chaffing",
  "chafing",
  "knife",
  "spice jar",
  "cast iron",
  "non-stick",
  "non stick",
  "bakeware",
  "spoon",
  "silicon kitchen",
  "silicone kitchen",
  "dinner set",
  "bread bin",
  "breadbin",
  "dish rack",
  "air fryer",
  "pressure cooker",
  "cereal dispenser",
  "food storage",
  "rice container",
  "fruit basket",
  "apron",
  "gas stove",
  "gas cylinder",
  "griller",
  "sandwich maker",
  "foil",
  "freezer bag",
  "sandwich bag",
  "ice bucket",
  "tumbler",
  "egg",
  "vegetable rack",
  "vegetable storage",
  "soup dish",
  "kitchen storage",
  "kitchen combo",
  "kitchen set",
  "spin cutter",
  "tray",
]

const isKitchenware: Matcher = (n) =>
  KITCHENWARE_TERMS.some((t) => n.includes(t))

export type ProductSection = { title: string; products: Product[] }

export type BeddingCategoryGroups = {
  bedding: ProductSection[]
  kitchenware: Product[]
  general: Product[]
  total: number
}

// Splits a category's products into bedding (grouped by series), kitchenware,
// and general so the storefront can present them in a shopper-friendly order.
export function groupBeddingCategory(products: Product[]): BeddingCategoryGroups {
  const beddingMap = new Map<string, Product[]>()
  const kitchenware: Product[] = []
  const general: Product[] = []

  for (const p of products) {
    const n = (p.name || "").toLowerCase()
    const series = BEDDING_SERIES.find((s) => s.match(n))
    if (series) {
      const bucket = beddingMap.get(series.title)
      if (bucket) bucket.push(p)
      else beddingMap.set(series.title, [p])
    } else if (isKitchenware(n)) {
      kitchenware.push(p)
    } else {
      general.push(p)
    }
  }

  const bedding = BEDDING_SERIES.filter((s) => beddingMap.has(s.title)).map(
    (s) => ({ title: s.title, products: beddingMap.get(s.title) as Product[] }),
  )

  return { bedding, kitchenware, general, total: products.length }
}
