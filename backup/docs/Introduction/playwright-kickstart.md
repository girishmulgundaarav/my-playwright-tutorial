---
sidebar_position: 2
---

# 🚀 Playwright Setup and Kick Start

This guide covers the prerequisites, installation steps, and writing your very first test script in Playwright.

## 🛠️ Prerequisites for Installing Playwright
Before installing Playwright, ensure you have the following ready:
1. **Node.js**: Required for running JavaScript-based projects.
2. **Visual Studio Code (VS Code)**: A recommended code editor for development.
3. **Project Folder**: Create a dedicated folder and open it using VS Code to begin development.

## 📥 Installing Playwright
Open the terminal in your project folder and run the initialization command:

```bash
npm init playwright@latest
```

This command initializes a Playwright project and creates the following essential files and folders:
* `package.json` – Manages project dependencies and scripts.
* `playwright.config.js` (or `.ts`) – Contains Playwright configuration settings.
* `tests/` – Directory for organizing your test files.

To check the installed version of Playwright, run:
```bash
npx playwright --version
```

## ✍️ Writing Your First Playwright Test

### Step 1: Create a New Test File
Inside the `tests/` directory, create a new file, for example, `FirstTest.spec.ts`.

### Step 2: Import Playwright Module
Add the following line at the top of your test file:
```typescript
const { test, expect } = require('@playwright/test');
```
* `test` is used to define test cases.
* `expect` is used for assertions.

### Step 3: Create a Test Block
Write your test using the `test` function:

```typescript
test('Verify page title', async ({ page }) => { 
  await page.goto('https://example.com'); 
  const title = await page.title(); 
  
  // Note: The assertion below is based on the presentation notes.
  // In practice, a title assertion often looks like: expect(page).toHaveTitle(/Example Domain/);
  expect(title).toHaveURL('Example Domain'); 
});
```

## ⏳ Understanding async and await
Many Playwright APIs such as `page.goto()`, `page.title()`, and `page.url()` return Promises because they involve asynchronous browser operations. To handle them correctly:
* Use `await` to pause execution until the Promise resolves.
* Mark the function as `async` to allow the use of `await`.

| Keyword | Description |
|---|---|
| `async` | Declares a function that returns a Promise and can use `await` |
| `await` | Pauses the function execution until the Promise resolves |

## 🏃 Running Tests and Debugging
Here are common commands to run and debug your Playwright tests:

| Command | Description |
|---|---|
| `npx playwright test` | Runs all tests on all browsers in headless mode. |
| `npx playwright test --headed` | Runs all tests in headed (non-headless) mode. |
| `npx playwright show-report` | Opens the HTML test report. |
| `npx playwright test mytest.spec.ts` | Runs a specific test file. |
| `npx playwright test --project=chromium --headed mytest.spec.ts` | Runs a specific test file only on Chromium in headed mode. |
| `npx playwright test mytest1.spec.ts mytest2.spec.ts` | Runs multiple specified test files. |
| `npx playwright test -g "test title"` | Runs the test(s) that match the given title. |
| `npx playwright test --project=chromium` | Runs all tests on the Chromium browser only. |
| `npx playwright test --debug` | Runs tests in debug mode. |
| `npx playwright test example.spec.ts --debug` | Debugs a specific test file. |
| `npx playwright test mytest.spec.ts --ui` | Run the test in UI Mode. |

## 🏛️ Key Components of Playwright Architecture
Understanding the underlying architecture of Playwright will help you leverage its power more effectively.

1. **Client or Language Binding**: Playwright supports multiple programming languages and environments like Java, JavaScript, TypeScript, Python, etc.
2. **Web Socket**: Playwright uses a web socket protocol to interact with the client and server. In web socket protocol, you can send back-to-back requests without terminating the connection. This helps Playwright perform test execution at a much faster pace than other automation tools.
3. **Browser Context**: It's an isolated instance of a browser that manages its storage, session IDs, cookies, caches, etc. This feature sets Playwright apart from other automation tools by enabling the parallel execution of test scripts, which speeds up the testing process.

![Playwright Architecture](/img/playwright-architecture.png)

4. **WebSocket vs. HTTP Request/Response**: As we know, standard HTTP uses a request-response model with stateless single interactions, meaning that after each request & response, the connection is terminated. Establishing a new connection between the client and server for each command makes it much slower. Playwright makes use of web sockets instead of standard HTTP. Once a connection is established between the client and server via web socket protocol, we can send back-to-back requests without terminating the connection. All test cases can use the same connection for their execution, and once execution is completed, the connection is closed.
5. **Real-time Use Cases**: Projects with modern applications that require multiple browser contexts, network controls, and fast/reliable cross-browser testing should opt for the Playwright tool. Some real-time project examples include Live trading applications, Gaming, Slack, and GitHub.
