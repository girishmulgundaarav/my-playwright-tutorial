---
sidebar_position: 1
---

# Getting Started with Playwright

Welcome to the complete Playwright tutorial! This guide will introduce you to Playwright, help you set up your environment, and run your first automated test.

---

## 📖 What is Playwright?
Playwright is a modern, open-source framework created by Microsoft for automating web browsers. 

To understand why it is so popular, let's first define **End-to-End (E2E) testing**:
> [!NOTE]
> **End-to-End (E2E) testing** is a method used to test a website's entire user journey from start to finish. Instead of checking small isolated pieces of code, an E2E test simulates a real human user interacting with your website in a browser—like clicking buttons, filling out forms, navigating pages, and checking that the correct results appear.

Playwright is primarily distributed as a **Node.js** library. Node.js is simply a tool that lets JavaScript code run directly on your computer (for example, in your terminal) instead of only running inside a web browser.

---

## ✨ Key Features (Explained Simply)
* **Cross-Browser & Cross-Platform** 🌐: Test your site on Chromium (Chrome, Edge), Firefox, and WebKit (Safari) using Windows, macOS, or Linux. Write your test once, and run it on all of them.
* **Cross-Language Support** 🗣️: Write tests in your preferred language—JavaScript, TypeScript, Java, Python, or C#.
* **Mobile Web Emulation** 📱: Simulate mobile devices like an iPhone or Android screen to test responsive designs without needing physical phones.
* **API Testing** 🔌: Test backend API endpoints alongside your frontend browser actions.
* **Auto-Waiting** ⏱️: Playwright automatically checks if a button or link is visible, enabled, and ready before clicking it. This means you do not have to write manual delays (like "sleep for 3 seconds") in your code!
* **Handles Complex Elements** 🧩: Works seamlessly with modern web structures like iframes and Shadow DOMs.
* **Parallel Execution** 🚀: Run multiple tests at the exact same time inside isolated environments to speed up test execution.

---

## 🛠️ Powerful Built-in Tools for Beginners
Playwright comes with tools that help you learn and write tests visually:
* **Playwright Inspector** 🕵️: A debugging tool that lets you pause your test run and step through it line-by-line to see what is happening in the browser.
* **Code Generation (Codegen)** 📹: A tool that opens a browser, records your manual clicks and typing, and instantly writes the test script for you.
* **Trace Viewer** 🔍: A "time-travel" debugger that captures screenshots, network requests, and console logs from your test run so you can inspect failures after they happen.

---

## 📝 TypeScript vs. JavaScript (Made Easy)
While Playwright supports both, this tutorial primarily focuses on **TypeScript**. 

Here is the difference in simple terms:
* **JavaScript** is dynamically typed. This means you can create a variable as a number (e.g., `let score = 10;`) and later accidentally put text into it (e.g., `score = "ten";`). The browser won't stop you until the code runs and crashes.
* **TypeScript** is a stricter version of JavaScript. If you say a variable is a number (e.g., `let score: number = 10;`), VS Code will immediately flag an error if you try to assign text to it.

> [!TIP]
> **Why TypeScript is perfect for beginners:** Because TypeScript has strict rules, your code editor (like VS Code) understands exactly what you are trying to write. It will show you **instant auto-suggestions** (autocomplete) and highlight typos *before* you even run your test!

---

## ✅ Step-by-Step Installation via VS Code
We will use the official VS Code extension to install and manage our tests visually.

### Phase 1: Prerequisites
Before installing Playwright, make sure your system has Node.js installed:
1. Open your terminal (`Ctrl + ` ` on Windows/Linux or `Cmd + ` ` on Mac).
2. Type `node -v` and press Enter.
3. Make sure you see **v18** or higher. If not, download the latest version from [nodejs.org](https://nodejs.org/).

### Phase 2: Installing the VS Code Extension
1. Click the **Extensions** icon on the left sidebar of VS Code (it looks like four blocks).
2. In the search bar, type **"Playwright Test"** (make sure it is published by Microsoft).
3. Click the blue **Install** button.

### Phase 3: Initializing Your Project
Now, let's create the necessary Playwright folders and files:
1. Open the Command Palette using `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac).
2. Type **"Test: Install Playwright"** and select it.
3. A menu will appear at the top. Check the boxes for the browsers you want (Chromium, Firefox, WebKit).
4. Choose **TypeScript** when asked for the language.
5. Click OK. Playwright will automatically download the browsers and set up your project.
6. Verify that a `playwright.config.ts` file and a `tests/` folder have appeared in your project.

### Phase 4: Running Your First Test
1. Click on the **Testing** icon on the left sidebar (it looks like a chemistry lab beaker).
2. Expand the test list to find `example.spec.ts`.
3. Click the green **Play** button next to it to run the test.
4. **💡 Playwright Tip:** At the bottom of the Testing panel, check the box that says **"Show browser"**. Now, when you run the test, the browser will open automatically so you can watch the test actions live!
5. To see a detailed report of the test run, run this command in your terminal:
   ```bash
   npx playwright show-report
   ```

---

## 🚀 Playwright Test Execution Lifecycle

Understanding how Playwright boots, runs, and reports on tests helps you write better scripts. Here is the visual step-by-step lifecycle of a test execution:

![Playwright Test Execution Lifecycle](/img/playwright_test_lifecycle.png)

---

## 🧩 Anatomy of a Playwright Test
Every basic Playwright test is written using the same simple structure. Let's look at this skeleton code:

```typescript
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  // 1. Navigate to a URL
  await page.goto('https://playwright.dev/');

  // 2. Check if the page title contains a keyword
  await expect(page).toHaveTitle(/Playwright/);
});
```

### Line-by-Line Breakdown:
1. **`import { test, expect }`**: We import the core functions from Playwright. `test` allows us to define our test blocks, and `expect` lets us verify if things match our expectations (assertions).
2. **`test('has title', async ({ page }) => { ... })`**:
   - `'has title'`: The friendly name of our test.
   - `async`: Marks the function as asynchronous. Webpages take time to load, so `async` tells JavaScript that actions inside this test will involve waiting.
   - `({ page })`: This is a **Fixture**. Think of `page` as a fresh, clean browser tab that Playwright opens for this test automatically. It prevents tests from sharing cookies or session history.
3. **`await page.goto(...)`**: Directs the browser tab to visit the specified website URL.
   - `await`: Pauses execution and tells Playwright: "Wait for the webpage to finish loading before moving to the next line."
4. **`await expect(page).toHaveTitle(/Playwright/)`**: An **assertion**. It checks if the browser tab's title contains the word "Playwright". If it does, the test passes!

---

```quiz
{
  "question": "Which of the following browsers does Playwright NOT support out of the box?",
  "options": [
    "Chromium (Chrome/Edge)",
    "Firefox",
    "Internet Explorer 11",
    "WebKit (Safari)"
  ],
  "answer": 2,
  "explanation": "Playwright supports modern rendering engines (Chromium, Firefox, WebKit). It does not support legacy browsers like Internet Explorer."
}
```

```quiz
{
  "question": "In Playwright, what is the `{ page }` parameter passed into a test function?",
  "options": [
    "A configuration settings file",
    "A brand new, isolated browser tab (Fixture) provided automatically for the test",
    "A physical browser application like Google Chrome",
    "A screenshot image file of the webpage"
  ],
  "answer": 1,
  "explanation": "The `{ page }` parameter is a built-in fixture that represents a fresh, isolated page/tab. Playwright automatically creates it before each test starts and cleans it up afterward, ensuring test isolation."
}
```