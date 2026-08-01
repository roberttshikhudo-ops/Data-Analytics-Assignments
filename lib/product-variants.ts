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
  blue: '#2d6cdf',
  navy: '#1f2d5a',
  teal: '#1f7a70',
  green: '#3a7d44',
  beige: '#d8c7a8',
  cream: '#efe6d2',
  ivory: '#f4efe1',
  brown: '#7a5230',
  tan: '#c39a68',
  natural: '#d8c7a8',
  stone: '#cabfae',
  gold: '#c9a13b',
  pink: '#e08aa8',
  purple: '#7c5cbf',
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
  // Split on the LAST dash (optionally surrounded by spaces).
  const match = name.match(/^(.*\S)\s*-\s*([A-Za-z]+)(\d*)$/)
  if (!match) return null

  const [, base, word, digits] = match
  const colorKey = word.toLowerCase()
  const swatch = COLOR_SWATCHES[colorKey]
  if (!swatch) return null

  return {
    base: base.trim(),
    label: `${word}${digits}`,
    colorKey,
    swatch,
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
