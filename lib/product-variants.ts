import type { Product } from '@/lib/types'

/**
 * Products in this store are stored as one row per colour (e.g.
 * "Luna Marble 10-pcs Premium Cookware set-Grey"). This helper collapses those
 * sibling rows into a single card with selectable colour swatches, using a
 * name-based heuristic. It is intentionally conservative: rows only group when
 * they share the same base name AND the suffix after the final dash is a
 * recognised colour token, so legitimate products like "10-piece" are safe.
 */

/** Recognised colour tokens mapped to a representative swatch colour. */
const COLOR_SWATCHES: Record<string, string> = {
  black: '#1a1a1a',
  white: '#f8f8f5',
  grey: '#8a8a8a',
  gray: '#8a8a8a',
  charcoal: '#3a3a3a',
  silver: '#c0c0c0',
  red: '#c0392b',
  maroon: '#7b1e1e',
  burgundy: '#6b1f2a',
  wine: '#722f37',
  blue: '#2d6cdf',
  navy: '#1f2d5a',
  petrol: '#125b63',
  steel: '#5a7d9a',
  sky: '#87ceeb',
  aqua: '#4fd1c5',
  teal: '#1f7a70',
  green: '#3a7d44',
  sage: '#9caf88',
  lime: '#a4c639',
  olive: '#808000',
  mint: '#98d8c8',
  beige: '#d8c7a8',
  cream: '#efe6d2',
  ivory: '#f4efe1',
  brown: '#7a5230',
  chocolate: '#5a3a22',
  coffee: '#6f4e37',
  camel: '#c19a6b',
  tan: '#c39a68',
  taupe: '#b0a189',
  natural: '#d8c7a8',
  stone: '#cabfae',
  gold: '#c9a13b',
  mustard: '#d4a017',
  pink: '#e08aa8',
  rose: '#c76b78',
  coral: '#e9967a',
  peach: '#f4b183',
  purple: '#7c5cbf',
  plum: '#6a2c50',
  lilac: '#c8a2c8',
  lavender: '#b7a4d1',
  mauve: '#b784a7',
  orange: '#e08a3c',
  yellow: '#e6c34a',
}

export interface ParsedVariant {
  /** Base product name shared across the colour siblings. */
  base: string
  /** Full raw suffix as shown to shoppers, e.g. "Black1" or "Grey". */
  label: string
  /** Normalised colour word used for the swatch, e.g. "black". */
  colorKey: string
  /** Hex swatch colour for the dot. */
  swatch: string
}

/**
 * Attempts to parse a colour variant from a product name. Returns null when the
 * suffix after the final dash is not a recognised colour.
 */
export function parseVariant(name: string): ParsedVariant | null {
  // Everything after the LAST dash is the potential colour suffix.
  const dashIdx = name.lastIndexOf('-')
  if (dashIdx <= 0) return null

  const base = name.slice(0, dashIdx).trim()
  const suffix = name.slice(dashIdx + 1).trim()
  if (!base || !suffix) return null

  // Strip a trailing parenthetical size, e.g. "Charcoal (Queen)" -> "Charcoal".
  const cleaned = suffix.replace(/\s*\([^)]*\)\s*$/, '').trim()
  // Separate an optional trailing number, e.g. "Black1" -> core "Black", digits "1".
  const digitMatch = cleaned.match(/^(.*?)(\d+)$/)
  const core = (digitMatch ? digitMatch[1] : cleaned).trim()
  const digits = digitMatch ? digitMatch[2] : ''
  if (!core) return null

  // A colour phrase may be multi-word ("Navy Blue", "Grey & Black", "Light Grey").
  // Use the first recognised colour token as the swatch.
  const words = core.toLowerCase().split(/[^a-z]+/).filter(Boolean)
  let colorKey = ''
  for (const word of words) {
    if (COLOR_SWATCHES[word]) {
      colorKey = word
      break
    }
  }
  if (!colorKey) return null

  return {
    base,
    label: `${core}${digits}`.trim(),
    colorKey,
    swatch: COLOR_SWATCHES[colorKey],
  }
}

export interface ProductVariant {
  product: Product
  label: string
  colorKey: string
  swatch: string
}

export interface ProductGroup {
  /** Stable key for React. */
  id: string
  /** Display name (base name when grouped, otherwise the product name). */
  name: string
  /** Representative product shown by default. */
  primary: Product
  /** All colour variants (length 1 when the product has no siblings). */
  variants: ProductVariant[]
  hasVariants: boolean
}

/**
 * Groups a flat product list into cards, collapsing recognised colour siblings.
 * Order of first appearance is preserved.
 */
export function groupProductVariants(products: Product[]): ProductGroup[] {
  const groups = new Map<string, ProductGroup>()

  for (const product of products) {
    const parsed = parseVariant(product.name)

    if (parsed) {
      const key = `base:${parsed.base.toLowerCase()}`
      const variant: ProductVariant = {
        product,
        label: parsed.label,
        colorKey: parsed.colorKey,
        swatch: parsed.swatch,
      }
      const existing = groups.get(key)
      if (existing) {
        existing.variants.push(variant)
        existing.hasVariants = true
      } else {
        groups.set(key, {
          id: key,
          name: parsed.base,
          primary: product,
          variants: [variant],
          hasVariants: false,
        })
      }
    } else {
      // Standalone product — keyed by id so it never merges with anything.
      groups.set(`id:${product.id}`, {
        id: `id:${product.id}`,
        name: product.name,
        primary: product,
        variants: [
          { product, label: product.name, colorKey: 'default', swatch: '#d8c7a8' },
        ],
        hasVariants: false,
      })
    }
  }

  return Array.from(groups.values())
}
