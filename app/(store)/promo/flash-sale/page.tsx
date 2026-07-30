import { Metadata } from 'next'
import { FlashSaleContent } from '@/components/marketing/flash-sale-content'

const OFFER_TITLE = '24-Hour Winter Bedding Flash Sale | Agri Hub SA'
const OFFER_DESCRIPTION =
  'Today only — save big on cozy corduroy comforters, fleece throws and winter blankets. Order online or on WhatsApp. Nationwide delivery. Hurry, ends at midnight!'

export const metadata: Metadata = {
  title: OFFER_TITLE,
  description: OFFER_DESCRIPTION,
  openGraph: {
    title: OFFER_TITLE,
    description: OFFER_DESCRIPTION,
    images: ['/images/promo/winter-specials-hero.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: OFFER_TITLE,
    description: OFFER_DESCRIPTION,
    images: ['/images/promo/winter-specials-hero.png'],
  },
}

export default function FlashSalePage() {
  return <FlashSaleContent />
}
