import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, child, onValue, set, push, remove, update, DataSnapshot } from "firebase/database";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Main Firebase config (luo-movies-site - single source for everything)
const firebaseConfig = {
  apiKey: "AIzaSyBzYZbd0lnZb6APSJeLVTLNWb01sYfRfls",
  authDomain: "luo-movies-site.firebaseapp.com",
  databaseURL: "https://luo-movies-site-default-rtdb.firebaseio.com",
  projectId: "luo-movies-site",
  storageBucket: "luo-movies-site.firebasestorage.app",
  messagingSenderId: "423336353163",
  appId: "1:423336353163:web:90fabe8eee8d31cc50238e",
  measurementId: "G-X6KL4HSXDE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Initialize analytics (only in browser)
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

// Auth exports
export { onAuthStateChanged, type User };

// Admin email
export const ADMIN_EMAIL = "vjmakerug@gmail.com";

export const isAdmin = (user: User | null): boolean => {
  return user?.email === ADMIN_EMAIL;
};

export interface Episode {
  episodeNumber: number;
  title: string;
  streamlink: string;
  season?: number;
}

export interface FirebaseMovie {
  id: string;
  title: string;
  year?: number;
  rating?: number;
  image?: string;
  category?: string;
  streamlink?: string;
  isTrending?: boolean;
  isPopular?: boolean;
  createdAt?: string;
  type: "movie" | "series";
  episodes?: Episode[];
  source?: "primary";
  description?: string;
}

export interface FirebaseUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  userEmail: string;
  plan: string;
  planName?: string;
  amount: number;
  currency: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  type: "subscription" | "withdrawal";
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed";
  description: string;
  createdAt: string;
  completedAt?: string;
  // Mobile Money specific fields
  phone?: string;
  provider?: "mtn" | "airtel";
  transactionRef?: string;
}

export interface WalletData {
  balance: number;
  currency: string;
  lastUpdated: string;
}

// Parse snapshot data to movie array
const parseSnapshotData = (snapshot: DataSnapshot, type: "movie" | "series"): FirebaseMovie[] => {
  if (!snapshot.exists()) return [];
  
  const data = snapshot.val();
  return Object.entries(data).map(([key, value]: [string, any]) => ({
    id: key,
    title: value.title || value.name || "Unknown",
    year: value.year || value.releaseYear || 2024,
    rating: value.rating || 7.5,
    image: value.image || value.poster || value.posterUrl || value.thumbnail || "",
    category: value.category || value.genre || "Action",
    streamlink: value.streamlink || value.driveUrl || value.videoUrl || "",
    isTrending: value.isTrending || value.isFeatured || false,
    isPopular: value.isPopular || false,
    createdAt: value.createdAt || "",
    type: type,
    episodes: value.episodes || [],
    source: "primary" as const,
    description: value.description || "",
  }));
};

// Sort movies: newest first (by createdAt)
const sortMovies = (movies: FirebaseMovie[]): FirebaseMovie[] => {
  return movies.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    
    if (dateA !== 0 && dateB !== 0) {
      return dateB - dateA;
    }
    
    if (dateA !== 0 && dateB === 0) return -1;
    if (dateA === 0 && dateB !== 0) return 1;
    
    return 0;
  });
};

// Real-time listener for movies - calls callback whenever data changes
export const subscribeToMovies = (callback: (movies: FirebaseMovie[]) => void): (() => void) => {
  const paths = ["movies", "series", "originals", "animation", "music"];
  const unsubscribes: (() => void)[] = [];
  
  let allContent: FirebaseMovie[] = [];
  
  const updateCallback = () => {
    const sorted = sortMovies([...allContent]);
    callback(sorted);
  };
  
  paths.forEach((path) => {
    const dbRef = ref(database, path);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const type = path === "series" ? "series" : "movie";
      const pathContent = parseSnapshotData(snapshot, type);
      console.log(`Firebase path "${path}": ${pathContent.length} items`);
      
      // Remove old content for this path and add new
      allContent = allContent.filter(m => 
        !pathContent.some(p => p.id === m.id)
      );
      allContent = [...allContent, ...pathContent];
      updateCallback();
    }, (error) => {
      console.error(`Firebase listener error on "${path}":`, error.message);
    });
    unsubscribes.push(unsubscribe);
  });
  
  return () => unsubscribes.forEach(unsub => unsub());
};

// One-time fetch (fallback)
export const fetchMovies = async (): Promise<FirebaseMovie[]> => {
  try {
    const paths = ["movies", "series", "originals", "animation", "music"];
    
    const results = await Promise.all(
      paths.map(async (path) => {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, path));
        return parseSnapshotData(snapshot, path === "series" ? "series" : "movie");
      })
    );
    
    const allContent = sortMovies(results.flat());
    console.log("Total content loaded:", allContent.length);
    return allContent;
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
};

export const fetchMovie = async (id: string): Promise<FirebaseMovie | null> => {
  try {
    const paths = ["movies", "series", "originals", "animation", "music"];
    
    for (const path of paths) {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `${path}/${id}`));
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log(`Found content in ${path}:`, id);
        return {
          id,
          title: data.title || data.name || "Unknown",
          year: data.year || data.releaseYear || 2024,
          rating: data.rating || 7.5,
          image: data.image || data.poster || data.posterUrl || data.thumbnail || "",
          category: data.category || data.genre || "Action",
          streamlink: data.streamlink || data.driveUrl || data.videoUrl || "",
          isTrending: data.isTrending || data.isFeatured || false,
          isPopular: data.isPopular || false,
          createdAt: data.createdAt || "",
          type: path === "series" ? "series" : "movie",
          episodes: data.episodes || [],
          source: "primary",
          description: data.description || "",
        };
      }
    }
    
    console.log("Content not found:", id);
    return null;
  } catch (error) {
    console.error("Error fetching movie:", error);
    return null;
  }
};

// Helper to convert Google Drive share URL to embed URL
export const getGoogleDriveEmbedUrl = (url: string): string => {
  if (!url) return "";
  
  if (url.includes("drive.google.com")) {
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    }
  }
  return url;
};

// Extract Google Drive file ID from URL
export const extractGoogleDriveFileId = (url: string): string | null => {
  if (!url) return null;
  if (url.includes("drive.google.com")) {
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) return fileIdMatch[1];
  }
  return null;
};

// Helper to get download URLs (worker primary, Google Drive fallback)
export const getGoogleDriveDownloadUrl = (url: string, fileName?: string): string => {
  if (!url) return "";
  const fileId = extractGoogleDriveFileId(url);
  if (fileId) {
    const encodedName = encodeURIComponent(fileName || "video.mp4");
    return `https://download.vjmakerug.workers.dev/download?fileId=${fileId}&fileName=${encodedName}`;
  }
  return url;
};

export const getGoogleDriveDirectDownloadUrl = (url: string): string => {
  if (!url) return "";
  const fileId = extractGoogleDriveFileId(url);
  if (fileId) {
    return `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;
  }
  return url;
};

// Firebase Auth functions
export const firebaseSignIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const firebaseSignUp = async (email: string, password: string, displayName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
    // Save user to database
    await saveUserToDatabase(userCredential.user);
  }
  return userCredential;
};

export const firebaseGoogleSignIn = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  // Save user to database
  await saveUserToDatabase(result.user);
  return result;
};

export const firebaseLogout = async () => {
  return firebaseSignOut(auth);
};

// Save user to database
export const saveUserToDatabase = async (user: User) => {
  const userRef = ref(database, `users/${user.uid}`);
  const snapshot = await get(userRef);
  
  const userData: FirebaseUser = {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "",
    photoURL: user.photoURL || "",
    createdAt: snapshot.exists() ? snapshot.val().createdAt : new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };
  
  await set(userRef, userData);
};

// Admin Database Functions
export const addMovie = async (movieData: Omit<FirebaseMovie, "id">, category: string = "movies") => {
  const dbRef = ref(database, category);
  const newRef = push(dbRef);
  await set(newRef, {
    ...movieData,
    createdAt: new Date().toISOString(),
  });
  return newRef.key;
};

export const updateMovie = async (id: string, movieData: Partial<FirebaseMovie>, category: string = "movies") => {
  const movieRef = ref(database, `${category}/${id}`);
  await update(movieRef, movieData);
};

export const deleteMovie = async (id: string, category: string = "movies") => {
  const movieRef = ref(database, `${category}/${id}`);
  await remove(movieRef);
};

export const addEpisodeToSeries = async (seriesId: string, episode: Episode) => {
  const seriesRef = ref(database, `series/${seriesId}`);
  const snapshot = await get(seriesRef);
  
  if (snapshot.exists()) {
    const seriesData = snapshot.val();
    const episodes = seriesData.episodes || [];
    episodes.push(episode);
    await update(seriesRef, { episodes });
  }
};

export const updateEpisode = async (seriesId: string, episodeIndex: number, episodeData: Partial<Episode>) => {
  const seriesRef = ref(database, `series/${seriesId}`);
  const snapshot = await get(seriesRef);
  
  if (snapshot.exists()) {
    const seriesData = snapshot.val();
    const episodes = seriesData.episodes || [];
    if (episodes[episodeIndex]) {
      episodes[episodeIndex] = { ...episodes[episodeIndex], ...episodeData };
      await update(seriesRef, { episodes });
    }
  }
};

export const deleteEpisode = async (seriesId: string, episodeIndex: number) => {
  const seriesRef = ref(database, `series/${seriesId}`);
  const snapshot = await get(seriesRef);
  
  if (snapshot.exists()) {
    const seriesData = snapshot.val();
    const episodes = seriesData.episodes || [];
    episodes.splice(episodeIndex, 1);
    await update(seriesRef, { episodes });
  }
};

// Users management
export const fetchAllUsers = async (): Promise<FirebaseUser[]> => {
  const dbRef = ref(database, "users");
  const snapshot = await get(dbRef);
  
  if (!snapshot.exists()) return [];
  
  const data = snapshot.val();
  return Object.values(data) as FirebaseUser[];
};

export const subscribeToUsers = (callback: (users: FirebaseUser[]) => void): (() => void) => {
  const dbRef = ref(database, "users");
  return onValue(dbRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const data = snapshot.val();
    callback(Object.values(data) as FirebaseUser[]);
  });
};

// Subscriptions management
export const fetchAllSubscriptions = async (): Promise<Subscription[]> => {
  const dbRef = ref(database, "subscriptions");
  const snapshot = await get(dbRef);
  
  if (!snapshot.exists()) return [];
  
  const data = snapshot.val();
  return Object.entries(data).map(([key, value]: [string, any]) => ({
    id: key,
    ...value,
  }));
};

export const subscribeToSubscriptions = (callback: (subs: Subscription[]) => void): (() => void) => {
  const dbRef = ref(database, "subscriptions");
  return onValue(dbRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const data = snapshot.val();
    callback(Object.entries(data).map(([key, value]: [string, any]) => ({
      id: key,
      ...value,
    })));
  });
};

export const addSubscription = async (subData: Omit<Subscription, "id">) => {
  const dbRef = ref(database, "subscriptions");
  const newRef = push(dbRef);
  await set(newRef, {
    ...subData,
    createdAt: new Date().toISOString(),
  });
  return newRef.key;
};

export const updateSubscription = async (id: string, data: Partial<Subscription>) => {
  const subRef = ref(database, `subscriptions/${id}`);
  await update(subRef, data);
};

// Transactions & Wallet
export const fetchTransactions = async (): Promise<Transaction[]> => {
  const dbRef = ref(database, "transactions");
  const snapshot = await get(dbRef);
  
  if (!snapshot.exists()) return [];
  
  const data = snapshot.val();
  return Object.entries(data).map(([key, value]: [string, any]) => ({
    id: key,
    ...value,
  }));
};

export const subscribeToTransactions = (callback: (txs: Transaction[]) => void): (() => void) => {
  const dbRef = ref(database, "transactions");
  return onValue(dbRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const data = snapshot.val();
    callback(Object.entries(data).map(([key, value]: [string, any]) => ({
      id: key,
      ...value,
    })));
  });
};

export const addTransaction = async (txData: Omit<Transaction, "id">) => {
  const dbRef = ref(database, "transactions");
  const newRef = push(dbRef);
  const dataToSave = {
    ...txData,
    createdAt: txData.createdAt || new Date().toISOString(),
  };
  await set(newRef, dataToSave);
  return newRef.key;
};

export const getWallet = async (): Promise<WalletData> => {
  const dbRef = ref(database, "wallet");
  const snapshot = await get(dbRef);
  
  if (!snapshot.exists()) {
    return { balance: 0, currency: "UGX", lastUpdated: new Date().toISOString() };
  }
  
  return snapshot.val();
};

export const subscribeToWallet = (callback: (wallet: WalletData) => void): (() => void) => {
  const dbRef = ref(database, "wallet");
  return onValue(dbRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback({ balance: 0, currency: "UGX", lastUpdated: new Date().toISOString() });
      return;
    }
    callback(snapshot.val());
  });
};

export const updateWallet = async (data: Partial<WalletData>) => {
  const walletRef = ref(database, "wallet");
  await update(walletRef, {
    ...data,
    lastUpdated: new Date().toISOString(),
  });
};

export interface WithdrawRequest {
  amount: number;
  phone: string;
  provider: "mtn" | "airtel";
  adminEmail: string;
}

export const withdrawFromWallet = async (request: WithdrawRequest): Promise<string> => {
  const { amount, phone, provider, adminEmail } = request;
  
  // Validate inputs
  if (!amount || amount <= 0) {
    throw new Error("Invalid amount");
  }
  if (!phone) {
    throw new Error("Phone number is required");
  }
  
  // Use backend wallet balance (do not rely on database wallet)
  const currency = "UGX";

  let apiBalance: number | null = null;
  try {
    const balRes = await fetch("https://function-bun-production-0c2c.up.railway.app/api/wallet/balance");
    const balData = await balRes.json();
    apiBalance =
      typeof balData?.relworx?.balance === "number"
        ? balData.relworx.balance
        : typeof balData?.balance === "number"
          ? balData.balance
          : null;

    console.log("Withdrawal pre-check - API balance:", apiBalance, balData);
  } catch (e) {
    console.error("Withdrawal pre-check - failed to load API balance:", e);
  }

  if (apiBalance === null) {
    throw new Error("Could not verify balance. Please try again.");
  }

  if (apiBalance < amount) {
    throw new Error("Insufficient balance");
  }
  
  // Format phone number
  let formattedPhone = phone.replace(/\D/g, "");
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "256" + formattedPhone.substring(1);
  } else if (!formattedPhone.startsWith("256")) {
    formattedPhone = "256" + formattedPhone;
  }
  formattedPhone = "+" + formattedPhone;
  
  // Generate transaction reference
  const transactionRef = `WD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  // Create pending transaction first
  const txData: Omit<Transaction, "id"> = {
    userId: "admin",
    userEmail: adminEmail,
    type: "withdrawal",
    amount,
    currency: currency,
    status: "pending",
    description: `Mobile Money withdrawal to ${formattedPhone} via ${provider.toUpperCase()}`,
    createdAt: new Date().toISOString(),
    phone: formattedPhone,
    provider,
    transactionRef,
  };
  
  const txId = await addTransaction(txData);
  
  if (!txId) {
    throw new Error("Failed to create transaction record");
  }
  
  try {
    // Update to processing status
    await updateTransaction(txId, { status: "processing" });
    
    // Call the real Mobile Money send-payment API
    const response = await fetch("https://api.vjmakerug.workers.dev/api/send-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        msisdn: formattedPhone,
        currency: "UGX",
        amount: amount,
        description: `VJ MAKER Withdrawal - ${transactionRef}`,
      }),
    });
    
    const data = await response.json();
    console.log("Withdrawal API response:", data);
    
    if (!response.ok || !data.success) {
      const errorMessage = data.message || data.relworx?.message || "Mobile Money transfer failed";
      throw new Error(errorMessage);
    }
    
    // Get the internal reference for status polling
    const internalReference = data.relworx?.internal_reference || data.internal_reference;
    
    if (internalReference) {
      // Poll for status
      let attempts = 0;
      const maxAttempts = 20;
      const pollInterval = 3000;
      
      const pollStatus = async (): Promise<boolean> => {
        attempts++;
        try {
          const statusResponse = await fetch(
            `https://api.vjmakerug.workers.dev/api/request-status?internal_reference=${encodeURIComponent(internalReference)}`
          );
          const statusData = await statusResponse.json();
          console.log("Withdrawal status check:", statusData);
          
          const relworxStatus = statusData.relworx?.request_status || statusData.request_status;
          
          if (relworxStatus === "success" || statusData.status === "success") {
            return true;
          }
          
          if (relworxStatus === "failed" || statusData.status === "failed") {
            throw new Error(statusData.relworx?.message || statusData.message || "Transfer failed");
          }
          
          // Continue polling
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, pollInterval));
            return pollStatus();
          }
          
          // Timeout - assume success if no failure reported
          console.log("Withdrawal status polling timeout, assuming success");
          return true;
        } catch (error) {
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, pollInterval));
            return pollStatus();
          }
          throw error;
        }
      };
      
      await pollStatus();
    }
    
    // Note: wallet balance is managed by the backend; we don't store/update a wallet balance in the database here.
    
    // Mark transaction as completed
    await updateTransaction(txId, { 
      status: "completed",
      completedAt: new Date().toISOString(),
    });
    
    return transactionRef;
  } catch (error: any) {
    // Mark transaction as failed
    try {
      await updateTransaction(txId, { 
        status: "failed",
        description: `Failed: ${error.message}`,
      });
    } catch (updateError) {
      console.error("Failed to update transaction status:", updateError);
    }
    throw error;
  }
};

export const updateTransaction = async (id: string, data: Partial<Transaction>) => {
  const txRef = ref(database, `transactions/${id}`);
  await update(txRef, data);
};
