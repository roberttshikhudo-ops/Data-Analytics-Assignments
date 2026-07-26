"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"

/**
 * Builds the promotional flyers entirely on a <canvas> from the real product
 * photos in the catalogue. No external dependencies and no server round-trip:
 * the images are drawn client-side and exported straight to PNG.
 */

const BUSINESS = {
  name: "AGRI HUB SA",
  tagline: "Quality Bedding for Every Home",
  whatsapp: "083 306 1529",
  website: "agrihubsa.co.za",
}

// Real product photos (one hero per range) with the range label + entry price.
// The hero is drawn large; the rest fill the product grid.
type Item = { label: string; price: number; src: string }

const HERO: Item = {
  label: "Reversible Comforter Sets",
  price: 295,
  src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20260108-WA0032%281%29-RR0r56BsTLIh1tY6p7b4UK89ICMstc.jpg",
}

const GRID: Item[] = [
  {
    label: "Quilts & Bedspreads",
    price: 390,
    src: "https://tkhnvcciiwg6evoc.public.blob.vercel-storage.com/optimized/1783318761884-fiu6bj.webp",
  },
  {
    label: "Winter Blankets",
    price: 290,
    src: "https://tkhnvcciiwg6evoc.public.blob.vercel-storage.com/products/little-sheep-blanket-black-white-leopard-1783737396180.jpg",
  },
  {
    label: "Bedsheet Sets",
    price: 185,
    src: "https://tkhnvcciiwg6evoc.public.blob.vercel-storage.com/optimized/1783318746889-ca5am9.webp",
  },
  {
    label: "Throws & Fleece",
    price: 160,
    src: "https://tkhnvcciiwg6evoc.public.blob.vercel-storage.com/optimized/1783318739715-r6vo3y.webp",
  },
  {
    label: "Mattress Protectors",
    price: 255,
    src: "https://tkhnvcciiwg6evoc.public.blob.vercel-storage.com/products/cordury-mattress-protector-green-1783738525022.jpg",
  },
  {
    label: "Kids Character Bedding",
    price: 260,
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WA_1784331214021-962jD9PItGaTDbShgliqivrowOZDdE.jpeg",
  },
]

// Palette (kept to a tight, cohesive set)
const COLORS = {
  navy: "#1f3b57",
  cream: "#f6efe4",
  white: "#ffffff",
  ink: "#26211c",
  accent: "#c26b3d",
}

type FormatKey = "portrait" | "square" | "story"

const FORMATS: {
  key: FormatKey
  label: string
  hint: string
  w: number
  h: number
  cols: number
}[] = [
  { key: "portrait", label: "Portrait", hint: "WhatsApp chats, email & printing", w: 1080, h: 1350, cols: 2 },
  { key: "square", label: "Square 1:1", hint: "Instagram & Facebook feed", w: 1080, h: 1080, cols: 3 },
  { key: "story", label: "Story 9:16", hint: "WhatsApp Status & Instagram Stories", w: 1080, h: 1920, cols: 2 },
]

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load ${src}`))
    img.src = src
  })
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

// Draw an image cropped to "cover" the given rounded box.
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.save()
  roundRect(ctx, x, y, w, h, r)
  ctx.clip()
  const ir = img.width / img.height
  const br = w / h
  let sw = img.width
  let sh = img.height
  let sx = 0
  let sy = 0
  if (ir > br) {
    sw = img.height * br
    sx = (img.width - sw) / 2
  } else {
    sh = img.width / br
    sy = (img.height - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
  ctx.restore()
}

function priceTag(ctx: CanvasRenderingContext2D, cx: number, cy: number, price: number, big = false) {
  const label = `FROM`
  const amount = `R${price}`
  const pad = big ? 26 : 16
  ctx.font = `700 ${big ? 30 : 20}px Arial, sans-serif`
  const amountW = ctx.measureText(amount).width
  ctx.font = `700 ${big ? 16 : 12}px Arial, sans-serif`
  const labelW = ctx.measureText(label).width
  const boxW = Math.max(amountW, labelW) + pad * 2
  const boxH = big ? 84 : 58
  const x = cx - boxW
  const y = cy
  ctx.fillStyle = COLORS.accent
  roundRect(ctx, x, y, boxW, boxH, big ? 16 : 12)
  ctx.fill()
  ctx.textAlign = "center"
  ctx.fillStyle = COLORS.white
  ctx.font = `700 ${big ? 16 : 12}px Arial, sans-serif`
  ctx.fillText(label, x + boxW / 2, y + (big ? 30 : 22))
  ctx.font = `800 ${big ? 34 : 24}px Arial, sans-serif`
  ctx.fillText(amount, x + boxW / 2, y + (big ? 66 : 46))
  ctx.textAlign = "left"
}

async function renderFlyer(
  canvas: HTMLCanvasElement,
  fmt: (typeof FORMATS)[number],
  images: { hero: HTMLImageElement; grid: HTMLImageElement[] },
) {
  const { w, h, cols } = fmt
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  // Background
  ctx.fillStyle = COLORS.cream
  ctx.fillRect(0, 0, w, h)

  const margin = 56
  const contentW = w - margin * 2

  // ---- Header band ----
  const headerH = Math.round(h * 0.12)
  ctx.fillStyle = COLORS.navy
  ctx.fillRect(0, 0, w, headerH)
  ctx.textAlign = "left"
  ctx.fillStyle = COLORS.white
  ctx.font = "800 46px Arial, sans-serif"
  ctx.fillText(BUSINESS.name, margin, headerH / 2 - 4)
  ctx.fillStyle = COLORS.cream
  ctx.font = "600 24px Arial, sans-serif"
  ctx.fillText(BUSINESS.tagline, margin, headerH / 2 + 32)
  // "Bedding Sale" ribbon on the right
  ctx.textAlign = "right"
  ctx.fillStyle = COLORS.accent
  ctx.font = "800 30px Arial, sans-serif"
  ctx.fillText("BEDDING COLLECTION", w - margin, headerH / 2 - 2)
  ctx.fillStyle = COLORS.cream
  ctx.font = "600 20px Arial, sans-serif"
  ctx.fillText("Prices from just R160", w - margin, headerH / 2 + 28)
  ctx.textAlign = "left"

  let cursorY = headerH + margin

  // ---- Hero image ----
  const heroH = Math.round(h * (fmt.key === "square" ? 0.32 : 0.34))
  drawCover(ctx, images.hero, margin, cursorY, contentW, heroH, 24)
  // hero label chip
  ctx.fillStyle = COLORS.navy
  const chipH = 56
  roundRect(ctx, margin, cursorY + heroH - chipH - 20, 460, chipH, 14)
  ctx.fill()
  ctx.fillStyle = COLORS.white
  ctx.font = "700 26px Arial, sans-serif"
  ctx.fillText(HERO.label, margin + 22, cursorY + heroH - chipH - 20 + chipH / 2 + 9)
  // hero price tag
  priceTag(ctx, margin + contentW - 20, cursorY + 20, HERO.price, true)

  cursorY += heroH + margin

  // ---- Product grid ----
  const rows = Math.ceil(GRID.length / cols)
  const gap = 24
  const footerH = Math.round(h * 0.14)
  const gridBottom = h - footerH - margin
  const gridAvailH = gridBottom - cursorY
  const cellW = (contentW - gap * (cols - 1)) / cols
  const cellH = (gridAvailH - gap * (rows - 1)) / rows

  ctx.font = "700 22px Arial, sans-serif"
  GRID.forEach((item, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = margin + col * (cellW + gap)
    const y = cursorY + row * (cellH + gap)
    const imgH = cellH - 46
    // card background
    ctx.fillStyle = COLORS.white
    roundRect(ctx, x, y, cellW, cellH, 18)
    ctx.fill()
    drawCover(ctx, images.grid[i], x + 8, y + 8, cellW - 16, imgH - 8, 12)
    // label + price
    ctx.fillStyle = COLORS.ink
    ctx.font = "700 20px Arial, sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(truncate(ctx, item.label, cellW - 120), x + 14, y + imgH + 26)
    ctx.fillStyle = COLORS.accent
    ctx.font = "800 22px Arial, sans-serif"
    ctx.textAlign = "right"
    ctx.fillText(`from R${item.price}`, x + cellW - 14, y + imgH + 26)
    ctx.textAlign = "left"
  })

  // ---- Footer band ----
  ctx.fillStyle = COLORS.navy
  ctx.fillRect(0, h - footerH, w, footerH)
  ctx.fillStyle = COLORS.white
  ctx.textAlign = "center"
  ctx.font = "800 46px Arial, sans-serif"
  ctx.fillText(`WhatsApp ${BUSINESS.whatsapp}  |  ${BUSINESS.website}`, w / 2, h - footerH / 2 - 8)
  ctx.fillStyle = COLORS.cream
  ctx.font = "600 30px Arial, sans-serif"
  ctx.fillText("Nationwide delivery  •  Secure online payment  •  Order today", w / 2, h - footerH / 2 + 38)
  ctx.textAlign = "left"
}

function truncate(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  if (ctx.measureText(text).width <= maxW) return text
  let t = text
  while (t.length > 1 && ctx.measureText(t + "…").width > maxW) {
    t = t.slice(0, -1)
  }
  return t + "…"
}

export function BeddingFlyerGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<{ hero: HTMLImageElement; grid: HTMLImageElement[] } | null>(null)
  const [format, setFormat] = useState<FormatKey>("portrait")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const draw = useCallback(async (key: FormatKey) => {
    const canvas = canvasRef.current
    if (!canvas || !imagesRef.current) return
    const fmt = FORMATS.find((f) => f.key === key)!
    await renderFlyer(canvas, fmt, imagesRef.current)
  }, [])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        const [hero, ...grid] = await Promise.all([HERO, ...GRID].map((it) => loadImage(it.src)))
        if (!active) return
        imagesRef.current = { hero, grid }
        await draw(format)
        setError(false)
      } catch {
        if (active) setError(true)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!loading && imagesRef.current) void draw(format)
  }, [format, loading, draw])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      const link = document.createElement("a")
      link.download = `Agri-Hub-Bedding-Flyer-${format}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
      toast.success("Flyer downloaded")
    } catch {
      toast.error("Could not export the flyer image")
    }
  }

  const active = FORMATS.find((f) => f.key === format)!

  return (
    <div className="space-y-4">
      <Tabs value={format} onValueChange={(v) => setFormat(v as FormatKey)}>
        <TabsList className="grid w-full grid-cols-3">
          {FORMATS.map((f) => (
            <TabsTrigger key={f.key} value={f.key}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-lg border bg-muted/30">
        {loading && (
          <div className="flex aspect-[4/5] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {error && !loading && (
          <div className="flex aspect-[4/5] items-center justify-center p-6 text-center text-sm text-muted-foreground">
            Could not load product images for the flyer. Please refresh and try again.
          </div>
        )}
        <canvas
          ref={canvasRef}
          className={`h-auto w-full ${loading || error ? "hidden" : "block"}`}
          aria-label="Bedding promotional flyer preview"
        />
      </div>

      <p className="text-center text-xs text-muted-foreground">{active.hint}</p>

      <Button onClick={handleDownload} disabled={loading || error} className="w-full gap-2">
        <Download className="h-4 w-4" />
        Download {active.label} flyer
      </Button>
    </div>
  )
}
