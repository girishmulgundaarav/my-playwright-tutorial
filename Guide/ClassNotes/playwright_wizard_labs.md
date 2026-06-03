# Playwright Automation Lab Guide: Multi-Step Form Wizard

This lab guide covers 10 advanced multi-step form wizard and client-state automation exercises designed to build E2E proficiency using the Multi-Step Form Wizard playground page. These exercises teach students how to automate validation gating, handle dynamic step skipping depending on paths (Personal vs. Business), manage local storage persistence, test async coupon codes with loading states, navigate back and forth via progress roving indicator headers, verify edit redirects from review screens, and assert final transaction summaries.

---

## 🛠️ Global Setup

Multi-step forms require tests to navigate through several sequential page layouts. You can initialize tests to start from the dashboard or directly navigate to the form wizard URL route.

```typescript
import { test, expect } from '@playwright/test';

test.describe('Multi-Step Form Wizard Lab', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Form Wizard page
    await page.goto('/wizard');
  });
});
```

---

## 📋 Part 1: Registration Paths & Validation Gating (Labs 1–4)

### Lab 1: Personal Account Happy Path Flow
* **Objective**: Automate the standard personal account registration flow and verify the success screen displays correct summaries.
* **Selectors**:
  * Type selection: `data-testid="wizard-type-personal"`
  * Email input: `data-testid="wizard-email-input"`
  * Next step button: `data-testid="wizard-next-btn"`
  * Address input: `data-testid="wizard-address-input"`
  * City input: `data-testid="wizard-city-input"`
  * Payment select: `data-testid="wizard-payment-select"`
  * Confirm button: `data-testid="wizard-confirm-btn"`
  * Success message: `data-testid="wizard-success-msg"`
  * Summary Email: `data-testid="summary-email"`
* **Exercises**:
  1. Choose the **Personal Account** radio button and enter email `"john@example.com"`. Click **Next**.
  2. Fill Shipping Address with `"123 Main Street"` and City with `"San Francisco"`. Click **Next**.
  3. Select payment option `"PayPal"`. Click **Next**.
  4. On the Review page, click **Confirm Order**.
  5. Assert the success message reads `"Order Confirmed Successfully"` and summary email matches `"john@example.com"`.

```typescript
test('Lab 1: Personal Account Happy Path Flow', async ({ page }) => {
  // Step 1: Account
  await page.getByTestId('wizard-type-personal').check();
  await page.getByTestId('wizard-email-input').fill('john@example.com');
  await page.getByTestId('wizard-next-btn').click();

  // Step 2: Shipping (Company Details skipped for Personal path)
  await page.getByTestId('wizard-address-input').fill('123 Main Street');
  await page.getByTestId('wizard-city-input').fill('San Francisco');
  await page.getByTestId('wizard-next-btn').click();

  // Step 3: Payment
  await page.getByTestId('wizard-payment-select').selectOption('PayPal');
  await page.getByTestId('wizard-next-btn').click();

  // Step 4: Review
  await page.getByTestId('wizard-confirm-btn').click();

  // Assertions
  await expect(page.getByTestId('wizard-success-msg')).toHaveText('Order Confirmed Successfully');
  await expect(page.getByTestId('summary-email')).toHaveText('john@example.com');
});
```

---

### Lab 2: Business Account Happy Path Flow
* **Objective**: Automate the business path which dynamically inserts the "Company Details" step into the form wizard.
* **Selectors**:
  * Type selection: `data-testid="wizard-type-business"`
  * Company input: `data-testid="wizard-company-input"`
  * Tax ID input: `data-testid="wizard-taxid-input"`
  * Next step button: `data-testid="wizard-next-btn"`
* **Exercises**:
  1. Select the **Business Account** option, fill email with `"biz@acme.com"`. Click **Next**.
  2. Verify you are redirected to the Company Details step. Fill Company Legal Name with `"Acme Corporation"` and Tax ID with `"TAX-998877"`. Click **Next**.
  3. Complete address step (`"456 Corporate Ave"`, `"New York"`) and payment step (`"Credit Card"`). Click **Next**.
  4. Confirm order on the Review screen.
  5. Assert the transaction completes successfully.

```typescript
test('Lab 2: Business Account Happy Path Flow', async ({ page }) => {
  // Step 1: Account (Select Business)
  await page.getByTestId('wizard-type-business').check();
  await page.getByTestId('wizard-email-input').fill('biz@acme.com');
  await page.getByTestId('wizard-next-btn').click();

  // Step 2: Company Details
  await page.getByTestId('wizard-company-input').fill('Acme Corporation');
  await page.getByTestId('wizard-taxid-input').fill('TAX-998877');
  await page.getByTestId('wizard-next-btn').click();

  // Step 3: Shipping
  await page.getByTestId('wizard-address-input').fill('456 Corporate Ave');
  await page.getByTestId('wizard-city-input').fill('New York');
  await page.getByTestId('wizard-next-btn').click();

  // Step 4: Payment
  await page.getByTestId('wizard-payment-select').selectOption('Credit Card');
  await page.getByTestId('wizard-next-btn').click();

  // Step 5: Review
  await page.getByTestId('wizard-confirm-btn').click();

  await expect(page.getByTestId('wizard-success-msg')).toHaveText('Order Confirmed Successfully');
});
```

---

### Lab 3: Validation Error Gating Checks
* **Objective**: Assert field validation triggers on blur and blocks progressive navigation when errors exist.
* **Selectors**:
  * Email input: `data-testid="wizard-email-input"`
  * Email error text: `data-testid="wizard-email-error"`
  * Next button: `data-testid="wizard-next-btn"`
* **Exercises**:
  1. Type an invalid email format `"test@com"` inside the email field.
  2. Press Tab to trigger the blur validation event.
  3. Assert that the email error message contains `"Please enter a valid email address."`.
  4. Clear the field and click **Next**.
  5. Assert the error message contains `"Email address is required."`.

```typescript
test('Lab 3: Validation Error Gating Checks', async ({ page }) => {
  const emailInput = page.getByTestId('wizard-email-input');

  // 1. Enter invalid email and blur focus
  await emailInput.fill('invalid-email');
  await emailInput.blur();
  await expect(page.getByTestId('wizard-email-error')).toContainText('Please enter a valid email address.');

  // 2. Try to proceed with empty field
  await emailInput.clear();
  await page.getByTestId('wizard-next-btn').click();
  await expect(page.getByTestId('wizard-email-error')).toContainText('Email address is required.');
});
```

---

### Lab 4: Progress Indicator Header Navigation
* **Objective**: Verify that students can navigate backward through steps using the header buttons if they have already been visited.
* **Selectors**:
  * Progress list: `data-testid="wizard-progress"`
* **Exercises**:
  1. Fill out Step 1 (email: `"user@gmail.com"`) and click **Next**.
  2. Once on Step 2 (Shipping), locate the indicator button representing Step 1 (usually the first button inside the progress nav).
  3. Assert it is enabled and click it.
  4. Verify the wizard redirects back to Step 1.
  5. Assert that button representing Step 3 (Payment) is disabled (cannot click forward into unvisited steps).

```typescript
test('Lab 4: Progress Indicator Header Navigation', async ({ page }) => {
  // Go to step 2
  await page.getByTestId('wizard-email-input').fill('user@gmail.com');
  await page.getByTestId('wizard-next-btn').click();

  // Locate progress bar buttons
  const stepButtons = page.locator('[data-testid="wizard-progress"] button');

  // Verify first button (Step 1) is enabled
  await expect(stepButtons.nth(0)).toBeEnabled();
  
  // Verify third button (Step 3) is disabled
  await expect(stepButtons.nth(2)).toBeDisabled();

  // Click Step 1 header to navigate back
  await stepButtons.nth(0).click();
  await expect(page.getByTestId('wizard-email-input')).toBeVisible();
});
```

---

## 📋 Part 2: Persistence & Async Voucher Audits (Labs 5–7)

### Lab 5: LocalStorage Auto-Save Recovery Check
* **Objective**: Verify that form progress is persistent and recovers successfully after page reloads.
* **Selectors**:
  * Email input: `data-testid="wizard-email-input"`
* **Exercises**:
  1. Fill the email field with `"persist@gmail.com"`.
  2. Do NOT click next; reload the page using `page.reload()`.
  3. Assert that the email field contains the recovered string `"persist@gmail.com"`.

```typescript
test('Lab 5: LocalStorage Auto-Save Recovery Check', async ({ page }) => {
  // 1. Input data
  await page.getByTestId('wizard-email-input').fill('persist@gmail.com');

  // 2. Reload page
  await page.reload();

  // 3. Verify text persists
  await expect(page.getByTestId('wizard-email-input')).toHaveValue('persist@gmail.com');
});
```

---

### Lab 6: Reset Progress Action & State Deletions
* **Objective**: Test the clear function to verify it unmounts localized states and resets inputs.
* **Selectors**:
  * Reset progress button: `data-testid="autosave-clear-btn"`
  * Email input: `data-testid="wizard-email-input"`
* **Exercises**:
  1. Fill the email field with `"clean@example.com"`.
  2. Click **Reset Progress**.
  3. Verify that the email input is cleared.
  4. Reload the page and verify the input remains empty.

```typescript
test('Lab 6: Reset Progress Action & State Deletions', async ({ page }) => {
  // 1. Enter email
  await page.getByTestId('wizard-email-input').fill('clean@example.com');

  // 2. Click Reset
  await page.getByTestId('autosave-clear-btn').click();

  // 3. Verify cleared
  await expect(page.getByTestId('wizard-email-input')).toHaveValue('');

  // 4. Verify persist on reload
  await page.reload();
  await expect(page.getByTestId('wizard-email-input')).toHaveValue('');
});
```

---

### Lab 7: Async Voucher Verification Delay
* **Objective**: Automate verifying promo codes with intermediate validation loading delay buffers.
* **Selectors**:
  * Promo code input: `data-testid="wizard-promo-input"`
  * Verify code button: `data-testid="wizard-promo-verify-btn"`
  * Promo status log: `data-testid="wizard-promo-status"`
* **Exercises**:
  1. Navigate to Step 4 (Payment details).
  2. Enter promo code `"DISCOUNT50"`.
  3. Click **Verify Code**.
  4. Assert the status changes to `"Verifying..."` or similar indicator.
  5. Await status updates to show `"Coupon applied successfully! 50% discount validated"`.
  6. Repeat checking invalid code entry `"WRONG50"`, asserting status displays `"Invalid discount coupon code."`.

```typescript
test('Lab 7: Async Voucher Verification Delay', async ({ page }) => {
  // Setup: Navigate to Step 4
  await page.getByTestId('wizard-email-input').fill('promo@gmail.com');
  await page.getByTestId('wizard-next-btn').click();
  await page.getByTestId('wizard-address-input').fill('Voucher Ave');
  await page.getByTestId('wizard-city-input').fill('Voucher City');
  await page.getByTestId('wizard-next-btn').click();

  // Case A: Valid Voucher Code
  await page.getByTestId('wizard-promo-input').fill('DISCOUNT50');
  await page.getByTestId('wizard-promo-verify-btn').click();
  
  // Verify loading state is displayed first
  await expect(page.getByTestId('wizard-promo-status')).toContainText('Verifying');
  // Await success message
  await expect(page.getByTestId('wizard-promo-status')).toContainText('Coupon applied successfully', { timeout: 3000 });

  // Case B: Invalid Voucher Code
  await page.getByTestId('wizard-promo-input').fill('WRONG50');
  await page.getByTestId('wizard-promo-verify-btn').click();
  await expect(page.getByTestId('wizard-promo-status')).toContainText('Invalid discount coupon', { timeout: 3000 });
});
```

---

## 📋 Part 3: Review Redirects & Final Confirms (Labs 8–10)

### Lab 8: Review Screen Redirect Edit Hooks
* **Objective**: Test the "Edit" redirections on the final review card details page to modify elements and verify modifications update the final review payload.
* **Selectors**:
  * Review page Account Edit link: `data-testid="edit-step-account"`
  * Email Input: `data-testid="wizard-email-input"`
  * Review page Email Summary display: `[data-testid="wizard-step-review"]` (containing updated value)
* **Exercises**:
  1. Fill the wizard steps with email `"review@test.com"`, address `"123 Old St"`, and click next until the Review page loads.
  2. Click **Edit** next to the **Account Details** block.
  3. Verify you are redirected back to Step 1, modify the email to `"new_review@test.com"`, and click **Next** (or navigate forward).
  4. Verify the updated email `"new_review@test.com"` is displayed on the Review page.

```typescript
test('Lab 8: Review Screen Redirect Edit Hooks', async ({ page }) => {
  // Navigate to review screen
  await page.getByTestId('wizard-email-input').fill('review@test.com');
  await page.getByTestId('wizard-next-btn').click();
  await page.getByTestId('wizard-address-input').fill('123 Old St');
  await page.getByTestId('wizard-city-input').fill('Old City');
  await page.getByTestId('wizard-next-btn').click();
  await page.getByTestId('wizard-payment-select').selectOption('PayPal');
  await page.getByTestId('wizard-next-btn').click();

  // 1. Click Edit Account Details
  await page.getByTestId('edit-step-account').click();

  // 2. Modify email
  await page.getByTestId('wizard-email-input').fill('new_review@test.com');
  await page.getByTestId('wizard-next-btn').click();
  await page.getByTestId('wizard-next-btn').click(); // skip shipping
  await page.getByTestId('wizard-next-btn').click(); // skip payment

  // 3. Assert change is reflected on Review page
  await expect(page.getByTestId('wizard-step-review')).toContainText('new_review@test.com');
});
```

---

### Lab 9: Roving Backward Edit Gating (Validation Updates)
* **Objective**: Test that when a user goes back to edit an element, validation errors block them from jumping ahead until resolved.
* **Selectors**:
  * Step buttons: `[data-testid="wizard-progress"] button`
  * Next step button: `data-testid="wizard-next-btn"`
  * Error indicator: `data-testid="wizard-email-error"`
* **Exercises**:
  1. Complete Step 1 and Step 2.
  2. Click the Step 1 progress indicator button in the header.
  3. Clear the email input field and try to click Step 2 in the header or the **Next** button.
  4. Assert validation error displays and keeps the user on Step 1.

```typescript
test('Lab 9: Roving Backward Edit Gating', async ({ page }) => {
  // Fill step 1 and step 2
  await page.getByTestId('wizard-email-input').fill('test@user.com');
  await page.getByTestId('wizard-next-btn').click();
  await page.getByTestId('wizard-address-input').fill('Main St');
  await page.getByTestId('wizard-city-input').fill('City');

  // Navigate back to Step 1
  const stepButtons = page.locator('[data-testid="wizard-progress"] button');
  await stepButtons.nth(0).click();

  // Empty the email field (causing validation failure)
  await page.getByTestId('wizard-email-input').clear();
  await page.getByTestId('wizard-next-btn').click();

  // Assert user is stuck on Step 1 due to validation error
  await expect(page.getByTestId('wizard-email-error')).toBeVisible();
  await expect(page.getByTestId('wizard-address-input')).not.toBeVisible();
});
```

---

### Lab 10: Complete Transaction Reset
* **Objective**: Validate successful order processing resets local storage state.
* **Selectors**:
  * Confirm button: `data-testid="wizard-confirm-btn"`
  * Start Over button: `data-testid="wizard-reset-btn"`
  * Success message: `data-testid="wizard-success-msg"`
  * Email input: `data-testid="wizard-email-input"`
* **Exercises**:
  1. Fill and navigate to the Review step.
  2. Click **Confirm Order**.
  3. Assert success screen reads `"Order Confirmed Successfully"`.
  4. Trigger page reload `page.reload()`. Verify that the page stays on the success screen (or resets).
  5. Click **Start Over** (which clears the database values).
  6. Assert the landing Step 1 account email field is empty.

```typescript
test('Lab 10: Complete Transaction Reset', async ({ page }) => {
  // Navigate to review screen
  await page.getByTestId('wizard-email-input').fill('finish@test.com');
  await page.getByTestId('wizard-next-btn').click();
  await page.getByTestId('wizard-address-input').fill('Final St');
  await page.getByTestId('wizard-city-input').fill('Final City');
  await page.getByTestId('wizard-next-btn').click();
  await page.getByTestId('wizard-payment-select').selectOption('PayPal');
  await page.getByTestId('wizard-next-btn').click();

  // 1. Confirm order
  await page.getByTestId('wizard-confirm-btn').click();
  await expect(page.getByTestId('wizard-success-msg')).toHaveText('Order Confirmed Successfully');

  // 2. Click Start Over
  await page.getByTestId('wizard-reset-btn').click();

  // 3. Verify landing reset
  await expect(page.getByTestId('wizard-email-input')).toHaveValue('');
});
```
