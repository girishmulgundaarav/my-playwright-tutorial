---
title: E2E POM Framework & Loops Lab
---

# Playwright Automation Lab Guide: E2E POM Framework & Loops

This lab guide is designed to help students master **End-to-End (E2E) testing framework design** and the use of **programming control structures (like `for` and `while` loops)** in automated tests. Students will build a modular Page Object Model (POM) structure, construct custom Playwright fixtures, iterate through dynamic tables using `for` loops, and implement status polling using a `while` loop.

---

## 🔗 Practice Sites & Test URLs

Before starting, navigate to these practice/test websites to try out the code examples:
*   **Playwright Sandbox - Async Challenges:** [https://playwright-sandbox.vercel.app/async](https://playwright-sandbox.vercel.app/async)
*   **Playwright Sandbox - Storage & Auth:** [https://playwright-sandbox.vercel.app/storage](https://playwright-sandbox.vercel.app/storage)
*   **Playwright Sandbox - Tables:** [https://playwright-sandbox.vercel.app/tables](https://playwright-sandbox.vercel.app/tables)
*   **Playwright Sandbox - Form Wizard:** [https://playwright-sandbox.vercel.app/wizard](https://playwright-sandbox.vercel.app/wizard)

---

## 🏗️ Architecture & Framework Setup

In a production-grade test suite, tests should be cleanly separated from direct DOM selectors. To achieve this, we will use the **Page Object Model (POM)** alongside **Custom Fixtures** to automatically instantiate and inject page objects.

Our framework directory structure:
```text
tests/
  fixtures/
    page-fixtures.ts     # Custom fixtures harness
  pages/
    LoginPage.ts         # POM for /storage login
    EmployeeGridPage.ts  # POM for /tables grid
    AsyncStatusPage.ts   # POM for /async status polling
    CheckoutWizardPage.ts# POM for /wizard order flow
  e2e-framework.spec.ts  # Test suite executing E2E cases
```

Below are the Page Object classes and the fixtures file that you will use to build your test suite.

<details>
<summary>📋 Click to reveal Page Objects & Fixtures Code</summary>

### 1. Login Page Object (`pages/LoginPage.ts`)
```typescript
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly welcomeMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByTestId('login-username');
    this.passwordInput = page.getByTestId('login-password');
    this.loginButton = page.getByTestId('login-submit');
    this.welcomeMessage = page.getByTestId('welcome-message');
  }

  async navigate() {
    await this.page.goto('/storage');
  }

  async login(user: string, pass: string) {
    await this.usernameInput.fill(user);
    await this.passwordInput.fill(pass);
    await this.loginButton.click();
  }
}
```

### 2. Employee Grid Page Object (`pages/EmployeeGridPage.ts`)
```typescript
import { Page, Locator } from '@playwright/test';

export class EmployeeGridPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly badge: Locator;
  readonly tableRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByTestId('table-search-input');
    this.badge = page.getByTestId('selected-count-badge');
    this.tableRows = page.locator('tbody tr[data-testid^="employee-row-"]');
  }

  async navigate() {
    await this.page.goto('/tables');
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }
}
```

### 3. Async Status Page Object (`pages/AsyncStatusPage.ts`)
```typescript
import { Page, Locator } from '@playwright/test';

export class AsyncStatusPage {
  readonly page: Page;
  readonly startPollingBtn: Locator;
  readonly statusBadge: Locator;
  readonly resetStateBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.startPollingBtn = page.getByTestId('start-polling-btn');
    this.statusBadge = page.getByTestId('polling-status-badge');
    this.resetStateBtn = page.locator('button:has-text("Reset State")');
  }

  async navigate() {
    await this.page.goto('/async');
  }

  async startJob() {
    await this.startPollingBtn.click();
  }
}
```

### 4. Checkout Wizard Page Object (`pages/CheckoutWizardPage.ts`)
```typescript
import { Page, Locator } from '@playwright/test';

export class CheckoutWizardPage {
  readonly page: Page;
  readonly personalRadio: Locator;
  readonly emailInput: Locator;
  readonly nextBtn: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly paymentSelect: Locator;
  readonly confirmBtn: Locator;
  readonly successMsg: Locator;
  readonly summaryEmail: Locator;

  constructor(page: Page) {
    this.page = page;
    this.personalRadio = page.getByTestId('wizard-type-personal');
    this.emailInput = page.getByTestId('wizard-email-input');
    this.nextBtn = page.getByTestId('wizard-next-btn');
    this.addressInput = page.getByTestId('wizard-address-input');
    this.cityInput = page.getByTestId('wizard-city-input');
    this.paymentSelect = page.getByTestId('wizard-payment-select');
    this.confirmBtn = page.getByTestId('wizard-confirm-btn');
    this.successMsg = page.getByTestId('wizard-success-msg');
    this.summaryEmail = page.getByTestId('summary-email');
  }

  async navigate() {
    await this.page.goto('/wizard');
  }
}
```

### 5. Playwright Custom Fixtures (`fixtures/page-fixtures.ts`)
```typescript
import { test as baseTest } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { EmployeeGridPage } from '../pages/EmployeeGridPage';
import { AsyncStatusPage } from '../pages/AsyncStatusPage';
import { CheckoutWizardPage } from '../pages/CheckoutWizardPage';

// Declare custom page fixture types
type ProjectFixtures = {
  loginPage: LoginPage;
  employeeGridPage: EmployeeGridPage;
  asyncStatusPage: AsyncStatusPage;
  checkoutWizardPage: CheckoutWizardPage;
};

// Extend base test to include pre-instantiated page objects
export const test = baseTest.extend<ProjectFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  employeeGridPage: async ({ page }, use) => {
    await use(new EmployeeGridPage(page));
  },
  asyncStatusPage: async ({ page }, use) => {
    await use(new AsyncStatusPage(page));
  },
  checkoutWizardPage: async ({ page }, use) => {
    await use(new CheckoutWizardPage(page));
  },
});

export { expect } from '@playwright/test';
```
</details>

---

## 📋 Lab 1: Data Gathering & Filtering using `for` loops
* **Goal**: Iterate through dynamic elements on the Employee Directory table using a `for` loop to filter and verify data attributes.

### 🔍 Challenge Context
When searching a data table, verifying count attributes or selecting specific items often requires looping over the active elements in the viewport. In this lab, we will navigate to `/tables`, type `"Engineering"`, and then iterate through the filtered results to check that every matching record indeed belongs to the correct department.

### 📋 Lab Exercises
1. Using the extended custom `test` fixture, inject `employeeGridPage`.
2. Navigate to the `/tables` page.
3. Type `"Engineering"` into the search input.
4. Locate the dynamic table row elements.
5. Count the matching rows.
6. Write a `for` loop to iterate through the rows. For each row:
   - Extract the text of the department column (the 5th column, `td:nth-child(5)`).
   - Assert that the text matches `"Engineering"` (case-insensitive).

<details>
<summary>💡 Click to reveal Solution Reference</summary>

```typescript
import { test, expect } from './fixtures/page-fixtures';

test('Lab 1: Filter & Iterate Rows with for loop', async ({ employeeGridPage }) => {
  // 1. Open the Tables page
  await employeeGridPage.navigate();

  // 2. Search for Engineering department
  await employeeGridPage.search('Engineering');

  // 3. Locate the table rows
  const rows = employeeGridPage.tableRows;
  const rowCount = await rows.count();
  
  // Verify some rows are returned
  expect(rowCount).toBeGreaterThan(0);

  // 4. Iterate using a standard for loop to audit matching columns
  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);
    // Locate the department cell (5th column: ID, Checkbox, Name, Role, Department...)
    const departmentCell = row.locator('td').nth(4); // 0-indexed column selection
    const deptText = await departmentCell.textContent();

    expect(deptText?.trim().toLowerCase()).toBe('engineering');
  }
});
```
</details>

---

## 📋 Lab 2: Long-Running Status Polling using `while` loops
* **Goal**: Automate asynchronous background processing status logs using a `while` loop with max-attempt boundaries.

### 🔍 Challenge Context
Some web operations trigger long-running asynchronous worker queues that gradually transition between multiple states (e.g., `queued` ➔ `processing` ➔ `validating` ➔ `completed`). Standard `expect().toBeVisible()` calls fail if we need to poll a changing text state or verify intermediate transitions. You will implement a polling loop using a `while` loop that periodically checks the status element until it reaches the final expected state, incorporating a retry counter to prevent infinite execution timeouts.

### 📋 Lab Exercises
1. Using the extended custom `test` fixture, inject `asyncStatusPage` and `page`.
2. Navigate to the `/async` page.
3. Click the **Launch Background Job** button.
4. Verify the status indicator says `"Current Status: queued"`.
5. Write a `while` loop to check the status text periodically (every 500ms):
   - Exit the loop immediately if the status text contains `"completed"`.
   - Maintain a counter of maximum polling attempts (e.g., limit to `15` checks).
   - Pause execution briefly inside the loop using `page.waitForTimeout(500)`.
6. After exiting the loop, assert that the status has reached the target `"completed"` state.

<details>
<summary>💡 Click to reveal Solution Reference</summary>

```typescript
import { test, expect } from './fixtures/page-fixtures';

test('Lab 2: Poll Asynchronous Job Status with while loop', async ({ asyncStatusPage, page }) => {
  // 1. Navigate to the Async Challenges page
  await asyncStatusPage.navigate();

  // 2. Start the background status loop polling job
  await asyncStatusPage.startJob();

  // 3. Initial check to confirm it queued successfully
  await expect(asyncStatusPage.statusBadge).toContainText('queued');

  // 4. Poll status updates using a while loop
  let targetStateReached = false;
  let attempts = 0;
  const maxAttempts = 15; // Max 7.5 seconds of total polling time

  while (!targetStateReached && attempts < maxAttempts) {
    const currentStatusText = await asyncStatusPage.statusBadge.textContent();
    
    if (currentStatusText?.toLowerCase().includes('completed')) {
      targetStateReached = true;
      break;
    }

    // Increment attempt counter and wait 500ms
    attempts++;
    await page.waitForTimeout(500);
  }

  // 5. Final assertion to verify job completed successfully
  expect(targetStateReached).toBe(true);
  await expect(asyncStatusPage.statusBadge).toContainText('completed');
});
```
</details>

---

## 📋 Lab 3: Orchestrated E2E Flow using POM Chaining
* **Goal**: Conduct a multi-page end-to-end checkout validation, utilizing Page Objects and structured data validation.

### 🔍 Challenge Context
The final exercise brings all elements together into a realistic E2E flow. We will fill out a multi-step checkout form wizard and verify the order is summary-gated using the `CheckoutWizardPage` Page Object.

### 📋 Lab Exercises
1. Using the extended custom `test` fixture, inject `checkoutWizardPage`.
2. Navigate to `/wizard`.
3. Choose the **Personal Account** radio selection.
4. Enter Email as `"tester@playwright.dev"`. Click **Next**.
5. Populate shipping details: Address = `"100 Test Avenue"`, City = `"New York"`. Click **Next**.
6. Select Payment option `"Credit Card"`. Click **Next**.
7. On the review page, click **Confirm Order**.
8. Assert that the confirmation message contains `"Order Confirmed Successfully"` and the summary email displays `"tester@playwright.dev"`.

<details>
<summary>💡 Click to reveal Solution Reference</summary>

```typescript
import { test, expect } from './fixtures/page-fixtures';

test('Lab 3: Orchestrated Multi-Step checkout order flow', async ({ checkoutWizardPage }) => {
  // 1. Open Wizard
  await checkoutWizardPage.navigate();

  // 2. Step 1: Account Type Selection
  await checkoutWizardPage.personalRadio.check();
  await checkoutWizardPage.emailInput.fill('tester@playwright.dev');
  await checkoutWizardPage.nextBtn.click();

  // 3. Step 2: Shipping Details
  await checkoutWizardPage.addressInput.fill('100 Test Avenue');
  await checkoutWizardPage.cityInput.fill('New York');
  await checkoutWizardPage.nextBtn.click();

  // 4. Step 3: Payment Type
  await checkoutWizardPage.paymentSelect.selectOption('Credit Card');
  await checkoutWizardPage.nextBtn.click();

  // 5. Step 4: Review and Confirm Order
  await checkoutWizardPage.confirmBtn.click();

  // 6. Assertions on Success view
  await expect(checkoutWizardPage.successMsg).toHaveText('Order Confirmed Successfully');
  await expect(checkoutWizardPage.summaryEmail).toHaveText('tester@playwright.dev');
});
```
</details>
