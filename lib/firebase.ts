// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDEDeu_ZnohEIa1bhEb5NxpOpdkM9ymJ4k",
  authDomain: "kherwal-bazaar-dashboard.firebaseapp.com",
  projectId: "kherwal-bazaar-dashboard",
  storageBucket: "kherwal-bazaar-dashboard.firebasestorage.app",
  messagingSenderId: "136032068045",
  appId: "1:136032068045:web:f3bec8a2aac566ecb92484",
  measurementId: "G-Z7CL46419Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics: any = null;

// Only initialize analytics on client side
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

const db = getFirestore(app);

// Test Firebase connection
export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    
    // Test writing to Firestore
    const testDoc = {
      test: true,
      timestamp: new Date(),
      message: 'Firebase connection test successful'
    };
    
    const docRef = await addDoc(collection(db, 'connection-test'), testDoc);
    console.log('Firebase connection successful! Document ID:', docRef.id);
    
    // Test reading from Firestore
    const querySnapshot = await getDocs(collection(db, 'connection-test'));
    console.log('Firebase read test successful! Documents count:', querySnapshot.size);
    
    return {
      success: true,
      message: 'Firebase database is connected and working!',
      docId: docRef.id
    };
  } catch (error) {
    console.error('Firebase connection failed:', error);
    return {
      success: false,
      message: 'Firebase connection failed',
      error: error
    };
  }
};

// Database functions
export const addProduct = async (productData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'products'), productData);
    console.log('Product added with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding product:', error);
    return { success: false, error };
  }
};

export const getProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const products: any[] = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, products };
  } catch (error) {
    console.error('Error getting products:', error);
    return { success: false, error };
  }
};

export const updateProduct = async (productId: string, productData: any) => {
  try {
    console.log(`[Firebase] Updating product ${productId} with data:`, productData);
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, productData);
    console.log(`[Firebase] ✅ Product updated successfully with ID: ${productId}`);
    return { success: true, id: productId };
  } catch (error) {
    console.error(`[Firebase] ❌ Error updating product ${productId}:`, error);
    return { success: false, error };
  }
};

export const deleteProduct = async (productId: string) => {
  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
    console.log('Product deleted with ID:', productId);
    return { success: true, id: productId };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error };
  }
};

// Category functions
export const addCategory = async (categoryData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'categories'), categoryData);
    console.log('Category added with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding category:', error);
    return { success: false, error };
  }
};

export const getCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'categories'));
    const categories: any[] = [];
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, categories };
  } catch (error) {
    console.error('Error getting categories:', error);
    return { success: false, error };
  }
};

export const updateCategory = async (categoryId: string, categoryData: any) => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    await updateDoc(categoryRef, categoryData);
    console.log('Category updated with ID:', categoryId);
    return { success: true, id: categoryId };
  } catch (error) {
    console.error('Error updating category:', error);
    return { success: false, error };
  }
};

export const deleteCategory = async (categoryId: string) => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    await deleteDoc(categoryRef);
    console.log('Category deleted with ID:', categoryId);
    return { success: true, id: categoryId };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false, error };
  }
};

export const getOrders = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'orders'));
    const orders: any[] = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, orders };
  } catch (error) {
    console.error('Error getting orders:', error);
    return { success: false, error };
  }
};

export const getSales = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'sales'));
    const sales: any[] = [];
    querySnapshot.forEach((doc) => {
      sales.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, sales };
  } catch (error) {
    console.error('Error getting sales:', error);
    return { success: false, error };
  }
};

export const addSale = async (saleData: any) => {
  try {
    console.log('[Firebase] Adding sale record:', saleData);
    const docRef = await addDoc(collection(db, 'sales'), {
      ...saleData,
      createdAt: new Date().toISOString()
    });
    console.log('[Firebase] ✅ Sale record added successfully with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('[Firebase] ❌ Error adding sale:', error);
    return { success: false, error };
  }
};

export const saveCheckout = async (checkoutData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'checkouts'), {
      ...checkoutData,
      createdAt: new Date().toISOString()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving checkout:', error);
    return { success: false, error };
  }
};

export const getCustomers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'customers'));
    const customers: any[] = [];
    querySnapshot.forEach((doc) => {
      customers.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, customers };
  } catch (error) {
    console.error('Error getting customers:', error);
    return { success: false, error };
  }
};

// ========================================
// PRINTING SECTION FIREBASE FUNCTIONS
// ========================================

// Printing Orders
export const addPrintingOrder = async (orderData: any) => {
  try {
    console.log('[Firebase] Adding printing order:', orderData);
    const docRef = await addDoc(collection(db, 'printing-orders'), {
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log('[Firebase] ✅ Printing order added successfully with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('[Firebase] ❌ Error adding printing order:', error);
    return { success: false, error };
  }
};

export const getPrintingOrders = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'printing-orders'));
    const orders: any[] = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    // Sort by createdAt descending
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { success: true, orders };
  } catch (error) {
    console.error('Error getting printing orders:', error);
    return { success: false, error };
  }
};

export const getPrintingOrder = async (orderId: string) => {
  try {
    const { getDoc } = await import('firebase/firestore');
    const orderRef = doc(db, 'printing-orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (orderSnap.exists()) {
      return { success: true, order: { id: orderSnap.id, ...orderSnap.data() } };
    } else {
      return { success: false, error: 'Order not found' };
    }
  } catch (error) {
    console.error('Error getting printing order:', error);
    return { success: false, error };
  }
};

export const updatePrintingOrder = async (orderId: string, orderData: any) => {
  try {
    console.log(`[Firebase] Updating printing order ${orderId}:`, orderData);
    const orderRef = doc(db, 'printing-orders', orderId);
    await updateDoc(orderRef, {
      ...orderData,
      updatedAt: new Date().toISOString()
    });
    console.log(`[Firebase] ✅ Printing order updated successfully: ${orderId}`);
    return { success: true, id: orderId };
  } catch (error) {
    console.error(`[Firebase] ❌ Error updating printing order ${orderId}:`, error);
    return { success: false, error };
  }
};

export const deletePrintingOrder = async (orderId: string) => {
  try {
    const orderRef = doc(db, 'printing-orders', orderId);
    await deleteDoc(orderRef);
    console.log('Printing order deleted with ID:', orderId);
    return { success: true, id: orderId };
  } catch (error) {
    console.error('Error deleting printing order:', error);
    return { success: false, error };
  }
};

// Printing Customers
export const addPrintingCustomer = async (customerData: any) => {
  try {
    console.log('[Firebase] Adding printing customer:', customerData);
    const docRef = await addDoc(collection(db, 'printing-customers'), {
      ...customerData,
      createdAt: new Date().toISOString(),
      totalOrders: 0,
      totalSpent: 0
    });
    console.log('[Firebase] ✅ Printing customer added successfully with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('[Firebase] ❌ Error adding printing customer:', error);
    return { success: false, error };
  }
};

export const getPrintingCustomers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'printing-customers'));
    const customers: any[] = [];
    querySnapshot.forEach((doc) => {
      customers.push({ id: doc.id, ...doc.data() });
    });
    // Sort by name
    customers.sort((a, b) => a.name.localeCompare(b.name));
    return { success: true, customers };
  } catch (error) {
    console.error('Error getting printing customers:', error);
    return { success: false, error };
  }
};

export const updatePrintingCustomer = async (customerId: string, customerData: any) => {
  try {
    const customerRef = doc(db, 'printing-customers', customerId);
    await updateDoc(customerRef, customerData);
    console.log('Printing customer updated with ID:', customerId);
    return { success: true, id: customerId };
  } catch (error) {
    console.error('Error updating printing customer:', error);
    return { success: false, error };
  }
};

export const deletePrintingCustomer = async (customerId: string) => {
  try {
    const customerRef = doc(db, 'printing-customers', customerId);
    await deleteDoc(customerRef);
    console.log('Printing customer deleted with ID:', customerId);
    return { success: true, id: customerId };
  } catch (error) {
    console.error('Error deleting printing customer:', error);
    return { success: false, error };
  }
};

// Job Types
export const addJobType = async (jobTypeData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'job-types'), {
      ...jobTypeData,
      createdAt: new Date().toISOString()
    });
    console.log('Job type added with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding job type:', error);
    return { success: false, error };
  }
};

export const getJobTypes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'job-types'));
    const jobTypes: any[] = [];
    querySnapshot.forEach((doc) => {
      jobTypes.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, jobTypes };
  } catch (error) {
    console.error('Error getting job types:', error);
    return { success: false, error };
  }
};

export const updateJobType = async (jobTypeId: string, jobTypeData: any) => {
  try {
    const jobTypeRef = doc(db, 'job-types', jobTypeId);
    await updateDoc(jobTypeRef, jobTypeData);
    console.log('Job type updated with ID:', jobTypeId);
    return { success: true, id: jobTypeId };
  } catch (error) {
    console.error('Error updating job type:', error);
    return { success: false, error };
  }
};

export const deleteJobType = async (jobTypeId: string) => {
  try {
    const jobTypeRef = doc(db, 'job-types', jobTypeId);
    await deleteDoc(jobTypeRef);
    console.log('Job type deleted with ID:', jobTypeId);
    return { success: true, id: jobTypeId };
  } catch (error) {
    console.error('Error deleting job type:', error);
    return { success: false, error };
  }
};

// Printing Products
export const addPrintingProduct = async (productData: any) => {
  try {
    console.log('[Firebase] Adding printing product:', productData);
    const docRef = await addDoc(collection(db, 'printing-products'), {
      ...productData,
      createdAt: new Date().toISOString()
    });
    console.log('[Firebase] ✅ Printing product added successfully with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('[Firebase] ❌ Error adding printing product:', error);
    return { success: false, error };
  }
};

export const getPrintingProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'printing-products'));
    const products: any[] = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, products };
  } catch (error) {
    console.error('Error getting printing products:', error);
    return { success: false, error };
  }
};

export const updatePrintingProduct = async (productId: string, productData: any) => {
  try {
    console.log(`[Firebase] Updating printing product ${productId}:`, productData);
    const productRef = doc(db, 'printing-products', productId);
    await updateDoc(productRef, productData);
    console.log(`[Firebase] ✅ Printing product updated successfully: ${productId}`);
    return { success: true, id: productId };
  } catch (error) {
    console.error(`[Firebase] ❌ Error updating printing product ${productId}:`, error);
    return { success: false, error };
  }
};

export const deletePrintingProduct = async (productId: string) => {
  try {
    const productRef = doc(db, 'printing-products', productId);
    await deleteDoc(productRef);
    console.log('Printing product deleted with ID:', productId);
    return { success: true, id: productId };
  } catch (error) {
    console.error('Error deleting printing product:', error);
    return { success: false, error };
  }
};

// Printing Product Categories
export const addPrintingCategory = async (categoryData: any) => {
  try {
    console.log('[Firebase] Adding printing category:', categoryData);
    const docRef = await addDoc(collection(db, 'printing-categories'), {
      ...categoryData,
      createdAt: new Date().toISOString()
    });
    console.log('[Firebase] ✅ Printing category added successfully with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('[Firebase] ❌ Error adding printing category:', error);
    return { success: false, error };
  }
};

export const getPrintingCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'printing-categories'));
    const categories: any[] = [];
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, categories };
  } catch (error) {
    console.error('Error getting printing categories:', error);
    return { success: false, error };
  }
};

export const updatePrintingCategory = async (categoryId: string, categoryData: any) => {
  try {
    console.log(`[Firebase] Updating printing category ${categoryId}:`, categoryData);
    const categoryRef = doc(db, 'printing-categories', categoryId);
    await updateDoc(categoryRef, categoryData);
    console.log(`[Firebase] ✅ Printing category updated successfully: ${categoryId}`);
    return { success: true, id: categoryId };
  } catch (error) {
    console.error(`[Firebase] ❌ Error updating printing category ${categoryId}:`, error);
    return { success: false, error };
  }
};

export const deletePrintingCategory = async (categoryId: string) => {
  try {
    const categoryRef = doc(db, 'printing-categories', categoryId);
    await deleteDoc(categoryRef);
    console.log('Printing category deleted with ID:', categoryId);
    return { success: true, id: categoryId };
  } catch (error) {
    console.error('Error deleting printing category:', error);
    return { success: false, error };
  }
};

export { app, analytics, db };
