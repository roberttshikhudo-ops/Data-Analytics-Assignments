"use client"

import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ProformaPrintButton() {
  return (
    <Button
      onClick={() => window.print()}
      className="print:hidden"
      size="lg"
    >
      <Printer className="mr-2 h-4 w-4" />
      Print / Save as PDF
    </Button>
  )
}
