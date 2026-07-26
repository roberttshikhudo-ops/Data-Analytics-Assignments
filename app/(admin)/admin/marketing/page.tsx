"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Copy, Check, Download, Megaphone, ImageDown, ListChecks } from "lucide-react"
import { BeddingFlyerGenerator } from "@/components/admin/bedding-flyer-generator"

// Business details (mirrors lib/invoice.ts BUSINESS constant)
const BUSINESS = {
  name: "Agri Hub SA",
  whatsapp: "083 306 1529",
  website: "agrihubsa.co.za",
  email: "info@agrihubsa.co.za",
  waLink: "https://wa.me/27833061529",
}

// Snapshot of Catalogue 6 ranges + live price points used to write the copy.
const RANGES = [
  { label: "Comforter Sets", from: 280 },
  { label: "Quilts & Bedspreads", from: 390 },
  { label: "Winter Blankets", from: 290 },
  { label: "Bedsheet Sets", from: 185 },
  { label: "Throws & Fleece", from: 160 },
  { label: "Mattress Protectors & Covers", from: 255 },
  { label: "Kids Character Bedding", from: 260 },
]

const SELLING_POINTS = [
  "7 bedding ranges in one catalogue - something for every room and budget",
  "Prices from just R160 - affordable quality for the whole home",
  "Kids character bedding: Mickey, Minnie, Spider-Man, Frozen, Stitch & Hello Kitty",
  "Nationwide delivery + secure online payment",
  "Order by WhatsApp, phone or online - fast and easy",
]

// Platform-specific captions
const CAPTIONS: { key: string; label: string; text: string }[] = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    text: `*AGRI HUB SA - BEDDING CATALOGUE IS HERE!* 🛏️

Transform your bedroom without breaking the bank. Our latest bedding collection has something for every home:

✅ Comforter Sets - from R280
✅ Quilts & Bedspreads - from R390
✅ Winter Blankets - from R290
✅ Bedsheet Sets - from R185
✅ Throws & Fleece - from R160
✅ Mattress Protectors & Covers - from R255
✅ Kids Character Bedding (Mickey, Frozen, Spider-Man & more) - R260

📦 Nationwide delivery
💳 Secure online payment
📲 Order today!

WhatsApp: ${BUSINESS.whatsapp}
Shop online: ${BUSINESS.website}

Reply *CATALOGUE* and we'll send you the full picture catalogue with prices.`,
  },
  {
    key: "facebook",
    label: "Facebook",
    text: `🛏️ NEW BEDDING COLLECTION AT AGRI HUB SA 🛏️

Cosy up your home for less! Our newest bedding catalogue is packed with quality comforters, blankets, sheets, throws and fun kids sets - all at prices that make sense.

🔹 Comforter Sets from R280
🔹 Quilts & Bedspreads from R390
🔹 Winter Blankets from R290
🔹 Bedsheet Sets from R185
🔹 Throws & Fleece from R160
🔹 Mattress Protectors from R255
🔹 Kids Character Bedding (Mickey, Minnie, Spider-Man, Frozen, Stitch, Hello Kitty) at R260

📦 We deliver nationwide | 💳 Safe & secure checkout

👉 Shop now at ${BUSINESS.website}
📲 Or WhatsApp us on ${BUSINESS.whatsapp}

Tag a friend who needs to see this! 👇`,
  },
  {
    key: "instagram",
    label: "Instagram",
    text: `Cosy season sorted. 🛏️✨ New bedding collection now live at Agri Hub SA - quality comforters, blankets, sheets & fun kids sets from just R160.

Comfort for every room. Prices for every budget.

📲 WhatsApp ${BUSINESS.whatsapp}
🛒 ${BUSINESS.website}

.
.
#bedding #comforter #homedecor #bedroomgoals #southafrica #kidsbedding #winterwarmers #agrihubsa #onlineshopping #shoplocal #homessa #duvet #blankets #interiordecor #affordableliving`,
  },
  {
    key: "sms",
    label: "SMS / Email",
    text: `Agri Hub SA - New Bedding Catalogue! Comforters from R280, blankets from R290, sheets from R185, kids sets R260 & more. Nationwide delivery. Shop ${BUSINESS.website} or WhatsApp ${BUSINESS.whatsapp}. Reply STOP to opt out.`,
  },
]

function CopyBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy - please select and copy manually")
    }
  }

  return (
    <div className="space-y-3">
      <div className="whitespace-pre-wrap rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed text-foreground">
        {text}
      </div>
      <Button onClick={handleCopy} className="gap-2">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy caption"}
      </Button>
    </div>
  )
}

export default function MarketingPage() {
  const [downloading, setDownloading] = useState(false)

  const handleDownloadCatalogue = async () => {
    setDownloading(true)
    try {
      const res = await fetch("/api/admin/catalogue/bedding-6")
      if (!res.ok) throw new Error("Failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "Agri-Hub-Bedding-Catalogue-6.pdf"
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch {
      toast.error("Could not download the catalogue. Please try again.")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Megaphone className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">
            Bedding Catalogue 6 - Marketing Kit
          </h1>
          <p className="mt-1 text-muted-foreground text-pretty">
            Ready-to-send promotional material. Download the flyer and catalogue, then
            copy a caption for each platform and paste it where you share.
          </p>
        </div>
      </div>

      {/* Assets row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Flyer gallery - one image per platform format */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ImageDown className="h-5 w-5" /> Promotional Flyers
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Built from your real product photos. Choose a format and download.
            </p>
          </CardHeader>
          <CardContent>
            <BeddingFlyerGenerator />
          </CardContent>
        </Card>

        {/* Full catalogue + selling points */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Download className="h-5 w-5" /> Full Picture Catalogue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The complete Catalogue 6 PDF with every product photo and price -
                perfect to send directly to customers who reply for details.
              </p>
              <Button onClick={handleDownloadCatalogue} disabled={downloading} className="w-full gap-2">
                <Download className="h-4 w-4" />
                {downloading ? "Preparing..." : "Download Catalogue 6 (PDF)"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ListChecks className="h-5 w-5" /> Key Selling Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {SELLING_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                {RANGES.map((r) => (
                  <Badge key={r.label} variant="secondary" className="font-normal">
                    {r.label} - from R{r.from}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Captions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ready-to-Post Captions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Pick the platform, copy the caption, and paste it with the flyer or catalogue.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="whatsapp">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
              {CAPTIONS.map((c) => (
                <TabsTrigger key={c.key} value={c.key}>
                  {c.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {CAPTIONS.map((c) => (
              <TabsContent key={c.key} value={c.key} className="mt-4">
                <CopyBlock text={c.text} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
