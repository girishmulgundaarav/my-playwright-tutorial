# Playwright Automation Lab Guide: Storage & Authentication

This lab guide covers 8 distinct E2E automation exercises targeting browser cookies, storage variables, and authentication states on the Storage & Authentication playground page. These exercises teach students how to verify login status, save and reload global storage states, test Role-Based Access Controls (RBAC), intercept authorization headers, audit session expiries, interact with browser-level databases (IndexedDB), verify partial session teardown behaviors, and test storage limit boundary errors.

---

## 🛠️ Global Setup

```typescript
import { test, expect } from '@playwright/test';

test.describe('Storage & Authentication Automation Lab', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Storage & Authentication page
    await page.goto('/storage');
  });
});
```

---

## 📋 Part 1: Authentication & Session Reuse (Labs 1–3)

### Lab 1: Basic Authentication Verification
* **Objective**: Perform a UI login and assert that matching values are saved to browser storage.
* **Selectors**:
  * Input username: `data-testid="login-username"`
  * Input password: `data-testid="login-password"`
  * Submit button: `data-testid="login-submit"`
  * Welcome header message: `data-testid="welcome-message"`
* **Exercises**:
  1. Fill username with `"admin"` and password with `"admin"`.
  2. Click **Log In**.
  3. Assert that the welcome text displays `"Welcome, Admin!"`.
  4. Assert the following storage items are set:
     * `localStorage.getItem('auth_token')` is not null.
     * `sessionStorage.getItem('session_id')` equals `"mock-session-id-456"`.
     * `document.cookie` contains `"logged_in=true"`.

```typescript
test('Lab 1: Basic Authentication Verification', async ({ page }) => {
  // 1. Perform Login
  await page.getByTestId('login-username').fill('admin');
  await page.getByTestId('login-password').fill('admin');
  await page.getByTestId('login-submit').click();

  // 2. Assert UI state changes
  await expect(page.getByTestId('welcome-message')).toHaveText('Welcome, Admin!');

  // 3. Verify LocalStorage, SessionStorage, and Cookies using evaluate
  const storageState = await page.evaluate(() => {
    return {
      token: localStorage.getItem('auth_token'),
      sessionId: sessionStorage.getItem('session_id'),
      cookies: document.cookie,
    };
  });

  expect(storageState.token).not.toBeNull();
  expect(storageState.sessionId).toBe('mock-session-id-456');
  expect(storageState.cookies).toContain('logged_in=true');
});
```

---

### Lab 2: Session Recovery & State Injection
* **Objective**: Bypass login pages entirely by pre-injecting authentication states directly into the browser context.
* **Exercises**:
  1. Setup a test script that sets the required local token, role parameter, session ID, and cookies during initialization *before* navigating to the page.
  2. Navigate to `/storage`.
  3. Assert that the user is logged in automatically as `"Editor"`.

```typescript
test('Lab 2: Session Recovery & State Injection', async ({ page, context }) => {
  // 1. Inject Cookies
  await context.addCookies([
    {
      name: 'logged_in',
      value: 'true',
      domain: 'localhost', // adapt domain accordingly for test environment
      path: '/',
    }
  ]);

  // 2. Navigate to page, then write storage variables before react mounts
  await page.goto('/storage');
  
  await page.evaluate(() => {
    localStorage.setItem('auth_token', 'mock-injected-jwt-token.payload.signature');
    localStorage.setItem('auth_role', 'editor');
    sessionStorage.setItem('session_id', 'mock-session-id-456');
  });

  // Reload page to read newly set storage tokens
  await page.reload();

  // 3. Verify bypassed welcome message
  await expect(page.getByTestId('welcome-message')).toHaveText('Welcome, Editor!');
});
```

---

### Lab 3: Role-Based Access Controls (RBAC) UI Validation
* **Objective**: Assert that UI actions are enabled or disabled depending on the current user role.
* **Selectors**:
  * View Button: `data-testid="rbac-action-view"`
  * Edit Button: `data-testid="rbac-action-edit"`
  * Delete Button: `data-testid="rbac-action-delete"`
* **Exercises**:
  1. Log in as `"viewer"`.
  2. Assert that the **View** action is enabled.
  3. Assert that the **Edit** and **Delete** actions are disabled.
  4. Log out. Log in as `"admin"`.
  5. Assert that all actions (**View**, **Edit**, and **Delete**) are enabled.

```typescript
test('Lab 3: Role-Based Access Controls', async ({ page }) => {
  // Case A: Viewer limitations
  await page.getByTestId('login-username').fill('viewer');
  await page.getByTestId('login-password').fill('viewer');
  await page.getByTestId('login-submit').click();

  await expect(page.getByTestId('rbac-action-view')).toBeEnabled();
  await expect(page.getByTestId('rbac-action-edit')).toBeDisabled();
  await expect(page.getByTestId('rbac-action-delete')).toBeDisabled();

  // Logout
  await page.getByTestId('logout-btn').click();

  // Case B: Admin privileges
  await page.getByTestId('login-username').fill('admin');
  await page.getByTestId('login-password').fill('admin');
  await page.getByTestId('login-submit').click();

  await expect(page.getByTestId('rbac-action-view')).toBeEnabled();
  await expect(page.getByTestId('rbac-action-edit')).toBeEnabled();
  await expect(page.getByTestId('rbac-action-delete')).toBeEnabled();
});
```

---

## 📋 Part 2: API Interception & Timeouts (Labs 4–5)

### Lab 4: Intercepting Authorization Headers & JWT
* **Objective**: Intercept outbound API queries, verify token strings, and validate JWT claims.
* **Selectors**:
  * Fetch Button: `data-testid="bearer-fetch-btn"`
  * Decoded Roles display: `data-testid="jwt-decoded-roles"`
* **Exercises**:
  1. Log in as `"admin"`.
  2. Set up a route interception listener for requests matching `**/api/user-profile`.
  3. Click **Fetch Private Profile**.
  4. Verify that the request headers contain the header `Authorization: Bearer <token>`.
  5. Extract the JWT payload, decode it, and assert that the roles claims list contains `"admin"`.

```typescript
test('Lab 4: Intercepting Authorization Headers', async ({ page }) => {
  // Perform Login
  await page.getByTestId('login-username').fill('admin');
  await page.getByTestId('login-password').fill('admin');
  await page.getByTestId('login-submit').click();

  // Setup interception
  const requestPromise = page.waitForRequest(request => 
    request.url().includes('/api/user-profile') && request.method() === 'GET'
  );

  // Click Fetch
  await page.getByTestId('bearer-fetch-btn').click();

  const request = await requestPromise;
  const headers = request.headers();

  // Verify Bearer Header exists
  expect(headers['authorization']).toContain('Bearer ');

  // Assert Decoded visual claims display in UI
  await expect(page.getByTestId('jwt-decoded-roles')).toContainText('admin');
});
```

---

### Lab 5: Expiration Countdowns & Redirection
* **Objective**: Verify that custom session limits sign users out automatically.
* **Selectors**:
  * Expiry Selector: `data-testid="login-expiry-select"`
  * Count down indicator: `data-testid="expiry-countdown"`
  * Form username field: `data-testid="login-username"`
* **Exercises**:
  1. Fill login credentials.
  2. Change Session Expiry selection to `"10 Seconds"`.
  3. Click **Log In**.
  4. Assert the countdown timer element displays.
  5. Wait for 10 seconds and verify that the application automatically signs out the user, redirecting back to the login page view.

```typescript
test('Lab 5: Expiration Countdowns & Redirection', async ({ page }) => {
  await page.getByTestId('login-username').fill('admin');
  await page.getByTestId('login-password').fill('admin');
  
  // Set expiry duration to 10 seconds
  await page.getByTestId('login-expiry-select').selectOption('10');
  await page.getByTestId('login-submit').click();

  // Verify countdown appears
  const countdown = page.getByTestId('expiry-countdown');
  await expect(countdown).toBeVisible();

  // Assert redirection back to Login state (waiting for Username field to show up again)
  await expect(page.getByTestId('login-username')).toBeVisible({ timeout: 12000 });
});
```

---

## 📋 Part 3: IndexedDB & Advanced Storage (Labs 6–8)

### Lab 6: IndexedDB Bookmark Manager
* **Objective**: Perform insertions, updates, and deletion actions inside browser-level databases (IndexedDB).
* **Selectors**:
  * Title field: `data-testid="idx-title-input"`
  * URL field: `data-testid="idx-url-input"`
  * Add Button: `data-testid="idx-add-btn"`
  * Bookmark list container: `data-testid="idx-bookmark-list"`
* **Exercises**:
  1. Log in.
  2. Fill Title with `"Playwright Documentation"`, and URL with `"https://playwright.dev"`.
  3. Click **Add Bookmark**.
  4. Assert that the item is appended to the list display.
  5. Click **Delete** on the newly created bookmark item.
  6. Assert the list is empty.

```typescript
test('Lab 6: IndexedDB Bookmark Manager', async ({ page }) => {
  // Login
  await page.getByTestId('login-username').fill('admin');
  await page.getByTestId('login-password').fill('admin');
  await page.getByTestId('login-submit').click();

  // Add DB Entry
  await page.getByTestId('idx-title-input').fill('Playwright Documentation');
  await page.getByTestId('idx-url-input').fill('https://playwright.dev');
  await page.getByTestId('idx-add-btn').click();

  // Verify persistent list render
  const list = page.getByTestId('idx-bookmark-list');
  await expect(list).toContainText('Playwright Documentation');

  // Delete DB Entry
  await page.locator('button:has-text("Delete")').first().click();
  await expect(list).not.toContainText('Playwright Documentation');
});
```

---

### Lab 7: Independent Storage Cleaners
* **Objective**: Validate how applications recover from partial session clearance.
* **Selectors**:
  * Clear Local Storage button: `data-testid="clear-local-btn"`
  * Welcome header: `data-testid="welcome-message"`
* **Exercises**:
  1. Log in.
  2. Click **Clear LocalStorage token**.
  3. Assert that the user is logged out automatically (since the localStorage token is missing).

```typescript
test('Lab 7: Independent Storage Cleaners', async ({ page }) => {
  // Login
  await page.getByTestId('login-username').fill('admin');
  await page.getByTestId('login-password').fill('admin');
  await page.getByTestId('login-submit').click();

  // Verify welcome state
  await expect(page.getByTestId('welcome-message')).toBeVisible();

  // Clear local storage token
  await page.getByTestId('clear-local-btn').click();

  // Assert user gets signed out automatically (Username input returns)
  await expect(page.getByTestId('login-username')).toBeVisible();
});
```

---

### Lab 8: Quota Limit Exceeded Boundaries
* **Objective**: Check application behavior when LocalStorage limits are exhausted.
* **Selectors**:
  * Exhaust Quota button: `data-testid="fill-quota-btn"`
  * Quota warning overlay: `data-testid="quota-error-alert"`
* **Exercises**:
  1. Log in.
  2. Click **Exhaust Quota (5MB)**.
  3. Verify that the quota error warning card (`data-testid="quota-error-alert"`) displays containing `"QuotaExceededError"`.

```typescript
test('Lab 8: Quota Limit Exceeded Boundaries', async ({ page }) => {
  // Login
  await page.getByTestId('login-username').fill('admin');
  await page.getByTestId('login-password').fill('admin');
  await page.getByTestId('login-submit').click();

  // Exhaust storage capacity
  await page.getByTestId('fill-quota-btn').click();

  // Verify warning box displays
  const errorAlert = page.getByTestId('quota-error-alert');
  await expect(errorAlert).toBeVisible();
  await expect(errorAlert).toContainText('QuotaExceededError');
});
```
