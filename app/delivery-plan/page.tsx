import type { Metadata } from "next"
import { ProformaPrintButton } from "@/components/proforma-print-button"

export const metadata: Metadata = {
  title: "Delivery Run-Sheet",
  description: "Optimized delivery route plan",
}

interface Stop {
  order: number
  name: string
  address: string
  phone: string
  orderRef: string
  amount: string
  leg: string
  note?: string
}

const START_END = "Midrand base — The Parks, Midrand, Johannesburg, 1685"

const STOPS: Stop[] = [
  {
    order: 1,
    name: "Bonny Mloresi",
    address:
      "Lion Pride Lifestyle Estate, 21265 Mongoose St, Kilimanjaro Village 3, Nietgedacht (near Lanseria), Johannesburg",
    phone: "083 283 9149",
    orderRef: "AGR-20260713-0018",
    amount: "R545.00",
    leg: "≈ 30 km / 30 min from base",
    note: "Order asks you to phone on arrival.",
  },
  {
    order: 2,
    name: "Dolly Letlhake",
    address: "House 241, Lemenong Section, Phokeng, North West",
    phone: "083 589 1862",
    orderRef: "AGR-20260713-0017",
    amount: "R2,815.00",
    leg: "≈ 105 km / 1h20 from Stop 1",
    note: "Largest order + longest leg. Confirm she is home before driving out to Phokeng.",
  },
  {
    order: 3,
    name: "Nericha Dobson",
    address: "100 Pepler Street (Office), Pretoria, 0200",
    phone: "066 528 5414",
    orderRef: "AGR-20260629-0016",
    amount: "R623.72",
    leg: "≈ 135 km / 1h30 from Stop 2 (via N4)",
    note: "Office address — deliver within business hours.",
  },
  {
    order: 4,
    name: "Mary Mojalefa",
    address: "House 33, Wynand Smith St, Phillip Nel Park, Pretoria West",
    phone: "072 452 1605",
    orderRef: "AGR-20260713-0023",
    amount: "R765.00",
    leg: "≈ 12 km / 20 min from Stop 3",
  },
]

export default function DeliveryPlanPage() {
  const today = new Date().toLocaleDateString("en-ZA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <main className="min-h-screen bg-muted/40 py-8 print:bg-white print:py-0">
      <div className="mx-auto flex max-w-3xl justify-end px-4 pb-4 print:hidden">
        <ProformaPrintButton />
      </div>

      <article className="mx-auto max-w-3xl bg-background p-8 shadow-sm print:max-w-none print:p-0 print:shadow-none">
        {/* Header */}
        <header className="mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold text-balance">Delivery Run-Sheet</h1>
          <p className="mt-1 text-sm text-muted-foreground">{today}</p>
          <p className="mt-3 text-sm">
            <span className="font-medium">Route:</span> Clockwise loop — Midrand → Lanseria →
            Phokeng → Pretoria → Midrand
          </p>
          <p className="text-sm">
            <span className="font-medium">Vehicle:</span> Own car
          </p>
        </header>

        {/* Start */}
        <section className="mb-4 rounded-lg border border-dashed p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Start / End
          </p>
          <p className="mt-1 font-medium">{START_END}</p>
          <p className="text-sm text-muted-foreground">Load the vehicle before departing.</p>
        </section>

        {/* Stops */}
        <ol className="space-y-4">
          {STOPS.map((stop) => (
            <li key={stop.order} className="rounded-lg border p-4 print:break-inside-avoid">
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {stop.order}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-lg font-semibold">{stop.name}</h2>
                    <span className="text-sm font-medium text-muted-foreground">
                      {stop.orderRef} · {stop.amount}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-pretty">{stop.address}</p>
                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    <span>
                      <span className="text-muted-foreground">Phone: </span>
                      {stop.phone}
                    </span>
                    <span>
                      <span className="text-muted-foreground">Leg: </span>
                      {stop.leg}
                    </span>
                  </div>
                  {stop.note && (
                    <p className="mt-2 rounded bg-muted px-2 py-1 text-sm">{stop.note}</p>
                  )}
                  <div className="mt-3 flex items-center gap-2 print:hidden">
                    <span className="text-xs text-muted-foreground">Delivered</span>
                    <span className="inline-block h-4 w-4 rounded border" aria-hidden="true" />
                  </div>
                  {/* Print-only signature line */}
                  <div className="mt-3 hidden items-end gap-2 print:flex">
                    <span className="text-xs text-muted-foreground">Received / Signature:</span>
                    <span className="h-4 flex-1 border-b border-dotted" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>

        {/* Return */}
        <section className="mt-4 rounded-lg border border-dashed p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Return
          </p>
          <p className="mt-1 font-medium">{START_END}</p>
          <p className="text-sm text-muted-foreground">≈ 45 km / 40 min from Stop 4.</p>
        </section>

        {/* Trip summary */}
        <section className="mt-6 border-t pt-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Trip Summary
          </h2>
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground">Total distance</p>
              <p className="font-medium">≈ 325 km</p>
            </div>
            <div>
              <p className="text-muted-foreground">Driving time</p>
              <p className="font-medium">≈ 4h30 (excl. stops)</p>
            </div>
            <div>
              <p className="text-muted-foreground">Est. fuel cost</p>
              <p className="font-medium">≈ R550–R650</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground text-pretty">
            Fuel estimate assumes ~8 L/100 km at ~R23/L. Adjust for your car&apos;s actual
            consumption and the current pump price. Phokeng is the far-west point, so doing it mid-loop
            (rather than an out-and-back) avoids ~100 km of wasted driving.
          </p>
        </section>
      </article>
    </main>
  )
}
