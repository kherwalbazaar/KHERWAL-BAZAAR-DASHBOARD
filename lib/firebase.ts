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
const analytics = getAnalytics(app);
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
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, productData);
    console.log('Product updated with ID:', productId);
    return { success: true, id: productId };
  } catch (error) {
    console.error('Error updating product:', error);
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
    const docRef = await addDoc(collection(db, 'sales'), {
      ...saleData,
      createdAt: new Date().toISOString()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding sale:', error);
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

export { app, analytics, db };
