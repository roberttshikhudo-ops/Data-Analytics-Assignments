import type { Product } from "@/lib/types"

type Matcher = (name: string) => boolean

// Bedding series in display order. Mirrors the ordering used by the Bedding
// Catalogue 6 generator so the storefront and the printed catalogue stay
// consistent. A product is assigned to the FIRST series it matches, so the
// order here is significant (branded/specific ranges come before generic
// "Comforter"/"Blanket" catch-alls).
const BEDDING_SERIES: { title: string; match: Matcher }[] = [
  // --- Comforter & quilt ranges, in the exact display order requested ---
  // 1. All reversible comforters (excluding the flower reversible range, which
  //    gets its own section further down).
  {
    title: "Reversible Comforters",
    match: (n) => n.includes("reversible") && !n.includes("flower"),
  },
  // 2. Geometric comforters (not geometric throws/blankets).
  {
    title: "Geometric Comforters",
    match: (n) => n.includes("geometric comforter"),
  },
  // 3. RARA series
  { title: "RARA Quilt Sets", match: (n) => n.includes("rara") },
  // 4. MOMO series
  { title: "MOMO Quilt Sets", match: (n) => n.includes("momo") },
  // 5. Moffy series
  { title: "Moffy Comforter Sets", match: (n) => n.includes("moffy") },
  // 6. Molly series
  { title: "Molly Comforter Sets", match: (n) => n.includes("molly") },
  // 7. Flower reversible comforters
  {
    title: "Flower Reversible Comforters",
    match: (n) => n.includes("flower") && n.includes("reversible"),
  },
  // 8. 9pcs comforter sets
  {
    title: "9pcs Comforter Sets",
    match: (n) => n.includes("9pcs comforter") || n.includes("9 pcs comforter"),
  },
  // 9. Corduroy comforters
  {
    title: "Corduroy Comforters",
    match: (n) => n.includes("corduroy") || n.includes("cordury"),
  },
  // 10. Remaining comforter sets (generic catch-all; kids comforters are
  //     handled by the Kids section at the end).
  {
    title: "Comforter Sets",
    match: (n) => n.includes("comforter") && !n.includes("kids"),
  },
  // 11. All other quilt / bedspread sets.
  {
    title: "Quilts & Bedspreads",
    match: (n) =>
      n.includes("quilt") ||
      n.includes("bedspread") ||
      n.includes("bed spread") ||
      n.includes("combo bedding"),
  },
  // --- Throws & fleece (products sorted within the section so each colour
  //     series clusters together) ---
  {
    title: "Throws & Fleece Blankets",
    match: (n) =>
      n.includes("throw") || (n.includes("fleece") && n.includes("blanket")),
  },
  // --- Bedsheets ---
  {
    title: "Bedsheets",
    match: (n) =>
      n.includes("bed sheet") ||
      n.includes("bedsheet") ||
      n.includes("frilled combo sheet") ||
      n.includes("sheet set") ||
      n.includes("combo sheet"),
  },
  // --- Blankets ---
  {
    title: "Winter Blankets",
    match: (n) =>
      n.includes("winter blanket") ||
      n.includes("jia jia") ||
      n.includes("little sheep") ||
      n.includes("quality winter blanket") ||
      n.includes("2ply") ||
      n.includes("2 ply") ||
      n.includes("1ply") ||
      n.includes("1 ply") ||
      (n.includes("blanket") && n.includes("winter")),
  },
  { title: "Other Blankets", match: (n) => n.includes("blanket") },
  // --- Other bedding items ---
  {
    title: "Mattress Protectors & Covers",
    match: (n) => n.includes("mattress protector") || n.includes("protector"),
  },
  {
    title: "Kids Character Bedding",
    match: (n) =>
      n.includes("kids bedding") ||
      n.includes("kids comforter") ||
      (n.includes("kids") && n.includes("comforter")),
  },
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

  // Sort products within each series alphabetically so same-name ranges and
  // their colour variants cluster together predictably.
  const byName = (a: Product, b: Product) =>
    (a.name || "").localeCompare(b.name || "")

  const bedding = BEDDING_SERIES.filter((s) => beddingMap.has(s.title)).map(
    (s) => ({
      title: s.title,
      products: (beddingMap.get(s.title) as Product[]).sort(byName),
    }),
  )

  kitchenware.sort(byName)
  general.sort(byName)

  return { bedding, kitchenware, general, total: products.length }
}
