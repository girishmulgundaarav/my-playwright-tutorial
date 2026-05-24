---
title: Assertions, Timeouts & Codegen
sidebar_position: 1
---

# Playwright Assertions, Timeouts, Codegen & Debugging

Automating modern web applications requires verifying page states correctly (assertions), managing asynchronous execution durations (timeouts), accelerating script creation (Codegen), and troubleshooting scripts when tests behave unexpectedly (debugging).

This guide covers how to implement auto-retrying and non-retrying assertions, customize timeouts at the test and expectation level, run the Playwright test recorder, and debug step-by-step using the Playwright Inspector.

---

## 1. Playwright Auto-Waiting Mechanism

Before performing actions like `.click()`, `.fill()`, or `.hover()`, Playwright automatically waits for target elements to pass a set of **Actionability Checks**. This ensures the element is in a state where the action can succeed, eliminating flaky test runs caused by race conditions.

### The Actionability Checklist
Playwright verifies that the element is:
1. **Attached**: Element is present in the DOM.
2. **Visible**: Element is visible on the page (not display: none, width/height > 0).
3. **Stable**: Element animation has finished (its bounding box is constant).
4. **Enabled**: Element is not disabled.
5. **Editable**: Element is input-ready (when filling or typing).
6. **Receiving Events**: Element is not obscured or covered by other elements (like modals or overlays).

```
Action Triggered (e.g., click)
  └── [Actionability Check]
         ├── Is Attached? ── Yes
         ├── Is Visible?  ── Yes
         ├── Is Stable?   ── Yes
         ├── Is Enabled?  ── Yes
         └── [Action Executed Successfully]
```

### Forcing Actions
In scenarios where you want to perform an action regardless of whether it passes the actionability checks (e.g., clicking a hidden element covered by a transparent overlay), you can bypass these checks by passing the `{ force: true }` parameter:

```typescript
// Bypasses non-essential checks (like visibility or pointer event blocking)
await page.locator('#small-searchterms').fill('Laptop', { force: true });
await page.locator('.button-1.search-box-button').click({ force: true });
```

---

## 2. Managing Timeouts

Timeouts dictate how long Playwright should wait for an operation to succeed before throwing an error and failing the test.

| Timeout Type | Scope | Default Value | Global Config File Parameter | Inline Override in Test |
| :--- | :--- | :--- | :--- | :--- |
| **Test Timeout** | Maximum time allowed for a single test block | `30,000 ms` (30s) | `timeout: 60000` | `test.setTimeout(50000)` |
| **Expect Timeout** | Time allowed for an assertion to be satisfied | `5,000 ms` (5s) | `expect: { timeout: 10000 }` | `expect(locator).toBeVisible({ timeout: 10000 })` |
| **Action Timeout** | Time allowed for an action (e.g. click, fill) to complete | No default (infinite) | `use: { actionTimeout: 10000 }` | `locator.click({ timeout: 10000 })` |
| **Navigation Timeout** | Time allowed for page navigation (`goto`, `waitForNavigation`) | No default (infinite) | `use: { navigationTimeout: 15000 }` | `page.goto(url, { timeout: 15000 })` |

### Modifying Timeouts in Code

#### A. Overriding a Test Timeout
```typescript
import { test } from '@playwright/test';

test('Test with custom timeout', async ({ page }) => {
  // Set timeout for this specific test to 50 seconds
  test.setTimeout(50000); 
  
  await page.goto('https://demowebshop.tricentis.com/');
});
```

#### B. Making a Test Slower
If a test is naturally slow (e.g. executing a long flow), calling `test.slow()` will automatically triple the default or configured timeout:
```typescript
test('Slow test execution example', async ({ page }) => {
  test.slow(); // Triples the default test timeout (e.g., from 30s to 90s)
  
  await page.goto('https://demowebshop.tricentis.com/');
});
```

#### C. Overriding an Assertion (Expect) Timeout
```typescript
// Waits up to 10 seconds for the element to become visible
await expect(page.locator('text=Welcome to our store')).toBeVisible({ timeout: 10000 });
```

---

## 3. Playwright Assertions

Playwright includes built-in matchers via the `expect` function. Assertions are categorized based on whether they wait and retry dynamically.

### Auto-Retrying Assertions (Asynchronous)
These assertions operate on **pages** or **locators**. They automatically wait for the expected condition to be met within the assertion timeout (default 5s) before failing.

:::tip Async Rule
Because auto-retrying assertions are asynchronous and return Promises, **you must use the `await` keyword** before `expect`.
:::

```typescript
// Waits for the page URL to match
await expect(page).toHaveURL("https://demowebshop.tricentis.com/");

// Waits for the element to become visible
await expect(page.locator('text=Welcome to our store')).toBeVisible();

// Waits for the element to contain specific text
await expect(page.locator("div[class='product-grid home-page-product-grid'] strong")).toHaveText('Featured products');
```

### Non-Retrying Assertions (Synchronous)
These assertions validate **immediate values** (strings, booleans, arrays, etc.) extracted from the page. They run exactly once and fail instantly if the condition is not met.

:::warning Sync Rule
Non-retrying assertions are synchronous and do not return Promises. **Do not use the `await` keyword** before `expect` when asserting values.
:::

```typescript
// 1. Get the value from the page
const title = await page.title();
const welcometext = await page.locator('text=Welcome to our store').textContent();

// 2. Perform synchronous assertion
expect(title.includes('Demo Web Shop')).toBeTruthy();
expect(welcometext).toContain('Welcome');
```

### Negated Assertions
You can invert any matcher by inserting `.not` before the matcher name:
```typescript
// Inverting an auto-retrying assertion (waits for element to hide)
await expect(page.locator('text=Welcome to our store')).not.toBeVisible();

// Inverting a non-retrying assertion (synchronous check)
expect(welcometext).not.toContain('Error');
```

---

## 4. Hard vs Soft Assertions

By default, assertions in Playwright are **Hard Assertions**. When a hard assertion fails, it immediately terminates the test run, blocking subsequent code blocks.

In contrast, **Soft Assertions** will record a failure, but allow the test to continue executing subsequent steps. All failures are compiled and reported together at the end of the test.

```
[Hard Assertion Failure] ──> [Test Terminated Immediately]

[Soft Assertion Failure] ──> [Record Failure] ──> [Execute Next Steps] ──> [Report All Failures at End]
```

### Comparing Hard vs Soft Assertions

| Feature | Hard Assertion | Soft Assertion |
| :--- | :--- | :--- |
| **Default Option?** | Yes | No (requires explicit `expect.soft(...)`) |
| **On Failure...** | Terminates test immediately | Continues executing remaining test steps |
| **Typical Use Case** | Critical checks (e.g. login success) that block next steps | Layout checks, verifying multiple independent elements |
| **Failure Summary** | Stops on first failure | Lists all compiled failures at the end |

### Code Example: Hard vs Soft Assertions

```typescript
import { test, expect } from '@playwright/test';

test('Verify Landing Page Elements with Soft Assertions', async ({ page }) => {
  await page.goto('https://demowebshop.tricentis.com/');

  // Soft Assertions: even if the title check fails, the test will continue checking URL & visibility
  await expect.soft(page).toHaveTitle('Demo Web Shop2'); // Will fail
  await expect.soft(page).toHaveURL('https://demowebshop.tricentis.com/'); // Will pass
  
  const logo = page.locator("img[alt='Tricentis Demo Web Shop']");
  await expect.soft(logo).toBeVisible(); // Will pass
  
  // The test is marked as FAILED in reports, but all three assertions were run
});
```

---

## 5. Playwright Test Generator (Codegen)

**Codegen** is a powerful utility that records your manual browser interactions and automatically translates them into ready-to-run Playwright test scripts.

```bash
npx playwright codegen https://example.com
```

This launches a chromium browser alongside the **Playwright Inspector**, which displays the generated code live as you click, type, or navigate.

Here is the Playwright Codegen interface showing a live browser and the Inspector side-by-side:

![Playwright Codegen](/img/codegen_inspector.png)

### Essential Codegen Commands

#### A. Record and Save Directly to File
Automatically write the recorded steps into a target file path:
```bash
npx playwright codegen -o tests/codegen-demo.spec.ts https://demoblaze.com/
```

#### B. Specify Browser Engine
Force recording on a specific browser type (`chromium`, `firefox`, or `webkit`):
```bash
# Using Firefox engine
npx playwright codegen --browser firefox https://example.com

# Short flag variant
npx playwright codegen -b webkit https://example.com
```

#### C. Emulate Mobile Devices
Simulate running on mobile devices to generate mobile-specific locators:
```bash
npx playwright codegen --device "iPhone 15" https://demoblaze.com/
```

#### D. Custom Viewport Sizes
Change the browser viewport dimensions:
```bash
npx playwright codegen --viewport-size "1280,720" https://example.com
```

#### E. Combining Options
Configure multiple recording constraints simultaneously:
```bash
npx playwright codegen --browser=chromium --output=tests/mytest.spec.ts --viewport-size "1280,720" https://demoblaze.com/
```

---

## 6. Debugging Playwright Tests

Playwright provides the **Playwright Inspector**, a graphical utility designed to step through your automated scripts step-by-step.

Here is what the Playwright Inspector looks like while paused on a breakpoint during debugging:

![Playwright Inspector Debugger](/img/playwright_inspector_debug.png)

### Starting Debug Mode
Run your test script with the `--debug` flag to launch the Inspector:
```bash
npx playwright test tests/mytest.spec.ts --debug
```

*   The test runs in headed mode.
*   The Inspector opens side-by-side, pausing at the first line of the test.
*   You can click **Step over** (`F10`) to execute line-by-line, **Resume** (`F5`) to run, or inspect selector elements dynamically using the **Record/Explore** tool.

### Adding Breakpoints (`page.pause()`)
To skip stepping through setup actions (like login pages) and pause the test at a precise line, insert `await page.pause()` directly into your code:

```typescript
test('Debug a specific step', async ({ page }) => {
  await page.goto('https://demoblaze.com/index.html');
  
  // Navigate to login modal
  await page.getByRole('link', { name: 'Log in' }).click();
  
  // Set a breakpoint here
  await page.pause(); 
  
  // Script will pause in headed browser, opening the Inspector here
  await page.locator('#loginusername').fill('pavanol');
  await page.locator('#loginpassword').fill('test@123');
});
```

---

## 🏋️ Hands-on Lab Assignments

### Exercise 1: Assertions and Auto-Wait Challenge
*   Write a test that navigates to the Demo Web Shop: `https://demowebshop.tricentis.com/`
*   Add a test-level timeout of `50000ms`.
*   Use auto-retrying assertions to verify that the URL is correct, and that the search field is visible.
*   Type "Laptop" in the search input field using a forced action (`{ force: true }`), click the search button, and assert the search results title has the correct text.

### Exercise 2: Soft vs Hard Assertions Implementation
*   Create a test that navigates to `https://demowebshop.tricentis.com/`.
*   Implement three assertions using `expect.soft`:
    *   Verify the title is `Demo Web Shop - Invalid` (Expected to Fail).
    *   Verify the page URL is `https://demowebshop.tricentis.com/` (Expected to Pass).
    *   Verify the logo image is visible (Expected to Pass).
*   Add a hard assertion at the end to check if the main header block is visible.
*   Confirm the test runs all soft checks and fails only at the end.

### Exercise 3: Playwright Debugging & Breakpoints
*   Write a script that:
    *   Navigates to `https://www.demoblaze.com/index.html`.
    *   Clicks the "Log in" button.
    *   Adds a breakpoint `await page.pause()` immediately after the click.
*   Run the script using `npx playwright test --debug` and verify that the Playwright Inspector pauses at your breakpoint, letting you inspect the DOM.

---

```quiz
{
  "question": "Which of the following assertions is synchronous and does NOT return a Promise?",
  "options": [
    "await expect(page).toHaveURL('https://example.com')",
    "await expect(locator).toBeVisible()",
    "expect(title.includes('Store')).toBeTruthy()",
    "await expect.soft(locator).toHaveText('Welcome')"
  ],
  "answer": 2,
  "explanation": "Assertions performed on direct primitive values (like expecting boolean results via toBeTruthy()) are synchronous, run immediately, and do not return a Promise. Locators and pages require asynchronous auto-retrying checks."
}
```

```quiz
{
  "question": "What happens when a soft assertion fails during a test execution in Playwright?",
  "options": [
    "The test is halted immediately and marked as a failure",
    "The failure is recorded, but the test continues executing the remaining steps",
    "The test is restarted automatically",
    "Playwright ignores the failure completely and marks the test as passed"
  ],
  "answer": 1,
  "explanation": "Soft assertions (expect.soft) compile and record failures without interrupting the test execution flow, letting subsequent lines run. All recorded failures are shown in the final report."
}
```

```quiz
{
  "question": "Which CLI command would you run to record actions on an iPhone 15 and output the generated code directly to tests/mobile.spec.ts?",
  "options": [
    "npx playwright codegen --device \"iPhone 15\" --output tests/mobile.spec.ts",
    "npx playwright test --device=\"iPhone 15\" -o tests/mobile.spec.ts",
    "npx playwright recorder iPhone 15 > tests/mobile.spec.ts"
  ],
  "answer": 0,
  "explanation": "To emulate a device and output code to a file using Codegen, use the `--device` flag followed by `--output` (or the `-o` shortcut) with the target file path."
}
```
