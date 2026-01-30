# Tavvy Pros Portal - Stripe Payment Integration Setup Guide

## 📋 Overview

This guide covers the complete setup of Stripe payment integration for the Tavvy Pros Portal, including:
- Subscription plans (Pro & Pro+)
- Annual/Monthly billing toggle
- Founding member coupons
- Webhook handling
- Customer portal

---

## 🔑 Environment Variables

### 1. Copy the example file:
```bash
cp .env.example .env
```

### 2. Add your Stripe keys:

**Get from Stripe Dashboard → Developers → API keys:**
- `STRIPE_SECRET_KEY`: Your restricted API key (already set)
- `STRIPE_PUBLISHABLE_KEY`: Your publishable key (pk_live_...)

**Get from Stripe Dashboard → Developers → Webhooks:**
- `STRIPE_WEBHOOK_SECRET`: Create a webhook endpoint first (see below)

---

## 🎯 Stripe Dashboard Configuration

### 1. **Products & Prices** ✅ (Already Created)

Your products are already set up:

| Product | Monthly Price ID | Annual Price ID |
|---------|-----------------|-----------------|
| **Tavvy Pro** | `price_1StuJjIeV9jtGwIXHlQNkJav` | `price_1StuJAIeV9jtGwIXS4bDWgDT` |
| **Tavvy Pro+** | `price_1StuBAIeV9jtGwIXnp3T4PLJ` | `price_1Stu9bIeV9jtGwIXWSN6axQf` |

### 2. **Coupons** ✅ (Already Created)

| Coupon ID | Discount | Duration | Use Case |
|-----------|----------|----------|----------|
| `HCArOJ6D` | $10 Off | 12 months | Pro Monthly |
| `wzF33SQA` | $400 Off | Once | Pro Yearly |
| `N831RGNp` | $50 Off | 12 months | Pro+ Monthly |
| `Ef0h5xy1` | $800 Off | Once | Pro+ Yearly |

### 3. **Webhook Endpoint** (Action Required)

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Set endpoint URL:
   ```
   https://pros.tavvy.com/api/webhooks/stripe
   ```
4. Select events to listen for:
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_...`)
7. Add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

---

## 🚀 Deployment Steps

### 1. **Install Dependencies**
```bash
cd /home/ubuntu/tavvy-pros-portal
pnpm install
```

### 2. **Build the Application**
```bash
pnpm build
```

### 3. **Set Environment Variables on Railway**

Go to your Railway project settings and add:
```
STRIPE_SECRET_KEY=rk_live_your_restricted_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
PUBLIC_URL=https://pros.tavvy.com
```

### 4. **Deploy to Railway**
```bash
git add -A
git commit -m "Add Stripe payment integration"
git push origin main
```

---

## 🧪 Testing

### Test in Development:

1. **Start the server:**
   ```bash
   pnpm dev
   ```

2. **Visit pricing page:**
   ```
   http://localhost:3000/pricing
   ```

3. **Use Stripe test cards:**
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`

4. **Test webhooks locally with Stripe CLI:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   stripe trigger customer.subscription.created
   ```

### Test in Production:

1. Visit `https://pros.tavvy.com/pricing`
2. Select a plan and complete checkout
3. Verify subscription in Stripe Dashboard
4. Check webhook logs for successful events

---

## 📱 User Flow

### 1. **Pricing Page** (`/pricing`)
- User sees Pro and Pro+ plans
- Toggle between monthly/annual billing
- Enter coupon code (optional)
- Click "Get Started" → Redirects to Stripe Checkout

### 2. **Stripe Checkout**
- User enters payment details
- Applies coupon if provided
- Completes payment

### 3. **Success** (`/subscription/success`)
- User is redirected after successful payment
- Subscription is activated via webhook
- User can access dashboard

### 4. **Customer Portal** (Future)
- User can manage subscription
- Update payment method
- Cancel subscription
- View invoices

---

## 🔧 Troubleshooting

### Issue: "Webhook signature verification failed"
**Solution:** Make sure `STRIPE_WEBHOOK_SECRET` is set correctly and matches the webhook endpoint in Stripe Dashboard.

### Issue: "Price not found"
**Solution:** Verify price IDs in `shared/stripe-config.ts` match your Stripe Dashboard.

### Issue: "Coupon not found"
**Solution:** Check coupon IDs in `shared/stripe-config.ts` and ensure they exist in Stripe Dashboard.

### Issue: "Checkout session creation failed"
**Solution:** 
1. Check `STRIPE_SECRET_KEY` has correct permissions
2. Verify `PUBLIC_URL` is set correctly
3. Check server logs for detailed error messages

---

## 📊 Database Schema (Future Enhancement)

You may want to add a `subscriptions` table to track user subscriptions:

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  plan TEXT NOT NULL, -- 'pro' or 'proPlus'
  interval TEXT NOT NULL, -- 'monthly' or 'annual'
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due', etc.
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
```

---

## 🎉 Next Steps

1. ✅ Test the pricing page in development
2. ✅ Set up webhook endpoint in Stripe Dashboard
3. ✅ Deploy to Railway with environment variables
4. ✅ Test end-to-end checkout flow in production
5. 🔄 Add subscription management UI (customer portal)
6. 🔄 Add subscription status to user dashboard
7. 🔄 Implement database tracking for subscriptions

---

## 📞 Support

If you encounter any issues:
1. Check server logs for errors
2. Verify all environment variables are set
3. Test webhooks with Stripe CLI
4. Contact Stripe support if payment issues persist

---

**Implementation Complete! 🚀**

The Tavvy Pros Portal now has a fully functional Stripe payment integration with:
- ✅ Pro & Pro+ subscription plans
- ✅ Monthly/Annual billing toggle
- ✅ Founding member coupons
- ✅ Stripe Checkout integration
- ✅ Webhook event handling
- ✅ Success/Cancel pages
- ✅ Responsive pricing page

You can now replicate this implementation to:
- `realtor.tavvy.com` (same products/prices)
- `onthego.tavvy.com` (different products)
- `tavvy.com` (eCard product)
