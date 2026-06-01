import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// Cart key helpers
export const getCartKey = (sessionId: string) => `cart:${sessionId}`
export const CART_EXPIRY = 60 * 60 * 24 * 7 // 7 days in seconds
