import Link from 'next/link'
import { ArrowRight, Truck, Shield, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/store/product-card'
import { CategoryCard } from '@/components/store/category-card'
import { CatalogueDownloadBadge } from '@/components/store/catalogue-download-badge'
import { getCachedCatalogue } from '@/lib/catalogue/cache-bedding-6'
import { buildCuratedGroup, groupProductVariants, type ProductGroup } from '@/lib/product-variants'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'

const HOME_LIVING_CATEGORY_ID = '099152dd-3ae4-4033-a201-92218245e22a'

type FamilyDef = { id: string; name: string; match: RegExp }

// Curated bedding families, shown first in this exact order.
const BEDDING_FAMILIES: FamilyDef[] = [
  { id: 'moffy', name: 'Moffy 7pcs Super King Comforter', match: /^moffy\b/i },
  { id: 'rara', name: 'RARA Super King Quilt Set', match: /\brara\b/i },
  { id: 'generic-reversible', name: '5pcs Generic Reversible Comforters', match: /generic reversible/i },
  {
    id: '9pcs-carpet-combo',
    name: '9pcs Comforter & 3D Carpet Combo SET',
    match: /9pcs comforter & 3d carpet combo/i,
  },
  { id: '9pcs', name: '9pcs Comforter Set', match: /^9pcs comforter set/i },
  { id: 'momo', name: 'MOMO Super King Quilt Set', match: /\bmomo\b/i },
  { id: 'geometric', name: '5pcs Geometric Comforter', match: /geometric comforter/i },
]

// Curated kitchen families, shown after all bedding.
const KITCHEN_FAMILIES: FamilyDef[] = [
  { id: '8pcs-cookware', name: '8pcs Non-Stick Granite Cookware Pot Set', match: /^8pcs non-stick granite cookware/i },
  { id: '10pcs-cookware', name: '10pcs Granite Non-Stick Cookware Set', match: /^10pcs granite non-stick cookware/i },
  { id: 'luna-cookware', name: 'Luna Marble 10pcs Premium Cookware Set', match: /^luna marble/i },
]

// Keywords used to sort the remaining auto-grouped products into sections.
// "Soft" (carpets, rugs, throws, fleece) is checked first so those families
// stay together in one block, then bedding, then kitchen.
const SOFT_KEYWORDS = /carpet|\brug\b|\brugs\b|throw|fleece/i
const BEDDING_KEYWORDS =
  /comforter|quilt|duvet|blanket|sheet|bedding|pillow|mattress|\bbed\b|linen|fitted|cover/i
const KITCHEN_KEYWORDS =
  /cookware|\bpot\b|\bpots\b|\bpan\b|frying|casserole|bowl|dinner|plate|cutlery|utensil|kettle|mug|\bcup\b|glass|kitchen|granite|marble|canister|storage|\btray\b|flask|jug/i

/** True when a product has a genuine product photo (blob upload or local file). */
function hasRealImage(p: Product): boolean {
  const url = (p.image_url ?? '').trim()
  if (!url) return false
  // Generic stock photos are not real product images.
  if (/unsplash|placeholder|\/placeholder\.svg/i.test(url)) return false
  return true
}

async function getCategoryProducts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .eq('category_id', HOME_LIVING_CATEGORY_ID)
    .order('name')

  return ((data || []) as Product[]).filter(hasRealImage)
}

async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  return data || []
}

export default async function HomePage() {
  const [products, categories, catalogue] = await Promise.all([
    getCategoryProducts(),
    getCategories(),
    getCachedCatalogue(),
  ])

  const buildFamilies = (defs: FamilyDef[]) =>
    defs
      .map((f) => buildCuratedGroup(f.id, f.name, products.filter((p) => f.match.test(p.name))))
      .filter((g): g is ProductGroup => g !== null)

  // Curated bedding families first, then curated kitchen families.
  const beddingFeatured = buildFamilies(BEDDING_FAMILIES)
  const kitchenFeatured = buildFamilies(KITCHEN_FAMILIES)

  // Products already placed in a curated family, so we don't repeat them.
  const featuredIds = new Set(
    [...beddingFeatured, ...kitchenFeatured].flatMap((g) => g.variants.map((v) => v.product.id)),
  )

  // Everything else, auto-grouped by colour/variant, then sorted into sections.
  const rest = groupProductVariants(products.filter((p) => !featuredIds.has(p.id)))
  const matches = (re: RegExp) => (g: ProductGroup) => re.test(g.name) || re.test(g.primary.name)
  const isSoft = matches(SOFT_KEYWORDS)
  const isBedding = matches(BEDDING_KEYWORDS)
  const isKitchen = matches(KITCHEN_KEYWORDS)

  // Carpets, rugs, throws and fleece all live together in one block. Carpets
  // and rugs come first, then throws and fleece.
  const restSoft = rest.filter((g) => isSoft(g))
  const softCarpets = restSoft.filter((g) => /carpet|\brug/i.test(g.name) || /carpet|\brug/i.test(g.primary.name))
  const softThrows = restSoft.filter((g) => !softCarpets.includes(g))

  const restBedding = rest.filter((g) => !isSoft(g) && isBedding(g))
  const restKitchen = rest.filter((g) => !isSoft(g) && !isBedding(g) && isKitchen(g))
  const restOther = rest.filter((g) => !isSoft(g) && !isBedding(g) && !isKitchen(g))

  // Final order: featured bedding, other bedding, then carpets/throws/fleece
  // together, then all kitchen, then anything else.
  const allGroups = [
    ...beddingFeatured,
    ...restBedding,
    ...softCarpets,
    ...softThrows,
    ...kitchenFeatured,
    ...restKitchen,
    ...restOther,
  ]

  return (
    <div className="flex flex-col">
      {/* Trust Badges */}
      <section className="border-b bg-card">
        <div className="container py-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Free Delivery</p>
                <p className="text-sm text-muted-foreground">On orders over R1,000</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Quality Guarantee</p>
                <p className="text-sm text-muted-foreground">100% genuine products</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Order on WhatsApp</p>
                <p className="text-sm text-muted-foreground">Fast, secure checkout</p>
              </div>
            </div>
          </div>
          <CatalogueDownloadBadge downloadUrl={catalogue?.downloadUrl} />
        </div>
      </section>

      {/* Featured Product Grid */}
      <section className="py-10">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold md:text-4xl">Bedding and Kitchenware</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Our full range of comforters, cookware and homeware - {allGroups.length} products, tap a design or
              colour to switch
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
            {allGroups.map((grp, index) => (
              <ProductCard key={grp.id} product={grp.primary} group={grp} priority={index < 6} />
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      {categories.length > 0 && (
        <section className="border-t py-12 bg-muted/30">
          <div className="container">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="text-2xl font-bold md:text-3xl">Shop by Category</h2>
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/shop">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {categories.slice(0, 8).map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
