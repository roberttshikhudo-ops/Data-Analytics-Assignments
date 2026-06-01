import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import Link from "next/link"
import { ProductCard } from "@/components/store/product-card"

async function getWishlist() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?redirect=/account/wishlist")

  const { data: wishlistItems } = await supabase
    .from("wishlists")
    .select(`
      id,
      product_id,
      products(
        id,
        name,
        slug,
        price,
        compare_at_price,
        stock_quantity,
        is_new,
        category_id,
        categories(name, slug)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return wishlistItems || []
}

export default async function WishlistPage() {
  const wishlistItems = await getWishlist()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Wishlist</h2>

      {wishlistItems.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Heart className="mx-auto h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Your wishlist is empty</h3>
            <p className="mt-2 text-muted-foreground">
              Save items you love by clicking the heart icon
            </p>
            <Link href="/shop">
              <Button className="mt-4">Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlistItems.map((item) => {
            const product = item.products as any
            if (!product) return null
            
            return (
              <ProductCard
                key={item.id}
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  compare_at_price: product.compare_at_price,
                  stock_quantity: product.stock_quantity,
                  is_new: product.is_new,
                  category: product.categories,
                  images: [],
                }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
