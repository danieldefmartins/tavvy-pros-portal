import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

// Price IDs - New pricing as of Jan 2026
// Pro: $199/year (first year), $599/year (renewal) | $49.99/month
// Pro+: $599/year (first year), $1,299/year (renewal) | $69.99/month
const PRICE_IDS: Record<string, string> = {
  pro_yearly: "price_1StuJAIeV9jtGwIXS4bDWgDT",        // $199/year (first year price)
  pro_monthly: "price_1StuJjIeV9jtGwIXHlQNkJav",       // $49.99/month
  pro_plus_yearly: "price_1Stu9bIeV9jtGwIXWSN6axQf",   // $599/year (first year price)
  pro_plus_monthly: "price_1StuBAIeV9jtGwIXnp3T4PLJ"   // $69.99/month
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

    // Determine price ID based on plan and cycle
    const priceKey = `${plan}_${cycle}`;
    const priceId = PRICE_IDS[priceKey];

    if (!priceId) {
      throw new Error(`Invalid plan/cycle combination: ${plan}/${cycle}`);
    }

    // Create checkout session
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
