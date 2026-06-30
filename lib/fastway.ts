// Fastway Courier Integration for South Africa
// API Documentation: https://www.fastway.co.za

const FASTWAY_API_KEY = process.env.FASTWAY_API_KEY
const FASTWAY_BASE_URL = 'https://api.fastway.org/v3'

// Fastway country code for South Africa
const COUNTRY_CODE = 'za'

export interface FastwayQuote {
  name: string
  type: string
  price: number
  eta: string
  description: string
}

export interface FastwayShipment {
  labelUrl: string
  trackingNumber: string
  consignmentId: string
}

export interface ShippingAddress {
  name: string
  company?: string
  street: string
  suburb: string
  city: string
  postalCode: string
  province: string
  phone: string
  email: string
}

// Get shipping quote based on postal codes
export async function getShippingQuotes(
  fromPostalCode: string,
  toPostalCode: string,
  weightKg: number = 5
): Promise<FastwayQuote[]> {
  if (!FASTWAY_API_KEY) {
    console.error('[Fastway] API key not configured')
    return getDefaultQuotes()
  }

  try {
    const response = await fetch(
      `${FASTWAY_BASE_URL}/psc/lookup/${COUNTRY_CODE}/${fromPostalCode}/${toPostalCode}/${weightKg}?api_key=${FASTWAY_API_KEY}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error('[Fastway] Quote API error:', response.status)
      return getDefaultQuotes()
    }

    const data = await response.json()
    
    if (data.result && data.result.services) {
      return data.result.services.map((service: any) => ({
        name: service.name || service.labelcolour,
        type: service.labelcolour || 'STANDARD',
        price: parseFloat(service.totalprice_normal || service.totalprice || '0'),
        eta: service.etd_description || '3-5 business days',
        description: service.description || 'Standard delivery',
      }))
    }

    return getDefaultQuotes()
  } catch (error) {
    console.error('[Fastway] Quote error:', error)
    return getDefaultQuotes()
  }
}

// Create a shipment and get waybill
export async function createShipment(
  from: ShippingAddress,
  to: ShippingAddress,
  items: { description: string; weight: number; quantity: number }[],
  serviceType: string = 'ROAD'
): Promise<FastwayShipment | null> {
  if (!FASTWAY_API_KEY) {
    console.error('[Fastway] API key not configured')
    return null
  }

  const totalWeight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0)

  try {
    const response = await fetch(
      `${FASTWAY_BASE_URL}/consignment/create?api_key=${FASTWAY_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Country: COUNTRY_CODE,
          PickupRFCode: from.postalCode,
          DeliveryRFCode: to.postalCode,
          WeightInKg: totalWeight || 5,
          ServiceType: serviceType,
          PickupAddress: {
            ContactName: from.name,
            CompanyName: from.company || 'Agri Hub SA',
            Address1: from.street,
            Address2: from.suburb,
            Suburb: from.city,
            PostCode: from.postalCode,
            State: from.province,
            Phone: from.phone,
            Email: from.email,
          },
          DeliveryAddress: {
            ContactName: to.name,
            CompanyName: to.company || '',
            Address1: to.street,
            Address2: to.suburb,
            Suburb: to.city,
            PostCode: to.postalCode,
            State: to.province,
            Phone: to.phone,
            Email: to.email,
          },
          Items: items.map(item => ({
            Description: item.description,
            Quantity: item.quantity,
            WeightInKg: item.weight,
          })),
        }),
      }
    )

    if (!response.ok) {
      console.error('[Fastway] Create shipment error:', response.status)
      return null
    }

    const data = await response.json()

    if (data.result && data.result.consignment_id) {
      return {
        consignmentId: data.result.consignment_id,
        trackingNumber: data.result.tracking_number || data.result.consignment_id,
        labelUrl: data.result.label_url || '',
      }
    }

    return null
  } catch (error) {
    console.error('[Fastway] Create shipment error:', error)
    return null
  }
}

// Track a shipment
export async function trackShipment(trackingNumber: string): Promise<any> {
  if (!FASTWAY_API_KEY) {
    return null
  }

  try {
    const response = await fetch(
      `${FASTWAY_BASE_URL}/trackconsignment/detail/${trackingNumber}?api_key=${FASTWAY_API_KEY}&CountryCode=${COUNTRY_CODE}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.result || null
  } catch (error) {
    console.error('[Fastway] Track error:', error)
    return null
  }
}

// Default quotes when API is unavailable
function getDefaultQuotes(): FastwayQuote[] {
  return [
    {
      name: 'Standard Delivery (Fastway)',
      type: 'ROAD',
      price: 99,
      eta: '2-4 business days',
      description: 'Nationwide delivery via Fastway Couriers',
    },
    {
      name: 'Express Delivery (Fastway)',
      type: 'EXPRESS',
      price: 160,
      eta: '1-2 business days',
      description: 'Priority delivery to major centres via Fastway Couriers',
    },
  ]
}

// Check if order qualifies for free shipping
export function qualifiesForFreeShipping(orderTotal: number): boolean {
  return orderTotal >= 1000
}

// Calculate final shipping cost
export function calculateShippingCost(
  quote: FastwayQuote,
  orderTotal: number
): number {
  if (qualifiesForFreeShipping(orderTotal)) {
    return 0
  }
  return quote.price
}

// Agri Hub SA warehouse address (for shipping from)
export const AGRIHUB_WAREHOUSE: ShippingAddress = {
  name: 'Agri Hub SA',
  company: 'Agri Hub SA',
  street: 'The Parks Lifestyle Apartments, Block 38 Unit 2F',
  suburb: 'Midrand',
  city: 'Johannesburg',
  postalCode: '1685',
  province: 'Gauteng',
  phone: '0833061529',
  email: 'info@agrihubsa.co.za',
}
