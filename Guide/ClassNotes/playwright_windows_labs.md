# Playwright Automation Lab Guide: Multi-Tab & Window Triggers

This lab guide covers 10 advanced multi-tab and window automation exercises designed to build E2E proficiency using the Multi-Tab & Window Triggers playground page. These exercises teach students how to await newly opened pages, track target blank anchors, automate popup sub-windows, handle delayed tab spawners, query concurrent batch tabs, test cross-tab real-time BroadcastChannels, audit auto-close flows, test window opener permissions, handle visibility page focus blurs, chain deeply nested window context swaps, and intercept load-time native dialogs.

---

## 🛠️ Global Setup

```typescript
import { test, expect } from '@playwright/test';

test.describe('Multi-Tab & Window Triggers Automation Lab', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Multi-Tab & Window Triggers page
    await page.goto('/windows');
  });
});
```

---

## 📋 Part 1: Basic Tab & Window Triggers (Labs 1–3)

### Lab 1: Target Blank Anchor Link
* **Objective**: Intercept and assert new page contexts opened via native `target="_blank"` anchors.
* **Selectors**:
  * Anchor link: `data-testid="open-tab-link"`
* **Exercises**:
  1. Set up a listener for the page event using `context.waitForEvent('page')`.
  2. Click the **Open New Tab** anchor.
  3. Wait for the new tab promise to resolve.
  4. Assert that the new tab page title or URL matches `/windows/new-tab`.

```typescript
test('Lab 1: Target Blank Anchor Link', async ({ page, context }) => {
  // 1. Setup page event listener
  const pagePromise = context.waitForEvent('page');

  // 2. Click trigger
  await page.getByTestId('open-tab-link').click();

  // 3. Resolve page promise
  const newPage = await pagePromise;
  await newPage.waitForLoadState();

  // 4. Assert url
  expect(newPage.url()).toContain('/windows/new-tab');
});
```

---

### Lab 2: Programmatic Popup Window
* **Objective**: Intercept popup windows launched dynamically via custom Javascript scripts.
* **Selectors**:
  * Popup trigger button: `data-testid="open-window-btn"`
* **Exercises**:
  1. Set up a listener for the popup event using `page.waitForEvent('popup')`.
  2. Click the **Open Popup Window** button.
  3. Wait for the popup window promise to resolve.
  4. Switch context to the popup page, fill form details inside the popup, and verify its URL matches `/windows/popup`.

```typescript
test('Lab 2: Programmatic Popup Window', async ({ page }) => {
  // 1. Setup popup event listener
  const popupPromise = page.waitForEvent('popup');

  // 2. Click trigger
  await page.getByTestId('open-window-btn').click();

  // 3. Resolve popup promise
  const popup = await popupPromise;
  await popup.waitForLoadState();

  // 4. Assert URL and perform actions inside popup
  expect(popup.url()).toContain('/windows/popup');
  await expect(popup.getByRole('heading')).toContainText('Popup Sub-Form');
});
```

---

### Lab 3: Delayed Tab Spawner
* **Objective**: Await pages that launch after intermediate loading delays.
* **Selectors**:
  * Delayed trigger button: `data-testid="delayed-tab-btn"`
  * Countdown indicator: `data-testid="delayed-tab-countdown"`
* **Exercises**:
  1. Click **Launch Delayed Tab**.
  2. Assert that the countdown loading status becomes visible.
  3. Set up a listener to wait for the new page event (with a custom timeout buffer to account for the 3.0s delay).
  4. Assert the new page opens successfully.

```typescript
test('Lab 3: Delayed Tab Spawner', async ({ page, context }) => {
  // 1. Click launch button
  await page.getByTestId('delayed-tab-btn').click();

  // 2. Setup tab promise (use a timeout of 5000ms to buffer the 3000ms delay)
  const pagePromise = context.waitForEvent('page', { timeout: 5000 });

  // 3. Resolve page context
  const newPage = await pagePromise;
  await newPage.waitForLoadState();

  expect(newPage.url()).toContain('/windows/new-tab');
});
```

---

## 📋 Part 2: Concurrent Tabs & Tab Communications (Labs 4–6)

### Lab 4: Concurrent Batch Tab Auditor
* **Objective**: Intercept and assert multiple pages launched concurrently.
* **Selectors**:
  * Batch trigger button: `data-testid="batch-tabs-btn"`
* **Exercises**:
  1. Click **Spawn Batch (3 Tabs)**.
  2. Catch all 3 newly created page contexts simultaneously.
  3. Assert that all 3 pages load their correct corresponding route IDs (`?id=A`, `?id=B`, and `?id=C`).

```typescript
test('Lab 4: Concurrent Batch Tab Auditor', async ({ page, context }) => {
  // 1. Capture batch pages as they launch
  const [page1, page2, page3] = await Promise.all([
    context.waitForEvent('page'),
    context.waitForEvent('page'),
    context.waitForEvent('page'),
    page.getByTestId('batch-tabs-btn').click()
  ]);

  // Load and read URLs
  const urls = [page1.url(), page2.url(), page3.url()];
  expect(urls.some(u => u.includes('id=A'))).toBe(true);
  expect(urls.some(u => u.includes('id=B'))).toBe(true);
  expect(urls.some(u => u.includes('id=C'))).toBe(true);
});
```

---

### Lab 5: Cross-Tab Message Synchronization
* **Objective**: Assert bi-directional sync across separate pages.
* **Selectors**:
  * Parent input field: `data-testid="parent-sync-input"`
  * Sync trigger button: `data-testid="open-sync-tab-btn"`
  * Child page input field: `data-testid="child-sync-input"` (inside sync-child tab)
* **Exercises**:
  1. Open the Sync tab by clicking **Open Sync Tab**.
  2. Intercept the child page object.
  3. Type `"Broadcasting from Parent"` inside the parent input box.
  4. Assert the child page input updates dynamically showing the same text.
  5. Type `"Broadcasting from Child"` inside the child page input box.
  6. Assert the parent page message badge updates dynamically displaying the child's text.

```typescript
test('Lab 5: Cross-Tab Message Synchronization', async ({ page, context }) => {
  // 1. Open sync child tab
  const childPagePromise = context.waitForEvent('page');
  await page.getByTestId('open-sync-tab-btn').click();
  const childPage = await childPagePromise;
  await childPage.waitForLoadState();

  // 2. Parent -> Child
  await page.getByTestId('parent-sync-input').fill('Broadcasting from Parent');
  await expect(childPage.getByTestId('child-sync-input')).toHaveValue('Broadcasting from Parent');

  // 3. Child -> Parent
  await childPage.getByTestId('child-sync-input').fill('Broadcasting from Child');
  await expect(page.getByTestId('parent-sync-msg')).toHaveText('Broadcasting from Child');
});
```

---

### Lab 6: Auto-Close & Window message callback loops
* **Objective**: Intercept postMessage callbacks and verify elements auto-close successfully.
* **Selectors**:
  * Auto-Close trigger: `data-testid="open-closing-btn"`
  * Confirm trigger inside child: `data-testid="child-confirm-btn"` (inside popup)
  * Parent status badge: `data-testid="closing-success-msg"`
* **Exercises**:
  1. Click **Open Auto-Close Tab**.
  2. Catch the new child tab context.
  3. Click **Confirm & Close** inside the child tab.
  4. Assert the child page unmounts and closes.
  5. Assert the parent success badge displays `"Confirmed Successfully!"`.

```typescript
test('Lab 6: Auto-Close & Window message callbacks', async ({ page, context }) => {
  // 1. Open child page
  const childPromise = context.waitForEvent('page');
  await page.getByTestId('open-closing-btn').click();
  const child = await childPromise;
  await child.waitForLoadState();

  // 2. Perform confirm action inside child (this triggers postMessage & self-closes)
  await child.getByTestId('child-confirm-btn').click();

  // 3. Assert child tab closed
  await expect.poll(() => child.isClosed()).toBe(true);

  // 4. Assert parent confirmation message updates
  await expect(page.getByTestId('closing-success-msg')).toHaveText('Confirmed Successfully!');
});
```

---

## 📋 Part 3: Opener Bounds, Visibility, & Nested Chains (Labs 7–10)

### Lab 7: Opener Context Access Boundary Check
* **Objective**: Test if child pages are blocked or granted access to mutate parent window contexts.
* **Selectors**:
  * Rel opener radio: `input[value="opener"]`
  * Rel noopener radio: `input[value="noopener"]`
  * Trigger button: `data-testid="open-opener-test-btn"`
  * Parent status: `data-testid="parent-manipulate-status"`
* **Exercises**:
  1. Choose the **rel="noopener"** radio option.
  2. Click **Open Opener Test Tab** and catch the child tab.
  3. Click **Manipulate Parent** inside the child tab.
  4. Assert that parent status remains `"Parent Status: Normal"`.
  5. Choose the **rel="opener"** radio option.
  6. Repeat steps and verify the parent status changes to `"Parent Status: Manipulated!"`.

```typescript
test('Lab 7: Opener Context Access Boundary Check', async ({ page, context }) => {
  // Case A: rel="noopener" (Security boundary active)
  await page.locator('input[value="noopener"]').click();
  const childPromiseNo = context.waitForEvent('page');
  await page.getByTestId('open-opener-test-btn').click();
  const childNo = await childPromiseNo;
  await childNo.waitForLoadState();

  await childNo.getByTestId('manipulate-parent-btn').click();
  await expect(page.getByTestId('parent-manipulate-status')).toHaveText('Parent Status: Normal');
  await childNo.close();

  // Case B: rel="opener" (Allowed context override)
  await page.locator('input[value="opener"]').click();
  const childPromiseYes = context.waitForEvent('page');
  await page.getByTestId('open-opener-test-btn').click();
  const childYes = await childPromiseYes;
  await childYes.waitForLoadState();

  await childYes.getByTestId('manipulate-parent-btn').click();
  await expect(page.getByTestId('parent-manipulate-status')).toHaveText('Parent Status: Manipulated!');
  await childYes.close();
});
```

---

### Lab 8: Visibility & Page Focus Shifts
* **Objective**: Monitor focus/blur events and Page Visibility API changes across page switching.
* **Selectors**:
  * Trigger Link: `data-testid="open-visibility-test-btn"`
  * Focus status field inside child: `data-testid="focus-state-display"` (inside visibility-child tab)
* **Exercises**:
  1. Click **Open Visibility Test** and catch the child page.
  2. Focus on the child tab using `child.bringToFront()`. Assert focus status reads `"Active"`.
  3. Shift focus back to the parent tab using `page.bringToFront()`.
  4. Assert that the child tab focus status changes to `"Blurred"`.

```typescript
test('Lab 8: Visibility & Page Focus Shifts', async ({ page, context }) => {
  const childPromise = context.waitForEvent('page');
  await page.getByTestId('open-visibility-test-btn').click();
  const child = await childPromise;
  await child.waitForLoadState();

  // Focus child
  await child.bringToFront();
  await expect(child.getByTestId('focus-state-display')).toHaveText('Focus Status: Active');

  // Blur child by focusing parent
  await page.bringToFront();
  await expect(child.getByTestId('focus-state-display')).toHaveText('Focus Status: Blurred');
});
```

---

### Lab 9: Nested Spawner Window Chains
* **Objective**: Switch context across deeply nested chained tree structures.
* **Selectors**:
  * Trigger Button: `data-testid="open-chain-btn"`
  * Target B Button inside chain-a: `data-testid="open-chain-b-btn"`
  * Trigger complete inside chain-b: `data-testid="complete-chain-btn"`
  * Success message parent: `data-testid="chain-success-msg"`
* **Exercises**:
  1. Click **Open Chain A** and catch the Page A context.
  2. Click **Open Chain B** inside Page A and catch the Page B context.
  3. Click **Complete Chain** inside Page B.
  4. Verify that the parent page success message badge updates and displays `"Chain Completed Successfully!"`.

```typescript
test('Lab 9: Nested Spawner Window Chains', async ({ page, context }) => {
  // 1. Open Chain A tab
  const chainAPromise = context.waitForEvent('page');
  await page.getByTestId('open-chain-btn').click();
  const chainA = await chainAPromise;
  await chainA.waitForLoadState();

  // 2. Open Chain B tab inside Chain A
  const chainBPromise = context.waitForEvent('page');
  await chainA.getByTestId('open-chain-b-btn').click();
  const chainB = await chainBPromise;
  await chainB.waitForLoadState();

  // 3. Complete chain inside Chain B
  await chainB.getByTestId('complete-chain-btn').click();

  // 4. Assert parent confirmation displays success
  await expect(page.getByTestId('chain-success-msg')).toHaveText('Chain Completed Successfully!');
});
```

---

### Lab 10: Intercept Load-Time Native Dialogs
* **Objective**: Setup dialog listeners to catch browser dialogues initialized on initial page loadings.
* **Selectors**:
  * Trigger Link: `data-testid="open-dialog-test-btn"`
* **Exercises**:
  1. Set up a listener for new tab page context creation.
  2. Click the **Open Dialog Tab** link.
  3. Capture the new tab page structure. Register a dialog accept listener using `newPage.on('dialog')` *before* the new page completes loading.
  4. Assert the confirm dialog was handled and page load completes.

```typescript
test('Lab 10: Intercept Load-Time Native Dialogs', async ({ page, context }) => {
  // Capture the tab context creation
  const tabPromise = context.waitForEvent('page');
  await page.getByTestId('open-dialog-test-btn').click();
  const newTab = await tabPromise;

  // Register load-time dialog listener
  newTab.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm');
    await dialog.accept(); // accept confirmation
  });

  await newTab.waitForLoadState();
  await expect(newTab.getByRole('heading')).toContainText('Dialog Load Complete');
});
```
