import { useState, useEffect, useRef } from "react";
import { X, Crown, Check, Smartphone, Loader2, Shield, Clock, Sparkles, AlertCircle, Copy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription, SUBSCRIPTION_PLANS, SubscriptionPlan } from "@/contexts/SubscriptionContext";
import { database } from "@/lib/firebase";
import { ref, push, set, get, update } from "firebase/database";
import { toast } from "sonner";
import LoginModal from "@/components/LoginModal";
import {
  formatPhoneNumber,
  isValidPhoneFormat,
  validatePhoneNumber,
  sendPaymentRequest,
  pollPaymentStatus,
  PaymentStatusResponse,
} from "@/lib/mobileMoneyApi";

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
}

type PaymentStep = "plans" | "payment" | "validating" | "processing" | "success" | "failed";

const SubscriptionModal = ({ open, onClose }: SubscriptionModalProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState<PaymentStep>("plans");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [internalReference, setInternalReference] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("Waiting for payment confirmation...");
  const [paymentDetails, setPaymentDetails] = useState<PaymentStatusResponse | null>(null);
  
  const pollingRef = useRef<boolean>(false);

  // Reset polling when modal closes
  useEffect(() => {
    if (!open) {
      pollingRef.current = false;
    }
  }, [open]);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!user) {
      setShowLoginModal(true);
      toast.info("Please sign in to subscribe");
      return;
    }
    setSelectedPlan(plan);
    setStep("payment");
  };

  const processPayment = async () => {
    if (!selectedPlan || !user) return;
    
    // Validate phone format first
    if (!isValidPhoneFormat(phoneNumber)) {
      toast.error("Please enter a valid Uganda phone number");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");
    setStep("validating");
    setStatusMessage("Validating phone number...");

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      // Step 1: Validate phone number with API (with 5s timeout, skip if slow)
      try {
        const validationPromise = validatePhoneNumber(phoneNumber);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("timeout")), 5000)
        );
        const validationResult = await Promise.race([validationPromise, timeoutPromise]) as any;
        
        if (!validationResult.success) {
          throw new Error(validationResult.message || "Invalid phone number. Please check and try again.");
        }
      } catch (valError: any) {
        if (valError.message !== "timeout") throw valError;
        // Timed out — skip validation and proceed to payment
        console.log("Phone validation timed out, skipping...");
      }
      
      setStatusMessage("Initiating payment request...");
      
      // Step 2: Send payment request
      const paymentResponse = await sendPaymentRequest({
        msisdn: phoneNumber,
        amount: selectedPlan.price,
        description: `VJ MAKER ${selectedPlan.name} Subscription`,
      });
      
      if (!paymentResponse.success) {
        throw new Error(paymentResponse.message || "Failed to initiate payment. Please try again.");
      }

      // Check nested relworx response for actual success
      if (paymentResponse.relworx && !paymentResponse.relworx.success) {
        throw new Error(paymentResponse.relworx.message || "Payment provider error. Please try again.");
      }
      
      // Get the internal reference for status polling
      const reference = paymentResponse.relworx?.internal_reference || paymentResponse.internal_reference;
      const customerRef = paymentResponse.relworx?.customer_reference || paymentResponse.customer_reference;
      
      if (!reference) {
        throw new Error("No payment reference received. Please try again.");
      }
      
      console.log("Payment initiated with reference:", reference);
      setInternalReference(reference);
      setTransactionId(customerRef || reference);
      setStep("processing");
      setStatusMessage("Please check your phone and enter your PIN to confirm payment");
      
      // Step 3: Start polling for payment status immediately
      pollingRef.current = true;
      
      const statusResult = await pollPaymentStatus(
        reference,
        (status) => {
          // Update status message based on response
          const relworxStatus = status.relworx?.request_status || status.request_status;
          console.log("Polling status update:", relworxStatus, status);
          
          if (relworxStatus === "pending") {
            setStatusMessage("Waiting for you to confirm on your phone...");
          } else if (relworxStatus === "processing") {
            setStatusMessage("Processing your payment...");
          }
        },
        60, // Max 60 attempts (3 minutes with 3s interval)
        3000 // Poll every 3 seconds
      );
      
      if (!pollingRef.current) {
        // User closed modal, don't continue
        return;
      }
      
      // Payment successful - save to Firebase
      console.log("Payment successful:", statusResult);
      setPaymentDetails(statusResult);
      
      await saveSubscription(statusResult, formattedPhone);
      
      setStep("success");
      toast.success("Subscription activated successfully!");

    } catch (error: any) {
      console.error("Payment error:", error);
      setErrorMessage(error.message || "Payment failed. Please try again.");
      setStep("failed");
      toast.error(error.message || "Payment failed");
    } finally {
      setIsProcessing(false);
      pollingRef.current = false;
    }
  };
  
  const saveSubscription = async (statusResult: PaymentStatusResponse, formattedPhone: string) => {
    if (!selectedPlan || !user) return;
    
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + selectedPlan.days);
    
    const relworx = statusResult.relworx;
    
    // Create subscription in Firebase
    const subsRef = ref(database, "subscriptions");
    const newSubRef = push(subsRef);
    
    await set(newSubRef, {
      userId: user.uid,
      userEmail: user.email || "",
      plan: selectedPlan.id,
      planName: selectedPlan.name,
      amount: selectedPlan.price,
      currency: selectedPlan.currency,
      startsAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isActive: true,
      createdAt: now.toISOString(),
      paymentMethod: "mobile_money",
      paymentPhone: formattedPhone,
      transactionId: relworx?.customer_reference || transactionId,
      internalReference: relworx?.internal_reference || internalReference,
      provider: relworx?.provider || "unknown",
      providerTransactionId: relworx?.provider_transaction_id || "",
      charge: relworx?.charge || 0,
    });

    // Create transaction record
    const txRef = ref(database, "transactions");
    const newTxRef = push(txRef);
    
    await set(newTxRef, {
      userId: user.uid,
      userEmail: user.email || "",
      type: "subscription",
      amount: selectedPlan.price,
      currency: selectedPlan.currency,
      status: "completed",
      description: `${selectedPlan.name} subscription`,
      phone: formattedPhone,
      transactionId: relworx?.customer_reference || transactionId,
      internalReference: relworx?.internal_reference || internalReference,
      provider: relworx?.provider || "unknown",
      providerTransactionId: relworx?.provider_transaction_id || "",
      charge: relworx?.charge || 0,
      completedAt: relworx?.completed_at || now.toISOString(),
      createdAt: now.toISOString(),
    });

    // Update wallet balance
    const walletRef = ref(database, "wallet");
    const walletSnapshot = await get(walletRef);
    const currentBalance = walletSnapshot.exists() ? walletSnapshot.val().balance || 0 : 0;
    
    await update(walletRef, {
      balance: currentBalance + selectedPlan.price,
      lastUpdated: now.toISOString(),
    });
  };

  const handleClose = () => {
    pollingRef.current = false;
    setStep("plans");
    setSelectedPlan(null);
    setPhoneNumber("");
    setTransactionId("");
    setInternalReference("");
    setErrorMessage("");
    setStatusMessage("");
    setPaymentDetails(null);
    setShowLoginModal(false);
    onClose();
  };
  
  const handleRetry = () => {
    setErrorMessage("");
    setStep("payment");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-card to-background border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-xl">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">VJ MAKER Premium</h2>
              <p className="text-sm text-muted-foreground">Unlimited movies & series</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Plans Step */}
          {step === "plans" && (
            <div className="space-y-4">
              {/* Features */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="text-center p-3 bg-secondary/50 rounded-xl">
                  <Sparkles className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">HD Quality</p>
                </div>
                <div className="text-center p-3 bg-secondary/50 rounded-xl">
                  <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Watch Anytime</p>
                </div>
                <div className="text-center p-3 bg-secondary/50 rounded-xl">
                  <Shield className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Ad-Free</p>
                </div>
              </div>

              {/* Plan Cards */}
              <div className="grid grid-cols-2 gap-3">
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan)}
                    className={`relative p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                      plan.id === "1_month" 
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20" 
                        : "border-border bg-secondary/30 hover:border-primary/50"
                    }`}
                  >
                    {plan.id === "1_month" && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full">
                        POPULAR
                      </span>
                    )}
                    <div className="text-center">
                      <p className="text-sm font-semibold text-foreground mb-1">{plan.name}</p>
                      <p className="text-2xl font-bold text-primary">
                        {plan.price.toLocaleString()}
                        <span className="text-xs font-normal text-muted-foreground ml-1">UGX</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{plan.duration}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payment Step */}
          {step === "payment" && selectedPlan && (
            <div className="space-y-5">
              {/* Selected Plan Summary */}
              <div className="p-4 bg-secondary/50 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Selected Plan</p>
                    <p className="text-lg font-bold text-foreground">{selectedPlan.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {selectedPlan.price.toLocaleString()}
                      <span className="text-sm font-normal ml-1">UGX</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile Money Payment */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Smartphone className="w-4 h-4 text-primary" />
                  Mobile Money Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0770 000 000"
                  className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-xs text-muted-foreground">
                  Enter your MTN or Airtel Uganda mobile money number
                </p>
              </div>

              {/* Payment Methods */}
              <div className="flex gap-2 justify-center opacity-60">
                <div className="px-3 py-1.5 bg-yellow-500/20 text-yellow-600 text-xs font-medium rounded-lg">MTN MoMo</div>
                <div className="px-3 py-1.5 bg-red-500/20 text-red-500 text-xs font-medium rounded-lg">Airtel Money</div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("plans")}
                  className="flex-1 px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={processPayment}
                  disabled={!phoneNumber || isProcessing}
                  className="flex-1 px-4 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  Pay {selectedPlan.price.toLocaleString()} UGX
                </button>
              </div>
            </div>
          )}

          {/* Validating Step */}
          {step === "validating" && (
            <div className="text-center py-8">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-primary animate-spin" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Validating</h3>
              <p className="text-sm text-muted-foreground">
                {statusMessage}
              </p>
            </div>
          )}

          {/* Processing Step */}
          {step === "processing" && (
            <div className="text-center py-8">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <Smartphone className="absolute inset-0 m-auto w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Processing Payment</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {statusMessage}
              </p>
              {transactionId && (
                <p className="text-xs text-muted-foreground">
                  Reference: {transactionId}
                </p>
              )}
            </div>
          )}

          {/* Failed Step */}
          {step === "failed" && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Payment Failed</h3>
              {errorMessage && (
                <div className="mx-auto mb-4 max-w-sm">
                  <div className="relative bg-secondary/70 border border-border rounded-lg p-3 text-left">
                    <p className="text-xs text-destructive font-mono break-all pr-8">
                      {errorMessage}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(errorMessage);
                        toast.success("Error message copied!");
                      }}
                      className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-foreground bg-secondary rounded-md transition-colors"
                      title="Copy error"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
              {!errorMessage && (
                <p className="text-sm text-muted-foreground mb-4">
                  Something went wrong. Please try again.
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRetry}
                  className="flex-1 px-4 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === "success" && selectedPlan && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your {selectedPlan.name} subscription is now active
              </p>
              <div className="p-4 bg-secondary/50 rounded-xl mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-left">
                    <p className="text-muted-foreground">Plan</p>
                    <p className="font-medium text-foreground">{selectedPlan.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-medium text-foreground">{selectedPlan.price.toLocaleString()} UGX</p>
                  </div>
                  <div className="text-left">
                    <p className="text-muted-foreground">Transaction ID</p>
                    <p className="font-medium text-foreground text-xs">{transactionId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium text-foreground">{selectedPlan.duration}</p>
                  </div>
                  {paymentDetails?.relworx?.provider && (
                    <>
                      <div className="text-left">
                        <p className="text-muted-foreground">Provider</p>
                        <p className="font-medium text-foreground text-xs">{paymentDetails.relworx.provider}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Charge</p>
                        <p className="font-medium text-foreground">{paymentDetails.relworx.charge || 0} UGX</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-full px-4 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
              >
                Start Watching
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  );
};

export default SubscriptionModal;
