'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { CartItem, Cart } from '@/lib/types'

interface CartContextType {
  items: CartItem[]
  itemCount: number
  subtotal: number
  isLoading: boolean
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  clearCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Get or create session ID in localStorage
function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  let sessionId = localStorage.getItem('cart_session')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('cart_session', sessionId)
  }
  return sessionId
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

  // Fetch cart on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const sessionId = getSessionId()
        const res = await fetch('/api/cart', {
          headers: { 'x-cart-session': sessionId }
        })
        const data = await res.json()
        setItems(data.items || [])
      } catch (err) {
        console.error('Failed to fetch cart:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCart()
  }, [])

  const addItem = useCallback(async (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    // Optimistic update
    const existingItem = items.find(i => i.productId === item.productId)
    const updatedItems = existingItem
      ? items.map(i => 
          i.productId === item.productId 
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      : [...items, { ...item, quantity }]
    
    setItems(updatedItems)
    setIsCartOpen(true)

    try {
      const sessionId = getSessionId()
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-cart-session': sessionId
        },
        body: JSON.stringify({ action: 'add', item, quantity }),
      })
      const data = await res.json()
      
      // Save session ID if returned (for new sessions)
      if (data.sessionId) {
        localStorage.setItem('cart_session', data.sessionId)
      }
      
      setItems(data.items || [])
    } catch (err) {
      // Revert on error
      setItems(items)
      console.error('Failed to add item:', err)
    }
  }, [items])

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity < 1) {
      return removeItem(productId)
    }

    // Optimistic update
    const updatedItems = items.map(i => 
      i.productId === productId ? { ...i, quantity } : i
    )
    setItems(updatedItems)

    try {
      const sessionId = getSessionId()
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-cart-session': sessionId
        },
        body: JSON.stringify({ action: 'update', productId, quantity }),
      })
      const data = await res.json()
      setItems(data.items || [])
    } catch (err) {
      setItems(items)
      console.error('Failed to update quantity:', err)
    }
  }, [items])

  const removeItem = useCallback(async (productId: string) => {
    // Optimistic update
    const updatedItems = items.filter(i => i.productId !== productId)
    setItems(updatedItems)

    try {
      const sessionId = getSessionId()
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-cart-session': sessionId
        },
        body: JSON.stringify({ action: 'remove', productId }),
      })
      const data = await res.json()
      setItems(data.items || [])
    } catch (err) {
      setItems(items)
      console.error('Failed to remove item:', err)
    }
  }, [items])

  const clearCart = useCallback(async () => {
    setItems([])

    try {
      const sessionId = getSessionId()
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-cart-session': sessionId
        },
        body: JSON.stringify({ action: 'clear' }),
      })
    } catch (err) {
      console.error('Failed to clear cart:', err)
    }
  }, [])

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      subtotal,
      isLoading,
      isCartOpen,
      openCart,
      closeCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
