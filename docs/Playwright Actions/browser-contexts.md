---
title: Browser Contexts, Tabs & Popups
sidebar_position: 8
---

# Browser Contexts, Tabs & Popups

To build scalable, parallelized tests, you must understand Playwright's hierarchy of **Browser**, **BrowserContext**, and **Page** objects, as well as how to handle multi-tab flows, popup windows, and HTTP authentication.

---

## 1. Playwright Hierarchy: Browser ➔ Context ➔ Page

Playwright isolates test sessions using an architecture that mirrors modern browser profiles:

![Playwright Browser Context and Page Session Hierarchy](/img/playwright_session_hierarchy.png)

### 1.1 Browser
*   Represents an actual physical browser process (e.g., Chromium, Firefox, WebKit) running headed or headless.
*   **Heavyweight:** Launching a browser process is resource-intensive. Ideally, you launch one browser process per test run.

### 1.2 BrowserContext (Incognito Session)
*   An isolated user session (like an Incognito or Private profile).
*   **Lightweight:** You can create thousands of contexts quickly.
*   **Isolation:** Each context has its own cookies, cache, local storage, and credentials, ensuring no state leaks between tests. This allows for multi-user test scenarios (e.g., testing a chat app with User A and User B concurrently).

### 1.3 Page
*   Represents a single tab or popup window within a specific BrowserContext.
*   Most interaction methods (`click`, `fill`, `goto`) are invoked on the `Page` object.

---

## 2. Automating Tabs & Popup Windows

When a user action (like clicking a link or button) opens a new tab or popup window, Playwright fires an asynchronous event.

### ⚠️ The Concurrency Race Condition
A common automation mistake is to trigger a click and *then* wait for the popup:

```javascript
// 🚫 BAD PRACTICE: Causes tests to hang!
await page.click('#PopUpBtn');
const popup = await page.waitForEvent('popup');
```

If the popup loads instantly, the event fires *before* the listener is registered, causing the test to wait indefinitely.

### ⚡ The Solution: `Promise.all()`
To avoid race conditions, you must register the event listener and trigger the click **concurrently** using `Promise.all`:

```javascript
//  GOOD PRACTICE: Safe and synchronous
const [popup] = await Promise.all([
  page.waitForEvent('popup'),
  page.click('#PopUpBtn')
]);
```

---

## 3. Real-World Labs & Code Examples

### 3.1 Scenario A: Handling New Tabs (`context.waitForEvent('page')`)
Use `context.waitForEvent('page')` when clicking an anchor link opens a new tab in the browser context.

```javascript
import { test, expect, chromium } from '@playwright/test';

test('Handle Multiple Tabs (OrangeHRM)', async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const parentPage = await context.newPage();

  await parentPage.goto("https://opensource-demo.orangehrmlive.com/web/index.php/auth/login");

  // Click link that opens OrangeHRM's corporate site in a new tab
  const [childPage] = await Promise.all([
    context.waitForEvent('page'),
    parentPage.locator("a:has-text('OrangeHRM, Inc')").click()
  ]);

  // Assert both pages are accessible and return correct titles
  expect(await parentPage.title()).toBe('OrangeHRM');
  expect(await childPage.title()).toContain('Human Resources Management');

  await parentPage.close();
  await childPage.close();
});
```

### 3.2 Scenario B: Handling Multiple Popup Windows (`page.waitForEvent('popup')`)
Use `page.waitForEvent('popup')` when clicking triggers child window popups. You can query `context.pages()` to get an array of all active pages.

```javascript
test('Handle Multiple Popup Windows', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("https://testautomationpractice.blogspot.com/");

  // Click button triggering multiple popups
  await Promise.all([
    page.waitForEvent('popup'),
    page.locator("#PopUp").click()
  ]);

  const allPages = context.pages();
  console.log(`Total active windows: ${allPages.length}`);

  // Loop through active windows to find specific pages
  for (const win of allPages) {
    const title = await win.title();
    console.log(`Window Title: ${title}`);

    if (title.includes('Playwright')) {
      await win.locator('.getStarted_Sjon').click(); // Perform actions inside popup
      await win.close(); // Close only the Playwright popup
    }
  }
});
```

---

## 4. Handling HTTP Basic Authentication

HTTP Basic Authentication prompts users for a username and password before serving content. Playwright handles this popup prompt without UI clicks using two strategies:

### Approach A: URL Credentials Insertion
You can embed credentials directly inside the URL string: `https://username:password@domain.com`.

```javascript
test('Basic Auth via URL Credentials', async ({ page }) => {
  // Pass credentials directly in the URL
  await page.goto('https://admin:admin@the-internet.herokuapp.com/basic_auth');
  await page.waitForLoadState();
  
  await expect(page.locator('text=Congratulations')).toBeVisible();
});
```

### Approach B: Context Configuration (Recommended)
You can define credentials when creating the BrowserContext using the `httpCredentials` parameter. This securely injects the credentials into HTTP request headers.

```javascript
test('Basic Auth via Context Credentials', async ({ browser }) => {
  // Define credentials in context parameters
  const context = await browser.newContext({
    httpCredentials: {
      username: 'admin',
      password: 'admin'
    }
  });

  const page = await context.newPage();
  await page.goto('https://the-internet.herokuapp.com/basic_auth');
  await page.waitForLoadState();

  await expect(page.locator('text=Congratulations')).toBeVisible();
});
```

---
*Reference: [Pavan Online Trainings](https://www.pavanonlinetrainings.com) | [SDET Pavan YouTube](https://www.youtube.com/@sdetpavan)*
