---
sidebar_position: 1
---

# 🚀 Getting Started with Playwright

Welcome to the complete Playwright tutorial! This guide will help you set up your environment and run your first automated test.

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