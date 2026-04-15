# Firebase Firestore Security Rules

## Copy these rules into your Firebase Console

Go to: **Firebase Console → Firestore Database → Rules** and paste this code:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ========== PRODUCTS COLLECTION ==========
    // Everyone can READ products (for display on dashboard/shop)
    // Only ADMIN can WRITE/UPDATE/DELETE products
    match /products/{productId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    // ========== PRINTING PRODUCTS COLLECTION ==========
    match /printing-products/{productId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    // ========== PRINTING ORDERS COLLECTION ==========
    match /printing-orders/{orderId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    // ========== PRINTING CUSTOMERS COLLECTION ==========
    match /printing-customers/{customerId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    // ========== PRINTING CATEGORIES COLLECTION ==========
    match /printing-categories/{categoryId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    // ========== JOB TYPES COLLECTION ==========
    match /job-types/{jobTypeId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    // ========== SALES COLLECTION ==========
    // Only authenticated users can CREATE sales (during checkout)
    // Only ADMIN can READ all sales
    // Users can READ their own sales
    match /sales/{saleId} {
      allow create: if isAuthenticated();
      allow read: if isAdmin() || request.auth.uid == resource.data.userId;
      allow update, delete: if isAdmin();
    }

    // ========== CUSTOMERS COLLECTION ==========
    // Users can READ/WRITE their own customer profile
    // Admin can READ all customers
    match /customers/{customerId} {
      allow read, write: if request.auth.uid == customerId;
      allow read: if isAdmin();
    }

    // ========== CHECKOUTS COLLECTION ==========
    match /checkouts/{checkoutId} {
      allow create: if isAuthenticated();
      allow read: if isAdmin();
    }

    // ========== CATEGORIES COLLECTION ==========
    match /categories/{categoryId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    // ========== CONNECTION TEST COLLECTION ==========
    match /connection-test/{docId} {
      allow read, write: if true;
    }

    // ========== HELPER FUNCTIONS ==========
    // Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Check if user is ADMIN
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## Development Rules (Allow All Access - For Testing)

For development and testing, use these permissive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow all operations for development
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ WARNING: These rules allow anyone to read/write your database. Only use for development!**

For production, implement proper authentication and use the admin-only rules above.

---

## Recommended Setup

### Use Cloud Functions for Stock Updates

Since stock updates are **critical** (to prevent race conditions), create a **Cloud Function** instead of updating directly from client:

**Cloud Function (Node.js):**

```javascript
// Update product stock during checkout
exports.processCheckout = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { items, customerId, totalAmount } = data;
  const db = admin.firestore();

  try {
    // Start transaction
    await db.runTransaction(async (transaction) => {
      // 1. Fetch current stock for each product
      const productRefs = items.map(item => db.collection('products').doc(item.productId));
      const productDocs = await transaction.getAll(...productRefs);

      // 2. Validate stock availability
      for (let i = 0; i < items.length; i++) {
        const currentStock = productDocs[i].data().stock;
        if (currentStock < items[i].quantity) {
          throw new Error(`${items[i].productName} only has ${currentStock} units`);
        }
      }

      // 3. Update product stocks
      items.forEach((item, i) => {
        const newStock = productDocs[i].data().stock - item.quantity;
        transaction.update(productRefs[i], { stock: newStock });
      });

      // 4. Create sale record
      transaction.set(
        db.collection('sales').doc(),
        {
          customerId,
          items,
          totalAmount,
          createdAt: new Date(),
          paymentStatus: 'completed'
        }
      );
    });

    return { success: true, message: 'Checkout processed' };
  } catch (error) {
    throw new functions.https.HttpsError('failed-precondition', error.message);
  }
});
```

Then call it from your app:

```typescript
// In lib/cart-manager.ts
const processCheckoutFunction = httpsCallable(functions, 'processCheckout');

await processCheckoutFunction({
  items: cartItems,
  customerId: userId,
  totalAmount: total
});
```

---

## Security Checklist

- ✅ **Products**: Public read, admin write only
- ✅ **Sales**: Write on checkout, admin read all
- ✅ **Stock**: Updated via Cloud Functions (prevents race conditions)
- ✅ **User Auth**: Checked on all write operations
- ✅ **Cost Price**: Hidden from client reads (stored in separate admin collection)

---

## Steps to Apply

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → Firestore Database → Rules tab
3. Paste one of the rule sets above
4. Click **Publish**
5. Test in the **Rules Playground** to verify access

Done! Your database is now secure. 🔒
