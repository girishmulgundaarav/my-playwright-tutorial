---
sidebar_position: 1
---

# Getting Started with Playwright

Welcome to the complete Playwright tutorial! This guide will introduce you to Playwright, help you set up your environment, and run your first automated test.

## 📖 What is Playwright?
Playwright is an open-source framework created by Microsoft (released in 2020) for automating web browsers. It enables reliable end-to-end testing and provides a dedicated API for testing and interacting with web APIs. It is primarily distributed as a **Node.js** library. *(Note: Node.js is an open-source, cross-platform JavaScript runtime environment that executes JavaScript code outside of a web browser).*

## ✨ Key Features
* **Cross-Browser & Cross-Platform** 🌐: Works with Chromium (Chrome, Edge), Firefox, and WebKit (Safari) across Windows, Mac, and Linux.
* **Cross-Language Support** 🗣️: Write tests in JavaScript, TypeScript, Java, Python, or C#.
* **Mobile Web Testing** 📱: Supports mobile testing for Chrome (Android) and Safari (iOS).
* **API Testing** 🔌: Includes built-in capabilities, allowing you to test backend APIs alongside your frontend.
* **Automatic Waiting (Auto-wait)** ⏱️: Waits for elements to be ready before performing actions, significantly reducing test flakiness.
* **Handles Complex Elements** 🧩: Easily interacts with Shadow DOM elements.
* **Parallel Execution** 🚀: Supports running tests simultaneously in multiple browser instances for faster execution.
* **Rich Reporting** 📊: Built-in reporters like HTML, JSON, and JUnit, plus support for third-party tools like Allure.

## 🛠️ Powerful Built-in Tools
* **Playwright Inspector** 🕵️: Helps debug tests by showing click points and verifying locators in real-time.
* **Code Generation (Codegen)** 📹: Records your browser actions and instantly converts them into test scripts in any supported language.
* **Trace Viewer** 🔍: Captures screenshots, records videos, retries flaky tests, and logs steps automatically to investigate test failures.

## 📝 TypeScript vs. JavaScript
While Playwright supports both, this tutorial primarily focuses on **TypeScript**. 
* **JavaScript** is dynamically typed (e.g., `let age = 30; age = "thirty";`). It complies with ECMAScript standards.
* **TypeScript** is a statically typed superset of JavaScript (e.g., `let age: number = 30;`). Microsoft can add any new features to it as long as the generated JavaScript is ECMAScript-compliant, making it extremely feature-full and robust.

---

## ✅ Phase 1: Prerequisites
Before installing Playwright, ensure your system is ready.

* **Check Node.js** 🖥️: Open your terminal (`Ctrl+` ` / `Cmd+` `) and type `node -v`.
* **Verify Version** 🟢: Ensure you see **v18** or higher.

## ✅ Phase 2: Installing the VS Code Extension
We will use the official extension to manage tests visually.

* **Open Extensions** 🧩: Click the Extensions icon in the VS Code sidebar.
* **Search** 🔍: Type **"Playwright Test"** (published by Microsoft).
* **Install** 📥: Click the blue Install button.

## ✅ Phase 3: Initializing Your Project
Now, let's create the necessary Playwright files in your folder.

* **Open Command Palette** ⌨️: Press `Ctrl+Shift+P` / `Cmd+Shift+P`.
* **Run Install Command** 🚀: Type **"Test: Install Playwright"** and select it.
* **Select Browsers** 🌐: Choose Chromium, Firefox, and WebKit.
* **Verify Files** ✨: Ensure `playwright.config.ts` and a `tests/` folder appear.

## ✅ Phase 4: Your First Test Run
Let's see Playwright in action using the example test provided.

* **Open Testing View** 🧪: Click the beaker icon on the left sidebar.
* **Run the Test** ▶️: Click the **Play** button next to `example.spec.ts`.
* **View Report** 📊: Run `npx playwright show-report` in the terminal to see results.

---

## 🧩 Understanding the Magic
When you ran that test, three important things happened:

1. **Headless Mode** 🎭: The browser ran in the background to save speed.
2. **Auto-Waiting** ⏱️: Playwright waited for elements to load automatically.
3. **HTML Reporting** 📊: A full dashboard was created to track the pass/fail status.

## ✍️ Basic Scripting Structure
Every Playwright test follows this standard "Skeleton":

```javascript
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  // 1. Navigate to a URL
  await page.goto('[https://playwright.dev/](https://playwright.dev/)');

  // 2. Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});
```

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