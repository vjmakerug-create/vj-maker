import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ref, onValue, get } from "firebase/database";
import { database, isAdmin } from "@/lib/firebase";
import { useAuth } from "./AuthContext";

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration: string;
  days: number;
  price: number;
  currency: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  { id: "1_day", name: "1 Day", duration: "1 Day", days: 1, price: 3000, currency: "UGX" },
  { id: "3_days", name: "3 Days", duration: "3 Days", days: 3, price: 5000, currency: "UGX" },
  { id: "1_week", name: "1 Week", duration: "7 Days", days: 7, price: 10000, currency: "UGX" },
  { id: "2_weeks", name: "2 Weeks", duration: "14 Days", days: 14, price: 15000, currency: "UGX" },
  { id: "1_month", name: "1 Month", duration: "30 Days", days: 30, price: 25000, currency: "UGX" },
  { id: "3_months", name: "3 Months", duration: "90 Days", days: 90, price: 50000, currency: "UGX" },
];

export interface UserSubscription {
  id: string;
  userId: string;
  userEmail: string;
  plan: string;
  planName: string;
  amount: number;
  currency: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  paymentMethod: string;
  paymentPhone: string;
  transactionId: string;
}

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  isSubscribed: boolean;
  loading: boolean;
  daysRemaining: number;
  checkSubscription: () => Promise<boolean>;
  showSubscriptionModal: boolean;
  setShowSubscriptionModal: (show: boolean) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    // Return safe defaults if provider is missing or crashed
    return {
      subscription: null,
      isSubscribed: false,
      loading: false,
      daysRemaining: 0,
      checkSubscription: async () => false,
      showSubscriptionModal: false,
      setShowSubscriptionModal: () => {},
    } as SubscriptionContextType;
  }
  return context;
};

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Calculate if subscription is active (admins always have access)
  const isSubscribed = (): boolean => {
    // Admin users always have full access
    if (isAdmin(user)) return true;
    
    if (!subscription) return false;
    if (!subscription.isActive) return false;
    const now = new Date();
    const expiresAt = new Date(subscription.expiresAt);
    return expiresAt > now;
  };

  // Calculate days remaining
  const getDaysRemaining = (): number => {
    if (!subscription || !isSubscribed()) return 0;
    const now = new Date();
    const expiresAt = new Date(subscription.expiresAt);
    const diff = expiresAt.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // Check subscription status
  const checkSubscription = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const subsRef = ref(database, "subscriptions");
      const snapshot = await get(subsRef);
      
      if (!snapshot.exists()) return false;
      
      const data = snapshot.val();
      const userSubs = Object.entries(data)
        .map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
        }))
        .filter((sub: any) => sub.userId === user.uid && sub.isActive);
      
      // Find the most recent active subscription
      const activeSub = userSubs
        .filter((sub: any) => new Date(sub.expiresAt) > new Date())
        .sort((a: any, b: any) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime())[0];
      
      if (activeSub) {
        setSubscription(activeSub);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error checking subscription:", error);
      return false;
    }
  };

  // Subscribe to user's subscription changes
  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const subsRef = ref(database, "subscriptions");
    
    const unsubscribe = onValue(subsRef, (snapshot) => {
      if (!snapshot.exists()) {
        setSubscription(null);
        setLoading(false);
        return;
      }
      
      const data = snapshot.val();
      const userSubs = Object.entries(data)
        .map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
        }))
        .filter((sub: any) => sub.userId === user.uid && sub.isActive);
      
      // Find the most recent active subscription that hasn't expired
      const activeSub = userSubs
        .filter((sub: any) => new Date(sub.expiresAt) > new Date())
        .sort((a: any, b: any) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime())[0];
      
      setSubscription(activeSub || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isSubscribed: isSubscribed(),
        loading,
        daysRemaining: getDaysRemaining(),
        checkSubscription,
        showSubscriptionModal,
        setShowSubscriptionModal,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
