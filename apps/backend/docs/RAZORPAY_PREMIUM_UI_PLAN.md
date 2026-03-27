# Razorpay Plan For Paid LSP + DOT

## Scope

This document is intentionally limited to:

- paid access for **IDE LSP features**
- paid access for **DOT docs chatbot**
- **frontend/UI integration planning only**

This document does **not** implement backend payment processing.

---

## 1. Product requirement

Two features belong to the paid version:

1. IDE language intelligence powered by the J++ LSP layer
2. DOT chatbot on the docs page

Free users should still be able to:

- open the IDE
- write code
- compile and run code
- read documentation

Paid users should additionally be able to:

- use advanced editor intelligence
- use DOT in docs

---

## 2. What has already been done in UI

The current frontend now shows this product model:

- `/ide` has a premium preview section for LSP features
- `/docs` has a premium preview section for DOT
- both pages have a local free/paid preview toggle for design/demo purposes
- free state shows locked/upsell UI
- paid preview shows unlocked UI state

Important:

- this is **presentation and gating UI**
- it is **not real subscription enforcement yet**

---

## 3. Recommended Razorpay purchase flow

Use this purchase flow:

1. User clicks `Upgrade with Razorpay`
2. Frontend requests an order/session from backend
3. Backend creates Razorpay order/subscription
4. Frontend opens Razorpay Checkout
5. User completes payment
6. Backend verifies signature/webhook
7. Backend marks user plan as `paid`
8. Frontend refreshes user subscription state
9. LSP and DOT unlock automatically

You asked not to touch backend payment integration, so only steps 1 and 9 belong to current implementation work.

---

## 4. Frontend states you need

You should store a subscription state such as:

```ts
type UserPlan = "free" | "paid" | "loading";
```

And feature flags derived from it:

```ts
const canUsePaidLsp = plan === "paid";
const canUseDotChat = plan === "paid";
```

Do not scatter string checks everywhere. Centralize plan logic.

Recommended future file:

- `apps/ui/lib/billing.js`

Possible shape:

```js
export function getPlanFeatures(plan) {
  return {
    canUsePaidLsp: plan === "paid",
    canUseDotChat: plan === "paid",
  };
}
```

---

## 5. Recommended frontend integration structure

### A. Auth/user state

You need some client-side source of truth for the logged-in user's plan.

Possible sources:

- auth session payload
- `/api/me`
- `/api/billing/status`

Example response:

```json
{
  "userId": "u_123",
  "plan": "free"
}
```

### B. Checkout launcher

Create one reusable frontend function:

```js
async function startRazorpayCheckout(featureKey) {
  // featureKey could be "premium_bundle", "lsp", or "dot"
}
```

Recommended bundle choice:

- sell one **premium bundle**
- include both LSP and DOT in that single paid plan

This is simpler than selling them separately.

---

## 6. Where Razorpay UI hooks should live

### IDE page

Location:

- locked premium language-intelligence panel
- upgrade CTA near LSP feature cards

Button behavior:

- if logged out: redirect to signup/login first
- if logged in and free: open Razorpay Checkout
- if already paid: do nothing or show feature as active

### Docs page

Location:

- DOT paywall panel
- DOT floating trigger can also show `Pro` badge

Button behavior:

- same premium bundle checkout entry point

---

## 7. Recommended frontend-only implementation steps

These are the steps you can safely implement without backend payment coding:

1. Add a shared billing hook like `usePlan()`
2. Replace preview toggle with real server-backed plan state later
3. Add a shared `UpgradeButton` component
4. Lazy-load Razorpay script in frontend
5. On click, call a placeholder backend endpoint like `/api/billing/create-order`
6. Open Razorpay Checkout with returned order data
7. After success, call a refresh method to re-fetch user plan

---

## 8. Razorpay frontend script setup

In Next.js, you typically need Razorpay Checkout JS in the browser.

Common approaches:

- load via `<Script />`
- load dynamically only when checkout starts

Example approach:

```js
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
```

This belongs in frontend utility code.

---

## 9. Example frontend checkout flow

```js
async function startPremiumCheckout() {
  const ok = await loadRazorpay();
  if (!ok) {
    throw new Error("Razorpay SDK failed to load");
  }

  const res = await fetch("/api/billing/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan: "premium_bundle" }),
  });

  const order = await res.json();

  const razorpay = new window.Razorpay({
    key: order.keyId,
    amount: order.amount,
    currency: order.currency,
    name: "J++",
    description: "Premium plan for LSP + DOT",
    order_id: order.orderId,
    handler: async function () {
      await refreshPlan();
    },
    prefill: order.prefill,
    theme: { color: "#111827" },
  });

  razorpay.open();
}
```

This is illustrative. It still depends on backend order creation and verification.

---

## 10. Why backend verification is mandatory

Even if you do not want to touch backend payment integration right now, you still need to understand this:

- frontend success callback is not enough
- backend must verify Razorpay signature or webhook
- backend must persist the user subscription state

If you skip that, users could unlock premium UI without confirmed payment.

So the frontend can be prepared now, but real monetization still needs backend work later.

---

## 11. Best product packaging recommendation

Use **one paid plan**, not two separate payments.

Recommended paid plan includes:

- LSP smart editor features
- DOT docs chatbot

Reason:

- simpler checkout
- simpler entitlement logic
- simpler messaging
- higher perceived value

Recommended internal plan key:

- `premium_bundle`

---

## 12. UI copy recommendation

Use consistent language everywhere.

### IDE

- "Unlock J++ Language Intelligence"
- "Autocomplete, hover, diagnostics, and outline are part of Premium."

### Docs

- "Unlock DOT"
- "Ask documentation questions with the Premium assistant."

### Checkout

- "Premium unlocks smart IDE tooling and DOT docs chat."

---

## 13. Suggested entitlement rules

If `plan === "free"`:

- show locked state for paid LSP panels
- keep basic editor usable
- show locked state for DOT

If `plan === "paid"`:

- enable Monaco LSP integrations
- enable DOT request composer and send button

---

## 14. Concrete future file plan

When you later do real payment integration, these files are a clean direction:

- `apps/ui/lib/razorpay.js`
- `apps/ui/hooks/usePlan.js`
- `apps/ui/components/UpgradeButton.jsx`
- `apps/ui/components/PlanBadge.jsx`

Optional backend files later:

- `apps/backend/src/billing/billing.controller.ts`
- `apps/backend/src/billing/billing.service.ts`
- `apps/backend/src/billing/razorpay.service.ts`
- `apps/backend/src/billing/webhook.controller.ts`

Again, those backend files are **not for now**.

---

## 15. Immediate next implementation after payment backend exists

Once backend billing exists, frontend work should proceed in this order:

1. Replace preview toggle with real user plan state.
2. Connect `Upgrade with Razorpay` buttons to checkout launcher.
3. After successful payment, refresh plan.
4. Gate IDE LSP network calls by entitlement.
5. Gate DOT chat submit path by entitlement.
6. Keep free users on locked preview panels.

---

## 16. Short summary

Right now, the correct approach is:

- keep payment logic out of backend for this step, as requested
- use frontend paywall/preview UI to show the premium product shape
- later connect those CTAs to Razorpay Checkout
- unlock both LSP and DOT from one premium bundle

That is the cleanest path.
