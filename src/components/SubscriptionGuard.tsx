import { ReactNode, useState } from "react";
import { Lock, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import LoginModal from "@/components/LoginModal";

interface SubscriptionGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  showLockOverlay?: boolean;
}

const SubscriptionGuard = ({ 
  children, 
  fallback,
  showLockOverlay = true 
}: SubscriptionGuardProps) => {
  const { user } = useAuth();
  const { isSubscribed, setShowSubscriptionModal, loading } = useSubscription();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is subscribed, show content
  if (isSubscribed) {
    return <>{children}</>;
  }

  // If fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default subscription gate UI
  if (showLockOverlay) {
    return (
      <>
        <div className="relative flex items-center justify-center py-12 bg-secondary/30 rounded-xl">
          <div className="text-center p-6">
            {!user ? (
              <>
                <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-bold text-foreground mb-2">Sign In Required</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Please sign in to access this content
                </p>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-5 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                <Crown className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-bold text-foreground mb-2">Premium Content</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Subscribe to watch unlimited movies and series
                </p>
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="px-5 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Subscribe Now
                </button>
              </>
            )}
          </div>
        </div>
        <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      </>
    );
  }

  return null;
};

export default SubscriptionGuard;