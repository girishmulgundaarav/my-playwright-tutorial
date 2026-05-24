---
title: Grouping, Hooks, Tags & Annotations
sidebar_position: 3
---

# Playwright Grouping, Hooks, Tags & Annotations

Managing large automated test suites requires logical organization, setup and teardown optimization, environment-specific execution, and targeted test execution. Playwright provides built-in mechanisms to structure tests, execute pre- and post-test conditions, declare execution rules, and categorize tests with metadata tags.

This guide covers test grouping using `test.describe`, hooks lifecycles, annotations (`only`, `skip`, `fail`, `fixme`, `slow`), and selective test tagging.

---

## 1. Grouping Tests (`test.describe`)

The `test.describe` block allows you to group related tests together. Grouping organizes your tests by feature, page object, or business workflow, and allows you to apply shared configurations or hooks exclusively to that group.

### Syntax and Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Group1', async () => {
  test('Test1', async () => {
    console.log("This is Test1...");
  });

  test('Test2', async () => {
    console.log("This is Test2...");
  });
});

test.describe('Group2', async () => {
  test('Test3', async () => {
    console.log("This is Test3...");
  });

  test('Test4', async () => {
    console.log("This is Test4...");
  });
});
```

### Running Specific Groups via CLI
You can run a single group of tests by referencing its title with the `--grep` flag:
```bash
npx playwright test tests/grouping.spec.ts --grep "Group1"
```

### Nested Describe Blocks
Playwright supports nested describe blocks for hierarchical structuring. Hooks declared inside a nested group will execute only for the tests within that specific sub-group:
```typescript
test.describe('User Management', () => {
  
  test.describe('Registration Suite', () => {
    test.beforeEach(async () => { /* Clear DB */ });
    test('Register standard user', async () => { ... });
  });

  test.describe('Login Suite', () => {
    test.beforeEach(async () => { /* Seed test user */ });
    test('Login with valid user', async () => { ... });
  });
});
```

---

## 2. Playwright Hooks Lifecycle

Hooks control the execution flow of your tests by running setup code before tests run, and cleanup code after they complete.

*   `test.beforeAll()`: Runs once before all tests in the file or describe block. (Useful for database initialization, global API logins, or opening a single shared browser tab).
*   `test.afterAll()`: Runs once after all tests in the file or describe block complete. (Useful for database teardowns, clearing reports, or closing shared resources).
*   `test.beforeEach()`: Runs before each individual test execution. (Useful for navigating to a page, logging in, or seeding page-specific data).
*   `test.afterEach()`: Runs after each individual test completes. (Useful for logging out, clearing browser storage, or closing a page instance).

### Hooks Execution Order Flowchart

Here is the sequential execution flow for Playwright hooks:

![Playwright Hooks Lifecycle](/img/playwright_hooks_lifecycle.png)


### A. Basic Hooks Implementation
```typescript
import { test } from '@playwright/test';

test.beforeAll('BeforeAll Setup', async () => {
  console.log("Runs once before all tests start.");
});

test.afterAll('AfterAll Teardown', async () => {
  console.log("Runs once after all tests complete.");
});

test.beforeEach('BeforeEach Setup', async () => {
  console.log("Runs before each individual test.");
});

test.afterEach('AfterEach Teardown', async () => {
  console.log("Runs after each individual test.");
});

test('Test A', async () => { console.log("Executing Test A"); });
test('Test B', async () => { console.log("Executing Test B"); });
```

### B. Shared Browser Context Hooks Example (Demoblaze)
By default, each test has its own isolated page instance. However, you can manage a single page instance programmatically across multiple tests inside a describe block:

```typescript
import { test, expect, Page } from '@playwright/test';

let page: Page; // Declare a shared page reference

test.beforeAll('Open Application Context', async ({ browser }) => {
  // Create a single browser page instance for all tests in this file
  page = await browser.newPage();
  await page.goto("https://www.demoblaze.com/index.html");
});

test.afterAll('Close Application Context', async () => {
  // Clean up the page instance after all tests complete
  await page.close();
});

test.beforeEach('Login to Account', async () => {
  await page.locator('#login2').click();
  await page.locator('#loginusername').fill('pavanol');
  await page.locator('#loginpassword').fill('test@123');
  await page.locator("button[onclick='logIn()']").click();
  await page.waitForTimeout(2000); // Wait for authorization token to settle
});

test.afterEach('Logout from Account', async () => {
  await page.locator('#logout2').click();
});

test.describe('Demoblaze Store Operations', async () => {
  
  test('Find Number of Products', async () => {
    const products = page.locator('#tbodyid .hrefch');
    const count = await products.count();
    console.log('Number of products found:', count);
    await expect(products).toHaveCount(9);
  });

  test('Add Product to Cart', async () => {
    await page.locator("text='Samsung galaxy s6'").click();

    // Register a dialog handler to dismiss the browser alert automatically
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Product added');
      await dialog.accept();
    });

    await page.locator('.btn.btn-success.btn-lg').click();
  });
});
```

---

## 3. Test Annotations

Annotations dictate test running behavior, timeout adjustments, or failure expectations.

### A. `.only()` (Focused Execution)
Runs only the specified test, skipping all other tests in the file or suite:
```typescript
test.only('Run only this test', async ({ page }) => {
  await page.goto('https://www.google.com/');
  await expect(page).toHaveTitle('Google');
});
```

### B. `.skip()` (Static & Conditional Skipping)
*   **Static Skip**: Bypasses the test block completely.
```typescript
test.skip('Skipped test', async ({ page }) => {
  await page.goto('https://www.google.com/');
});
```
*   **Conditional Skip**: Dynamically skips a test at runtime depending on variable/context states (e.g., skip only on Firefox):
```typescript
test('Test skipped on Firefox browser', async ({ page, browserName }) => {
  test.skip(browserName === 'firefox', 'This feature is not supported on Firefox.');
  
  await page.goto('https://www.google.com/');
  await expect(page).toHaveTitle('Google');
});
```

### C. `.fail()` (Expected Failures)
Marks a test as expected to fail. Playwright runs the test:
*   If the test **fails**, it passes the build (recorded as expected failure).
*   If the test **passes**, it fails the build (recorded as an unexpected success).
```typescript
test.fail('Expected to fail due to bug #541', async ({ page }) => {
  await page.goto('https://www.google.com/');
  await expect(page).toHaveTitle('Incorrect Title'); // Fails as expected
});
```

### D. `.fixme()` (Incomplete / Broken Tests)
Marks a test as broken or requiring correction. Unlike `fail()`, **fixme tests are not run at all** (automatically skipped):
```typescript
test.fixme('Broken test to be resolved', async ({ page }) => {
  await page.goto('https://www.google.com/');
  // Code waiting for fixes
});
```

### E. `.slow()` (Timeout Tripling)
Triples the default timeout duration (e.g. from 30s to 90s) for slow operations:
```typescript
test('Heavy calculation test', async ({ page }) => {
  test.slow(); // Multiplies default timeout limit by 3
  await page.goto('https://www.google.com/');
  await expect(page).toHaveTitle('Google');
});
```

### Annotations Comparison Summary

| Annotation | Executed? | Expected Outcome | Use Case |
| :--- | :--- | :--- | :--- |
| `test.only` | **Yes** (others skipped) | Pass | Debugging a single test |
| `test.skip` | **No** | Skipped | Bypassing irrelevant tests (e.g., OS/browser specific) |
| `test.fail` | **Yes** | Fail | Tracking a known bug, expecting failure |
| `test.fixme` | **No** | Skipped | Broken tests that should not execute until fixed |
| `test.slow` | **Yes** | Pass | Extending timeout length for intensive tests |

---

## 4. Test Tagging

Metadata tags classify and filter tests, enabling you to execute targeted subsets (like `@sanity`, `@smoke`, `@regression`) instead of running the entire suite.

### Adding Tags to Tests

#### Method A: Inside the Test Option Object (Recommended)
You can assign tags using the `tag` option in the test declaration:
```typescript
test('Check homepage title', { tag: '@sanity' }, async ({ page }) => {
  await page.goto('https://www.google.com/');
  await expect(page).toHaveTitle('Google');
});

test('Check top recommendations', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
  await page.goto('https://www.google.com/');
  await expect(page.locator("text='Recommendations'")).toBeVisible();
});
```

#### Method B: In the Test Title (Legacy)
Add the tag string directly inside your test description title:
```typescript
test('@regression Check checkout flow', async ({ page }) => {
  await page.goto('https://www.google.com/');
  // Checkout test steps
});
```

### Running Tests by Tags (CLI Filtering)

You filter tagged tests from the command line using the `--grep` and `--grep-invert` flags.

#### 1. Run a single tag
```bash
npx playwright test tests/tagging.spec.ts --grep "@sanity"
```

#### 2. Logical OR (Run either tag)
Executes tests matching `@sanity` OR `@regression`:
```bash
npx playwright test tests/tagging.spec.ts --grep "@sanity|@regression"
```

#### 3. Logical AND (Run tests matching both tags)
Executes tests containing both `@sanity` AND `@regression` (using positive lookaheads in regular expressions):
```bash
npx playwright test tests/tagging.spec.ts --grep "(?=.*@sanity)(?=.*@regression)"
```

#### 4. Logical NOT (Exclude tags)
Executes tests matching `@sanity` but excludes those containing `@regression`:
```bash
npx playwright test tests/tagging.spec.ts --grep "@sanity" --grep-invert "@regression"
```

### Global Tag Configuration in `playwright.config.ts`
You can declare regex tag rules directly inside your configuration file to define default filtering criteria:
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Run sanity tests by default
  grep: /@sanity/, 
  
  // Exclude regression tests by default
  grepInvert: /@regression/,
});
```

---

## 🏋️ Hands-on Lab Assignments

### Exercise 1: Hooks Execution Lifecycle
1. Write a test suite grouped using `test.describe('Lifecycle Suite')`.
2. Configure all four hook types (`beforeAll`, `afterAll`, `beforeEach`, `afterEach`) to log custom statements to the console.
3. Write three simple tests inside the group.
4. Execute the tests and verify that the hook print order matches the standard lifecycle flow (i.e. `beforeAll` runs once, `beforeEach` runs three times).

### Exercise 2: Programmatic Skip and Timeout Adjustment
1. Write a test that runs on multiple browsers.
2. Inside the test, programmatically check the browser engine name.
3. Skip the test dynamically if the engine name is `webkit` (Safari).
4. If the engine name is `chromium`, apply `.slow()` to increase the timeout limit for the test runtime.

### Exercise 3: CLI Tag Filter Matrix
1. Create a spec file `tests/tags-matrix.spec.ts` with 4 tests:
   - Test A: Tagged `@smoke`
   - Test B: Tagged `@regression`
   - Test C: Tagged `@smoke` and `@regression`
   - Test D: Un-tagged.
2. Run the CLI command to execute only the `@smoke` suite.
3. Run the CLI command to execute tests that belong to both `@smoke` and `@regression` (AND condition).
4. Run the CLI command to execute smoke tests, explicitly excluding regression runs.

---

```quiz
{
  "question": "Which hook runs only once before any of the test blocks in a specific describe group execute?",
  "options": [
    "test.beforeEach()",
    "test.beforeAll()",
    "test.describe.before()",
    "test.afterAll()"
  ],
  "answer": 1,
  "explanation": "test.beforeAll() executes exactly once before any test in its scope (file or describe group) is run. test.beforeEach() runs before every individual test."
}
```

```quiz
{
  "question": "If a test marked with test.fail() executes and passes successfully, what is the outcome of the test run?",
  "options": [
    "The test is marked as PASSED",
    "The test is marked as SKIPPED",
    "The test is marked as FAILED in reports",
    "The test is flagged as a Flaky test"
  ],
  "answer": 2,
  "explanation": "A test.fail() annotation expects the test to fail. If it passes, Playwright treats this as an unexpected success and marks the test execution as FAILED in the test suite results."
}
```

```quiz
{
  "question": "Which of the following regex grep queries compiles tests belonging to either @smoke OR @sanity?",
  "options": [
    "npx playwright test --grep \"(?=.*@smoke)(?=.*@sanity)\"",
    "npx playwright test --grep \"@smoke&@sanity\"",
    "npx playwright test --grep \"@smoke|@sanity\"",
    "npx playwright test --grep \"@smoke\" --grep-invert \"@sanity\""
  ],
  "answer": 2,
  "explanation": "The pipe character '|' represents the logical OR operator in regular expressions, executing tests that match either of the specified tags."
}
```
