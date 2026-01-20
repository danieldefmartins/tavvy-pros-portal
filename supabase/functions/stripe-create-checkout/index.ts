import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

// Price IDs (regular prices - coupons will apply the intro discount)
const PRICE_IDS: Record<string, string> = {
  pro_yearly: "price_1SnPT2IeV9jtGwIXhcNUzpXD",      // $499/year
  pro_monthly: "price_1SriqqIeV9jtGwIXlpIqw1L4",     // $49.99/month
  pro_plus_yearly: "price_1SrP2tIeV9jtGwIXcu7bzEbJ", // $1,299/year
  pro_plus_monthly: "price_1SritiIeV9jtGwIXg7mr8x7q" // $109.99/month
};

// Coupon IDs for intro pricing (first 12 months)
const COUPONS: Record<string, string> = {
  pro_yearly: "ivjf3mbD",      // $400 off → $99 first year
  pro_monthly: "6UL8Ic6E",     // $10 off → $39.99/mo first 12 months
  pro_plus_yearly: "Rd8fTRgK", // $800 off → $499 first year
  pro_plus_monthly: "T9F6T2Av" // $50 off → $59.99/mo first 12 months
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight - MUST return 200 OK
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const { successUrl, cancelUrl, plan = "pro", cycle = "yearly" } = await req.json();

    // Determine price ID and coupon based on plan and cycle
    const priceKey = `${plan}_${cycle}`;
    const priceId = PRICE_IDS[priceKey];
    const couponId = COUPONS[priceKey];

    if (!priceId) {
      throw new Error(`Invalid plan/cycle combination: ${plan}/${cycle}`);
    }

    // Create checkout session with coupon for intro pricing
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        plan: plan,
        cycle: cycle,
      },
      subscription_data: {
        metadata: {
          plan: plan,
          cycle: cycle,
        },
      },
    };

    // Apply coupon if available (for intro pricing)
    if (couponId) {
      sessionConfig.discounts = [{ coupon: couponId }];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
