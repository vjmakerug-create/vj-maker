// Mobile Money API Service
// Integration with https://api.vjmakerug.workers.dev

const API_BASE_URL = "https://api.vjmakerug.workers.dev/api";

export interface ValidatePhoneResponse {
  success: boolean;
  ip_address: string;
  relworx: {
    success: boolean;
    message?: string;
    provider?: string;
    msisdn?: string;
  };
}

export interface SendPaymentRequest {
  msisdn: string;
  amount: number;
  description?: string;
}

export interface SendPaymentResponse {
  success: boolean;
  message?: string;
  internal_reference?: string;
  customer_reference?: string;
  ip_address?: string;
  relworx?: {
    success: boolean;
    message?: string;
    internal_reference?: string;
    customer_reference?: string;
  };
}

export interface PaymentStatusResponse {
  success: boolean;
  status: "pending" | "processing" | "success" | "failed";
  message?: string;
  customer_reference?: string;
  internal_reference?: string;
  msisdn?: string;
  amount?: number;
  currency?: string;
  provider?: string;
  charge?: number;
  request_status?: string;
  remote_ip?: string;
  provider_transaction_id?: string;
  completed_at?: string;
  ip_address?: string;
  relworx?: {
    success: boolean;
    status: string;
    message?: string;
    customer_reference?: string;
    internal_reference?: string;
    msisdn?: string;
    amount?: number;
    currency?: string;
    provider?: string;
    charge?: number;
    request_status?: string;
    provider_transaction_id?: string;
    completed_at?: string;
  };
}

export interface WalletBalanceResponse {
  success: boolean;
  balance?: number;
  currency?: string;
  ip_address?: string;
}

/**
 * Format phone number to Uganda format with country code
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, "");
  
  // Handle Uganda phone numbers
  if (cleaned.startsWith("0")) {
    cleaned = "256" + cleaned.substring(1);
  } else if (!cleaned.startsWith("256")) {
    cleaned = "256" + cleaned;
  }
  
  return "+" + cleaned;
};

/**
 * Validate phone number format
 */
export const isValidPhoneFormat = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, "");
  // Uganda phone numbers: starts with 0 or 256, total 10 or 12 digits
  if (cleaned.startsWith("0")) {
    return cleaned.length === 10;
  } else if (cleaned.startsWith("256")) {
    return cleaned.length === 12;
  }
  return cleaned.length === 9; // Just the 9 digits after country code
};

/**
 * Validate phone number with the API
 */
export const validatePhoneNumber = async (phone: string): Promise<ValidatePhoneResponse> => {
  const formattedPhone = formatPhoneNumber(phone);
  
  try {
    const response = await fetch(`${API_BASE_URL}/validate-phone`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ msisdn: formattedPhone }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Phone validation error:", error);
    throw error;
  }
};

/**
 * Send payment to a phone number (for withdrawals)
 */
export const sendPayment = async (request: SendPaymentRequest): Promise<SendPaymentResponse> => {
  const formattedPhone = formatPhoneNumber(request.msisdn);
  
  try {
    const response = await fetch(`${API_BASE_URL}/send-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        msisdn: formattedPhone,
        currency: "UGX",
        amount: request.amount,
        description: request.description || "Withdrawal",
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Send payment response:", data);
    return data;
  } catch (error) {
    console.error("Send payment error:", error);
    throw error;
  }
};

/**
 * Request a payment from customer (for subscriptions)
 */
export const sendPaymentRequest = async (request: SendPaymentRequest): Promise<SendPaymentResponse> => {
  const formattedPhone = formatPhoneNumber(request.msisdn);
  
  try {
    const response = await fetch(`${API_BASE_URL}/request-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        msisdn: formattedPhone,
        currency: "UGX",
        amount: request.amount,
        description: request.description || "VJ MAKER Subscription",
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Request payment response:", data);
    return data;
  } catch (error) {
    console.error("Request payment error:", error);
    throw error;
  }
};

/**
 * Check payment status
 */
export const checkPaymentStatus = async (internalReference: string): Promise<PaymentStatusResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/request-status?internal_reference=${encodeURIComponent(internalReference)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Payment status response:", data);
    return data;
  } catch (error) {
    console.error("Check payment status error:", error);
    throw error;
  }
};

/**
 * Get wallet balance
 */
export const getWalletBalance = async (): Promise<WalletBalanceResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/wallet/balance`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Get wallet balance error:", error);
    throw error;
  }
};

/**
 * Backend transaction from the API
 */
export interface BackendTransaction {
  customer_reference: string;
  provider: string;
  msisdn: string;
  transaction_type: "collection" | "payout";
  transaction_method: string;
  currency: string;
  amount: number;
  status: "success" | "failed" | "pending" | "processing";
  created_at: string;
}

export interface TransactionsResponse {
  success: boolean;
  relworx?: {
    success: boolean;
    current_page: number;
    per_page: number;
    total_pages: number;
    total_count: number;
    next_page: number | null;
    prev_page: number | null;
    transactions: BackendTransaction[];
  };
}

/**
 * Fetch transactions from the payment backend
 */
export const fetchBackendTransactions = async (page: number = 1): Promise<TransactionsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions?page=${page}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Fetch transactions error:", error);
    throw error;
  }
};

/**
 * Poll payment status until completion or timeout
 */
export const pollPaymentStatus = async (
  internalReference: string,
  onStatusUpdate: (status: PaymentStatusResponse) => void,
  maxAttempts: number = 120,
  intervalMs: number = 1000
): Promise<PaymentStatusResponse> => {
  let attempts = 0;
  
  return new Promise((resolve, reject) => {
    const poll = async () => {
      attempts++;
      
      try {
        const status = await checkPaymentStatus(internalReference);
        onStatusUpdate(status);
        
        // Check if we have a relworx response with status
        const relworxStatus = status.relworx?.request_status || status.request_status;
        const isSuccess = status.success && (relworxStatus === "success" || status.status === "success");
        const isFailed = relworxStatus === "failed" || status.status === "failed";
        
        if (isSuccess) {
          resolve(status);
          return;
        }
        
        if (isFailed) {
          reject(new Error(status.message || "Payment failed"));
          return;
        }
        
        if (attempts >= maxAttempts) {
          reject(new Error("Payment timeout - please check your phone for the prompt"));
          return;
        }
        
        // Continue polling
        setTimeout(poll, intervalMs);
      } catch (error) {
        if (attempts >= maxAttempts) {
          reject(error);
          return;
        }
        // Continue polling on error (network issues, etc.)
        setTimeout(poll, intervalMs);
      }
    };
    
    // Start polling immediately
    poll();
  });
};
