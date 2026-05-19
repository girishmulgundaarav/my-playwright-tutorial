---
sidebar_position: 2
---

# Playwright Setup and Kick Start

This guide covers the prerequisites, installation steps, architectural breakdown, and writing/running your very first test script in Playwright.

---

## 🛠️ Prerequisites for Installing Playwright
Before installing Playwright, ensure you have the following ready:
1. **Node.js**: Required for running JavaScript/TypeScript-based projects.
2. **Visual Studio Code (VS Code)**: A recommended IDE for test development.
3. **Project Folder**: Create a dedicated workspace directory and open it in VS Code to begin.

---

## 📥 Installing Playwright & Project Structure
Open the terminal in your project folder and run the initialization command:

```bash
npm init playwright@latest
```

This command initializes a Playwright project and creates the following structure:
*   `package.json` – Manages project dependencies and execution scripts.
*   `playwright.config.ts` (or `.js`) – Contains Playwright configuration settings.
*   `tests/` – Directory for organizing your test files.
*   `tests-examples/` – Contains default sample test files.

To check the installed version of Playwright, run:
```bash
npx playwright --version
```

### ⚙️ Typical Playwright Configuration Settings
Your `playwright.config.ts` handles the test runner settings:
*   `testDir`: Specifies the directory containing the tests.
*   `timeout`: Maximum time (in milliseconds) a single test is allowed to run.
*   `retries`: Number of times a failed test is automatically re-run.
*   `workers`: Number of parallel test execution threads.
*   `use`: Global options applied to all browsers (e.g., `headless: true`, `viewport`, `screenshot: 'only-on-failure'`).

---

## 🏛️ Playwright Architecture: Deep Dive

Understanding the underlying architecture of Playwright helps you write highly efficient, parallel test suites.

```
┌─────────────────────────────────┐
│     Client (Test Runner)        │
│  Java / JS / TS / Python / C#   │
└────────────────┬────────────────┘
                 │
                 │ WebSocket Connection (Fast, Bi-directional)
                 ▼
┌─────────────────────────────────┐
│        Playwright Server        │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│        Browser Instance         │
│  Chromium  │  Firefox  │ WebKit  │
└─────────────────────────────────┘
```

### 1. Client-Server Architecture
Unlike older automation tools like Selenium (which communicates using HTTP API requests for every command), Playwright uses a single **WebSocket** connection.
*   **The HTTP Problem:** HTTP is stateless. After sending a request (e.g. click a button) and receiving a response, the connection closes. Establishing a new HTTP connection for each line of code introduces significant execution overhead.
*   **The WebSocket Solution:** Playwright opens a persistent WebSocket connection that stays alive throughout the execution of your test script. Commands are sent back-and-forth instantly over the same connection, making test execution extremely fast.

### 2. Browser vs. Browser Context vs. Page
Playwright structures browser execution in three distinct layers to enable high-speed parallel execution:

*   **Browser Instance:** Represents the physical browser process (Chromium, Firefox, or WebKit) launched by Playwright. Launching a browser is resource-heavy.
*   **Browser Context:** An isolated session inside the browser instance. Think of it as a separate "Incognito Window".
    *   Each context has its own cookies, localStorage, session storage, and cache.
    *   Contexts are extremely lightweight to create (takes milliseconds) and require almost no memory overhead.
    *   This isolation allows you to run multiple tests in parallel across different contexts without them interfering with each other.
*   **Page:** Represents a single tab or window inside a Browser Context.

### 3. Real-world Use Cases
Playwright's robust context isolation makes it perfect for testing:
*   **Multiple User Sessions:** Logging in as an "Admin" in one context and a "Guest" in another to verify access rights.
*   **Live Updates:** Trading dashboards, chat clients (like Slack), and collaboration tools (like GitHub) that utilize active WebSocket servers.

---

## ✍️ Writing Your First Playwright Test

### Step 1: Create a New Test File
Inside the `tests/` directory, create a new file named `FirstTest.spec.ts`.

### Step 2: Import Playwright Module
Add the following line at the top of your test file:
```javascript
const { test, expect } = require('@playwright/test');
```
*   `test`: Used to declare test blocks and assertions.
*   `expect`: Used for making validation assertions.

### Step 3: Create a Test Block
Write your test block:

```javascript
test('Verify page title and URL', async ({ page }) => { 
  // 1. Navigate to the website
  await page.goto('https://example.com'); 

  // 2. Retrieve page title
  const title = await page.title(); 
  console.log('Page Title:', title);

  // 3. Make Assertions
  // Assert the title string
  expect(title).toBe('Example Domain');
  
  // Assert the URL using a locator assertion
  await expect(page).toHaveURL('https://example.com/');
});
```

> [!WARNING]
> **PDF Note Correction:** The presentation slide notes say `expect(title).toHaveURL('Example Domain');`. This is syntactically incorrect. 
> *   `title` is a raw string returned by `page.title()`.
> *   `toHaveURL` is a Playwright-specific assertion matcher meant to be used on the `page` or a locator object (e.g., `await expect(page).toHaveURL(...)`).
> *   To assert the title string, use standard Jest-like syntax: `expect(title).toBe('Example Domain')` or `await expect(page).toHaveTitle('Example Domain')`.

---

## ⏳ Understanding `async` and `await`
Web interactions (navigating to pages, retrieving page titles, clicking buttons) are asynchronous and involve wait times between the client and browser.
*   Playwright APIs return JavaScript **Promises** that resolve when the browser completes the request.
*   **`await`**: Pauses the execution of the test script until the Promise resolves.
*   **`async`**: Used to mark the wrapper function as asynchronous, allowing the use of `await` inside it.

| Keyword | Description |
| :--- | :--- |
| `async` | Declares a function that returns a Promise and supports asynchronous operations. |
| `await` | Suspends execution of the current function until the target Promise is resolved or rejected. |

---

## 🛠️ Recording and Debugging Tools

Playwright provides powerful built-in utilities to record and debug scripts in real-time.

### 1. Playwright Codegen (Code Generation)
The Codegen tool opens a browser window and automatically records your interactions, translating them into ready-to-use script files.

Run the following command to start recording:
```bash
npx playwright codegen https://example.com
```
*   Interact with the website (click inputs, submit buttons, navigate).
*   Copy the generated code from the **Playwright Inspector** window and paste it directly into your test file.

### 2. Playwright Inspector
The Playwright Inspector helps you debug tests step-by-step.

*   To pause a test at a specific line and open the Inspector, insert:
    ```javascript
    await page.pause();
    ```
*   Run the test with the `--debug` flag:
    ```bash
    npx playwright test FirstTest.spec.ts --debug
    ```
*   Use the debugger controls in the browser to step over, pause, resume, and inspect locator targets.

---

## 🏃 Running Tests: CLI Commands Reference

Use these terminal commands to execute and inspect test suites:

| Command | Description |
| :--- | :--- |
| `npx playwright test` | Runs all tests in headless mode (no browser window is shown). |
| `npx playwright test --headed` | Runs all tests in headed mode (shows the browser UI). |
| `npx playwright show-report` | Opens the local HTML test execution report. |
| `npx playwright test mytest.spec.ts` | Executes tests inside a specific file. |
| `npx playwright test --project=chromium --headed mytest.spec.ts` | Runs a specific test on Chromium browser only in headed mode. |
| `npx playwright test mytest1.spec.ts mytest2.spec.ts` | Executes multiple specified test files together. |
| `npx playwright test -g "test title"` | Runs only the test cases matching the given title string. |
| `npx playwright test --project=chromium` | Runs all tests on the Chromium browser only. |
| `npx playwright test --debug` | Executes tests in interactive debugging mode. |
| `npx playwright test mytest.spec.ts --ui` | Launches the interactive Playwright UI Runner. |

---
*Reference: [Pavan Online Trainings](https://www.pavanonlinetrainings.com) | [SDET Pavan YouTube](https://www.youtube.com/@sdetpavan)*
