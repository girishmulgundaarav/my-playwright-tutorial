---
title: Page Object Model (POM)
sidebar_position: 8
---

# Page Object Model (POM)

As test suites grow, writing locators and interactions directly inside test cases leads to duplication. If a button's selector changes, you must update every test file that clicks that button.

The **Page Object Model (POM)** is a design pattern that creates an abstraction layer between test logic and the application's user interface. 

---

## 1. Architectural Overview

The following diagram illustrates how Playwright runs test scripts through a custom fixture injection model that references organized, modular page objects:

![Playwright Page Object Model & Fixture Injection Architecture](/img/playwright_pom_fixtures.png)

---

## 2. Core Page Object Model Design

In the Page Object Model:
1. **Each Web Page** is represented by a TypeScript/JavaScript Class.
2. **Web Elements** (buttons, inputs, labels) are represented as instance variables utilizing Playwright's `Locator` type.
3. **User Actions** (typing, clicking, navigating) are written as `async` class methods.

---

### Step 1: Create the Page Object Class

Define the selectors and interaction methods inside a class.

```typescript
// pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  // Define page property and locator types
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInBtn: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    // Instantiate locators using user-facing attributes
    this.emailInput = page.getByPlaceholder('e.g. ashley@example.com');
    this.passwordInput = page.getByPlaceholder('Enter password');
    this.signInBtn = page.getByRole('button', { name: 'Sign in' });
    this.errorMessage = page.locator('.error-toast-message');
  }

  // Define navigation helper method
  async navigate() {
    await this.page.goto('https://app.vwo.com');
  }

  // Define interaction workflows
  async login(email: string, pass: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);
    await this.signInBtn.click();
  }
}
```

---

### Step 2: Write the Test Case Using the Page Object

Instantiate the Page Object manually inside your test spec:

```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('TC-001: Successful Login with Valid Credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Execute steps via page object abstraction
  await loginPage.navigate();
  await loginPage.login('user@example.com', 'ValidPass123');

  // Assertions remain inside the test file (not in the Page Object)
  await expect(page).toHaveURL(/dashboard/);
});
```

:::warning Assertions vs. Actions
Do not put test assertions (like `expect(locator).toBeVisible()`) inside Page Object classes. Page Objects should only represent the structure and behavior of the UI. Placing assertions in page objects makes them less reusable and harder to maintain.
:::

---

## 3. Advanced POM Patterns

### A. The Page Chaining Pattern
In a standard workflow, navigating from page to page requires instantiating multiple page objects manually inside the test file. 

The **Page Chaining Pattern** solves this by having page object methods return an instance of the *next* page object:

```typescript
// pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';
import { DashboardPage } from './DashboardPage';

export class LoginPage {
  readonly page: Page;
  // ... locators ...

  constructor(page: Page) {
    this.page = page;
  }

  async login(email: string, pass: string): Promise<DashboardPage> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);
    await this.signInBtn.click();
    
    // Return instance of the next page in the workflow
    return new DashboardPage(this.page);
  }
}
```

Now, tests can chain calls cleanly, reflecting the user flow:

```typescript
test('E2E Order Flow', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  
  // Chain operations as navigation flows
  const dashboard = await loginPage.login('user@example.com', 'Pass123');
  await dashboard.verifyWelcomeMessage();
});
```

---

### B. Custom Fixtures Injection (Playwright Way)
Instantiating page objects manually in every test (`const loginPage = new LoginPage(page)`) is repetitive. 

Playwright resolves this using **Custom Fixtures**. You can extend the base test runner to inject page objects directly into your test cases:

#### 1. Define the Fixtures Extension
Create a custom test harness:

```typescript
// fixtures/page-fixtures.ts
import { test as baseTest } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

// Declare types for custom page fixtures
type CustomPageFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

// Extend base test to create a custom test instance
export const test = baseTest.extend<CustomPageFixtures>({
  loginPage: async ({ page }, use) => {
    // Instantiate page object
    const loginPage = new LoginPage(page);
    // Provide fixture to the test runner
    await use(loginPage);
  },
  
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  }
});

export { expect } from '@playwright/test';
```

#### 2. Use Fixtures in Test Specs
Import your custom `test` harness instead of the default `@playwright/test`. The fixtures are initialized automatically and injected as parameters:

```typescript
// tests/login-fixture.spec.ts
import { test, expect } from '../fixtures/page-fixtures';

// Inject page objects directly
test('TC-002: Login using Custom Page Fixture', async ({ loginPage, dashboardPage, page }) => {
  await loginPage.navigate();
  await loginPage.login('user@example.com', 'ValidPass123');
  
  await dashboardPage.verifyWelcomeMessage();
  await expect(page).toHaveURL(/dashboard/);
});
```

---

### C. Shared Component Encapsulation
Many applications share global layouts (header navigation, footers, search modules). Instead of duplicating these components inside every page class, encapsulate them in helper components:

```typescript
// components/HeaderComponent.ts
import { Page, Locator } from '@playwright/test';

export class HeaderComponent {
  readonly page: Page;
  readonly cartIcon: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartIcon = page.locator('#shopping_cart_container');
    this.logoutLink = page.getByRole('link', { name: 'Logout' });
  }

  async logout() {
    await this.logoutLink.click();
  }
}
```

Now, composition allows page objects to contain nested layouts:

```typescript
// pages/DashboardPage.ts
import { Page } from '@playwright/test';
import { HeaderComponent } from '../components/HeaderComponent';

export class DashboardPage {
  readonly page: Page;
  readonly header: HeaderComponent; // Shared component inclusion

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);
  }
}
```

In your test file, you access nested attributes cleanly:
```typescript
await dashboardPage.header.logout();
```

---

## 🏋️ Hands-on Lab Assignments

### Exercise 1: Web Shop Shopping Cart POM
1. Create a workspace page object file `ShoppingCartPage.ts`.
2. Define locators for:
   - Cart icon container.
   - Subtotal amount indicator.
   - Checkout button.
3. Write a spec using page chaining that starts on the login page, navigates to the shopping cart, verifies item counts, and advances to checkouts.

### Exercise 2: Implementing a Fixture Extension
1. Create a `fixtures.ts` file in your tests folder.
2. Extend the Playwright test object to supply custom `shoppingCartPage` and `loginPage` fixtures.
3. Rewrite an existing standard test to inject the fixtures and eliminate manual constructor instances.

---

```quiz
{
  "question": "Why should test assertions (expect statements) be kept inside spec files rather than inside Page Object classes?",
  "options": [
    "Playwright fails to compile if expect statements are placed inside class declarations",
    "It preserves separation of concerns, ensuring page classes act as UI adapters while tests define expectations and assertions",
    "Assertions run slower if executed inside external modules",
    "To prevent browsers from timing out on headless execution modes"
  ],
  "answer": 1,
  "explanation": "Separation of concerns states that Page Objects model the application's structure, while test files define the verification logic. Putting assertions inside page objects limits their reusability across different test suites."
}
```

```quiz
{
  "question": "What pattern allows navigating through pages sequentially without manually importing and instantiating each page class in the test script?",
  "options": [
    "Custom Fixtures Injection",
    "Page Chaining Pattern",
    "Base Component Composition",
    "Locator Propagation Model"
  ],
  "answer": 1,
  "explanation": "The Page Chaining Pattern involves returning an instance of the target page object from the navigation methods of the preceding page class (e.g., login() returns new DashboardPage(page))."
}
```

```quiz
{
  "question": "Which Playwright method is used to register custom pre-instantiated page objects to automate setup and parameter injections?",
  "options": [
    "test.register()",
    "test.extend()",
    "test.inject()",
    "test.useFixtures()"
  ],
  "answer": 1,
  "explanation": "The `test.extend<T>()` method allows extending the base Playwright test runner with custom fixtures, enabling dependency injection directly into test parameter blocks."
}
```
