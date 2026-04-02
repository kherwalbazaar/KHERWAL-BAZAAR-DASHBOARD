/**
 * useCart Hook
 * Manages cart state and operations with automatic stock validation
 */

'use client'

import { useState, useCallback } from 'react'
import {
  Cart,
  CartItem,
  initializeCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  recalculateCart,
  processCheckout,
} from '@/lib/cart-manager'

export const useCart = (initialCart?: Cart) => {
  const [cart, setCart] = useState<Cart>(initialCart || initializeCart())
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddToCart = useCallback(
    (item: CartItem) => {
      try {
        setError(null)
        const updatedCart = addToCart(cart, item)
        setCart(updatedCart)
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add item to cart'
        setError(errorMessage)
        return false
      }
    },
    [cart]
  )

  const handleRemoveFromCart = useCallback((productId: string) => {
    setError(null)
    setCart((prevCart) => removeFromCart(prevCart, productId))
  }, [])

  const handleUpdateQuantity = useCallback(
    (productId: string, quantity: number) => {
      try {
        setError(null)
        const updatedCart = updateCartItemQuantity(cart, productId, quantity)
        setCart(updatedCart)
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update quantity'
        setError(errorMessage)
        return false
      }
    },
    [cart]
  )

  const handleClearCart = useCallback(() => {
    setError(null)
    setCart(clearCart())
  }, [])

  const handleCheckout = useCallback(
    async (checkoutData?: {
      customerId?: string
      paymentMethod?: string
      paidAmount?: number
      notes?: string
    }) => {
      setIsProcessing(true)
      setError(null)

      try {
        const result = await processCheckout(cart, checkoutData)

        if (result.success) {
          setCart(clearCart())
          return {
            success: true,
            saleId: result.saleId,
          }
        } else {
          setError(result.error || 'Checkout failed')
          return {
            success: false,
            error: result.error,
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Checkout failed'
        setError(errorMessage)
        return {
          success: false,
          error: errorMessage,
        }
      } finally {
        setIsProcessing(false)
      }
    },
    [cart]
  )

  return {
    cart,
    isProcessing,
    error,
    addToCart: handleAddToCart,
    removeFromCart: handleRemoveFromCart,
    updateQuantity: handleUpdateQuantity,
    clearCart: handleClearCart,
    checkout: handleCheckout,
    totalItems: cart.totalItems,
    totalPrice: cart.totalPrice,
  }
}
