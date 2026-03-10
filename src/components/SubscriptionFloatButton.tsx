import { Crown, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface SubscriptionFloatButtonProps {
  onClick: () => void;
}

const SubscriptionFloatButton = ({ onClick }: SubscriptionFloatButtonProps) => {
  const { user } = useAuth();
  const { isSubscribed, daysRemaining } = useSubscription();

  // Don't show if already subscribed
  if (isSubscribed) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 group"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-orange-500 to-primary rounded-full blur-lg opacity-60 group-hover:opacity-100 animate-pulse transition-opacity" />
      
      {/* Button */}
      <div className="relative flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-orange-500 text-white font-bold rounded-full shadow-2xl hover:scale-105 transition-transform">
        <Crown className="w-5 h-5" />
        <span className="hidden sm:inline">Subscribe Now</span>
        <span className="sm:hidden">Subscribe</span>
        <Sparkles className="w-4 h-4 animate-pulse" />
      </div>

      {/* Badge */}
      <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full animate-bounce">
        From 3K
      </div>
    </button>
  );
};

export default SubscriptionFloatButton;
