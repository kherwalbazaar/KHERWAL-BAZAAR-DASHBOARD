# Shopping Cart & Stock Management System

This document explains how to use the shopping cart and automatic stock reduction system in the Kherwal Bazaar Dashboard.

## Overview

The system includes three components:

1. **Cart Manager** (`lib/cart-manager.ts`) - Business logic for cart operations
2. **useCart Hook** (`hooks/use-cart.ts`) - React hook for managing cart state
3. **Shopping Cart Component** (`components/shopping-cart.tsx`) - UI component for displaying cart

## Features

- ✅ Add items to cart with stock validation
- ✅ Remove items from cart
- ✅ Update item quantities with stock checks
- ✅ Automatic stock reduction when checkout is completed
- ✅ Sale record creation in Firebase
- ✅ Payment method tracking
- ✅ Customer tracking (optional)
- ✅ Order notes support

## Usage

### Basic Implementation

```tsx
'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/use-cart'
import { ShoppingCart } from '@/components/shopping-cart'

export default function ProductPage() {
  const [cartOpen, setCartOpen] = useState(false)
  const cart = useCart()

  const handleAddProduct = (product: any) => {
    const success = cart.addToCart({
      productId: product.id,
      productName: product.name,
      quantity: 1,
      price: product.price,
      costPrice: product.costPrice,
      stock: product.stock,
    })

    if (!success) {
      // Show error message
      console.error(cart.error)
    }
  }

  return (
    <div>
      {/* Your product listing */}
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        🛒 Cart ({cart.totalItems})
      </button>

      <ShoppingCart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckoutSuccess={(saleId) => {
          console.log('Sale created:', saleId)
          // Reload dashboard data
        }}
      />
    </div>
  )
}
```

### useCart Hook API

```typescript
const cart = useCart()

// Properties
cart.cart              // Current cart object with items
cart.totalItems        // Total number of items in cart
cart.totalPrice        // Total cart value
cart.isProcessing      // Whether checkout is in progress
cart.error            // Error message if any operation fails

// Methods
cart.addToCart(item)           // Add item to cart
cart.removeFromCart(productId) // Remove item from cart
cart.updateQuantity(productId, quantity) // Update item quantity
cart.clearCart()               // Clear all items
cart.checkout(checkoutData)    // Process checkout and reduce stock
```

### Checkout Data

When calling `cart.checkout()`, pass an optional object:

```typescript
cart.checkout({
  customerId: 'CUST123',           // Optional: customer ID
  paymentMethod: 'cash',           // Optional: 'cash', 'card', 'upi', 'bank_transfer'
  paidAmount: 1000,               // Optional: amount paid (defaults to total)
  notes: 'Special packaging',      // Optional: order notes
})
```

## Database Schema

### Products Collection
```typescript
{
  id: string
  name: string
  price: number           // Selling price
  costPrice: number       // Cost price for investment tracking
  stock: number           // Current stock (auto-updated)
  // ... other fields
}
```

### Sales Collection
```typescript
{
  id: string
  items: Array<{
    productId: string
    productName: string
    quantity: number
    price: number
    subtotal: number
  }>
  total: number           // Total sale amount
  paidAmount: number      // Amount actually paid
  customerId?: string     // Optional customer reference
  paymentMethod: string   // 'cash', 'card', 'upi', 'bank_transfer'
  notes?: string         // Optional notes
  checkoutDate: string   // ISO timestamp
  totalItems: number     // Total items in sale
}
```

## Dashboard Metrics

The dashboard automatically updates with real data from Firebase:

### Total Sales (₹)
- Shows: `Total paid amount from all sales`
- Source: Sum of `paidAmount` from sales collection

### Total Orders
- Shows: `Number of completed checkouts`
- Source: Count of documents in sales collection
- Note: Includes +8.2% calculation if data available

### Growth Rate
- Shows: `Year-over-year growth percentage`
- Source: Calculated from sales data

### Total Products
- Shows: `Number of products in inventory`
- Source: Count of documents in products collection

### Total Stock
- Shows: `Sum of all product stock units`
- Source: Sum of updated `stock` field after each checkout

### Total Invest
- Shows: `Total product cost price (inventory value)`
- Source: Sum of `costPrice * stock` for all products
- Updates: Automatically when stock changes

## Stock Reduction Process

When a customer completes checkout:

1. **Validate Cart**: Ensure all items have sufficient stock
2. **Update Products**: Reduce stock for each product in cart
   - New Stock = Current Stock - Purchased Quantity
3. **Create Sale Record**: Save sale details in Firebase
4. **Update Dashboard**: Metrics automatically refresh
5. **Clear Cart**: Reset for next transaction

## Error Handling

All methods return error messages that you should display to users:

```typescript
const success = cart.addToCart(item)
if (!success) {
  showErrorMessage(cart.error) // e.g., "Insufficient stock. Available: 5, Requested: 10"
}

// Or check in checkout
const result = await cart.checkout(data)
if (!result.success) {
  console.error(result.error)
}
```

## Stock Validation Rules

- **Adding to Cart**: Checks if requested quantity ≤ available stock
- **Updating Quantity**: Validates new quantity against stock
- **Purchasing**: Final check before stock reduction
- **Low Stock Alert**: Items with < 5 units show `low-stock` status

## Integration with Existing Pages

### For Garments / Products Pages
```typescript
// In your product listing component
<button 
  onClick={() => cart.addToCart({
    productId: product.id,
    productName: product.name,
    quantity: 1,
    price: product.price,
    costPrice: product.costPrice,
    stock: product.stock
  })}
>
  Add to Cart
</button>
```

### For Dashboard
The dashboard metrics update automatically via `loadDashboardData()` function in `app/page.tsx`. To refresh metrics after checkout, call:

```typescript
// Import in your component
import { loadDashboardData } from '@/app/page'

// After successful checkout
onCheckoutSuccess={(saleId) => {
  loadDashboardData() // Refresh all metrics
}}
```

## Firebase Security Rules

Ensure your Firestore rules allow:

```
// Products: Update stock
match /products/{document=**} {
  allow read: if true;
  allow create, update, delete: if request.auth != null;
}

// Sales: Create new sales
match /sales/{document=**} {
  allow read: if true;
  allow create: if request.auth != null;
}
```

## Testing

### Test Adding to Cart
```typescript
cart.addToCart({
  productId: '123',
  productName: 'Test Product',
  quantity: 2,
  price: 500,
  costPrice: 300,
  stock: 10
})
// Should succeed: cart.totalItems = 2, cart.totalPrice = 1000
```

### Test Stock Validation
```typescript
cart.addToCart({
  productId: '123',
  productName: 'Test Product',
  quantity: 20,  // More than available stock
  price: 500,
  costPrice: 300,
  stock: 10
})
// Should fail: cart.error = "Insufficient stock. Available: 10, Requested: 20"
```

### Test Checkout
```typescript
const result = await cart.checkout({
  customerId: 'CUST123',
  paymentMethod: 'cash',
  paidAmount: 1000
})
// On success: sale created, stock reduced, cart cleared
// Result: { success: true, saleId: 'SALE123' }
```

## Future Enhancements

- [ ] Discount codes support
- [ ] Tax calculations
- [ ] Shipping cost
- [ ] Inventory alerts for low stock
- [ ] Cart persistence (localStorage)
- [ ] Order history per customer
- [ ] Batch operations
- [ ] Return/exchange management

## Troubleshooting

### Stock Not Reducing
- Check Firebase permissions
- Verify product ID exists in database
- Check browser console for errors

### Cart Not Showing
- Ensure Dialog component is imported
- Check if `isOpen` prop is true
- Verify cart items are being added

### Metrics Not Updating
- Clear browser cache
- Check Firebase connection
- Verify sales data is in correct format

## Contact

For issues or questions, please refer to Firebase documentation or check the implementation files.
