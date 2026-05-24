---
title: Visual & Accessibility Testing
sidebar_position: 7
---

# Visual & Accessibility Testing

Functional tests verify that an application's logic works, but they don't ensure that the user interface looks correct or remains accessible to users with disabilities. Playwright addresses this by supporting **Visual Regression Testing** and **Accessibility (A11y) Audits**.

---

## 1. Quality Verification Pipelines

The following diagram illustrates how Playwright runs dual pipelines to verify visual representation and accessibility compliance:

![Playwright Dual Verification Pipelines](/img/playwright_visual_accessibility.png)

---

## 2. Visual Regression Testing

Visual testing compares live page screenshots with baseline "golden" images stored in your repository. If a layout shift, color change, or broken component alters the rendering by even a single pixel, the comparison fails.

### A. Screenshot Assertions

Playwright provides two main methods to compare screenshots:

#### 1. Web-First Assertion (`toHaveScreenshot`) - *Recommended*
The modern approach. It automatically awaits page stability, disables animations, hides caret cursors, and captures screenshots:

```typescript
import { test, expect } from '@playwright/test';

test('Visual Test: Homepage Layout', async ({ page }) => {
  await page.goto('https://demowebshop.tricentis.com/');
  
  // Compares the live page to the saved baseline image
  await expect(page).toHaveScreenshot('homepage.png');
});
```

#### 2. Raw Buffer Matcher (`toMatchSnapshot`)
An alternative approach that compares binary image buffers directly. You must capture the screenshot buffer manually:

```typescript
test('Visual Test: Raw Buffer Matcher', async ({ page }) => {
  await page.goto('https://demowebshop.tricentis.com/');
  
  // Manually take screenshot and match against baseline
  expect(await page.screenshot()).toMatchSnapshot('homepage-raw.png');
});
```

---

### B. Element-Level Snapshot Comparison

To prevent false failures caused by dynamic header widgets or advertisements, you can target a specific, stable element for visual testing:

```typescript
test('Visual Test: Header Logo Element', async ({ page }) => {
  await page.goto('https://demowebshop.tricentis.com/');
  
  const logo = page.locator("img[alt='Tricentis Demo Web Shop']");
  
  // Verify element-level rendering
  await expect(logo).toHaveScreenshot('logo.png');
});
```

---

### C. Snapshot Management & Updates

When you run a visual test for the first time:
1. Playwright will fail the test and report that no baseline screenshot exists.
2. It will save the captured screenshot as a baseline inside a `__screenshots__` directory in your test folder.
3. Commit this baseline image to your Git repository.

When making intentional UI changes:
Update the golden baseline images by running tests with the `--update-snapshots` flag:
```bash
npx playwright test --update-snapshots
```

---

### D. Advanced Configuration & Tolerances

You can configure thresholds in `playwright.config.ts` or inline in your test assertions:

```typescript
await expect(page).toHaveScreenshot('homepage.png', {
  // Mask dynamic elements (draws a solid colored box over them)
  mask: [page.locator('.dynamic-carousel-banner')],
  
  // Sensitivity threshold: 0 (most sensitive) to 1 (least sensitive)
  threshold: 0.2,
  
  // Maximum number of pixels allowed to differ
  maxDiffPixels: 100,
  
  // Maximum ratio of differing pixels compared to the total
  maxDiffPixelRatio: 0.05
});
```

---

## 3. Accessibility Testing (A11y)

Accessibility testing ensures your application is usable by people with disabilities by checking compliance with WCAG (Web Content Accessibility Guidelines) standards.

Playwright integrates with **Axe-core** (an industry-standard accessibility engine) via the `@axe-core/playwright` package.

### A. Setup & Installation
Install the required adapter dependency in your project:
```bash
npm install @axe-core/playwright
```

---

### B. Running a Basic Scan
Use `AxeBuilder` to analyze the page and assert that no accessibility violations are found:

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('A11y Test: W3C Homepage Accessibility Scan', async ({ page }, testInfo) => {
  await page.goto('https://www.w3.org');

  // Run the Axe-core accessibility scan
  const scanResults = await new AxeBuilder({ page }).analyze();

  // Attach raw JSON results to the Playwright HTML report
  await testInfo.attach('accessibility-scan-results', {
    body: JSON.stringify(scanResults, null, 2),
    contentType: 'application/json',
  });

  // Verify that there are zero violations
  expect(scanResults.violations.length).toEqual(0);
});
```

---

### C. Advanced Accessibility Customization

You can scope your accessibility checks to target specific guidelines or ignore known legacy issues.

#### 1. Scan for Specific WCAG Standards
Filter scans using accessibility tags (e.g., WCAG 2.0 Level AA, WCAG 2.1 Level AA):
```typescript
const scanResults = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  .analyze();
```

#### 2. Disable Specific Rules
If your team is working on fixing a known issue (like color contrast), you can temporarily disable that rule to prevent tests from failing:
```typescript
const scanResults = await new AxeBuilder({ page })
  .disableRules(['color-contrast', 'duplicate-id'])
  .analyze();
```

#### 3. Scope Scans to Specific DOM Elements
Restrict scanning to a main content panel or exclude sections with dynamic content:
```typescript
const scanResults = await new AxeBuilder({ page })
  .include('#main-content-panel')  // Only scan this container
  .exclude('#ad-banner')           // Do not scan this element
  .analyze();
```

---

## 🏋️ Hands-on Lab Assignments

### Exercise 1: Masking Dynamic Content
1. Create a test file named `visual-masking.spec.ts`.
2. Navigate to a page with dynamic widgets (like `https://demowebshop.tricentis.com/`).
3. Write a visual test for the homepage but mask the search bar element.
4. Run the test and inspect the captured baseline screenshot to verify the search bar is covered by a solid mask.

### Exercise 2: WCAG 2.1 Compliance Scan
1. Install `@axe-core/playwright` in your environment.
2. Create a test file named `accessibility-audit.spec.ts`.
3. Configure `AxeBuilder` to scan `https://demowebshop.tricentis.com/` targeting only `'wcag21aa'` rules.
4. Log any violations to the console and attach the JSON reports to your test execution report.

---

```quiz
{
  "question": "What is the primary benefit of using await expect(page).toHaveScreenshot() over expect(await page.screenshot()).toMatchSnapshot()?",
  "options": [
    "It converts images to PDF format automatically",
    "It is a web-first assertion that automatically awaits page stability, ignores cursors, and retries the assertion if it initially fails",
    "It runs the test in headed mode automatically",
    "It disables JavaScript on the target page before capturing the screenshot"
  ],
  "answer": 1,
  "explanation": "`toHaveScreenshot` is a web-first assertion. It automatically handles wait states and animations, and retries the screenshot comparison to reduce test flakiness."
}
```

```quiz
{
  "question": "Which flag is used to update golden baseline screenshots during test execution?",
  "options": [
    "--update-golden",
    "--save-snapshots",
    "--update-snapshots",
    "--reset-baselines"
  ],
  "answer": 2,
  "explanation": "The `--update-snapshots` flag tells Playwright to recapture and overwrite the saved baseline images in your `__screenshots__` directories."
}
```

```quiz
{
  "question": "How can you temporarily ignore a specific accessibility rule (like color contrast) in your Axe tests?",
  "options": [
    "AxeBuilder.ignoreRules(['color-contrast'])",
    "AxeBuilder.disableRules(['color-contrast'])",
    "AxeBuilder.skip('color-contrast')",
    "new AxeBuilder({ page, skipRules: ['color-contrast'] })"
  ],
  "answer": 1,
  "explanation": "The `.disableRules(['rule-id'])` method on `AxeBuilder` allows you to exclude specific accessibility rules from the scan."
}
```
