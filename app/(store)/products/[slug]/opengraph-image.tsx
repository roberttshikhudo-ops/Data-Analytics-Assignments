import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const alt = 'Agri Hub SA product'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://agrihubsa.co.za'

function resolveImage(url: string | null): string | null {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

function formatPrice(value: number): string {
  return `R${Number(value).toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let product: {
    name: string
    price: number
    compare_at_price: number | null
    image_url: string | null
  } | null = null

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const { data } = await supabase
      .from('products')
      .select('name, price, compare_at_price, image_url')
      .eq('slug', slug)
      .single()
    product = data
  } catch {
    // fall through to default card
  }

  const name = product?.name ?? 'Agri Hub SA'
  const imageUrl = resolveImage(product?.image_url ?? null)
  const onSale =
    product?.compare_at_price != null && product.compare_at_price > (product.price ?? 0)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: '#2D5016',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Product image panel */}
        <div
          style={{
            width: '46%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            padding: 40,
          }}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              width={480}
              height={480}
              style={{ width: 480, height: 480, objectFit: 'contain' }}
            />
          ) : (
            <div style={{ display: 'flex', fontSize: 64, color: '#2D5016', fontWeight: 700 }}>
              Agri Hub SA
            </div>
          )}
        </div>

        {/* Details panel */}
        <div
          style={{
            width: '54%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 56,
            color: '#ffffff',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 28,
              letterSpacing: 4,
              fontWeight: 700,
              color: '#F4A300',
              marginBottom: 24,
            }}
          >
            AGRI HUB SA
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 28,
            }}
          >
            {name.length > 60 ? `${name.slice(0, 60)}…` : name}
          </div>

          {product?.price != null && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginBottom: 32 }}>
              <div style={{ display: 'flex', fontSize: 64, fontWeight: 800 }}>
                {formatPrice(product.price)}
              </div>
              {onSale && (
                <div
                  style={{
                    display: 'flex',
                    fontSize: 36,
                    color: '#cbd5c0',
                    textDecoration: 'line-through',
                    paddingBottom: 10,
                  }}
                >
                  {formatPrice(product!.compare_at_price as number)}
                </div>
              )}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              backgroundColor: '#F4A300',
              color: '#2D5016',
              fontSize: 28,
              fontWeight: 700,
              padding: '14px 28px',
              borderRadius: 999,
            }}
          >
            Free delivery over R1,000
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
