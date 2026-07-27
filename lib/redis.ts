import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// Cart key helpers
export const getCartKey = (sessionId: string) => `cart:${sessionId}`
// Keep saved carts alive for 30 days. The expiry is refreshed on every read
// (sliding expiration) so an actively shopping customer never loses their cart.
export const CART_EXPIRY = 60 * 60 * 24 * 30 // 30 days in seconds
