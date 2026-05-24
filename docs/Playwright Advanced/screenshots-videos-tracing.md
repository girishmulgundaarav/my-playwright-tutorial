---
title: Screenshots, Videos & Tracing
sidebar_position: 2
---

# Playwright Screenshots, Videos, Tracing & Handling Flaky Tests

In automated web testing, capturing execution artifacts like screenshots, video recordings, and trace files is essential for diagnosing test failures. These artifacts provide visual evidence and event logs, transforming ambiguous failures into easily debuggable issues.

This guide details how to capture page, full-page, and element-specific screenshots, record video execution, configure and navigate the Trace Viewer, and manage flaky tests using auto-retries in Playwright.

---

## 1. Capturing Screenshots

Screenshots capture the visual state of the application at a specific point in time during the test run. Playwright supports page-level, full-page, and element-specific screenshot capturing.

### A. Viewport (Page) Screenshot
Captures the current visible area of the browser:
```typescript
test('capture page screenshot', async ({ page }) => {
  await page.goto('https://demowebshop.tricentis.com/');
  const timestamp = Date.now();
  await page.screenshot({ path: `screenshots/homepage-${timestamp}.png` });
});
```

### B. Full-Page Screenshot
Scrolls through and captures the entire scrollable height of the web page:
```typescript
test('capture full page screenshot', async ({ page }) => {
  await page.goto('https://demowebshop.tricentis.com/');
  const timestamp = Date.now();
  await page.screenshot({ 
    path: `screenshots/fullpage-${timestamp}.png`, 
    fullPage: true 
  });
});
```

### C. Element Screenshot
Focuses on and captures only the bounding box of a target locator:
```typescript
test('capture element screenshot', async ({ page }) => {
  await page.goto('https://demowebshop.tricentis.com/');
  const timestamp = Date.now();
  
  // Method 1: Capture using locator reference
  const logo = page.locator("img[alt='Tricentis Demo Web Shop']");
  await logo.screenshot({ path: `screenshots/logo-${timestamp}.png` });

  // Method 2: Inline locator screenshot
  await page.locator('.product-grid.home-page-product-grid')
            .screenshot({ path: `screenshots/featuredproducts-${timestamp}.png` });
});
```

### D. Global Screenshot Settings
To avoid adding manual screenshots in every test, configure automatic screenshots in `playwright.config.ts`:
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    // Capture screenshots under specific conditions
    screenshot: 'only-on-failure', 
  },
});
```

| Config Option | Description |
| :--- | :--- |
| `'off'` | Do not capture screenshots (default). |
| `'on'` | Capture a screenshot after every single test. |
| `'only-on-failure'` | Capture a screenshot only when a test fails. |
| `'on-first-failure'` | Capture a screenshot only on the first failure of a test (not subsequent retries). |

### E. Masking Sensitive Elements (Official Playwright API)
When taking screenshots of pages containing sensitive user information (like API keys, passwords, or credit card details), you can mask specific elements. This overlays a pink box over the target element to obscure it in the generated image:
```typescript
test('screenshot with element masking', async ({ page }) => {
  await page.goto('https://demowebshop.tricentis.com/');
  await page.screenshot({
    path: 'screenshots/masked-homepage.png',
    mask: [page.locator('.newsletter-card'), page.locator('.search-box')]
  });
});
```

:::tip Output Location
By default, automatic screenshots are stored inside the `test-results` folder and are linked directly in the Playwright HTML test report.
:::

---

## 2. Video Recording

Recording video files helps developers and QA engineers see the exact interaction steps leading up to an error.

### Configuring Video Capture in `playwright.config.ts`
Video capturing is disabled by default and can be configured globally in your configuration file:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    video: 'retain-on-failure', 
  },
});
```

| Config Option | Description |
| :--- | :--- |
| `'off'` | Do not record videos. |
| `'on'` | Record videos for all tests. |
| `'retain-on-failure'` | Record videos for all tests, but delete them for successful runs, keeping only the videos for failed tests. |
| `'on-first-retry'` | Record video only when a test fails and is retried for the first time. |

### Custom Video Dimensions
You can customize the resolution of the recorded videos in `playwright.config.ts` by specifying the `size` property under `video`:
```typescript
export default defineConfig({
  use: {
    video: {
      mode: 'retain-on-failure',
      size: { width: 640, height: 480 } // Custom width and height
    }
  }
});
```

:::warning Resource Usage
Recording videos for every successful test block uses a high amount of CPU and disk space. In CI/CD pipelines, utilizing `'retain-on-failure'` or `'on-first-retry'` is recommended.
:::

---

## 3. Tracing and the Trace Viewer

Playwright Tracing records a detailed execution history of the test run, capturing actions, network calls, console logs, source code steps, and full-page snapshots. This trace is packaged into a `.zip` file and opened in a graphical tool called the **Trace Viewer**.

```
Test Run (Tracing Active) ──> trace.zip ──> Opened in Trace Viewer (GUI)
                                              ├── Actions Timeline
                                              ├── Source Code View
                                              ├── Call Log & Parameters
                                              └── DOM Snapshot per Step
```

### Enabling Tracing

#### 1. In `playwright.config.ts` (Recommended)
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    trace: 'on-first-retry', // Options: 'off', 'on', 'retain-on-failure', 'on-first-retry'
  },
});
```

#### 2. Via Command Line Interface (CLI)
Override the configuration parameters dynamically during a run:
```bash
npx playwright test tests/example.spec.ts --trace on
```

#### 3. Programmatically in Test Code
You can record traces for specific code sections or custom browser contexts:
```typescript
import { test, expect } from '@playwright/test';

test('tracing test', async ({ page, context }) => {
  // Start tracing before starting operations
  await context.tracing.start({ screenshots: true, snapshots: true });

  await page.goto('https://www.demoblaze.com/index.html');
  await page.getByRole('link', { name: 'Log in' }).click();
  await page.locator('#loginusername').fill('pavanol');
  await page.locator('#loginpassword').fill('test@123'); 
  await page.getByRole('button', { name: 'Log in' }).click();
  
  await expect(page.getByRole('link', { name: 'Log out' })).toBeVisible();

  // Stop tracing and save the file
  await context.tracing.stop({ path: 'trace.zip' });
});
```

### Viewing Trace Files
There are three main ways to open and interact with a generated `trace.zip`:

1. **HTML Report View**: Open the report (`npx playwright show-report`). Failed tests with active tracing will have a **Traces** section at the bottom. Click the thumbnail to open the interactive viewer.
2. **CLI Utility**: Run the following command pointing to the trace file:
   ```bash
   npx playwright show-trace trace.zip
   ```
3. **Web Interface**: Navigate to [trace.playwright.dev](https://trace.playwright.dev/) and drag-and-drop your `trace.zip` file directly. (The trace file remains local to your browser and is not uploaded to external servers).

Here is what the Trace Viewer interface looks like during analysis:

![Playwright Trace Viewer](/img/trace_viewer.png)

### Troubleshooting: "Report Port in Use" Error
If you launch the report viewer and see:
`Error: listen EADDRINUSE: address already in use ::1:9323`

This occurs because port `9323` is already bound to a running instance.

* **Solution 1 (Kill Current PID)**:
  * Find the PID: `lsof -i :9323` (macOS/Linux) or `netstat -ano | findstr :9323` (Windows)
  * Kill it: `kill -9 <PID>` (macOS/Linux) or `taskkill /PID <PID> /F` (Windows)
* **Solution 2 (Use custom port)**:
  * Direct the report to bind to a different port:
    ```bash
    npx playwright show-report --port=9324
    ```

---

## 4. Handling Flaky Tests & Retries

### What is a Flaky Test?
A flaky test is a test that fluctuates between passing and failing across test runs, even when there are no changes to the test code or application code.

Common causes include:
* Slow server responses or high network latency.
* Dynamic content delays (elements loading asynchronously).
* Animations blocking user interactions.
* Third-party API instability.

```
                    ┌───────► Pass (Stable)
                    │
Test Execution ─────┼───────► Fail (Broken Code)
                    │
                    └───────► Fail ──► Retry ──► Pass (Flaky Test)
```

### Configuring Auto-Retries
Playwright resolves flakiness by rerunning failed tests a set number of times. If a test fails initially but passes on a retry, Playwright registers it as **Flaky** in reports rather than as a hard failure.

#### A. Configure in `playwright.config.ts`
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Retry failed tests up to 3 times
  retries: 3, 
});
```

#### B. Configure via CLI
Specify retries during execution:
```bash
# Run all tests with 3 retries
npx playwright test --retries=3

# Run a specific file with 2 retries
npx playwright test tests/flakytest.spec.ts --retries=2
```

### Conditionally Handling Retries in Code (`testInfo.retry`)
Sometimes, a flaky test needs extra cleanup or custom configurations during retry attempts. Playwright exposes the `testInfo` object in the test callback, letting you inspect the current retry count:
```typescript
test('flaky test with conditional retry logic', async ({ page }, testInfo) => {
  await page.goto('https://demowebshop.tricentis.com/');
  
  if (testInfo.retry > 0) {
    console.log(`Running retry attempt #${testInfo.retry}. Clearing local storage...`);
    await page.evaluate(() => localStorage.clear());
  }

  // Rest of the test steps
});
```

---

:::note Python / Pytest Reruns Comparison
If you are developing Playwright tests using Python instead of TypeScript, auto-retry logic is not built directly into the standard `pytest` library. You must install a third-party plugin to achieve similar retry mechanics.

**Prerequisites & Setup for Python (Pytest):**
1. Install the rerun failures plugin:
   ```bash
   pip install pytest-rerunfailures
   ```
2. Execute your tests using the `--reruns` and `--reruns-delay` flags:
   ```bash
   pytest tests/test_flaky.py --headed --reruns 3 --reruns-delay 2
   ```
This instructs pytest to retry failed tests up to 3 times, waiting 2 seconds between each attempt.
:::

---

## 🏋️ Hands-on Lab Assignments

### Exercise 1: Custom Artifact Capturing
1. Write a script that opens the Demo Web Shop (`https://demowebshop.tricentis.com/`).
2. Capture a standard viewport screenshot.
3. Capture a full-page screenshot.
4. Locate the main catalog category slider or featured products block, and capture an element-specific screenshot.
5. Save the output files inside a folder named `screenshots/` with dynamic timestamp suffixes.

### Exercise 2: Programmatic Trace Logging
1. Write a script that logs in to Demoblaze (`https://www.demoblaze.com/index.html`) using a programmatic browser context.
2. Initialize tracing inside the context using `context.tracing.start()`.
3. Perform standard actions: click "Log in", fill username and password, and submit the login modal.
4. Stop the trace and save it as `trace.zip`.
5. Open the trace file using `npx playwright show-trace trace.zip` and inspect the Actions timeline.

### Exercise 3: Simulating Flakiness and Retries
1. Create a file `tests/flakytest.spec.ts` with a test designed to fail on incorrect credentials.
2. Configure the test file or run it via the terminal with `--retries=2`.
3. Verify that Playwright attempts the test 3 times total (1 initial + 2 retries) before declaring it failed in the output report.

---

```quiz
{
  "question": "Which of the screenshot config options captures a image ONLY when a test block fails?",
  "options": [
    "screenshot: 'on'",
    "screenshot: 'only-on-failure'",
    "screenshot: 'on-first-failure'",
    "screenshot: 'off'"
  ],
  "answer": 1,
  "explanation": "The 'only-on-failure' option captures screenshots only when a test run terminates in a failure. 'on-first-failure' captures on the first failure but will not capture again during retries."
}
```

```quiz
{
  "question": "Which of the following is NOT an interactive feature available inside the Playwright Trace Viewer?",
  "options": [
    "Inspecting console log outputs for each step",
    "Editing and hot-reloading the live test source code during playback",
    "Inspecting the DOM structure of the page at the moment of action execution",
    "Reviewing HTTP request/response payloads"
  ],
  "answer": 1,
  "explanation": "The Trace Viewer is a static analysis tool that displays historical snapshots and event logs. It does not allow live editing, hot-reloading, or execution of the source code."
}
```

```quiz
{
  "question": "In a Python (Pytest) environment, what extra step is required to achieve test retries?",
  "options": [
    "Configure pytest.ini with retries = 3",
    "Import a custom retry decorator in each test file",
    "Install the 'pytest-rerunfailures' plugin and run with the --reruns flag",
    "Python Playwright does not support test retries"
  ],
  "answer": 2,
  "explanation": "Standard pytest does not include a retry mechanism. To implement retries, you must install the 'pytest-rerunfailures' package and execute the command with the --reruns flag."
}
```
