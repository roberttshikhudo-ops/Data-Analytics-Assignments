import type { Metadata } from 'next'
import { Gift, Share2, ShoppingBag, Truck } from 'lucide-react'
import { ReferWidget } from '@/components/marketing/refer-widget'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://agrihubsa.co.za'
const REFERRAL_CODE = 'FRIEND10'

export const metadata: Metadata = {
  title: 'Refer a Friend - Give 10% Off',
  description:
    'Share Agri Hub SA with friends and give them 10% off their first order. Quality agricultural, hardware & lifestyle supplies with fast nationwide delivery.',
  openGraph: {
    title: 'Refer a Friend | Agri Hub SA',
    description: 'Give your friends 10% off their first order at Agri Hub SA.',
    type: 'website',
  },
}

const steps = [
  {
    icon: Share2,
    title: 'Share your code',
    description: 'Send FRIEND10 to friends, family, and your farming community via WhatsApp or social media.',
  },
  {
    icon: ShoppingBag,
    title: 'They save 10%',
    description: 'Your friend gets 10% off their first order - on seeds, tools, bedding, and more.',
  },
  {
    icon: Truck,
    title: 'Everyone wins',
    description: 'They enjoy quality products with free delivery over R1,000, delivered nationwide.',
  },
]

export default function ReferPage() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/10">
            <Gift className="h-8 w-8" />
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Share Agri Hub SA, Give 10% Off
          </h1>
          <p className="text-pretty text-lg opacity-90">
            Know someone who&apos;d love quality farm, home, and hardware supplies? Share your code
            and give them 10% off their first order.
          </p>
        </div>
      </section>

      {/* Widget */}
      <section className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
          <ReferWidget code={REFERRAL_CODE} shareUrl={BASE_URL} />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <h2 className="mb-10 text-center text-2xl font-bold md:text-3xl">How it works</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="flex flex-col items-center gap-3 text-center">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <step.icon className="h-7 w-7" />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-pretty text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
