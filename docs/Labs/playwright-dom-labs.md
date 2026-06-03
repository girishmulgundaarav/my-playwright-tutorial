---
title: DOM & Locating Lab
---

# Playwright Automation Lab Guide: DOM & Locating Practice

This lab guide covers 9 essential automation exercises focusing on advanced DOM interactions, locating strategies, browser dialogues, and context switching. These exercises teach students how to intercept native dialogs, pierce open Shadow DOM boundaries, query relative elements, prevent stale element exceptions, handle dynamic element IDs, and switch context inside nested iframes.

---

## 🛠️ Global Setup

```typescript
import { test, expect } from '@playwright/test';

test.describe('DOM & Locating Practice Lab', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the DOM & Locating page
    await page.goto('/dom');
  });
});
```

---

## 📋 Part 1: Native Dialogs & Alerts (Labs 1–3)

Playwright executes dialog events asynchronously. Dialog handlers must be declared *before* the trigger actions are fired.

### Lab 1: Native Alert Handler
* **Objective**: Intercept and dismiss native browser alerts.
* **Selectors**:
  * Alert trigger button: `data-testid="alert-btn"`
* **Exercises**:
  1. Register a dialog listener using `page.on('dialog')`.
  2. Verify the dialog type is `"alert"` and the message matches `"This is a native browser alert modal dialog!"`.
  3. Accept/Dismiss the alert dialog.
  4. Trigger the alert by clicking `data-testid="alert-btn"`.

<details>
<summary>💡 Click to reveal Solution Reference</summary>

```typescript
test('Lab 1: Native Alert Handler', async ({ page }) => {
  // 1. Setup dialogue listener
  page.on('dialog', async (dialog) => {
    expect(dialog.type()).toBe('alert');
    expect(dialog.message()).toContain('native browser alert');
    await dialog.accept(); // dismiss alert
  });

  // 2. Click button to trigger
  await page.getByTestId('alert-btn').click();
});
```
</details>

---

### Lab 2: Native Confirm Handler
* **Objective**: Test branch flows (accept/dismiss) inside confirm dialogs.
* **Selectors**:
  * Confirm trigger button: `data-testid="confirm-btn"`
  * Results text block: `data-testid="confirm-result"`
* **Exercises**:
  1. Setup a confirm dialog listener to accept the dialog.
  2. Click **Trigger Confirm** and verify the result reads `"Result: OK"`.
  3. Setup a confirm dialog listener to dismiss the dialog.
  4. Click **Trigger Confirm** again and verify the result reads `"Result: Cancel"`.

<details>
<summary>💡 Click to reveal Solution Reference</summary>

```typescript
test('Lab 2: Native Confirm Handler', async ({ page }) => {
  // Case A: User clicks OK (Accept)
  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm');
    await dialog.accept();
  });
  await page.getByTestId('confirm-btn').click();
  await expect(page.getByTestId('confirm-result')).toHaveText('Result: OK');

  // Case B: User clicks Cancel (Dismiss)
  page.once('dialog', async (dialog) => {
    await dialog.dismiss();
  });
  await page.getByTestId('confirm-btn').click();
  await expect(page.getByTestId('confirm-result')).toHaveText('Result: Cancel');
});
```
</details>

---

### Lab 3: Native Prompt Handler
* **Objective**: Input text variables directly into native prompt inputs.
* **Selectors**:
  * Prompt trigger button: `data-testid="prompt-btn"`
  * Prompt result badge: `data-testid="prompt-result"`
* **Exercises**:
  1. Setup a prompt dialog listener to enter `"QA-KEY-9988"` as response input.
  2. Click **Trigger Prompt**.
  3. Assert that the page result output reads `"Val: QA-KEY-9988"`.

<details>
<summary>💡 Click to reveal Solution Reference</summary>

```typescript
test('Lab 3: Native Prompt Handler', async ({ page }) => {
  // Setup prompt handler with answer
  page.on('dialog', async (dialog) => {
    expect(dialog.type()).toBe('prompt');
    await dialog.accept('QA-KEY-9988');
  });

  await page.getByTestId('prompt-btn').click();
  await expect(page.getByTestId('prompt-result')).toHaveText('Val: QA-KEY-9988');
});
```
</details>

---

## 📋 Part 2: Advanced Locating & DOM Structures (Labs 4–7)

### Lab 4: Shadow DOM Boundary Piercing
* **Objective**: Locate elements nested inside custom Web Component shadow roots.
* **Selectors**:
  * Secret message text: `data-testid="shadow-secret"`
* **Exercises**:
  1. Locate the text inside the pink dashed container.
  2. Confirm Playwright's locator engine pierces through open Shadow DOM scopes automatically.
  3. Assert the text content equals `"Playwright Pierced The Shadow DOM!"`.

<details>
<summary>💡 Click to reveal Solution Reference</summary>

```typescript
test('Lab 4: Shadow DOM Boundary Piercing', async ({ page }) => {
  // Playwright's CSS selector engine automatically pierces shadow roots
  const secret = page.getByTestId('shadow-secret');
  await expect(secret).toBeVisible();
  await expect(secret).toHaveText('Playwright Pierced The Shadow DOM!');
});
```
</details>

---

### Lab 5: Sibling Relative Locating
* **Objective**: Locate elements relative to nearby sibling tags in card groups.
* **Selectors**:
  * Target card name: `"Professional Plan"`
  * Sibling button: Select Plan button
* **Exercises**:
  1. Locate the card container containing the text `"Professional Plan"`.
  2. Click the **Select Plan** button inside that specific card.
  3. Assert the card border changes state (showing the card is selected).

<details>
<summary>💡 Click to reveal Solution Reference</summary>

```typescript
test('Lab 5: Sibling Relative Locating', async ({ page }) => {
  // Use locator chaining to restrict selector scope to the specific plan card
  const professionalCard = page.locator('div', { hasText: 'Professional Plan' }).filter({
    has: page.locator('button', { name: 'Select Plan' })
  });

  await professionalCard.getByRole('button', { name: 'Select Plan' }).click();

  // Verify selection is applied (border changes card background)
  const targetCard = page.getByTestId('plan-card-professional-plan');
  await expect(targetCard).toHaveClass(/bg-emerald-50/);
});
```
</details>

---

### Lab 6: Stale Element Handling
* **Objective**: Verify that Playwright avoids stale element reference exceptions when DOM nodes unmount and remount.
* **Selectors**:
  * Trigger button: `data-testid="stale-trigger-btn"`
  * Valid hits badge: `data-testid="stale-click-counter"`
* **Exercises**:
  1. Locate the trigger button `data-testid="stale-trigger-btn"`.
  2. Click the button once. Note that the node unmounts and is replaced by a fresh node in the DOM.
  3. Click the button a second time.
  4. Assert the click counter displays `2` without hitting stale exceptions.

<details>
<summary>💡 Click to reveal Solution Reference</summary>

```typescript
test('Lab 6: Stale Element Handling', async ({ page }) => {
  const trigger = page.getByTestId('stale-trigger-btn');
  const counter = page.getByTestId('stale-click-counter');

  // Click 1 (this unmounts the element and mounts a new one after 300ms)
  await trigger.click();
  
  // Click 2 (Playwright automatically resolves the fresh element state)
  await trigger.click();

  await expect(counter).toHaveText('2');
});
```
</details>

---

### Lab 7: Bypassing Dynamic ID Attributes
* **Objective**: Match elements that change dynamic IDs (e.g. `btn-a5f1e`) on every click.
* **Selectors**:
  * Target button: `data-testid="dynamic-id-btn"` (or check button text `"Validate Identity"`)
  * Validation badge: `data-testid="identity-validation-badge"`
* **Exercises**:
  1. Locate the button by its test ID or stable text role rather than relying on its dynamic `id` attribute.
  2. Click the button three times.
  3. Verify the validation badge reports success.

<details>
<summary>💡 Click to reveal Solution Reference</summary>

```typescript
test('Lab 7: Bypassing Dynamic ID Attributes', async ({ page }) => {
  // Avoid using page.locator('#btn-xxxxx') which changes on every click!
  const validateBtn = page.getByRole('button', { name: 'Validate Identity' });

  await validateBtn.click();
  await validateBtn.click();
  await validateBtn.click();

  await expect(page.getByTestId('identity-validation-badge')).toContainText('Success (3 clicks)');
});
```
</details>

---

## 📋 Part 3: Frame Context Switching (Labs 8–9)

### Lab 8: Single Frame Context Interaction
* **Objective**: Access and fill input fields inside standard embedded frames.
* **Selectors**:
  * Embedded iframe: `data-testid="embedded-iframe"`
  * Inner form inputs: `data-testid="iframe-input"`, `data-testid="iframe-submit-btn"`
  * Success message: `data-testid="iframe-success-msg"`
* **Exercises**:
  1. Switch context to the single iframe using the `frameLocator` API.
  2. Type `"Playwright Testing"` into the input box.
  3. Click **Submit to Parent**.
  4. Verify the success message displays inside the iframe.

<details>
<summary>💡 Click to reveal Solution Reference</summary>

```typescript
test('Lab 8: Single Frame Context Interaction', async ({ page }) => {
  // Retrieve frame locator
  const myFrame = page.frameLocator('[data-testid="embedded-iframe"]');

  // Perform actions on elements inside the frame context
  const input = myFrame.getByTestId('iframe-input');
  const submitBtn = myFrame.getByTestId('iframe-submit-btn');

  await input.fill('Playwright Testing');
  await submitBtn.click();

  // Validate success inside frame
  await expect(myFrame.getByTestId('iframe-success-msg')).toBeVisible();
});
```
</details>

---

### Lab 9: Deeply Nested Frames context switching
* **Objective**: Traverse chained frames recursively to perform interactions.
* **Selectors**:
  * Level 1 Parent iframe: `data-testid="nested-parent-iframe"`
  * Level 2 Child iframe: `data-testid="nested-child-iframe"`
  * Input inside Child: `data-testid="nested-child-input"`
  * Submit button inside Child: `data-testid="nested-child-btn"`
* **Exercises**:
  1. Access the child frame by chaining frame locators:
     `frameLocator(Parent) -> frameLocator(Child)`.
  2. Type `"Nested QA Code"` into the child iframe input.
  3. Click **Submit in Child**.
  4. Verify the success badge `data-testid="nested-child-success"` appears inside the Level 2 frame.

<details>
<summary>💡 Click to reveal Solution Reference</summary>

```typescript
test('Lab 9: Deeply Nested Frames context switching', async ({ page }) => {
  // Chain parent and child frame locators recursively
  const childFrame = page
    .frameLocator('[data-testid="nested-parent-iframe"]')
    .frameLocator('[data-testid="nested-child-iframe"]');

  const input = childFrame.getByTestId('nested-child-input');
  const submitBtn = childFrame.getByTestId('nested-child-btn');

  await input.fill('Nested QA Code');
  await submitBtn.click();

  // Assert success card displays inside the inner child frame
  await expect(childFrame.getByTestId('nested-child-success')).toBeVisible();
});
```
</details>
