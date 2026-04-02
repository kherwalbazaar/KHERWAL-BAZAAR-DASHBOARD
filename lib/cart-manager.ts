/**
 * Cart Management Module
 * Handles cart operations and automatic stock reduction when checkout is created
 */

import { updateProduct, getSales, addSale } from './firebase'

export interface CartItem {
  productId: string
  productName: string
  quantity: number
  price: number
  costPrice: number
  stock: number
}

export interface Cart {
  items: CartItem[]
  totalPrice: number
  totalItems: number
}

/**
 * Initialize empty cart
 */
export const initializeCart = (): Cart => {
  return {
    items: [],
    totalPrice: 0,
    totalItems: 0,
  }
}

/**
 * Add item to cart
 */
export const addToCart = (cart: Cart, item: CartItem): Cart => {
  const existingItem = cart.items.find((i) => i.productId === item.productId)

  if (existingItem) {
    // Check if adding more quantity exceeds available stock
    if (existingItem.quantity + item.quantity > item.stock) {
      throw new Error(
        `Insufficient stock. Available: ${item.stock}, Requested: ${existingItem.quantity + item.quantity}`
      )
    }
    existingItem.quantity += item.quantity
  } else {
    // Check stock availability
    if (item.quantity > item.stock) {
      throw new Error(`Insufficient stock. Available: ${item.stock}, Requested: ${item.quantity}`)
    }
    cart.items.push({ ...item })
  }

  // Recalculate totals
  return recalculateCart(cart)
}

/**
 * Remove item from cart
 */
export const removeFromCart = (cart: Cart, productId: string): Cart => {
  cart.items = cart.items.filter((item) => item.productId !== productId)
  return recalculateCart(cart)
}

/**
 * Update item quantity
 */
export const updateCartItemQuantity = (cart: Cart, productId: string, quantity: number): Cart => {
  const item = cart.items.find((i) => i.productId === productId)

  if (!item) {
    throw new Error('Product not found in cart')
  }

  if (quantity <= 0) {
    return removeFromCart(cart, productId)
  }

  if (quantity > item.stock) {
    throw new Error(`Insufficient stock. Available: ${item.stock}, Requested: ${quantity}`)
  }

  item.quantity = quantity
  return recalculateCart(cart)
}

/**
 * Recalculate cart totals
 */
export const recalculateCart = (cart: Cart): Cart => {
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0)

  return {
    ...cart,
    totalItems,
    totalPrice,
  }
}

/**
 * Clear all items from cart
 */
export const clearCart = (): Cart => {
  return initializeCart()
}

/**
 * Process checkout and reduce stock in database
 * This function should be called when the user confirms the checkout
 */
export const processCheckout = async (
  cart: Cart,
  checkoutData?: {
    customerId?: string
    paymentMethod?: string
    paidAmount?: number
    notes?: string
  }
): Promise<{ success: boolean; saleId?: string; error?: string }> => {
  try {
    if (cart.items.length === 0) {
      return { success: false, error: 'Cart is empty' }
    }

    // Update stock for each product in the cart
    for (const item of cart.items) {
      console.log(`Processing checkout for product: ${item.productName}`)
      console.log(`  Current cart stock: ${item.stock}, Quantity to reduce: ${item.quantity}`)
      
      // Calculate new stock correctly
      const newStock = Math.max(0, item.stock - item.quantity)
      console.log(`  New stock will be: ${newStock}`)
      
      const result = await updateProduct(item.productId, {
        stock: newStock,
      })

      console.log(`  Update result: ${result.success ? 'SUCCESS' : 'FAILED'}`)

      if (!result.success) {
        console.error(`Error updating stock for ${item.productName}:`, result.error)
        throw new Error(`Failed to update stock for product ${item.productName}`)
      }
    }

    // Create sale record in database
    console.log(`Creating sale record for ${cart.totalItems} items, Total: ₹${cart.totalPrice}`)
    
    const saleRecord = {
      items: cart.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price,
      })),
      total: cart.totalPrice,
      paidAmount: checkoutData?.paidAmount || cart.totalPrice,
      customerId: checkoutData?.customerId || null,
      paymentMethod: checkoutData?.paymentMethod || 'cash',
      notes: checkoutData?.notes || '',
      checkoutDate: new Date().toISOString(),
      totalItems: cart.totalItems,
    }

    const saleResult = await addSale(saleRecord)

    console.log(`Sale creation result: ${saleResult.success ? 'SUCCESS' : 'FAILED'}`)
    if (saleResult.success) {
      console.log(`Sale ID: ${saleResult.id}`)
    }

    if (saleResult.success) {
      console.log('✅ Checkout completed successfully!')
      return {
        success: true,
        saleId: saleResult.id,
      }
    } else {
      console.error('❌ Failed to create sale record:', saleResult.error)
      return {
        success: false,
        error: 'Failed to create sale record',
      }
    }
  } catch (error) {
    console.error('❌ Checkout error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Get stock status for a product
 */
export const getStockStatus = (stock: number): 'in-stock' | 'low-stock' | 'out-of-stock' => {
  if (stock <= 0) {
    return 'out-of-stock'
  }
  if (stock < 5) {
    return 'low-stock'
  }
  return 'in-stock'
}
