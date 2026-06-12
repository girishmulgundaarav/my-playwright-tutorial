---
title: Codegen & Locator Strategies
sidebar_position: 2
---

# Test Generation & Locator Strategies

Creating test scripts from scratch can be time-consuming. Playwright includes a built-in **Test Generator (Codegen)** that records your interactions in a browser window and automatically generates tests. 

This guide covers how to leverage Codegen, customize recording behavior using CLI flags, understand Playwright's locator selection priority order, and integrate these capabilities with development environments.

---

## 🔗 Practice Sites & Test URLs

Before starting, navigate to these practice/test websites to try out the code examples:
*   **VWO App Login:** [https://app.vwo.com](https://app.vwo.com)

---

## 1. Test Generation with Codegen

When you run Playwright's test generator, it launches two windows side-by-side:
1.  A browser instance where you interact with the target application.
2.  The **Playwright Inspector** window, which displays the auto-generated code live.

To begin recording, run:
```bash
npx playwright codegen https://example.com
```

As you click links, fill out forms, or navigate, Playwright records these actions and writes the corresponding JavaScript/TypeScript test code.

---

## 2. Advanced Codegen Flags

You can customize the recording environment using command-line flags:

| Flag | Purpose | Command Example |
| :--- | :--- | :--- |
| **`--target`** | Sets target programming language (`javascript`, `typescript`, `python`, `java`, or `csharp`). | `npx playwright codegen --target=python https://example.com` |
| **`-o`, `--output`** | Saves the generated code directly to a file. | `npx playwright codegen -o tests/login.spec.ts https://example.com` |
| **`-b`, `--browser`** | Emulates a specific browser engine (`chromium`, `firefox`, or `webkit`). | `npx playwright codegen -b firefox https://example.com` |
| **`--device`** | Emulates screen size, user-agent, and touch settings of a mobile device. | `npx playwright codegen --device="iPhone 13" https://example.com` |
| **`--viewport-size`** | Sets a custom browser viewport resolution. | `npx playwright codegen --viewport-size="1280,720" https://example.com` |
| **`--color-scheme`** | Emulates light or dark mode themes. | `npx playwright codegen --color-scheme=dark https://example.com` |
| **`--save-storage`** | Saves cookies, tokens, and storage state to a JSON file. | `npx playwright codegen --save-storage=auth.json https://example.com` |
| **`--load-storage`** | Loads a saved authentication state to bypass login screens. | `npx playwright codegen --load-storage=auth.json https://example.com` |
| **`--timezone`** | Emulates a localized timezone. | `npx playwright codegen --timezone="Europe/London" https://example.com` |
| **`--locale`** | Emulates user localization/locale settings. | `npx playwright codegen --locale="fr-FR" https://example.com` |
| **`--geolocation`** | Emulates physical GPS coordinates. | `npx playwright codegen --geolocation="48.8584,2.2945" https://example.com` |

---

## 3. How Playwright Selects Locators

Playwright generates locators based on a resilient selection priority. It avoids brittle CSS selectors or complex XPath hierarchies in favor of user-facing attributes.

![Playwright Locator Priority Hierarchy](/img/playwright_locator_priority.png)

### Locator Selection Strategy

1.  **`getByRole()`**: Checks HTML semantics (e.g. `button`, `link`, `heading`, `checkbox`) and filters by accessible names (e.g., labels, aria-labels).
    *   *Example*: `page.getByRole('button', { name: 'Log in' })`
2.  **`getByLabel()`**: Locates form input elements by their associated `<label>` element text.
    *   *Example*: `page.getByLabel('Username')`
3.  **`getByPlaceholder()`**: Matches input elements by their placeholder text.
    *   *Example*: `page.getByPlaceholder('Enter your email address')`
4.  **`getByText()`**: Finds elements containing specific visible text strings.
    *   *Example*: `page.getByText('Welcome back, User!')`
5.  **`getByAltText()`**: Matches images (`<img>` elements) by their `alt` text attribute.
    *   *Example*: `page.getByAltText('Company logo')`
6.  **`getByTitle()`**: Locates elements having a matching `title` tooltip attribute.
    *   *Example*: `page.getByTitle('Close modal')`
7.  **`getByTestId()`**: Looks for custom test identifiers (e.g. `data-testid`). You can configure your custom test-id attribute name in `playwright.config.ts`.
    *   *Example*: `page.getByTestId('submit-btn')`
8.  **CSS Selectors / XPath**: Falling back to standard DOM trees when no semantic attributes exist.
    *   *Example*: `page.locator('#login-form .btn-submit')`

---

## 4. IDE Integration

The Playwright Test extension for VS Code integrates these generation capabilities directly into the editor:

*   **Record New**: Click the **Record New** button in the Testing panel to open a browser window and automatically generate a new spec file in your workspace.
*   **Record at Cursor**: Place your text cursor inside an existing test block, click **Record at Cursor**, and interact with the browser to append actions to your script.
*   **Pick Locator**: Hover over page elements in the active browser window to see their locator path, then click to copy it to your clipboard.
*   **Show Trace**: Review visual trace reports inline inside your editor to troubleshoot failing test assertions.

---

## 5. Practical Projects

### Project 1: Refined Login Automation Flow

In this project, we record a login flow and refine the auto-generated code into a structured, production-ready test suite.

#### Step 1: Record the Flow
Start the generator targeting the VWO login page, saving the recorded output to a test file:
```bash
npx playwright codegen -o tests/vwo_login.spec.js https://app.vwo.com
```
In the browser, enter credentials (email, password) and click **Sign in**. Playwright records these actions in real time.

#### Step 2: Refine the Code
The raw recorded script works, but contains hardcoded values and lack structure. We refine it into a structured suite utilizing environment variables and lifecycle hooks:

```javascript
// tests/vwo_login.spec.js
import { test, expect } from '@playwright/test';

// Retrieve credentials from environment variables, fallback to defaults
const LOGIN_URL = 'https://app.vwo.com';
const VALID_EMAIL = process.env.VWO_EMAIL || 'test@example.com';
const VALID_PASS = process.env.VWO_PASS || 'TestPass123';

test.describe('VWO Login Suite', () => {
  // Navigate to login page before running each test case
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL);
  });

  test('TC-001: Successful Login', async ({ page }) => {
    // Fill credentials using placeholder locators
    await page.getByPlaceholder('e.g. ashley@example.com').fill(VALID_EMAIL);
    await page.getByPlaceholder('Enter password').fill(VALID_PASS);
    
    // Click login button using role-based locator
    await page.getByRole('button', { name: 'Sign in to VWO' }).click();

    // Verify dashboard URL redirect
    await expect(page).toHaveURL(/dashboard/);
  });

  test('TC-002: Fail Login - Invalid Password', async ({ page }) => {
    await page.getByPlaceholder('e.g. ashley@example.com').fill(VALID_EMAIL);
    await page.getByPlaceholder('Enter password').fill('WrongPassword123');
    await page.getByRole('button', { name: 'Sign in to VWO' }).click();

    // Verify error toast message becomes visible
    await expect(page.getByText('Your email or password is incorrect')).toBeVisible();
  });
});
```

#### Step 3: Execute and Debug the Suite
Run the refined suite from the terminal:
```bash
# Run tests headlessly
npx playwright test tests/vwo_login.spec.js

# Run in headed mode to watch execution
npx playwright test tests/vwo_login.spec.js --headed

# Run with trace recording enabled
npx playwright test tests/vwo_login.spec.js --trace on
```

---

### Project 2: E2E Test Suite & Auth State Preservation

This project records E2E flows across multiple pages and preserves authenticated browser states to speed up execution.

#### Step 1: Record and Save Authenticated State
Login to the target site once and export the authenticated state (cookies and local storage) to a JSON file:
```bash
npx playwright codegen --save-storage auth-state.json https://the-internet.herokuapp.com/login
```

#### Step 2: Reuse State for Subsequent Recording Sessions
Launch the generator with the saved authentication state, bypassing the login step:
```bash
npx playwright codegen --load-storage auth-state.json https://the-internet.herokuapp.com/secure
```

#### Step 3: Run the Multi-browser Config
Configure a global test suite to run tests in parallel across Chromium, Firefox, and WebKit:

```javascript
// playwright.config.js
module.exports = {
  testDir: './tests',
  timeout: 30000,
  workers: 3,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }]
  ],
  use: {
    baseURL: 'https://the-internet.herokuapp.com',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
};
```
Run the suite:
```bash
npx playwright test
```

---

## 🏋️ Hands-on Lab Assignments

### Exercise 1: Multi-Page Test Recording
1.  Run the test generator targeting `https://the-internet.herokuapp.com/dropdown`.
2.  Select "Option 1" from the dropdown.
3.  Click the checkboxes link in the navigation menu and select both checkboxes.
4.  Export the recorded code to `tests/inputs.spec.js`.

### Exercise 2: Mobile Viewport Validation
1.  Launch the generator emulating a **Galaxy S9** device screen size in dark mode.
2.  Navigate to `https://the-internet.herokuapp.com/` and record clicking the **Mobile** layout menu.
3.  Save the code to `tests/mobile_inputs.spec.js`.

---

## 📝 Interactive Quiz

```quiz
{
  "question": "Which locator strategy does Playwright's Codegen prioritize first when recording element interactions?",
  "options": [
    "CSS class names (e.g. locator('.submit-btn'))",
    "XPath queries (e.g. locator('//button'))",
    "Role-based attributes (e.g. getByRole('button'))",
    "Input element text (e.g. getByText('Submit'))"
  ],
  "answer": 2,
  "explanation": "Playwright prioritizes role-based locators (getByRole) first because they check page accessibility structures, making tests resilient to style or layout changes."
}
```

```quiz
{
  "question": "What is the purpose of the --save-storage flag during a codegen session?",
  "options": [
    "To save the browser binary installer to local storage",
    "To export cookies, tokens, and storage state to a JSON file to bypass login steps in future tests",
    "To save all pages as HTML files",
    "To back up the test runner configuration settings"
  ],
  "answer": 1,
  "explanation": "The `--save-storage` flag writes the active browser session details (like cookies, localStorage) to a JSON file. This file can be loaded in subsequent runs via `--load-storage` to bypass login procedures."
}
```

```quiz
{
  "question": "How do you record browser steps in Python syntax using the CLI?",
  "options": [
    "npx playwright codegen --language python",
    "npx playwright codegen --target python",
    "npx playwright python-codegen",
    "npx playwright codegen -py"
  ],
  "answer": 1,
  "explanation": "The `--target` flag instructs the code generator to translate recorded browser interactions into a specific programming language. Passing `python` outputs Python script blocks."
}
```
