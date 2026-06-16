import Link from "next/link"
import { Gift, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ReferCalloutProps {
  /** Optional heading override */
  title?: string
  className?: string
}

export function ReferCallout({
  title = "Loving Agri Hub? Share the warmth.",
  className,
}: ReferCalloutProps) {
  return (
    <Card className={`border-primary/30 bg-primary/5 ${className ?? ""}`}>
      <CardContent className="flex flex-col items-start gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Gift className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground text-pretty">
              Give a friend 10% off their first order with code{" "}
              <span className="font-mono font-semibold text-primary">FRIEND10</span>. Spread the word and help
              them save too.
            </p>
          </div>
        </div>
        <Button asChild className="w-full shrink-0 sm:w-auto">
          <Link href="/refer">
            Refer a Friend
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
