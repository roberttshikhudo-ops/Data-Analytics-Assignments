'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BedDouble,
  Layers,
  Blocks,
  Snowflake,
  Store,
  Truck,
  MapPin,
  Headphones,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  PackageCheck,
  type LucideIcon,
} from 'lucide-react'
import {
  ORDER_MENU,
  ORDER_INTENT_MESSAGE,
  buildOrderWaLink,
  type OrderMenuOption,
} from '@/lib/whatsapp'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'

const ICONS: Record<string, LucideIcon> = {
  BedDouble,
  Layers,
  Blocks,
  Snowflake,
  Store,
  Truck,
  MapPin,
  Headphones,
}

const STEPS = [
  {
    icon: MessageCircle,
    title: 'Tap an option',
    body: 'Pick a category below or start a chat. We reply with a quick menu.',
  },
  {
    icon: PackageCheck,
    title: 'We help you choose',
    body: 'Tell us what you need and we confirm your items, sizes and total.',
  },
  {
    icon: CreditCard,
    title: 'Pay securely',
    body: 'We send a secure payment link. Checkout in seconds, delivered to your door.',
  },
]

export function OrderOnWhatsApp() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#075E54] via-[#0b7d6f] to-[#128C7E] text-white">
        <div className="container py-14 text-center md:py-20">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
            <MessageCircle className="h-4 w-4" />
            Order on WhatsApp
          </div>
          <h1 className="mx-auto max-w-2xl text-balance text-4xl font-bold leading-tight md:text-5xl">
            Order your bedding in 3 simple steps
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-white/85">
            No forms, no fuss. Chat with us on WhatsApp, choose your products, and pay with
            a secure link once your order is confirmed.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-14 gap-2 bg-white px-8 text-lg font-semibold text-[#075E54] hover:bg-white/90"
            >
              <a href={buildOrderWaLink()} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />
                Start My Order on WhatsApp
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 border-white/40 bg-transparent px-8 text-lg font-semibold text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="#menu">
                Browse Options
                <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <p className="mx-auto mt-4 max-w-md text-sm text-white/70">
            Sends this message: &ldquo;{ORDER_INTENT_MESSAGE}&rdquo;
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="border-b bg-background py-12">
        <div className="container grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="relative rounded-xl border bg-card p-6 text-card-foreground"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#128C7E]/10 text-[#075E54]">
                <step.icon className="h-6 w-6" />
              </div>
              <div className="absolute right-5 top-5 text-3xl font-bold text-muted-foreground/20">
                {i + 1}
              </div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="scroll-mt-24 bg-muted/30 py-14">
        <div className="container">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold">What would you like to do?</h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              Tap an option to browse the products, or chat with us directly on WhatsApp.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ORDER_MENU.map((option) => (
              <OrderOptionCard key={option.n} option={option} />
            ))}
          </div>
        </div>
      </section>

      {/* Reassurance footer */}
      <section className="bg-background py-12">
        <div className="container flex flex-col items-center gap-6 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#075E54]" /> Secure payment link
            </span>
            <span className="inline-flex items-center gap-2">
              <Truck className="h-5 w-5 text-[#075E54]" /> Nationwide delivery
            </span>
            <span className="inline-flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-[#075E54]" /> Free over R1,000
            </span>
          </div>
          <Button
            asChild
            size="lg"
            className="h-14 gap-2 bg-[#25D366] px-8 text-lg font-semibold text-white hover:bg-[#20BD5A]"
          >
            <a href={buildOrderWaLink()} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5" />
              Start My Order on WhatsApp
            </a>
          </Button>
        </div>
      </section>
    </div>
  )
}

function OrderOptionCard({ option }: { option: OrderMenuOption }) {
  const Icon = ICONS[option.icon] ?? Store
  const waLink = buildOrderWaLink(option.waMessage)
  const isDelivery = option.href === '#delivery'
  const isDirectChat = option.href.startsWith('http')

  return (
    <div className="group flex flex-col rounded-xl border bg-card p-5 text-card-foreground shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#128C7E]/10 text-[#075E54]">
          <Icon className="h-5 w-5" />
        </span>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#075E54] text-sm font-bold text-white">
          {option.n}
        </span>
      </div>

      <h3 className="text-base font-semibold leading-tight">{option.label}</h3>
      <p className="mt-1 flex-1 text-sm text-muted-foreground">{option.description}</p>

      <div className="mt-4 flex flex-col gap-2">
        {isDelivery ? (
          <DeliveryDialog />
        ) : isDirectChat ? (
          <Button
            asChild
            className="w-full gap-2 bg-[#25D366] text-white hover:bg-[#20BD5A]"
          >
            <a href={option.href} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" />
              Chat Now
            </a>
          </Button>
        ) : (
          <Button asChild className="w-full gap-1.5 bg-[#075E54] text-white hover:bg-[#064c44]">
            <Link href={option.href}>
              {option.n === 6 ? 'Track Order' : 'Browse'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}

        {!isDirectChat && (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full gap-2 text-[#075E54] hover:bg-[#128C7E]/10 hover:text-[#075E54]"
          >
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}

function DeliveryDialog() {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-1.5 bg-[#075E54] text-white hover:bg-[#064c44]">
          View Cost
          <ArrowRight className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-[#075E54]" />
            Delivery Cost
          </DialogTitle>
          <DialogDescription>
            We deliver nationwide with Fastway couriers.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="rounded-lg border bg-emerald-50 p-4 text-emerald-900">
            <p className="font-semibold">FREE delivery on orders over R1,000</p>
            <p className="mt-1 text-emerald-800/80">
              Spend R1,000 or more and we cover the courier cost anywhere in South Africa.
            </p>
          </div>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#075E54]" />
              Orders under R1,000 are charged a courier rate based on your area and parcel
              size, calculated at checkout.
            </li>
            <li className="flex items-start gap-2">
              <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#075E54]" />
              You receive a tracking number by SMS/email as soon as your parcel ships.
            </li>
          </ul>
          <Button
            asChild
            className="w-full gap-2 bg-[#25D366] text-white hover:bg-[#20BD5A]"
          >
            <a
              href={buildOrderWaLink(
                'Hello Agri Hub SA, please tell me the delivery cost (Option 7) to my area. My town/postal code is: ',
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4" />
              Get my exact delivery cost
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
