# Playwright Automation Lab Guide: Async Challenges

This lab guide covers 7 advanced automation exercises corresponding to the different testing zones on the Async Challenges playground page. These exercises help students master asynchronous automation patterns, including dealing with API lags, progress bar auditing, random delay resolving, status polling loops, race condition autocomplete, self-dismissing alerts, and test retry loops.

---

## 🛠️ Global Setup

```typescript
import { test, expect } from '@playwright/test';

test.describe('Async Challenges Automation Lab', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Async Challenges page
    await page.goto('/async');
  });
});
```

---

## 📋 Zone 1: Delayed API Simulation (Lab 1)

### Lab 1: Fixed Delay API Resolving
* **Objective**: Automate buttons that render data after a fixed delay, verifying intermediate loading states.
* **Selectors**:
  * Fetch button: `data-testid="fetch-data-btn"`
  * Loading spinner: `data-testid="loading-spinner"`
  * Success text box: `data-testid="loaded-text-box"`
* **Exercises**:
  1. Click the **Fetch Data** button.
  2. Immediately assert that the loading spinner (`data-testid="loading-spinner"`) is visible.
  3. Wait for the spinner to disappear.
  4. Assert that the text box with `"Data Loaded Successfully"` is visible and has the correct value.

```typescript
test('Lab 1: Fixed Delay API Resolving', async ({ page }) => {
  const fetchBtn = page.getByTestId('fetch-data-btn');
  const spinner = page.getByTestId('loading-spinner');
  const textBox = page.getByTestId('loaded-text-box');

  // Trigger API
  await fetchBtn.click();

  // Assert intermediate loading state
  await expect(spinner).toBeVisible();

  // Wait for load completion and verify data
  await expect(spinner).toBeHidden({ timeout: 4000 });
  await expect(textBox).toBeVisible();
  await expect(textBox).toHaveValue('Data Loaded Successfully');
});
```

---

## 📋 Zone 2: Real-time Progress Bar (Lab 2)

### Lab 2: Progress Completion Audit
* **Objective**: Monitor progress percentage changes and wait for a final success condition.
* **Selectors**:
  * Start button: `data-testid="start-progress-btn"`
  * Progress text indicator: `data-testid="progress-text"`
  * Completion badge: `data-testid="download-complete-badge"`
* **Exercises**:
  1. Click **Start Download**.
  2. Verify that the progress indicator begins updating (value increases from `0%`).
  3. Wait for the success badge `"Download Complete"` to become visible.
  4. Assert the progress text indicator displays `"100%"`.

```typescript
test('Lab 2: Progress Completion Audit', async ({ page }) => {
  const startBtn = page.getByTestId('start-progress-btn');
  const progressText = page.getByTestId('progress-text');
  const successBadge = page.getByTestId('download-complete-badge');

  // Start progress bar
  await startBtn.click();

  // Wait for download completion (duration is 5s, we give a buffer of 6s)
  await expect(successBadge).toBeVisible({ timeout: 6000 });
  await expect(progressText).toHaveText('100%');
});
```

---

## 📋 Zone 3: Variable Delay Card (Lab 3)

### Lab 3: Random Delay Waiter
* **Objective**: Target elements that appear after variable durations without using hardcoded sleeps (`page.waitForTimeout`).
* **Selectors**:
  * Trigger button: `data-testid="random-delay-btn"`
  * Random success card: `data-testid="random-success-card"`
* **Exercises**:
  1. Click **Trigger Random Delay**.
  2. Wait for the green success card (`data-testid="random-success-card"`) to resolve and show in the DOM.
  3. Assert that the success card contains the resolving text `"Action Resolved"`.

```typescript
test('Lab 3: Random Delay Waiter', async ({ page }) => {
  const triggerBtn = page.getByTestId('random-delay-btn');
  const successCard = page.getByTestId('random-success-card');

  // Start action
  await triggerBtn.click();

  // Wait dynamically for completion. Delay ranges from 1.5s to 5.0s, so we use a 6.0s timeout.
  // Playwright's locator assertions wait automatically!
  await expect(successCard).toBeVisible({ timeout: 6000 });
  await expect(successCard).toContainText('Action Resolved');
});
```

---

## 📋 Zone 4: Status Polling Simulator (Lab 4)

### Lab 4: Background Status Loop Polling
* **Objective**: Check and wait through intermediate state stages until a job completes.
* **Selectors**:
  * Launch button: `data-testid="start-polling-btn"`
  * Status badge: `data-testid="polling-status-badge"`
* **Exercises**:
  1. Click **Launch Background Job**.
  2. Poll the status badge text periodically. Verify it transitions through:
     `queued` $\rightarrow$ `processing` $\rightarrow$ `validating` $\rightarrow$ `completed`.
  3. Assert the final badge state becomes `"Current Status: completed"`.

```typescript
test('Lab 4: Background Status Loop Polling', async ({ page }) => {
  const launchBtn = page.getByTestId('start-polling-btn');
  const statusBadge = page.getByTestId('polling-status-badge');

  // Launch job
  await launchBtn.click();

  // Validate polling states sequentially
  await expect(statusBadge).toHaveText('Current Status: queued');
  await expect(statusBadge).toHaveText('Current Status: processing', { timeout: 2000 });
  await expect(statusBadge).toHaveText('Current Status: validating', { timeout: 2000 });
  await expect(statusBadge).toHaveText('Current Status: completed', { timeout: 2000 });
});
```

---

## 📋 Zone 5: Race Condition Autocomplete (Lab 5)

### Lab 5: Race Condition Handler
* **Objective**: Understand input debounce delays and verify out-of-order suggestions.
* **Selectors**:
  * Search input: `data-testid="race-search-input"`
  * Suggestions container: `data-testid="suggestions-list"`
  * Bug toggle: `data-testid="race-bug-switch"`
* **Exercises**:
  1. Set the race condition bug toggle switch to "disabled" (unselected / grey state).
  2. Type a short text `"play"` and then quickly replace it with `"react"`.
  3. Wait for the suggestions list container to resolve.
  4. Assert the matching suggestion list contains React-related text and NOT Playwright-related text.

```typescript
test('Lab 5: Race Condition Autocomplete', async ({ page }) => {
  const input = page.getByTestId('race-search-input');
  const bugSwitch = page.getByTestId('race-bug-switch');

  // Assert the race condition bug switch is turned OFF (gray state)
  const isBugEnabled = await bugSwitch.evaluate(el => el.classList.contains('bg-red-500'));
  if (isBugEnabled) {
    await bugSwitch.click(); // toggle off
  }

  // Type quickly to trigger potential out-of-order response resolving
  await input.fill('play');
  await input.fill('react');

  // Wait for suggestions list
  const list = page.getByTestId('suggestions-list');
  await expect(list).toBeVisible();

  // Verify that only the final query's suggestions display (No Playwright suggestions present)
  await expect(list).toContainText('react abort');
  await expect(list).not.toContainText('playwright');
});
```

---

## 📋 Zone 6: Transient Alert Banner (Lab 6)

### Lab 6: Transient Toast Banner Auditor
* **Objective**: Intercept and assert on alert elements that auto-dismiss and unmount from the DOM.
* **Selectors**:
  * Show Alert button: `data-testid="show-toast-btn"`
  * Alert banner: `data-testid="toast-banner"`
* **Exercises**:
  1. Click the **Show Alert Banner** button.
  2. Assert the alert banner (`data-testid="toast-banner"`) is immediately visible.
  3. Wait for exactly 2.0 seconds and verify that the banner is successfully removed from the DOM.

```typescript
test('Lab 6: Transient Toast Banner Auditor', async ({ page }) => {
  const showBtn = page.getByTestId('show-toast-btn');
  const banner = page.getByTestId('toast-banner');

  // Trigger alert banner
  await showBtn.click();
  await expect(banner).toBeVisible();

  // Wait for auto-dismiss unmounting (duration is 2s)
  await expect(banner).toBeHidden({ timeout: 3000 });
});
```

---

## 📋 Zone 7: Retry-on-Failure Request Flow (Lab 7)

### Lab 7: Programmatic Request Retry Loop
* **Objective**: Automate request retry loops when dealing with flaky operations that fail initially.
* **Selectors**:
  * Execute button: `data-testid="retry-request-btn"`
  * Success alert card: `data-testid="retry-success-alert"`
  * Error alert card: `data-testid="retry-error-alert"`
* **Exercises**:
  1. Click **Execute Request**.
  2. Verify that connection failure alert is returned (Attempts counter displays `1`).
  3. Click **Retry Request**.
  4. Verify that connection failure alert is returned again (Attempts counter displays `2`).
  5. Click **Retry Request** a third time.
  6. Assert the success banner displays containing `"Access Granted"` and `"Mock Token"`.

```typescript
test('Lab 7: Programmatic Request Retry Loop', async ({ page }) => {
  const actionBtn = page.getByTestId('retry-request-btn');
  const errorAlert = page.getByTestId('retry-error-alert');
  const successAlert = page.getByTestId('retry-success-alert');

  // Attempt 1: Click and verify failure
  await actionBtn.click();
  await expect(errorAlert).toBeVisible();
  await expect(errorAlert).toContainText('Connection Failed (Attempt 1)');

  // Attempt 2: Click and verify failure
  await actionBtn.click();
  await expect(errorAlert).toBeVisible();
  await expect(errorAlert).toContainText('Connection Failed (Attempt 2)');

  // Attempt 3: Click and verify success
  await actionBtn.click();
  await expect(successAlert).toBeVisible();
  await expect(successAlert).toContainText('Access Granted (Attempt 3)');
  await expect(successAlert).toContainText('authtoken_d3f4a9b2c8e102');
});
```
