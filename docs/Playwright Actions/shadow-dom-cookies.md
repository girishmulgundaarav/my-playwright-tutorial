---
title: Shadow DOM & Cookies
sidebar_position: 11
---

# Shadow DOM, Cookies & Custom Browser Settings

In modern web development, websites are built to be highly secure and modular. To successfully automate these sites, you will encounter encapsulated web components residing inside **Shadow DOMs**, need to manage browser **Cookies** for session states or tracking, and configure custom **Browser Settings** (like viewports, proxies, and locales).

Playwright provides native APIs to handle these requirements with high reliability and zero extra boilerplate.

---

## 🔗 Practice Sites & Test URLs

Before starting, navigate to these practice/test websites to try out the code examples:
*   **Automation Practice:** [http://www.automationpractice.pl/index.php](http://www.automationpractice.pl/index.php)
*   **Books PWA Kit:** [https://books-pwakit.appspot.com/](https://books-pwakit.appspot.com/)
*   **Polymer Shop:** [https://shop.polymer-project.org/](https://shop.polymer-project.org/)
*   **Google:** [https://www.google.com/](https://www.google.com/)

---

## 1. Automating Shadow DOM Elements

### What is the Shadow DOM?
The **Shadow DOM** is a self-contained, encapsulated DOM tree inside a web page. It is commonly used in Web Components to isolate their internal HTML structure, styles, and behaviors from the main document, preventing styling conflicts.

*   **Shadow Host**: The regular DOM element to which the Shadow DOM is attached (acting as the entry point).
*   **Shadow Root**: The root node of the Shadow DOM tree.
*   **Shadow Tree**: The encapsulated DOM elements nested inside the Shadow Root.

```
Main Document (DOM)
   └── Shadow Host (Regular Element)
          └── [Shadow Root] (Encapsulation Boundary)
                 └── Shadow Tree (Nested Elements)
```

---

### Playwright's Native Piercing Behavior
By default, **Playwright automatically pierces open Shadow DOM roots**. 
You can target elements inside a Shadow DOM using standard CSS selectors, text locators, or role locators without having to manually select the shadow root.

:::warning XPath Exception
**XPath locators do NOT pierce Shadow DOM roots.** 
If you try to target an element inside a Shadow DOM using XPath (e.g., `//input[@id='search']`), the search will fail to locate the element. Always stick to CSS selectors or Playwright's built-in selectors (e.g., `page.locator('#input')`) when working with Shadow DOMs.
:::

---

### Code Examples: Shadow DOM Automation

Here is how you locate and interact with elements inside Shadow DOM trees.

#### Scenario 1: Searching Books on a Shadow DOM Application
In this example, the `#input` text field and book titles are encapsulated inside shadow roots on the Google Books PWA demo.

```typescript
import { test, expect } from '@playwright/test';

test('Interact with Shadow DOM Input and Verify Titles', async ({ page }) => {
  await page.goto('https://books-pwakit.appspot.com/');

  // Playwright pierces the Shadow DOM natively using standard CSS
  const searchInput = page.locator('#input');
  await searchInput.fill('Playwright automation');
  await page.keyboard.press('Enter');

  // Wait for results to render
  await page.waitForTimeout(3000);

  // Retrieve book titles located within Shadow DOM elements
  const booksFound = await page.locator('h2.title').all();
  console.log(`Books Found: ${booksFound.length}`);

  // Assert that elements inside the shadow tree were found
  expect(booksFound.length).toBe(20);
});
```

#### Scenario 2: Selecting E-Commerce Categories on Polymer Shop
In this example, navigation buttons are nested deep inside Shadow Roots.

```typescript
test('Navigate E-Commerce Shop Nested inside Shadow DOM', async ({ page }) => {
  await page.goto('https://shop.polymer-project.org/');

  // standard CSS locators pierce the shadow boundaries automatically
  const shopNowBtn = page.locator('a[aria-label="Men\'s Outerwear Shop Now"]');
  await shopNowBtn.click();
  
  await page.waitForTimeout(3000);

  // Count products inside the shadow root list container
  const productsFound = await page.locator('div.title').all();
  console.log(`Number of products found: ${productsFound.length}`);

  expect(productsFound.length).toBe(16);
});
```

---

## 2. Managing Cookies in Playwright

Cookies are small data blocks stored on the client side, widely used for **Session Management** (keeping users logged in), **Personalization** (tracking theme settings), and **Analytics**.

Playwright allows you to inspect, inject, and clear cookies at the `BrowserContext` level.

---

### Key Cookie Operations

#### 1. Retrieve Cookies (`context.cookies()`)
Returns all cookies currently stored in the browser session. You can optionally filter them by passing a specific URL.

```typescript
// Get all cookies
const allCookies = await context.cookies();

// Get cookies for a specific URL only
const domainCookies = await context.cookies('https://example.com');
```

#### 2. Set / Inject Cookies (`context.addCookies()`)
Used to mock authenticated sessions or pre-set tracking tokens. You must specify the `name`, `value`, and a targeting `url` or `domain`.

```typescript
await context.addCookies([
  {
    name: 'session_token',
    value: 'xyz987654321',
    url: 'https://example.com',
    path: '/',
    httpOnly: true,
    secure: true
  }
]);
```

#### 3. Clear Cookies (`context.clearCookies()`)
Removes cookies from the current context. By default, it clears all cookies, but you can also pass options to clear specific ones.

```typescript
// Clear all cookies
await context.clearCookies();

// Pro Tip: Clear specific cookies by filtering by Name, Domain, or Path
await context.clearCookies({ name: 'session_token' });
await context.clearCookies({ domain: 'example.com' });
```

---

### Code Example: Cookie Lifecycle Verification

```typescript
import { test, expect } from '@playwright/test';

test('Verify Cookie Addition, Retrieval, and Deletion', async ({ browser }) => {
  // Create an isolated context
  const context = await browser.newContext();
  const page = await context.newPage();

  // 1. Add / Inject a custom cookie
  await context.addCookies([
    {
      name: 'MyCookie',
      value: '123456',
      url: 'http://www.automationpractice.pl/index.php'
    }
  ]);
  console.log('Cookie injected!');

  // Navigate to target site
  await page.goto('http://www.automationpractice.pl/index.php');

  // 2. Retrieve cookies and assert MyCookie exists
  let cookiesList = await context.cookies();
  const targetCookie = cookiesList.find(c => c.name === 'MyCookie');
  
  expect(targetCookie).toBeDefined();
  expect(targetCookie?.value).toBe('123456');
  console.log(`Cookie value verified: ${targetCookie?.value}`);

  // Print all active cookies
  for (const cookie of cookiesList) {
    console.log(`Active Cookie: ${cookie.name} = ${cookie.value}`);
  }

  // 3. Clear the cookies using context.clearCookies()
  await context.clearCookies();

  // Verify list is empty
  cookiesList = await context.cookies();
  expect(cookiesList.length).toBe(0);
  console.log('All cookies cleared successfully!');
  
  await context.close();
});
```

---

## 3. Custom Browser Context Settings

BrowserContexts represent isolated browser sessions (similar to separate Incognito profiles). When instantiating custom contexts manually, Playwright offers several parameters to control the environment.

### Setting Viewports, Locales, and Proxy Settings

You can pass configuration parameters directly into `browser.newContext()`:

```typescript
const context = await browser.newContext({
  viewport: { width: 1200, height: 800 }, // Initial screen size
  locale: 'en-GB',                        // Simulate region
  ignoreHTTPSErrors: true,                // Skip invalid SSL warnings
  // proxy: { server: 'http://myproxy.com:3128' }
});
```

---

### Simulating Maximize and Minimize
*   **Maximize**: You can simulate maximizing the window by setting the viewport size to standard desktop resolutions (e.g., `1920x1080` or `1280x720`).
*   **Minimize**: Playwright does not directly support minimizing browser windows because tests execute headless or inside container viewports. You can simulate it by setting the viewport size to `1x1` pixels.

```typescript
// Simulating window maximize
await page.setViewportSize({ width: 1920, height: 1080 });
```

---

### Code Example: Browser Setting Customization

```typescript
import { test, expect, chromium } from '@playwright/test';

test('Simulate Custom Browser Context Settings', async () => {
  // Launch the browser process
  const browser = await chromium.launch({ headless: false });

  // Create context with custom configurations
  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 },
    locale: 'en-US',
    ignoreHTTPSErrors: true // Prevents SSL Certificate error pages from blocking tests
  });

  const page = await context.newPage();

  // Simulate maximizing the viewport size dynamically
  await page.setViewportSize({ width: 1920, height: 1080 });

  await page.goto('https://www.google.com/');
  console.log(`Page title loaded: ${await page.title()}`);

  await page.waitForTimeout(2000);
  await context.close();
  await browser.close();
});
```

---

## 📝 Recap: Key Methods Summary

| Method / Property | Context Level | Description | Typical Use Case |
| :--- | :--- | :--- | :--- |
| **`page.locator(selector)`** | Page | Pierces Open Shadow Roots automatically with CSS | Locating encapsulated web component elements. |
| **`context.cookies([urls])`** | Context | Returns all cookies currently active in the session | Inspecting authentication or tracking tokens. |
| **`context.addCookies([cookies])`** | Context | Injects new cookies into the browser context | Simulating cookie-based logins or analytics flags. |
| **`context.clearCookies([options])`** | Context | Clears all cookies, or matching specific filters | Logging out or clearing state between tests. |
| **`page.setViewportSize(size)`** | Page | Changes the size of the page's viewport dynamically | Testing responsive designs or maximizing screens. |

---

## 🏋️ Hands-on Lab Assignments

### Exercise 1: Shadow DOM Navigation Challenge
*   Navigate to the Polymer Shop homepage: `https://shop.polymer-project.org/`
*   Click the "Ladies' Outerwear Shop Now" link.
*   Assert that the listing renders exactly `16` clothing products.
*   Click on the first product item and assert the product page is loaded.

### Exercise 2: Specific Cookie Deletion
*   Write a test that injects three cookies: `CookieA`, `CookieB`, and `CookieC`.
*   Verify that `context.cookies()` returns `3` cookies.
*   Clear **only** `CookieB` using the name filter options in `clearCookies()`.
*   Assert that the context now contains exactly `2` cookies, and `CookieB` is no longer present.

### Exercise 3: SSL Validation & Custom Sizing
*   Launch a manual Chromium browser process.
*   Instantiate a context configured with `ignoreHTTPSErrors: true` and an initial viewport of `800x600`.
*   Navigate to a site with expired SSL certificates (e.g., `https://expired.badssl.com/`).
*   Assert that the page loads successfully instead of throwing a certificate block.
*   Change the viewport size dynamically to `1920x1080` (Maximize) and confirm the site layout updates.

---

```quiz
{
  "question": "Which type of selector will FAIL to locate an element nested inside an open Shadow DOM root in Playwright?",
  "options": [
    "CSS Selectors (e.g., '#input')",
    "XPath Selectors (e.g., '//input')",
    "Text Selectors (e.g., 'text=Search')",
    "Role Selectors (e.g., 'page.getByRole()')"
  ],
  "answer": 1,
  "explanation": "XPath selectors in Playwright do not pierce shadow roots. Standard CSS, text, and role-based locators pierce them natively by default."
}
```

```quiz
{
  "question": "How can you clear a specific cookie named 'session_token' without deleting other cookies in Playwright?",
  "options": [
    "await context.clearCookies({ name: 'session_token' })",
    "await context.deleteCookie('session_token')",
    "await context.clearCookies('session_token')",
    "This is not supported; you must clear all cookies using clearCookies() and re-add the others"
  ],
  "answer": 0,
  "explanation": "Modern Playwright supports passing filter parameters (such as `name`, `domain`, or `path`) into `context.clearCookies()` to target and clear specific cookies."
}
```

```quiz
{
  "question": "What happens if a test navigates to a webpage with invalid or expired SSL certificates when ignoreHTTPSErrors is set to false (default)?",
  "options": [
    "Playwright automatically updates the browser to bypass it silently",
    "The page loads normally, but console warnings are printed",
    "Playwright throws an navigation error and the test fails",
    "The webpage is redirected to Google.com"
  ],
  "answer": 2,
  "explanation": "By default, secure browser connections require valid SSL certificates. If a certificate is invalid/expired and `ignoreHTTPSErrors` is not set to `true`, Playwright's navigation request will throw a security error and fail the test."
}
```
