"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatPrice } from "@/lib/utils"
import { Search, Save } from "lucide-react"

interface Product {
  id: string
  name: string
  sku: string | null
  price: number
  cost_price: number | null
  category_id: string | null
  categories: { name: string } | null
}

interface Category {
  id: string
  name: string
}

interface ProductCostEditorProps {
  products: Product[]
  categories: Category[]
}

export function ProductCostEditor({ products, categories }: ProductCostEditorProps) {
  const router = useRouter()
  const supabase = createClient()

  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [onlyMissing, setOnlyMissing] = useState(true)
  const [saving, setSaving] = useState(false)

  // Draft cost values keyed by product id. Only entries the user has edited
  // appear here, so we can save just the changes.
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku || "").toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === "all" || p.category_id === categoryFilter
      const matchesMissing = !onlyMissing || !(Number(p.cost_price) > 0)
      return matchesSearch && matchesCategory && matchesMissing
    })
  }, [products, search, categoryFilter, onlyMissing])

  const dirtyCount = Object.keys(drafts).length

  function setDraft(id: string, value: string) {
    setDrafts((prev) => ({ ...prev, [id]: value }))
  }

  function currentCost(p: Product): string {
    if (drafts[p.id] !== undefined) return drafts[p.id]
    return p.cost_price != null && Number(p.cost_price) > 0 ? String(p.cost_price) : ""
  }

  function marginFor(p: Product): number | null {
    const raw = currentCost(p)
    if (raw === "" || Number.isNaN(Number(raw))) return null
    const cost = Number(raw)
    const price = Number(p.price)
    if (price <= 0) return null
    return ((price - cost) / price) * 100
  }

  async function handleSave() {
    const entries = Object.entries(drafts)
      .map(([id, value]) => ({ id, value: value.trim() }))
      .filter((e) => e.value !== "")

    // Validate
    const invalid = entries.find((e) => Number.isNaN(Number(e.value)) || Number(e.value) < 0)
    if (invalid) {
      toast.error("Please enter valid, non-negative cost prices.")
      return
    }

    if (entries.length === 0) {
      toast.error("No cost prices to save.")
      return
    }

    setSaving(true)
    try {
      const results = await Promise.all(
        entries.map((e) =>
          supabase.from("product_costs").upsert(
            {
              product_id: e.id,
              cost_price: Number(e.value),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "product_id" },
          ),
        ),
      )
      const failed = results.filter((r) => r.error)
      if (failed.length > 0) {
        console.log("[v0] Cost save errors:", failed.map((f) => f.error?.message))
        toast.error(`Saved with ${failed.length} error(s). Please retry.`)
      } else {
        toast.success(`Saved cost prices for ${entries.length} product(s).`)
        setDrafts({})
        router.refresh()
      }
    } catch (err) {
      console.log("[v0] Cost save exception:", err)
      toast.error("Something went wrong while saving.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Switch id="only-missing" checked={onlyMissing} onCheckedChange={setOnlyMissing} />
          <Label htmlFor="only-missing" className="whitespace-nowrap">
            Only missing cost
          </Label>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Showing {filteredProducts.length} product(s)
          {dirtyCount > 0 && (
            <span className="ml-2 font-medium text-foreground">
              &middot; {dirtyCount} unsaved change(s)
            </span>
          )}
        </p>
        <Button onClick={handleSave} disabled={saving || dirtyCount === 0}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : `Save ${dirtyCount > 0 ? dirtyCount : ""} change(s)`}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Selling Price</TableHead>
              <TableHead className="w-[160px]">Cost Price (R)</TableHead>
              <TableHead className="text-right">Margin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No products found. Try adjusting the filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((p) => {
                const margin = marginFor(p)
                const isDirty = drafts[p.id] !== undefined
                return (
                  <TableRow key={p.id} className={isDirty ? "bg-primary/5" : undefined}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground">{p.sku || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.categories?.name || "-"}
                    </TableCell>
                    <TableCell className="text-right">{formatPrice(p.price)}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={currentCost(p)}
                        onChange={(e) => setDraft(p.id, e.target.value)}
                        className="h-9"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {margin == null ? (
                        <span className="text-muted-foreground">-</span>
                      ) : (
                        <Badge
                          variant="outline"
                          className={
                            margin < 0
                              ? "border-destructive/30 text-destructive"
                              : margin < 15
                                ? "border-amber-300 text-amber-700"
                                : "border-green-300 text-green-700"
                          }
                        >
                          {margin.toFixed(0)}%
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
