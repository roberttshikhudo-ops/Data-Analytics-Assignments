import type { Metadata } from 'next'
import { OrderOnWhatsApp } from '@/components/store/order-on-whatsapp'
import { BeddingCatalogueSection } from '@/components/store/bedding-catalogue-section'
import { getCachedCatalogue } from '@/lib/catalogue/cache-bedding-6'

export const metadata: Metadata = {
  title: 'Order on WhatsApp | Agri Hub SA',
  description:
    'Order bedding from Agri Hub SA on WhatsApp in 3 simple steps. Choose your product, confirm your order, and pay with a secure link. Nationwide delivery, free over R1,000.',
  openGraph: {
    title: 'Order on WhatsApp | Agri Hub SA',
    description:
      'Choose a product, confirm your order, and pay with a secure link. Ordering bedding has never been easier.',
  },
}

export default async function OrderPage() {
  const catalogue = await getCachedCatalogue()
  return (
    <>
      <OrderOnWhatsApp />
      <BeddingCatalogueSection downloadUrl={catalogue?.downloadUrl} />
    </>
  )
}
