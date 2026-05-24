---
sidebar_position: 2
---

# Playwright Setup and Kick Start

This guide covers the prerequisites, installation steps, architectural breakdown, and writing/running your very first test script in Playwright.

---

## 🛠️ Prerequisites for Installing Playwright
Before installing Playwright, ensure you have these ready:
1. **Node.js**: The core runtime engine required to run JavaScript/TypeScript-based tools and libraries on your computer.
2. **Visual Studio Code (VS Code)**: A free, powerful code editor recommended for writing and debugging tests.
3. **Project Folder**: A dedicated workspace folder on your computer to store your test files.

---

## 📥 Installing Playwright & Project Structure
If you prefer using the terminal (Command Line Interface), open your terminal inside your project folder and run the initialization command:

```bash
npm init playwright@latest
```

### 📋 CLI Prompts You Will See:
When you run this command, Playwright will ask you a few quick setup questions:
1. **Choose between TypeScript or JavaScript**: Select **TypeScript** (highly recommended for auto-suggestions).
2. **Name of your tests folder**: Press Enter to accept the default (`tests`).
3. **Add a GitHub Actions workflow?**: Type `y` or `n` (choosing `y` adds a configuration file to run your tests automatically on GitHub whenever you push code).
4. **Install Playwright browsers?**: Type `y` to download Playwright's custom Chromium, Firefox, and WebKit browser engines automatically.

Once the command finishes, it creates the following files:
* `package.json` – The project's manifest file. It lists the libraries your project uses and lets you create terminal command shortcuts.
* `playwright.config.ts` – The **Control Room** of Playwright. This file holds all your configuration settings.
* `tests/` – The default directory where you will write all your test scripts.
* `tests-examples/` – Contains default sample test files created by Microsoft for reference.

To verify that Playwright installed correctly and check the version, run:
```bash
npx playwright --version
```

---

### ⚙️ Typical Playwright Configuration Settings
Your `playwright.config.ts` file manages settings for the test runner. Here are the fields you will see:
* `testDir`: Tells Playwright where to look for your test files (e.g., `./tests`).
* `timeout`: The maximum time (in milliseconds) a single test is allowed to run before failing (default is 30,000ms or 30 seconds).
* `retries`: How many times a failed test is automatically re-run to bypass temporary network glitches.
* `workers`: How many tests can run in parallel at the same time.
* `use`: Global options applied to all tests, such as `headless: true` (run tests in the background) or `screenshot: 'only-on-failure'`.

---

## 🏛️ Playwright Architecture: Deep Dive

Understanding Playwright's system architecture helps explain why it is faster and more reliable than older tools. Here is the visual layout of Playwright's client-server structure:

![Playwright System Architecture](/img/playwright_architecture.png)

### 1. Client-Server Architecture (WebSockets vs. HTTP)
Older automation tools (like Selenium) communicate by sending individual **HTTP requests** for every single action (e.g., one request to click, one to type). 
* **The HTTP Problem:** HTTP is stateless. Opening and closing a new connection for every action introduces significant delay (network overhead).
* **The WebSocket Solution:** Playwright opens a single, persistent **WebSocket** connection. Think of this as establishing a **live phone call** that stays open the entire time your test runs. Commands are sent back and forth instantly over this single connection, making tests run incredibly fast.

### 2. Browser vs. Browser Context vs. Page
Playwright structures browser execution in three distinct layers:

* **Browser Instance:** Represents the physical browser application (Chromium, Firefox, WebKit) launched by Playwright. Launching a browser takes time and computer memory (RAM).
* **Browser Context:** An isolated session inside the browser instance. 
  * **The Incognito Analogy:** Think of a Browser Context as opening a new **Incognito Window**. It has its own isolated cookies, local storage, and cache.
  * **Why they are awesome:** Contexts take milliseconds to open and use almost zero memory. This allows Playwright to run tests in parallel across separate contexts without them interfering with each other (e.g., logging in as an Admin in one window and a Guest in another).
* **Page:** Represents a single browser tab or window inside a Browser Context.

Here is a visual hierarchy showing how these execution layers are organized:

![Playwright Context Hierarchy](/img/playwright_context_hierarchy.png)

---

## ✍️ Writing Your First Playwright Test

### Step 1: Create a New Test File
Inside the `tests/` directory, create a new file named `FirstTest.spec.ts`.

### Step 2: Import Playwright Module
Add the following line at the top of your test file to import the core testing features:
```typescript
import { test, expect } from '@playwright/test';
```

> [!NOTE]
> **JavaScript vs. TypeScript Imports:** Modern TypeScript projects use the `import` statement. If you are working in an older JavaScript-only project, you might see the CommonJS `require` syntax instead: `const { test, expect } = require('@playwright/test');`.

### Step 3: Create a Test Block
Write your test block below the import:

```typescript
test('Verify page title and URL', async ({ page }) => { 
  // 1. Navigate to the website
  await page.goto('https://example.com'); 

  // 2. Retrieve page title
  const title = await page.title(); 
  console.log('Page Title:', title);

  // 3. Make Assertions
  // Check the title string matches exactly
  expect(title).toBe('Example Domain');
  
  // Check the URL matches using a page assertion
  await expect(page).toHaveURL('https://example.com/');
});
```

> [!WARNING]
> **Common Mistake:** Avoid trying to use `toHaveURL` directly on raw text strings (e.g., `expect(title).toHaveURL('...');`). 
> * `title` is a simple text string returned by `page.title()`. Use `.toBe(...)` for simple strings.
> * `toHaveURL` and `toHaveTitle` are special Playwright assertions that must be used on the `page` or a locator object (e.g., `await expect(page).toHaveURL(...)`).

---

## ⏳ Understanding `async` and `await`
Loading web pages and clicking buttons takes time, so Playwright performs actions asynchronously.
* Playwright commands return **Promises** (a promise that the browser will complete the action).
* **`await`**: Tells Playwright to pause and wait for that specific action to finish before running the next line of code.
* **`async`**: Used to mark the outer function block, letting JavaScript know it is allowed to use `await` inside it.

| Keyword | Description |
| :--- | :--- |
| `async` | Declares a function that performs asynchronous actions in the background. |
| `await` | Pauses script execution until the browser action finishes. |

---

## 🛠️ Recording and Debugging Tools

Playwright provides built-in utilities to record and debug scripts in real-time.

### 1. Playwright Codegen (Code Generation)
The Codegen tool opens a browser window and automatically records your interactions, translating them into script code:

Run this command to start recording:
```bash
npx playwright codegen https://example.com
```
* Click buttons, fill forms, and navigate the browser.
* Copy the generated code from the **Playwright Inspector** panel and paste it into your test file.

### 2. Playwright Inspector
The Playwright Inspector helps you debug tests step-by-step.
* Insert `await page.pause();` in your test script where you want the execution to stop:
  ```typescript
  await page.goto('https://example.com');
  await page.pause(); // The browser will pause here
  ```
* Run the test in debug mode using:
  ```bash
  npx playwright test FirstTest.spec.ts --debug
  ```

---

## 🏃 Running Tests: CLI Commands Reference

Here are the terminal commands categorized by use case to run your tests:

### Running Tests
| Command | Description |
| :--- | :--- |
| `npx playwright test` | Runs all tests in headless mode (background). |
| `npx playwright test --headed` | Runs all tests and opens the physical browsers. |
| `npx playwright test FirstTest.spec.ts` | Runs only the tests inside a specific file. |
| `npx playwright test --project=chromium` | Runs tests only on the Chromium browser. |

### Debugging & Reports
| Command | Description |
| :--- | :--- |
| `npx playwright show-report` | Opens the HTML test execution report. |
| `npx playwright test --debug` | Opens the Playwright Inspector debugger. |
| `npx playwright test --ui` | Launches the interactive UI test runner. |

---

```quiz
{
  "question": "What is a Browser Context in Playwright?",
  "options": [
    "A configuration settings file for the test runner",
    "An isolated, lightweight session inside a browser instance, similar to an Incognito window",
    "A server that controls the WebSocket connection",
    "The terminal console where you run commands"
  ],
  "answer": 1,
  "explanation": "A Browser Context is an isolated, lightweight session inside the browser instance. It requires very little memory and launches instantly, allowing full test isolation."
}
```

```quiz
{
  "question": "What does the `await` keyword do in a Playwright script?",
  "options": [
    "It tells Playwright to pause and wait for the action to finish before running the next line",
    "It stops the execution of the test forever",
    "It speeds up the browser loading speed",
    "It creates a screenshot of the page"
  ],
  "answer": 0,
  "explanation": "`await` pauses execution of the current function until the asynchronous page action completes, preventing the code from running ahead before the browser is ready."
}
```

---
*Reference: [Pavan Online Trainings](https://www.pavanonlinetrainings.com) | [SDET Pavan YouTube](https://www.youtube.com/@sdetpavan)*
