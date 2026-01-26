import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

// Price IDs - Regular prices (before Founders Discount)
// Pro: $599/year | $59.99/month
// Pro+: $1,399/year | $119.99/month
const PRICE_IDS: Record<string, string> = {
  pro_yearly: "price_1StuJAIeV9jtGwIXS4bDWgDT",        // $599/year (regular)
  pro_monthly: "price_1StuJjIeV9jtGwIXHlQNkJav",       // $59.99/month (regular)
  pro_plus_yearly: "price_1Stu9bIeV9jtGwIXWSN6axQf",   // $1,399/year (regular)
  pro_plus_monthly: "price_1StuBAIeV9jtGwIXnp3T4PLJ"   // $119.99/month (regular)
};

// Founders Discount Coupons
// Pro Yearly: $400 off (once) = $599 -> $199 first year
// Pro+ Yearly: $800 off (once) = $1,399 -> $599 first year
// Pro Monthly: $10 off (12 months) = $59.99 -> $49.99 for 12 months
// Pro+ Monthly: $50 off (12 months) = $119.99 -> $69.99 for 12 months
const FOUNDERS_COUPONS: Record<string, string> = {
  pro_yearly: "ivjf3mbD",        // $400 off (once)
  pro_monthly: "6UL8Ic6E",       // $10 off (12 months)
  pro_plus_yearly: "Rd8fTRgK",   // $800 off (once)
  pro_plus_monthly: "T9F6T2Av"   // $50 off (12 months)
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
    const { successUrl, cancelUrl, plan = "pro", cycle = "yearly", applyFoundersDiscount = true } = await req.json();

    // Determine price ID based on plan and cycle
    const priceKey = `${plan}_${cycle}`;
    const priceId = PRICE_IDS[priceKey];

    if (!priceId) {
      throw new Error(`Invalid plan/cycle combination: ${plan}/${cycle}`);
    }

    // Create checkout session config
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
        founders_discount: applyFoundersDiscount ? "true" : "false",
      },
      subscription_data: {
        metadata: {
          plan: plan,
          cycle: cycle,
        },
      },
    };

    // Apply Founders Discount coupon if enabled
    if (applyFoundersDiscount) {
      const couponId = FOUNDERS_COUPONS[priceKey];
      if (couponId) {
        sessionConfig.discounts = [{ coupon: couponId }];
      }
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
