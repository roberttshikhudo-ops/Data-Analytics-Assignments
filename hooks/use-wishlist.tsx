'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function useWishlist(productId?: string) {
  const router = useRouter()
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(!!productId)

  // Check whether this product is already in the user's wishlist
  useEffect(() => {
    let active = true

    async function check() {
      if (!productId) return
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          if (active) setIsChecking(false)
          return
        }

        const { data } = await supabase
          .from('wishlists')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .maybeSingle()

        if (active) {
          setIsInWishlist(!!data)
          setIsChecking(false)
        }
      } catch {
        if (active) setIsChecking(false)
      }
    }

    check()
    return () => {
      active = false
    }
  }, [productId])

  const toggleWishlist = useCallback(
    async (id?: string) => {
      const targetId = id || productId
      if (!targetId) return

      setIsLoading(true)
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          toast.error('Please sign in to save items to your wishlist')
          router.push('/auth/login?redirect=/account/wishlist')
          return
        }

        if (isInWishlist) {
          const { error } = await supabase
            .from('wishlists')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', targetId)

          if (error) throw error
          setIsInWishlist(false)
          toast.success('Removed from wishlist')
        } else {
          const { error } = await supabase
            .from('wishlists')
            .insert({ user_id: user.id, product_id: targetId })

          if (error) throw error
          setIsInWishlist(true)
          toast.success('Added to wishlist')
        }
      } catch (err) {
        toast.error('Could not update wishlist. Please try again.')
      } finally {
        setIsLoading(false)
      }
    },
    [productId, isInWishlist, router],
  )

  return { isInWishlist, isLoading, isChecking, toggleWishlist }
}
