import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowRight, 
  Leaf, 
  FlaskConical, 
  Shovel, 
  Lightbulb, 
  Droplets, 
  UtensilsCrossed, 
  Stethoscope, 
  Shirt, 
  HardHat, 
  Home, 
  Wrench,
  Car,
  Scissors,
  Pill,
  Backpack,
  Package
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Category } from '@/lib/types'

// Map category slugs to icons
const categoryIcons: Record<string, React.ElementType> = {
  'gardening-tools': Shovel,
  'animal-feeds': UtensilsCrossed,
  'seeds-vegetables-and-mbeu': Leaf,
  'fertilisers-chemicals': FlaskConical,
  'ppes': HardHat,
  'electrical': Lightbulb,
  'plumbing': Droplets,
  'building-construction': Wrench,
  'home-living': Home,
  'animal-health': Stethoscope,
  'kitchenware-dining': UtensilsCrossed,
  'footwear-clothing': Shirt,
  'bags-travel': Backpack,
  'health-beauty': Pill,
  'automotive': Car,
  'hardware-tools': Wrench,
  'paint-accessories': Scissors,
}

interface CategoryCardProps {
  category: Category
}

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = categoryIcons[category.slug] || Leaf

  return (
    <Link href={`/shop/${category.slug}`}>
      <Card className="group relative overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer h-full">
        {category.image_url ? (
          <div className="relative aspect-[4/3]">
            <Image
              src={category.image_url}
              alt={category.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <CardContent className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="font-semibold text-lg group-hover:text-accent transition-colors">
                {category.name}
              </h3>
              <div className="flex items-center gap-1 text-base text-white/80 mt-1 group-hover:text-accent">
                <span>Shop now</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </div>
        ) : (
          <CardContent className="p-6 flex flex-col items-center justify-center aspect-[4/3] text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-3 group-hover:bg-primary/20 transition-colors">
              <Icon className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {category.name}
            </h3>
            <div className="flex items-center gap-1 text-base text-muted-foreground mt-2 group-hover:text-primary">
              <span>Shop now</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  )
}
