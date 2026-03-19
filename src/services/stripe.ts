import { supabase } from '../lib/supabase';

export interface CheckoutSessionRequest {
  priceId: string;
  mode: 'payment' | 'subscription';
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export const createCheckoutSession = async (
  request: CheckoutSessionRequest
): Promise<CheckoutSessionResponse> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      price_id: request.priceId,
      mode: request.mode,
      success_url: request.successUrl,
      cancel_url: request.cancelUrl,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

export const redirectToCheckout = async (sessionId: string) => {
  // For now, we'll use the URL directly since we get it from the API
  // In a production app, you might want to use Stripe's JS SDK
  const { data } = await createCheckoutSession({
    priceId: sessionId, // This would be passed differently in real usage
    mode: 'subscription',
    successUrl: `${window.location.origin}/success`,
    cancelUrl: `${window.location.origin}/pricing`,
  });
  
  if (data.url) {
    window.location.href = data.url;
  }
};