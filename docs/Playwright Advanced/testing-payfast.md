---
sidebar_position: 9
---

# Fintech Checkout & Payment Gateway Testing

In this case study, we will walk through how to automate end-to-end tests for a fintech application using **PlayFast** (our financial management and payment dashboard) as our test subject.

Fintech testing requires special care because it involves secure inputs, third-party payment gateways, complex state validations, and iframe sandboxes.

---

## 💳 The Test Scenario
We want to test a customer purchasing a SaaS subscription. The user journey includes:
1. Navigating to the pricing page.
2. Clicking **"Get Started"** on the Premium Plan.
3. Filling out the checkout form (Name, Email).
4. Interacting with a secure payment iframe (card details).
5. Submitting payment and verifying the dashboard redirects to the success state.

---

## 🧩 1. Handling Secure Checkout Iframes
Many payment providers (like Stripe or PayFast) load credit card input fields inside secure `<iframe>` elements to keep them isolated from the host page.

In Playwright, we handle iframes using `frameLocator()`.

> [!WARNING]
> You cannot select elements inside an iframe using regular page selectors like `page.locator()`. You must locate the frame first.

### Example:
```typescript
// 1. Locate the secure card entry iframe
const cardFrame = page.frameLocator('iframe[name="secure-checkout-frame"]');

// 2. Select and interact with input fields inside that iframe
await cardFrame.getByPlaceholder('Card Number').fill('4242 4242 4242 4242');
await cardFrame.getByPlaceholder('MM/YY').fill('12/28');
await cardFrame.getByPlaceholder('CVC').fill('123');
```

---

## 🔌 2. Mocking Payment APIs (Speed & Reliability)
Running live credit card charges during every test run is slow and can fail due to bank throttling or internet issues.

We can mock network responses using `page.route()` to make our tests **100% reliable** and **sub-second fast**.

```typescript
// Intercept the payment submission API call and return a success mock response
await page.route('**/api/v1/charge', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      transactionId: 'TXN_987654321',
      status: 'success',
      amount: 4900, // $49.00
      currency: 'usd'
    })
  });
});
```

---

## 📝 3. Complete End-to-End Test Script
Here is a complete, structured Playwright test script showing the checkout flow:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Fintech Payment Gateway Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    // Intercept payment API to mock transaction success
    await page.route('**/api/payments/charge', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ status: 'APPROVED', code: '00' })
      });
    });

    await page.goto('https://playfast-finance.com/pricing');
  });

  test('should successfully purchase premium subscription', async ({ page }) => {
    // 1. Select plan and click CTA
    await page.getByRole('heading', { name: 'Premium Plan' }).scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Get Started' }).click();

    // 2. Fill customer details
    await page.getByPlaceholder('Full Name').fill('Girish Mulgund');
    await page.getByPlaceholder('Email address').fill('girish@playfast.com');
    await page.getByRole('button', { name: 'Proceed to Payment' }).click();

    // 3. Interact with secure iframe fields
    const paymentFrame = page.frameLocator('#payment-gateway-iframe');
    await paymentFrame.getByPlaceholder('Cardholder Name').fill('Girish Mulgund');
    await paymentFrame.getByPlaceholder('Card Number').fill('4242 4242 4242 4242');
    await paymentFrame.getByPlaceholder('Expiry Date').fill('12/29');
    await paymentFrame.getByPlaceholder('CVV/CVC').fill('242');

    // 4. Submit checkout
    await paymentFrame.getByRole('button', { name: 'Pay $49.00 Now' }).click();

    // 5. Assert transition to success page
    await expect(page).toHaveURL(/.*\/checkout-success/);
    await expect(page.getByRole('heading')).toContainText('Thank you for your purchase!');
    await expect(page.getByText('Transaction ID: TXN_')).toBeVisible();
  });
});
```

---

## 💡 Best Practices for Fintech Testing
1. **Never hardcode real secrets:** Use environment variables (like `process.env.TEST_CARD_NUMBER`) for credentials.
2. **Use sandbox environments:** Connect to Stripe/PayFast staging dashboards instead of production.
3. **Validate error states:** Always write a test for card failure codes (e.g. `INSUFFICIENT_FUNDS`, `EXPIRED_CARD`) to check that correct user feedback messages appear on the interface.

```quiz
{
  "question": "Which Playwright method should you use to interact with elements nested inside a secure payment gateway iframe?",
  "options": [
    "page.locator()",
    "page.frameLocator()",
    "page.nestedLocator()",
    "page.switchToFrame()"
  ],
  "answer": 1,
  "explanation": "Playwright uses page.frameLocator(selector) to create a locator for elements inside an iframe, allowing actions like .fill() or .click() to execute directly inside the frame."
}
```
