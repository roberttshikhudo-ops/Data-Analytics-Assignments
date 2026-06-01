import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import type { Product } from '@/lib/types'

interface ProductTabsProps {
  product: Product
}

export function ProductTabs({ product }: ProductTabsProps) {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0">
        <TabsTrigger 
          value="description" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
        >
          Description
        </TabsTrigger>
        <TabsTrigger 
          value="specifications"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
        >
          Specifications
        </TabsTrigger>
        <TabsTrigger 
          value="shipping"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
        >
          Shipping
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="mt-6">
        <Card>
          <CardContent className="p-6">
            {product.description ? (
              <div className="prose prose-sm max-w-none text-foreground">
                {product.description.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No description available.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="specifications" className="mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.sku && (
                  <>
                    <div className="font-medium">SKU</div>
                    <div className="text-muted-foreground">{product.sku}</div>
                  </>
                )}
                {product.category && (
                  <>
                    <div className="font-medium">Category</div>
                    <div className="text-muted-foreground">{product.category.name}</div>
                  </>
                )}
                <div className="font-medium">Stock Status</div>
                <div className="text-muted-foreground">
                  {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="shipping" className="mt-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h4 className="font-medium mb-2">Delivery Options</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong>Standard Delivery:</strong> 5-7 business days - R99 (Free on orders over R1,500)</li>
                <li><strong>Express Delivery:</strong> 2-3 business days - R199</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Delivery Areas</h4>
              <p className="text-sm text-muted-foreground">
                We deliver nationwide across all 9 provinces of South Africa. Remote areas may have 
                extended delivery times.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Returns Policy</h4>
              <p className="text-sm text-muted-foreground">
                We offer a 30-day return policy for unused items in their original packaging. 
                Please contact our support team to initiate a return. Note that perishable items 
                like seeds and fertilizers may have different return conditions.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
