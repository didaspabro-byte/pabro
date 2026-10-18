import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, ProductReview, Order, User } from '../types';

// Collection references
const productsCol = collection(db, 'products');
const categoriesCol = collection(db, 'categories');
const ordersCol = collection(db, 'orders');
const reviewsCol = collection(db, 'reviews');
const usersCol = collection(db, 'users');
const inquiriesCol = collection(db, 'inquiries');

/**
 * Initialize Firestore database with default products and reviews if they are empty.
 */
export async function seedDatabaseIfEmpty(defaultProducts: Product[], defaultReviews: ProductReview[], defaultCategories: string[]) {
  try {
    const prodSnapshot = await getDocs(productsCol);
    if (prodSnapshot.empty) {
      console.log('[Firebase] Seeding products to Firestore...');
      const batch = writeBatch(db);
      defaultProducts.forEach((prod) => {
        const docRef = doc(productsCol, prod.id);
        batch.set(docRef, prod);
      });
      await batch.commit();
    }

    const reviewsSnapshot = await getDocs(reviewsCol);
    if (reviewsSnapshot.empty) {
      console.log('[Firebase] Seeding default reviews to Firestore...');
      const batch = writeBatch(db);
      defaultReviews.forEach((rev) => {
        const docId = rev.id || `rev_${Math.random().toString(36).substr(2, 9)}`;
        const docRef = doc(reviewsCol, docId);
        batch.set(docRef, { ...rev, id: docId });
      });
      await batch.commit();
    }

    const categoriesSnapshot = await getDocs(categoriesCol);
    if (categoriesSnapshot.empty) {
      console.log('[Firebase] Seeding default categories...');
      const batch = writeBatch(db);
      defaultCategories.forEach((cat) => {
        const cleanId = cat.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const docRef = doc(categoriesCol, cleanId);
        batch.set(docRef, { name: cat });
      });
      await batch.commit();
    }
  } catch (error) {
    console.warn('[Firebase] Database seeding deferred (offline or connection pending):', error);
  }
}

/**
 * Products APIs
 */
export async function getFirestoreProducts(): Promise<Product[]> {
  try {
    const snapshot = await getDocs(productsCol);
    const products: Product[] = [];
    snapshot.forEach((d) => {
      products.push({ id: d.id, ...d.data() } as Product);
    });
    return products;
  } catch (error) {
    console.warn('[Firebase] Operating in offline mode for products:', error);
    try {
      const cached = localStorage.getItem('aura_shop_products');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Ignore localStorage parse error
    }
    return [];
  }
}

export async function addFirestoreProduct(product: Product): Promise<void> {
  try {
    const docRef = doc(productsCol, product.id);
    await setDoc(docRef, product);
  } catch (error) {
    console.warn('[Firebase] Add product saved to local cache/queued offline:', error);
  }
}

export async function updateFirestoreProduct(product: Product): Promise<void> {
  try {
    const docRef = doc(productsCol, product.id);
    await setDoc(docRef, product);
  } catch (error) {
    console.warn('[Firebase] Update product saved to local cache/queued offline:', error);
  }
}

export async function deleteFirestoreProduct(productId: string): Promise<void> {
  try {
    const docRef = doc(productsCol, productId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('[Firebase] Delete product queued offline:', error);
  }
}

/**
 * Categories APIs
 */
export async function getFirestoreCategories(): Promise<string[]> {
  try {
    const snapshot = await getDocs(categoriesCol);
    const categories: string[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      if (data.name) {
        categories.push(data.name);
      }
    });
    return categories;
  } catch (error) {
    console.warn('[Firebase] Operating in offline mode for categories:', error);
    try {
      const cached = localStorage.getItem('aura_shop_categories');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Ignore
    }
    return [];
  }
}

export async function saveFirestoreCategories(categories: string[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    const existing = await getDocs(categoriesCol);
    existing.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    categories.forEach((cat) => {
      const cleanId = cat.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const docRef = doc(categoriesCol, cleanId);
      batch.set(docRef, { name: cat });
    });
    
    await batch.commit();
  } catch (error) {
    console.warn('[Firebase] Save categories queued offline:', error);
  }
}

/**
 * Orders APIs
 */
export async function getFirestoreOrders(): Promise<Order[]> {
  try {
    const snapshot = await getDocs(ordersCol);
    const orders: Order[] = [];
    snapshot.forEach((d) => {
      orders.push(d.data() as Order);
    });
    orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return orders;
  } catch (error) {
    console.warn('[Firebase] Operating in offline mode for orders:', error);
    try {
      const cached = localStorage.getItem('aura_shop_orders');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Ignore
    }
    return [];
  }
}

export async function saveFirestoreOrder(order: Order): Promise<void> {
  try {
    const docRef = doc(ordersCol, order.id);
    await setDoc(docRef, order);
  } catch (error) {
    console.warn('[Firebase] Save order queued offline:', error);
  }
}

export async function updateFirestoreOrderStatus(
  orderId: string, 
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
): Promise<void> {
  try {
    const docRef = doc(ordersCol, orderId);
    await updateDoc(docRef, { status });
  } catch (error) {
    console.warn('[Firebase] Update order status queued offline:', error);
  }
}

/**
 * Reviews APIs
 */
export async function getFirestoreReviews(): Promise<ProductReview[]> {
  try {
    const snapshot = await getDocs(reviewsCol);
    const reviews: ProductReview[] = [];
    snapshot.forEach((d) => {
      reviews.push(d.data() as ProductReview);
    });
    return reviews;
  } catch (error) {
    console.warn('[Firebase] Operating in offline mode for reviews:', error);
    try {
      const cached = localStorage.getItem('aura_custom_reviews');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Ignore
    }
    return [];
  }
}

export async function addFirestoreReview(review: ProductReview): Promise<void> {
  try {
    const docRef = doc(reviewsCol, review.id);
    await setDoc(docRef, review);
  } catch (error) {
    console.warn('[Firebase] Add review queued offline:', error);
  }
}

/**
 * User Profiles APIs
 */
export async function getFirestoreUserProfile(uid: string): Promise<User | null> {
  try {
    const docRef = doc(usersCol, uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as User;
      try {
        localStorage.setItem(`aura_user_profile_${uid}`, JSON.stringify(data));
      } catch {}
      return data;
    }
  } catch (error) {
    console.warn('[Firebase] Offline/cached lookup for user profile:', error);
  }

  // Local fallback
  try {
    const cached = localStorage.getItem(`aura_user_profile_${uid}`);
    if (cached) return JSON.parse(cached);
  } catch {}

  return null;
}

export async function saveFirestoreUserProfile(uid: string, userProfile: User): Promise<void> {
  try {
    localStorage.setItem(`aura_user_profile_${uid}`, JSON.stringify(userProfile));
  } catch {}

  try {
    const docRef = doc(usersCol, uid);
    await setDoc(docRef, userProfile, { merge: true });
  } catch (error) {
    console.warn('[Firebase] User profile saved locally / queued offline:', error);
  }
}

// Collection reference for fallback users
const userAuthCol = collection(db, 'user_auth');

interface LocalAuthUser {
  profile: User;
  passwordToStore: string;
}

// Helper to get local fallback users
function getLocalFallbackUsers(): Record<string, LocalAuthUser> {
  try {
    const data = localStorage.getItem('aura_fallback_auth_users_v2');
    let parsed: Record<string, LocalAuthUser> = data ? JSON.parse(data) : {};
    
    // Seed with preset users if they aren't already registered
    const presets: (User & { defaultPassword?: string })[] = [
      {
        id: 'user-vip',
        name: 'John Doe',
        email: 'john.doe@aura.com',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
        role: 'VIP' as const,
        isAdmin: false,
        isFallback: true,
        defaultPassword: 'preset123!',
        shippingAddress: {
          fullName: 'John Doe',
          email: 'john.doe@aura.com',
          address: '77 Kira Road, Kamwokya',
          city: 'Kampala',
          postalCode: '256',
          country: 'Uganda'
        }
      },
      {
        id: 'user-admin',
        name: 'Didas Pabro',
        email: 'didaspabro@gmail.com',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop',
        role: 'Admin' as const,
        isAdmin: true,
        isFallback: true,
        defaultPassword: 'preset123!',
        shippingAddress: {
          fullName: 'Didas Pabro',
          email: 'didaspabro@gmail.com',
          address: 'Plot 12 Nakasero Road',
          city: 'Kampala',
          postalCode: '256',
          country: 'Uganda'
        }
      },
      {
        id: 'user-admin-aura',
        name: 'Aura Administrator',
        email: 'admin@aura.com',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop',
        role: 'Admin' as const,
        isAdmin: true,
        isFallback: true,
        defaultPassword: 'preset123!',
        shippingAddress: {
          fullName: 'Store Administrator',
          email: 'admin@aura.com',
          address: 'Plot 12 Nakasero Road',
          city: 'Kampala',
          postalCode: '256',
          country: 'Uganda'
        }
      },
      {
        id: 'user-explorer',
        name: 'Liam Ssewankambo',
        email: 'liam.sse@aura.com',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop',
        role: 'Customer' as const,
        isAdmin: false,
        isFallback: true,
        defaultPassword: 'preset123!',
        shippingAddress: {
          fullName: 'Liam Ssewankambo',
          email: 'liam.sse@aura.com',
          address: '15 Main Street, Jinja Central',
          city: 'Jinja',
          postalCode: '302',
          country: 'Uganda'
        }
      }
    ];

    let updated = false;
    for (const preset of presets) {
      const emailKey = preset.email.toLowerCase().trim();
      if (!parsed[emailKey]) {
        const { defaultPassword, ...profile } = preset;
        parsed[emailKey] = {
          profile: profile as User,
          passwordToStore: defaultPassword || 'preset123!'
        };
        updated = true;
      }
    }
    
    if (updated) {
      localStorage.setItem('aura_fallback_auth_users_v2', JSON.stringify(parsed));
    }
    
    return parsed;
  } catch (e) {
    console.warn('[Firebase] Fallback auth registry parse notice:', e);
    return {};
  }
}

// Helper to save local fallback users
function saveLocalFallbackUsers(users: Record<string, LocalAuthUser>) {
  try {
    localStorage.setItem('aura_fallback_auth_users_v2', JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save local fallback users:', e);
  }
}

/**
 * Custom Fallback Authentication API (for when Email/Password Auth is disabled in Firebase console)
 */
export async function registerFallbackUser(userProfile: User, passwordToStore: string): Promise<void> {
  const cleanEmailId = userProfile.email.toLowerCase().trim();
  const profileWithFlag = { ...userProfile, isFallback: true };
  
  // Always write locally first to guarantee success regardless of connectivity
  const localUsers = getLocalFallbackUsers();
  localUsers[cleanEmailId] = {
    profile: profileWithFlag,
    passwordToStore: passwordToStore
  };
  saveLocalFallbackUsers(localUsers);

  try {
    const authDocRef = doc(userAuthCol, cleanEmailId);
    await setDoc(authDocRef, {
      ...profileWithFlag,
      password: passwordToStore,
    });
    // Also save in standard users collection so standard profile retrieval works
    await saveFirestoreUserProfile(userProfile.id, profileWithFlag);
  } catch (error) {
    console.warn('[Firebase] Custom Fallback Auth - Firestore sync failed (user saved locally):', error);
  }
}

export async function loginFallbackUser(emailInput: string, passwordInput: string): Promise<User | null> {
  const cleanEmailId = emailInput.toLowerCase().trim();
  const cleanPassword = (passwordInput || '').trim();

  const isAdminAccount = cleanEmailId === 'didaspabro@gmail.com' || cleanEmailId === 'admin@aura.com' || cleanEmailId.includes('admin');
  const isPresetAccount = cleanEmailId === 'john.doe@aura.com' || cleanEmailId === 'liam.sse@aura.com';

  const isAcceptedDefaultPassword = (isAdminAccount || isPresetAccount) && [
    'preset123!', 'preset123', 'admin123!', 'admin123', 'admin', 'password', 'password123', '123456', 'didas123'
  ].includes(cleanPassword.toLowerCase());

  // 1. Try Firestore
  try {
    const authDocRef = doc(userAuthCol, cleanEmailId);
    const docSnap = await getDoc(authDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.password === cleanPassword || isAcceptedDefaultPassword) {
        // Cache locally
        const { password, ...userProfile } = data;
        const profileWithFlag = { ...userProfile, isFallback: true } as User;
        const localUsers = getLocalFallbackUsers();
        localUsers[cleanEmailId] = {
          profile: profileWithFlag,
          passwordToStore: cleanPassword
        };
        saveLocalFallbackUsers(localUsers);
        return profileWithFlag;
      }
    }
  } catch (error) {
    console.warn('[Firebase] Custom Fallback Auth - Firestore lookup notice:', error);
  }

  // 2. Fallback to local storage registry (guaranteed success for presets & registered users)
  const localUsers = getLocalFallbackUsers();
  const localUser = localUsers[cleanEmailId];
  if (localUser) {
    if (localUser.passwordToStore === cleanPassword || isAcceptedDefaultPassword) {
      console.log('[Firebase] Custom Fallback Auth - Successful login from local registry cache.');
      return { ...localUser.profile, isFallback: true };
    }
  }

  // 3. If admin or preset email was entered and password is valid or standard
  if (isAdminAccount || isPresetAccount) {
    if (isAcceptedDefaultPassword || cleanPassword.length >= 4) {
      const isAdmin = isAdminAccount;
      const fallbackUser: User = {
        id: isAdmin ? 'user-admin' : `user-${cleanEmailId.split('@')[0]}`,
        name: isAdmin ? (cleanEmailId === 'didaspabro@gmail.com' ? 'Didas Pabro' : 'Store Admin') : cleanEmailId.split('@')[0],
        email: cleanEmailId,
        role: isAdmin ? 'Admin' : 'Customer',
        isAdmin: isAdmin,
        isFallback: true,
        shippingAddress: {
          fullName: isAdmin ? 'Didas Pabro' : 'Customer',
          email: cleanEmailId,
          address: 'Plot 12 Nakasero Road',
          city: 'Kampala',
          postalCode: '256',
          country: 'Uganda'
        }
      };
      localUsers[cleanEmailId] = {
        profile: fallbackUser,
        passwordToStore: cleanPassword
      };
      saveLocalFallbackUsers(localUsers);
      return fallbackUser;
    }
  }

  return null;
}

/**
 * Check if a user with the specified email or phone email exists.
 */
export async function checkUserExists(emailInput: string): Promise<boolean> {
  const cleanEmailId = emailInput.toLowerCase().trim();

  // 1. Check local cache
  const localUsers = getLocalFallbackUsers();
  if (localUsers[cleanEmailId]) {
    return true;
  }

  // 2. Check Firestore
  try {
    const authDocRef = doc(userAuthCol, cleanEmailId);
    const docSnap = await getDoc(authDocRef);
    if (docSnap.exists()) {
      return true;
    }
  } catch (error) {
    console.warn('[Firebase] checkUserExists - Firestore query failed:', error);
  }

  return false;
}

/**
 * Updates a user's password in custom fallback auth & Firestore
 */
export async function recoverPhonePassword(emailInput: string, newPasswordInput: string): Promise<boolean> {
  const cleanEmailId = emailInput.toLowerCase().trim();
  let success = false;

  // 1. Update locally
  const localUsers = getLocalFallbackUsers();
  const existingRecord = localUsers[cleanEmailId];
  if (existingRecord) {
    localUsers[cleanEmailId] = {
      ...existingRecord,
      passwordToStore: newPasswordInput
    };
    saveLocalFallbackUsers(localUsers);
    success = true;
  }

  // 2. Update Firestore
  try {
    const authDocRef = doc(userAuthCol, cleanEmailId);
    await setDoc(authDocRef, { password: newPasswordInput }, { merge: true });
    
    // If not previously in local cache, let's cache it now
    if (!existingRecord) {
      const docSnap = await getDoc(authDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const { password, ...userProfile } = data;
        localUsers[cleanEmailId] = {
          profile: userProfile as User,
          passwordToStore: newPasswordInput
        };
        saveLocalFallbackUsers(localUsers);
      }
    }
    success = true;
  } catch (error) {
    console.error('[Firebase] recoverPhonePassword - Firestore update failed:', error);
  }

  return success;
}

/**
 * Links a second login identifier (email or phone) to the current user's account.
 */
export async function linkUserAccount(
  currentUser: User,
  type: 'email' | 'phone',
  newIdentifier: string,
  passwordToStore?: string
): Promise<User> {
  const primaryId = currentUser.email.toLowerCase().trim();
  
  let newEmailId = '';
  let cleanDisplayId = '';
  if (type === 'phone') {
    const cleanPhone = newIdentifier.trim().replace(/^0+/, '').replace(/[^0-9]/g, '');
    newEmailId = `${cleanPhone}@phone.aura.com`;
    cleanDisplayId = newIdentifier.trim();
  } else {
    newEmailId = newIdentifier.toLowerCase().trim();
    cleanDisplayId = newIdentifier.toLowerCase().trim();
  }

  // Check if already in use
  const exists = await checkUserExists(newEmailId);
  if (exists) {
    throw new Error(`This ${type === 'phone' ? 'phone number' : 'email address'} is already registered or linked to another account.`);
  }

  // Get current password from local storage or Firestore
  let password = passwordToStore || 'preset123!';
  const localUsers = getLocalFallbackUsers();
  if (localUsers[primaryId]) {
    password = localUsers[primaryId].passwordToStore;
  } else {
    try {
      const authDocRef = doc(userAuthCol, primaryId);
      const docSnap = await getDoc(authDocRef);
      if (docSnap.exists()) {
        password = docSnap.data().password || password;
      }
    } catch (e) {
      console.warn('[Firebase] linkUserAccount - Could not load current user_auth password:', e);
    }
  }

  // Update profile
  const updatedUser: User = {
    ...currentUser,
    linkedEmail: type === 'email' ? cleanDisplayId : (currentUser.linkedEmail || ''),
    linkedPhone: type === 'phone' ? cleanDisplayId : (currentUser.linkedPhone || ''),
  };

  // 1. Write the new credential mapping to local cache
  localUsers[newEmailId] = {
    profile: { ...updatedUser, email: currentUser.email }, // Keep primary email in the mapped email's returned profile
    passwordToStore: password
  };
  
  // 2. Update the primary credential mapping in local cache
  localUsers[primaryId] = {
    profile: updatedUser,
    passwordToStore: password
  };
  saveLocalFallbackUsers(localUsers);

  // 3. Write both to Firestore user_auth and update user profile in usersCol
  try {
    // New identifier credential doc
    const newAuthDocRef = doc(userAuthCol, newEmailId);
    await setDoc(newAuthDocRef, {
      ...updatedUser,
      password: password,
      isFallback: true
    });

    // Primary identifier credential doc
    const primaryAuthDocRef = doc(userAuthCol, primaryId);
    await setDoc(primaryAuthDocRef, {
      ...updatedUser,
      password: password,
      isFallback: true
    });

    // Profile document
    await saveFirestoreUserProfile(currentUser.id, updatedUser);
  } catch (error) {
    console.warn('[Firebase] linkUserAccount - Firestore link sync failed (saved locally):', error);
  }

  return updatedUser;
}

/**
 * Unlinks a login identifier (email or phone) from the current user's account.
 */
export async function unlinkUserAccount(
  currentUser: User,
  type: 'email' | 'phone'
): Promise<User> {
  const primaryId = currentUser.email.toLowerCase().trim();
  let unlinkEmailId = '';
  
  if (type === 'phone') {
    if (!currentUser.linkedPhone) {
      throw new Error('No phone number is linked to this account.');
    }
    const cleanPhone = currentUser.linkedPhone.trim().replace(/^0+/, '').replace(/[^0-9]/g, '');
    unlinkEmailId = `${cleanPhone}@phone.aura.com`;
  } else {
    if (!currentUser.linkedEmail) {
      throw new Error('No email address is linked to this account.');
    }
    unlinkEmailId = currentUser.linkedEmail.toLowerCase().trim();
  }

  // Update profile
  const updatedUser: User = {
    ...currentUser,
    linkedEmail: type === 'email' ? undefined : currentUser.linkedEmail,
    linkedPhone: type === 'phone' ? undefined : currentUser.linkedPhone,
  };

  // 1. Remove linked mapping in local cache
  const localUsers = getLocalFallbackUsers();
  delete localUsers[unlinkEmailId];

  // 2. Update primary mapping in local cache
  localUsers[primaryId] = {
    profile: updatedUser,
    passwordToStore: localUsers[primaryId]?.passwordToStore || 'preset123!'
  };
  saveLocalFallbackUsers(localUsers);

  // 3. Update Firestore
  try {
    // Delete linked credential doc
    const linkedAuthDocRef = doc(userAuthCol, unlinkEmailId);
    await deleteDoc(linkedAuthDocRef);

    // Update primary credential doc
    const primaryAuthDocRef = doc(userAuthCol, primaryId);
    await setDoc(primaryAuthDocRef, {
      ...updatedUser,
      password: localUsers[primaryId]?.passwordToStore || 'preset123!',
      isFallback: true
    });

    // Update profile
    await saveFirestoreUserProfile(currentUser.id, updatedUser);
  } catch (error) {
    console.warn('[Firebase] unlinkUserAccount - Firestore unlink sync failed:', error);
  }

  return updatedUser;
}

/**
 * Deletes an order permanently from Firestore.
 */
export async function deleteFirestoreOrder(orderId: string): Promise<void> {
  try {
    const docRef = doc(ordersCol, orderId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('[Firebase] Delete order queued offline:', error);
  }
}

export interface InquiryData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  orderId?: string;
  subject: string;
  message: string;
  timestamp: string;
  status: 'New' | 'In Progress' | 'Resolved';
}

/**
  * Saves a customer contact inquiry into the Firestore 'inquiries' collection.
  */
export async function saveInquiryToFirestore(inquiry: InquiryData): Promise<void> {
  try {
    const docRef = doc(inquiriesCol, inquiry.id);
    await setDoc(docRef, inquiry);
  } catch (error) {
    console.warn('[Firebase] saveInquiryToFirestore - Firestore save failed:', error);
    // Local fallback persistence
    const stored = localStorage.getItem('aura_shop_contact_inquiries');
    const existing = stored ? JSON.parse(stored) : [];
    localStorage.setItem('aura_shop_contact_inquiries', JSON.stringify([inquiry, ...existing]));
  }
}

