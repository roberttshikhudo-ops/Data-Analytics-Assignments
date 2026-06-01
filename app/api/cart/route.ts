import { NextRequest, NextResponse } from 'next/server'
import { redis, getCartKey, CART_EXPIRY } from '@/lib/redis'
import type { Cart } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    // Get session ID from header (sent by client)
    const sessionId = request.headers.get('x-cart-session') || ''
    
    if (!sessionId) {
      // No session yet, return empty cart
      return NextResponse.json({ items: [], updatedAt: new Date().toISOString() })
    }
    
    const cartKey = getCartKey(sessionId)
    const cart = await redis.get<Cart>(cartKey)
    
    return NextResponse.json(cart || { items: [], updatedAt: new Date().toISOString() })
  } catch (error) {
    console.error('Cart GET error:', error)
    return NextResponse.json({ items: [], updatedAt: new Date().toISOString() })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get session ID from header (sent by client)
    let sessionId = request.headers.get('x-cart-session') || ''
    
    // If no session, create one and return it
    if (!sessionId) {
      sessionId = crypto.randomUUID()
    }
    
    const cartKey = getCartKey(sessionId)
    const body = await request.json()
    
    const { action, item, productId, quantity } = body
    
    // Get current cart
    let cart = await redis.get<Cart>(cartKey) || { items: [], updatedAt: new Date().toISOString() }
    
    switch (action) {
      case 'add': {
        const existingIndex = cart.items.findIndex(i => i.productId === item.productId)
        if (existingIndex > -1) {
          cart.items[existingIndex].quantity += quantity || 1
        } else {
          cart.items.push({ ...item, quantity: quantity || 1 })
        }
        break
      }
      
      case 'update': {
        const index = cart.items.findIndex(i => i.productId === productId)
        if (index > -1) {
          if (quantity <= 0) {
            cart.items.splice(index, 1)
          } else {
            cart.items[index].quantity = quantity
          }
        }
        break
      }
      
      case 'remove': {
        cart.items = cart.items.filter(i => i.productId !== productId)
        break
      }
      
      case 'clear': {
        cart.items = []
        break
      }
    }
    
    cart.updatedAt = new Date().toISOString()
    
    // Save to Redis
    await redis.set(cartKey, cart, { ex: CART_EXPIRY })
    
    // Return cart with session ID in response
    return NextResponse.json({ ...cart, sessionId })
  } catch (error) {
    console.error('Cart POST error:', error)
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
  }
}
