---
name: setup-payments
description: Set up secure payment processing for web and mobile platforms using 2026 industry standards
---

# Payment System Setup

## Purpose
Guide implementation of secure, PCI-compliant payment systems supporting credit cards, digital wallets (Apple Pay, Google Pay), and PayPal across web, iOS, and Android platforms.

## When to Use
Auto-triggered when user mentions:
- "payment", "checkout", "billing", "subscription"
- "credit card", "stripe", "paypal", "square"
- "monetization", "pricing", "payment gateway"

Manual invocation: `/setup-payments`

## Process

### Step 1: Assess Requirements

Ask the user these questions (one message, all questions):

```
I'll help you set up payment processing. Quick questions:

1. **Platforms**: Which platforms need payments?
   - Web only
   - Web + iOS
   - Web + Android
   - Web + iOS + Android

2. **Payment Methods**: Which payment methods?
   - Credit/debit cards only
   - Cards + Apple Pay/Google Pay
   - Cards + PayPal
   - All of the above (cards, digital wallets, PayPal)

3. **Scale**: Expected transaction volume?
   - Getting started (<$10K/month)
   - Growing ($10K-$100K/month)
   - Established ($100K-$1M/month)
   - Enterprise (>$1M/month)

4. **Use Case**: What are you selling?
   - One-time purchases (e-commerce)
   - Subscriptions (SaaS)
   - Marketplace (multiple sellers)
   - Donations/tips

5. **Technical Context**: What's your backend?
   - Python (FastAPI/Django/Flask)
   - Node.js (Express/NestJS)
   - Other (specify)
```

**If user already provided context:** Skip questions they've answered, only ask what's missing.

### Step 2: Present Decision Matrix

Based on requirements, present this decision matrix:

```markdown
## Payment Provider Decision Matrix

Based on your requirements, here's the comparison:

| Provider | Best For | Pros | Cons | Pricing |
|----------|----------|------|------|---------|
| **Stripe** | Startups to enterprise, cross-platform | Unified API for web/iOS/Android, 100+ payment methods, excellent docs, ML fraud detection | Requires technical integration | 2.9% + $0.30 |
| **PayPal** | Small businesses, quick setup | Brand trust, fast setup, PayPal wallet users | Less customizable, separate mobile wallet integration | 2.9% + $0.30 |
| **Square** | Small businesses <$25K/month | Simple setup, in-person + online | Higher online fees (3.3%), limited international | 3.3% + $0.30 (free) or $29/mo |
| **Adyen** | Enterprise >$5M/month | Direct acquiring, 250+ methods, intelligent routing | Complex setup, enterprise pricing | Custom pricing |

### Recommendation for Your Case

[Provide specific recommendation based on their answers]

**Why this fits:**
- [Reason 1 based on platform requirements]
- [Reason 2 based on scale]
- [Reason 3 based on use case]

**Key Features:**
- [Feature 1]
- [Feature 2]
- [Feature 3]

Should I proceed with [recommended provider] implementation guide?
```

**Decision Logic:**

**If scale = "Getting started" OR "Growing":**
- AND platforms = "Web only" → Recommend PayPal (fastest setup)
- AND platforms include mobile → Recommend Stripe (best mobile SDKs)
- AND use_case = "Marketplace" → Must use Stripe (Connect API)

**If scale = "Established":**
- Always recommend Stripe (best features, scalability)

**If scale = "Enterprise":**
- Recommend Adyen for >$5M/month
- Recommend Stripe for everything else

**If uncertain:** Ask: "What's your top priority: speed of setup, developer experience, or lowest fees?"

### Step 3: Implementation Roadmap

Once provider is chosen, present implementation checklist:

```markdown
## Implementation Roadmap: [Provider Name]

### Phase 1: Account Setup (15 minutes)
- [ ] Create [provider] account at [URL]
- [ ] Enable test mode
- [ ] Get API keys (publishable + secret)
- [ ] Store secret key in environment variables (NEVER commit to git)

### Phase 2: Backend Implementation (2-4 hours)

**Install SDK:**
[Provide exact command for their tech stack]

**Create Payment Intent Endpoint:**
[Provide code snippet]

**Implement Webhook Handler:**
[Provide code snippet]

**Security Checklist:**
- [ ] Validate webhook signatures
- [ ] Use HTTPS only (no HTTP)
- [ ] Implement rate limiting (max 10 payment attempts/hour/user)
- [ ] Never log full card numbers or CVV
- [ ] Store only customer IDs and payment method tokens

### Phase 3: Frontend Integration (3-6 hours)

[Platform-specific instructions based on requirements]

### Phase 4: Testing (2-3 hours)

- [ ] Test successful payment flow
- [ ] Test declined card (use test card: 4000 0000 0000 0002)
- [ ] Test insufficient funds
- [ ] Test webhook delivery
- [ ] Test mobile wallet (Apple Pay/Google Pay)
- [ ] Test 3D Secure authentication

### Phase 5: Production Deployment (1 hour)

- [ ] Switch to production API keys
- [ ] Enable fraud detection (Stripe Radar/equivalent)
- [ ] Set up monitoring alerts
- [ ] Document payment flow for team
- [ ] Test one real $1 transaction

**Total Estimated Time: 8-14 hours**
```

### Step 4: Generate Implementation Code

Provide platform-specific code based on their tech stack:

#### Backend Code Template

**For Python FastAPI:**
```python
from fastapi import FastAPI, HTTPException, Request
import stripe
import os

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

app = FastAPI()

@app.post("/create-payment-intent")
async def create_payment_intent(amount: int, currency: str = "usd"):
    """Create a payment intent for the specified amount."""
    try:
        intent = stripe.PaymentIntent.create(
            amount=amount,  # Amount in cents
            currency=currency,
            automatic_payment_methods={"enabled": True},
        )
        return {"client_secret": intent.client_secret}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/webhook")
async def webhook_handler(request: Request):
    """Handle Stripe webhook events."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    if event.type == "payment_intent.succeeded":
        payment_intent = event.data.object
        # TODO: Fulfill the order, update database, send confirmation email
        print(f"Payment succeeded: {payment_intent.id}")

    elif event.type == "payment_intent.payment_failed":
        payment_intent = event.data.object
        # TODO: Notify customer, log failed payment
        print(f"Payment failed: {payment_intent.id}")

    return {"status": "success"}
```

**For Node.js Express:**
```javascript
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    // TODO: Fulfill order
    console.log('Payment succeeded:', paymentIntent.id);
  }

  res.json({received: true});
});
```

#### Frontend Code Templates

**Web (React with Stripe):**
```typescript
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'https://yourapp.com/payment-success',
      },
    });

    if (error) {
      // Show error to customer
      console.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe}>Pay Now</button>
    </form>
  );
}

export function CheckoutPage({ clientSecret }: { clientSecret: string }) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm />
    </Elements>
  );
}
```

**iOS (Swift):**
```swift
import Stripe

class PaymentViewController: UIViewController {
    var paymentSheet: PaymentSheet?

    func checkout() {
        // 1. Fetch payment intent from your server
        fetchPaymentIntent { [weak self] clientSecret in
            guard let self = self else { return }

            // 2. Configure payment sheet
            var configuration = PaymentSheet.Configuration()
            configuration.merchantDisplayName = "Your App Name"
            configuration.applePay = .init(
                merchantId: "merchant.com.yourapp",
                merchantCountryCode: "US"
            )

            // 3. Present payment sheet
            self.paymentSheet = PaymentSheet(
                paymentIntentClientSecret: clientSecret,
                configuration: configuration
            )

            self.paymentSheet?.present(from: self) { result in
                switch result {
                case .completed:
                    print("Payment completed")
                case .failed(let error):
                    print("Payment failed: \(error)")
                case .canceled:
                    print("Payment canceled")
                }
            }
        }
    }

    func fetchPaymentIntent(completion: @escaping (String) -> Void) {
        // Call your backend endpoint
        // completion(clientSecret)
    }
}
```

**Android (Kotlin):**
```kotlin
import com.stripe.android.PaymentConfiguration
import com.stripe.android.paymentsheet.PaymentSheet
import com.stripe.android.paymentsheet.PaymentSheetResult

class CheckoutActivity : AppCompatActivity() {
    private lateinit var paymentSheet: PaymentSheet

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        PaymentConfiguration.init(
            applicationContext,
            "pk_test_your_publishable_key"
        )

        paymentSheet = PaymentSheet(this, ::onPaymentSheetResult)
    }

    private fun checkout() {
        // 1. Fetch payment intent from your server
        fetchPaymentIntent { clientSecret ->
            // 2. Present payment sheet
            paymentSheet.presentWithPaymentIntent(
                clientSecret,
                PaymentSheet.Configuration(
                    merchantDisplayName = "Your App Name",
                    googlePay = PaymentSheet.GooglePayConfiguration(
                        environment = PaymentSheet.GooglePayConfiguration.Environment.Test,
                        countryCode = "US"
                    )
                )
            )
        }
    }

    private fun onPaymentSheetResult(result: PaymentSheetResult) {
        when (result) {
            is PaymentSheetResult.Completed -> {
                // Payment successful
            }
            is PaymentSheetResult.Canceled -> {
                // User canceled
            }
            is PaymentSheetResult.Failed -> {
                // Payment failed
            }
        }
    }
}
```

### Step 5: Testing Guide

Provide testing checklist with test credentials:

```markdown
## Testing Checklist

### Test Cards (Stripe)
- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **Insufficient Funds**: 4000 0000 0000 9995
- **3D Secure Required**: 4000 0025 0000 3155

**For all test cards:**
- Expiry: Any future date
- CVC: Any 3 digits
- Zip: Any 5 digits

### Unit Tests
- [ ] Payment intent creation returns client secret
- [ ] Webhook signature validation works
- [ ] Invalid signatures are rejected
- [ ] Payment state transitions correctly

### Integration Tests
- [ ] End-to-end payment flow completes
- [ ] Webhooks are processed correctly
- [ ] Idempotency prevents duplicate charges
- [ ] Failed payments are logged

### Security Tests
- [ ] Cannot create payment without server-side validation
- [ ] CSRF protection on payment endpoints
- [ ] Rate limiting prevents abuse
- [ ] Webhook endpoints require valid signatures

### Mobile Wallet Tests (if applicable)
- [ ] Apple Pay works in iOS simulator
- [ ] Google Pay works in Android emulator
- [ ] Wallet button appears only when available
- [ ] Payment sheet shows correct amount

### Production Smoke Test
- [ ] Process one $1 real transaction
- [ ] Verify webhook received
- [ ] Check transaction in provider dashboard
- [ ] Confirm funds appear in account (24-48 hours)
```

### Step 6: PCI Compliance Checklist

Provide security verification:

```markdown
## PCI DSS v4.0.1 Compliance Checklist

✅ **Requirement 1: Never handle raw card data**
- [ ] Using hosted payment pages (Stripe Elements/Checkout)
- [ ] Card data goes directly to payment provider
- [ ] Only store tokenized payment methods

✅ **Requirement 2: Secure API keys**
- [ ] Secret keys in environment variables (not code)
- [ ] Different keys for test/production
- [ ] Keys never committed to git
- [ ] Keys rotated quarterly (set calendar reminder)

✅ **Requirement 3: HTTPS only**
- [ ] All payment endpoints use HTTPS
- [ ] Redirect HTTP to HTTPS
- [ ] Valid SSL certificate

✅ **Requirement 4: Webhook security**
- [ ] Verify webhook signatures
- [ ] Use separate webhook secret
- [ ] Log webhook events
- [ ] Implement idempotency

✅ **Requirement 5: Client-side security**
- [ ] Monitor third-party scripts on payment pages
- [ ] Use Subresource Integrity (SRI) for CDN resources
- [ ] Implement Content Security Policy (CSP)

✅ **Requirement 6: Rate limiting**
- [ ] Max 10 payment attempts per hour per user
- [ ] Block repeated failed attempts
- [ ] Alert on suspicious patterns

✅ **Requirement 7: Logging (without sensitive data)**
- [ ] Log payment attempts (success/failure)
- [ ] Log webhook events
- [ ] NEVER log card numbers, CVV, or full API keys
- [ ] Redact sensitive data in error messages

## Your PCI Scope

By using hosted payment pages (Stripe Elements/PaymentSheet):
- **Your scope**: SAQ A (simplest, 22 questions)
- **Not in scope**: Card data handling, storage, transmission
- **Compliance cost**: Minimal (vs. $50K-$200K for SAQ D)

Annual PCI compliance validation: [Link to provider's compliance docs]
```

### Step 7: Monitoring & Alerts Setup

```markdown
## Monitoring Setup

### Key Metrics to Track

1. **Payment Success Rate**
   - Target: >95%
   - Alert if drops below 90%

2. **Failed Payments**
   - Track decline reasons
   - Alert on unusual decline patterns

3. **Webhook Processing**
   - Target latency: <2 seconds
   - Alert if webhooks fail

4. **Fraud Detection**
   - Monitor risk scores
   - Track chargeback rate (target: <0.5%)

### Implementation

Use your payment provider's dashboard for:
- Real-time transaction monitoring
- Automated fraud detection
- Financial reporting

Set up alerts:
```python
# Example: Alert on payment anomalies
if payment_success_rate < 0.90:
    send_alert("Payment success rate dropped to {rate}")

if failed_webhooks > 10:
    send_alert("Multiple webhook failures detected")
```

Log structured events:
```python
logger.info("payment_completed", {
    "payment_id": payment_id,
    "amount": amount,
    "currency": currency,
    "customer_id": customer_id,
    "status": "succeeded"
})
```
```

## Output Format

After completing all steps, summarize:

```markdown
## Payment System Setup Complete ✓

**Provider**: [Stripe/PayPal/Square/Adyen]

**Platforms Configured**:
- [x] Web (using [integration method])
- [x] iOS (using [SDK])
- [x] Android (using [SDK])

**Payment Methods Enabled**:
- [x] Credit/debit cards
- [x] Apple Pay
- [x] Google Pay
- [x] PayPal

**Security**:
- [x] PCI DSS v4.0.1 compliant (SAQ A)
- [x] Webhook signatures verified
- [x] HTTPS enforced
- [x] Rate limiting active

**Next Steps**:
1. Test with real $1 transaction
2. Set up monitoring alerts
3. Document payment flow for team
4. Schedule quarterly key rotation
5. Review provider docs: [link]

**Estimated Transaction Costs**:
- Per transaction: [fee structure]
- Monthly volume: [estimate based on scale]
- Volume discounts: [if applicable]

**Support Resources**:
- Provider docs: [link]
- Test card numbers: [link]
- Webhook testing: [link]
- Dashboard: [link]
```

## Anti-Patterns to Avoid

- ❌ **Building custom card processing**: Never handle raw card data - PCI compliance costs far exceed transaction fees
- ❌ **Multiple payment providers**: Different providers for web/mobile creates integration nightmare
- ❌ **Client-side only validation**: Always validate payments server-side to prevent fraud
- ❌ **Skipping webhooks**: Essential for reliable payment confirmation (don't rely on client-side callbacks)
- ❌ **Storing card numbers**: Even encrypted, dramatically increases PCI scope and liability
- ❌ **Ignoring mobile wallets**: 60% of transactions on mobile; Apple Pay/Google Pay improve conversion
- ❌ **Not testing in sandbox**: Always test thoroughly before going live
- ❌ **Committing API keys**: Use environment variables, never commit secrets to git
- ❌ **Skipping webhook signature verification**: Opens door to fake payment confirmations

## Examples

### Example 1: E-commerce Startup

**Input:**
- Platforms: Web + iOS + Android
- Payment methods: All (cards, wallets, PayPal)
- Scale: Getting started (<$10K/month)
- Use case: One-time purchases
- Backend: Python FastAPI

**Output:**
```
Recommendation: Stripe

Why:
- Cross-platform SDKs reduce integration time by 70%
- All payment methods included automatically
- Excellent docs for FastAPI integration
- Scales as you grow

Implementation:
- Backend: Stripe Python SDK + Payment Intent API
- Web: Stripe.js + Payment Element
- iOS: Stripe iOS SDK + PaymentSheet
- Android: Stripe Android SDK + PaymentSheet

Estimated setup time: 10-12 hours
Cost: 2.9% + $0.30 per transaction
```

### Example 2: Small Business Website

**Input:**
- Platforms: Web only
- Payment methods: Cards + PayPal
- Scale: Getting started
- Use case: One-time purchases
- Backend: Node.js

**Output:**
```
Recommendation: PayPal Complete Payments

Why:
- Fastest setup (2-3 hours)
- Brand trust increases conversion
- Good for low-volume businesses
- PayPal wallet for existing users

Implementation:
- Backend: PayPal REST API
- Web: PayPal JavaScript SDK

Estimated setup time: 3-4 hours
Cost: 2.9% + $0.30 per transaction

Note: If you add mobile apps later, consider migrating to Stripe for unified integration.
```

### Example 3: SaaS Subscription Platform

**Input:**
- Platforms: Web only (for now)
- Payment methods: Cards only
- Scale: Growing ($50K/month)
- Use case: Monthly subscriptions
- Backend: Python Django

**Output:**
```
Recommendation: Stripe

Why:
- Built-in subscription management
- Automatic retry logic for failed payments
- Customer portal for self-service
- Webhooks handle subscription lifecycle

Implementation:
- Backend: Stripe Python SDK + Subscription API
- Web: Stripe.js + Pricing Table
- Features: Prorated upgrades, trial periods, usage-based billing

Estimated setup time: 12-16 hours
Cost: 2.9% + $0.30 per transaction

Bonus: Stripe Customer Portal saves 20+ hours of UI development
```

## When to Revisit

Triggers to reconsider payment provider:

1. **Scale Change**
   - Processing >$5M/month → Consider Adyen or direct acquiring
   - Volume discounts may justify provider switch

2. **Geographic Expansion**
   - Expanding to regions with limited provider support
   - Need local payment methods (iDEAL, SEPA, etc.)

3. **Feature Gaps**
   - Need specific payment method not supported
   - Require advanced fraud detection not available

4. **Cost Optimization**
   - Transaction fees >1% of revenue
   - Volume justifies custom negotiation

5. **Regulatory Changes**
   - New compliance requirements (SCA, PSD2)
   - Regional payment regulations

**Review Schedule:**
- Quarterly: Review payment metrics (success rate, fraud, costs)
- Annually: Evaluate payment provider landscape and pricing
- As needed: When hitting any trigger above

## References

Research document: `docs/research/2026-02-16-payment-system-setup.md`

Key resources:
- PCI DSS v4.0.1: https://www.pcisecuritystandards.org/
- Stripe docs: https://docs.stripe.com/
- PayPal docs: https://developer.paypal.com/
- Apple Pay: https://developer.apple.com/apple-pay/
- Google Pay: https://developers.google.com/pay
