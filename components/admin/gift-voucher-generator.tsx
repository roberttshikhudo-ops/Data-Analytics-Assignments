"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Download, Loader2, RefreshCw, Copy, Check } from "lucide-react"
import { toast } from "sonner"

/**
 * Renders a professional Agri Hub SA gift voucher entirely on a <canvas> from
 * admin-supplied details, then exports it straight to PNG. No server round-trip.
 * Use it to reward customers with an amount to spend on their next purchase.
 */

const BUSINESS = {
  name: "AGRI HUB SA",
  tagline: "Your Partner in Agriculture & Home",
  whatsapp: "083 306 1529",
  website: "agrihubsa.co.za",
  logo: "/images/agri-hub-logo.jpg",
}

const COLORS = {
  green: "#2e7d32",
  darkGreen: "#184e20",
  deepGreen: "#0f3d17",
  ink: "#1f2d1a",
  cream: "#f7f5ec",
  softCream: "#efeadb",
  gold: "#c9a24b",
  lightGold: "#e4cf93",
  white: "#ffffff",
  muted: "#6b7b62",
}

type VoucherData = {
  recipient: string
  amount: string
  minSpend: string
  code: string
  expiry: string
  message: string
}

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let out = ""
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return `AHSA-${out.slice(0, 4)}-${out.slice(4)}`
}

function defaultExpiry() {
  const d = new Date()
  d.setMonth(d.getMonth() + 3)
  return d.toISOString().slice(0, 10)
}

function formatDate(iso: string) {
  if (!iso) return ""
  const d = new Date(iso + "T00:00:00")
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })
}

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

function drawContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  size: number,
) {
  const ir = img.width / img.height
  let w = size
  let h = size
  if (ir > 1) h = size / ir
  else w = size * ir
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h)
}

function renderVoucher(
  canvas: HTMLCanvasElement,
  data: VoucherData,
  logo: HTMLImageElement | null,
) {
  const w = 1600
  const h = 800
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  // Base
  ctx.fillStyle = COLORS.cream
  ctx.fillRect(0, 0, w, h)

  // Subtle diagonal texture on the base
  ctx.strokeStyle = "rgba(46,125,50,0.04)"
  ctx.lineWidth = 2
  for (let i = -h; i < w; i += 34) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + h, h)
    ctx.stroke()
  }

  const pad = 40
  // Card
  ctx.fillStyle = COLORS.white
  roundRect(ctx, pad, pad, w - pad * 2, h - pad * 2, 28)
  ctx.fill()

  // Gold double frame
  ctx.strokeStyle = COLORS.gold
  ctx.lineWidth = 4
  roundRect(ctx, pad + 16, pad + 16, w - pad * 2 - 32, h - pad * 2 - 32, 18)
  ctx.stroke()
  ctx.strokeStyle = COLORS.lightGold
  ctx.lineWidth = 1.5
  roundRect(ctx, pad + 24, pad + 24, w - pad * 2 - 48, h - pad * 2 - 48, 14)
  ctx.stroke()

  // ---- Left green panel ----
  const panelX = pad + 24
  const panelY = pad + 24
  const panelW = 520
  const panelH = h - pad * 2 - 48
  ctx.save()
  roundRect(ctx, panelX, panelY, panelW, panelH, 14)
  ctx.clip()
  // gradient fill
  const grad = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelH)
  grad.addColorStop(0, COLORS.green)
  grad.addColorStop(1, COLORS.deepGreen)
  ctx.fillStyle = grad
  ctx.fillRect(panelX, panelY, panelW, panelH)
  // faint leaf circle accents
  ctx.fillStyle = "rgba(255,255,255,0.05)"
  ctx.beginPath()
  ctx.arc(panelX + panelW - 30, panelY + 60, 150, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(panelX + 40, panelY + panelH - 30, 120, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  const panelCX = panelX + panelW / 2

  // Logo in a white disc
  if (logo) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(panelCX, panelY + 130, 92, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fillStyle = COLORS.white
    ctx.fill()
    ctx.clip()
    drawContain(ctx, logo, panelCX, panelY + 130, 150)
    ctx.restore()
  }

  ctx.textAlign = "center"
  ctx.fillStyle = COLORS.white
  ctx.font = "800 44px Georgia, 'Times New Roman', serif"
  ctx.fillText(BUSINESS.name, panelCX, panelY + 280)
  ctx.fillStyle = COLORS.lightGold
  ctx.font = "italic 22px Georgia, serif"
  ctx.fillText(BUSINESS.tagline, panelCX, panelY + 316)

  // Divider
  ctx.strokeStyle = "rgba(228,207,147,0.5)"
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(panelCX - 150, panelY + 348)
  ctx.lineTo(panelCX + 150, panelY + 348)
  ctx.stroke()

  // Amount label + value
  ctx.fillStyle = COLORS.lightGold
  ctx.font = "700 24px Arial, sans-serif"
  ctx.fillText("VOUCHER VALUE", panelCX, panelY + 400)
  ctx.fillStyle = COLORS.white
  ctx.font = "900 130px Arial, sans-serif"
  const amount = data.amount.trim() || "0"
  ctx.fillText(`R${amount}`, panelCX, panelY + 520)

  ctx.fillStyle = "rgba(255,255,255,0.92)"
  ctx.font = "600 24px Arial, sans-serif"
  ctx.fillText("to spend on your next purchase", panelCX, panelY + 560)
  ctx.textAlign = "left"

  // ---- Right content ----
  const rx = panelX + panelW + 56
  const rRight = w - pad - 24 - 40
  const rW = rRight - rx

  // "GIFT VOUCHER" title
  ctx.textAlign = "left"
  ctx.fillStyle = COLORS.gold
  ctx.font = "700 26px Arial, sans-serif"
  ctx.fillText("CONGRATULATIONS — YOU QUALIFY FOR A", rx, panelY + 70)
  ctx.fillStyle = COLORS.deepGreen
  ctx.font = "900 76px Georgia, serif"
  ctx.fillText("Gift Voucher", rx, panelY + 150)

  // Message / body
  ctx.fillStyle = COLORS.ink
  ctx.font = "400 26px Arial, sans-serif"
  const msg =
    data.message.trim() ||
    `As a valued customer of Agri Hub SA, you have earned R${amount} to spend on your next order with us. Thank you for shopping with us!`
  wrapText(ctx, msg, rx, panelY + 205, rW, 38)

  // "To" recipient line
  let cursorY = panelY + 205 + wrapCount(ctx, msg, rW) * 38 + 34
  if (data.recipient.trim()) {
    ctx.fillStyle = COLORS.muted
    ctx.font = "700 20px Arial, sans-serif"
    ctx.fillText("PRESENTED TO", rx, cursorY)
    ctx.fillStyle = COLORS.deepGreen
    ctx.font = "700 40px Georgia, serif"
    ctx.fillText(truncate(ctx, data.recipient.trim(), rW), rx, cursorY + 42)
    cursorY += 78
  }

  // Qualifying / terms chip
  const minSpend = data.minSpend.trim()
  if (minSpend) {
    const chipText = `Valid when you spend R${minSpend} or more`
    ctx.font = "700 22px Arial, sans-serif"
    const cw = ctx.measureText(chipText).width + 44
    ctx.fillStyle = "rgba(46,125,50,0.10)"
    roundRect(ctx, rx, cursorY, cw, 48, 24)
    ctx.fill()
    ctx.fillStyle = COLORS.green
    ctx.fillText(chipText, rx + 22, cursorY + 31)
    cursorY += 76
  }

  // Bottom detail row: code + expiry
  const detailY = h - pad - 24 - 132
  // Voucher code box
  ctx.fillStyle = COLORS.softCream
  roundRect(ctx, rx, detailY, 360, 100, 12)
  ctx.fill()
  ctx.strokeStyle = COLORS.gold
  ctx.setLineDash([6, 5])
  ctx.lineWidth = 2
  roundRect(ctx, rx, detailY, 360, 100, 12)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = COLORS.muted
  ctx.font = "700 18px Arial, sans-serif"
  ctx.fillText("VOUCHER CODE", rx + 22, detailY + 34)
  ctx.fillStyle = COLORS.deepGreen
  ctx.font = "800 34px 'Courier New', monospace"
  ctx.fillText(data.code.trim() || "—", rx + 22, detailY + 76)

  // Expiry
  ctx.fillStyle = COLORS.muted
  ctx.font = "700 18px Arial, sans-serif"
  ctx.fillText("VALID UNTIL", rx + 400, detailY + 34)
  ctx.fillStyle = COLORS.deepGreen
  ctx.font = "800 30px Arial, sans-serif"
  ctx.fillText(formatDate(data.expiry) || "—", rx + 400, detailY + 72)

  // Footer contact line inside card
  ctx.fillStyle = COLORS.green
  roundRect(ctx, rx, h - pad - 24 - 16, rW, 2, 1)
  ctx.fill()
  ctx.fillStyle = COLORS.ink
  ctx.font = "600 22px Arial, sans-serif"
  ctx.textAlign = "left"
  ctx.fillText(`WhatsApp ${BUSINESS.whatsapp}`, rx, h - pad - 44)
  ctx.textAlign = "right"
  ctx.fillText(BUSINESS.website, rRight, h - pad - 44)
  ctx.textAlign = "left"
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ""
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lh: number,
) {
  const lines = wrapLines(ctx, text, maxW)
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh))
}

function wrapCount(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  return wrapLines(ctx, text, maxW).length
}

function truncate(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  if (ctx.measureText(text).width <= maxW) return text
  let t = text
  while (t.length > 1 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1)
  return t + "…"
}

export function GiftVoucherGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const logoRef = useRef<HTMLImageElement | null>(null)
  const [ready, setReady] = useState(false)
  const [copied, setCopied] = useState(false)
  const [data, setData] = useState<VoucherData>({
    recipient: "",
    amount: "100",
    minSpend: "500",
    code: genCode(),
    expiry: defaultExpiry(),
    message: "",
  })

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    renderVoucher(canvas, data, logoRef.current)
  }, [data])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const logo = await loadImage(BUSINESS.logo)
        if (!active) return
        logoRef.current = logo
      } catch {
        logoRef.current = null
      } finally {
        if (active) setReady(true)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (ready) draw()
  }, [ready, draw])

  const update = (key: keyof VoucherData, value: string) =>
    setData((d) => ({ ...d, [key]: value }))

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      const link = document.createElement("a")
      const who = data.recipient.trim() ? `-${data.recipient.trim().replace(/\s+/g, "-")}` : ""
      link.download = `Agri-Hub-Gift-Voucher${who}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
      toast.success("Voucher downloaded")
    } catch {
      toast.error("Could not export the voucher image")
    }
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(data.code)
      setCopied(true)
      toast.success("Voucher code copied")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy the code")
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      {/* Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipient">Customer name (optional)</Label>
          <Input
            id="recipient"
            placeholder="e.g. John Mokoena"
            value={data.recipient}
            onChange={(e) => update("recipient", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Voucher value (R)</Label>
            <Input
              id="amount"
              inputMode="numeric"
              placeholder="100"
              value={data.amount}
              onChange={(e) => update("amount", e.target.value.replace(/[^0-9]/g, ""))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minSpend">Min. spend (R)</Label>
            <Input
              id="minSpend"
              inputMode="numeric"
              placeholder="500"
              value={data.minSpend}
              onChange={(e) => update("minSpend", e.target.value.replace(/[^0-9]/g, ""))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Voucher code</Label>
          <div className="flex gap-2">
            <Input
              id="code"
              value={data.code}
              onChange={(e) => update("code", e.target.value.toUpperCase())}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => update("code", genCode())}
              title="Generate new code"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopyCode}
              title="Copy code"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiry">Valid until</Label>
          <Input
            id="expiry"
            type="date"
            value={data.expiry}
            onChange={(e) => update("expiry", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Personal message (optional)</Label>
          <Textarea
            id="message"
            rows={3}
            placeholder="Leave blank to use the default thank-you message."
            value={data.message}
            onChange={(e) => update("message", e.target.value)}
          />
        </div>

        <Button onClick={handleDownload} disabled={!ready} className="w-full gap-2">
          <Download className="h-4 w-4" />
          Download voucher (PNG)
        </Button>
      </div>

      {/* Preview */}
      <div className="space-y-3">
        <div className="overflow-hidden rounded-lg border bg-muted/30">
          {!ready && (
            <div className="flex aspect-[2/1] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          <canvas
            ref={canvasRef}
            className={`h-auto w-full ${ready ? "block" : "hidden"}`}
            aria-label="Gift voucher preview"
          />
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Live preview — edit the fields on the left and download when ready. Exports at 1600 × 800px.
        </p>
      </div>
    </div>
  )
}
