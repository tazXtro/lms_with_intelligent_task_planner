# Stripe Integration Setup Guide

This guide will help you set up Stripe payments for your DigiGyan LMS platform **without using webhooks**.

## How It Works

Our Stripe integration uses a **redirect-based flow** that doesn't require webhooks:

1. **User clicks "Proceed to Payment"** → Creates a Stripe Checkout Session
2. **User is redirected to Stripe** → Completes payment securely on Stripe's hosted page
3. **User is redirected back** → Success page verifies payment with Stripe API
4. **Enrollment is created** → User gets instant course access

This approach is simpler than webhooks and works perfectly for course purchases!

## Setup Instructions

### Step 1: Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create an account or log in
3. Navigate to **Developers** → **API Keys**
4. Copy your **Secret key** (starts with `sk_test_` for test mode)
5. Copy your **Publishable key** (starts with `pk_test_` for test mode)

### Step 2: Configure Environment Variables

Create a `.env.local` file in your project root with the following:

```env
# Supabase Configuration (you should already have these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application URL (important for Stripe redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

**Important Notes:**
- Replace `your_stripe_secret_key` with your actual Stripe secret key
- Replace `your_stripe_publishable_key` with your actual Stripe publishable key
- For production, change `NEXT_PUBLIC_APP_URL` to your production domain
- For production, use live Stripe keys (starting with `sk_live_` and `pk_live_`)

### Step 3: Restart Your Development Server

```bash
npm run dev
```

## Testing the Integration

### Test Card Numbers

Stripe provides test card numbers for different scenarios:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |

**Test Card Details:**
- **Expiry Date:** Any future date (e.g., 12/34)
- **CVV:** Any 3 digits (e.g., 123)
- **ZIP Code:** Any 5 digits (e.g., 12345)

### Testing Flow

1. Browse to a course as a learner
2. Click "Enroll Now" or "Buy Course"
3. Click "Proceed to Payment"
4. You'll be redirected to Stripe's checkout page
5. Use test card `4242 4242 4242 4242`
6. Complete the payment
7. You'll be redirected back to the success page
8. Your enrollment will be created automatically!

## Security Features

✅ **No sensitive data on your server** - Card details go directly to Stripe
✅ **Payment verification** - We verify each payment with Stripe's API before enrollment
✅ **User authentication** - Only authenticated users can checkout
✅ **Duplicate prevention** - System checks for existing enrollments
✅ **SSL encryption** - All data is encrypted in transit

## Architecture

### API Routes Created

1. **`/api/stripe/create-checkout-session`** - Creates a Stripe checkout session
2. **`/api/stripe/verify-session`** - Verifies payment and retrieves session details

### Pages Created

1. **`/learner/checkout`** - Main checkout page with course summary
2. **`/learner/checkout/success`** - Success page that verifies payment and enrolls user

### Flow Diagram

```
User → Checkout Page → API (Create Session) → Stripe Checkout
         ↑                                            ↓
Success Page ← API (Verify Session) ← User Returns ←┘
         ↓
Enrollment Created
```

## Why No Webhooks?

**Webhooks** are great for async operations, but they add complexity:
- Require a publicly accessible URL (hard for local development)
- Need webhook signature verification
- Require handling retry logic
- More moving parts to debug

**Our redirect-based approach:**
- Simpler to implement and test
- Works perfectly for synchronous enrollment
- No external URL needed for development
- User sees instant feedback
- Direct API verification ensures payment is complete

## Production Deployment

When deploying to production:

1. **Update environment variables:**
   ```env
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   STRIPE_SECRET_KEY=sk_live_your_live_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
   ```

2. **Enable live mode in Stripe Dashboard**

3. **Test with real cards** (or continue testing with test mode keys)

4. **Set up Stripe billing** for production transactions

## Troubleshooting

### "Payment verification failed"
- Check that your `STRIPE_SECRET_KEY` is correct
- Ensure the session hasn't expired (sessions expire after 24 hours)

### "Redirecting to Stripe..." hangs
- Verify `NEXT_PUBLIC_APP_URL` is set correctly
- Check browser console for errors
- Ensure Stripe keys are from the same mode (test or live)

### Double enrollments
- The system already checks for existing enrollments
- If this occurs, check database constraints on the `enrollments` table

### Session errors
- Stripe sessions expire after 24 hours
- Users must complete payment within this timeframe

## Support

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Test Cards:** https://stripe.com/docs/testing
- **Stripe Dashboard:** https://dashboard.stripe.com

## Next Steps

1. Set up your environment variables
2. Test with Stripe test cards
3. Customize the success page if needed
4. When ready, switch to live mode for production!

---

**Note:** This integration is production-ready but focuses on simplicity. For advanced features like subscriptions, coupons, or refunds, you may want to extend the current implementation.

