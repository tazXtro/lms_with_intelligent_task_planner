# 🚀 Stripe Integration - Quick Start

## ✅ What You Need (5 minutes)

### 1. Get Stripe Keys

1. Visit https://dashboard.stripe.com/register
2. Create account (or login)
3. Go to: **Developers** → **API Keys**
4. Copy these two keys:
   - **Secret key** (starts with `sk_test_`)
   - **Publishable key** (starts with `pk_test_`)

### 2. Add to Your Project

Create/edit `.env.local` in your project root:

```bash
# Required for Stripe
STRIPE_SECRET_KEY=sk_test_paste_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_paste_your_publishable_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Your existing Supabase vars (keep these)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. Restart Server

```bash
npm run dev
```

## 🧪 Test It (2 minutes)

1. Open browser: `http://localhost:3000`
2. Login as a learner
3. Browse courses → Select any course
4. Click "Enroll Now" → "Proceed to Payment"
5. Use this test card:
   ```
   Card: 4242 4242 4242 4242
   Expiry: 12/34
   CVV: 123
   ZIP: 12345
   ```
6. Complete payment
7. ✅ You should be enrolled!

## 🎯 That's It!

You now have a fully working Stripe payment integration **without webhooks**!

---

## 📁 Files Created

- ✅ `/app/api/stripe/create-checkout-session/route.ts` - Creates payment sessions
- ✅ `/app/api/stripe/verify-session/route.ts` - Verifies payments
- ✅ `/app/learner/checkout/page.tsx` - Updated checkout page
- ✅ `/app/learner/checkout/success/page.tsx` - Success page with enrollment

## 🔒 Security

- ✅ Payments verified with Stripe API
- ✅ No card data on your server
- ✅ User authentication required
- ✅ Duplicate enrollment prevention

## 🐛 Troubleshooting

**Problem**: "Failed to create checkout session"
- **Solution**: Check your `.env.local` has the correct `STRIPE_SECRET_KEY`

**Problem**: Page doesn't redirect to Stripe
- **Solution**: Check `NEXT_PUBLIC_APP_URL` is set to `http://localhost:3000`

**Problem**: "Payment verification failed"
- **Solution**: Make sure you're using matching Stripe keys (both test or both live, not mixed)

## 📚 Need More Help?

- See `STRIPE_IMPLEMENTATION_SUMMARY.md` for detailed flow
- See `STRIPE_SETUP_GUIDE.md` for complete documentation
- Visit https://stripe.com/docs for Stripe documentation

## 🚀 Going to Production?

When ready for real payments:

1. Get **live** keys from Stripe Dashboard
2. Replace `sk_test_` with `sk_live_` key
3. Replace `pk_test_` with `pk_live_` key
4. Update `NEXT_PUBLIC_APP_URL` to your production domain
5. Deploy!

---

**Questions?** Check the other documentation files or Stripe's excellent docs at https://stripe.com/docs

