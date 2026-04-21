---
sidebar_position: 3
---

# 🚀 Advanced Tools & Assertions

Now that you know how to locate elements and perform actions, let's explore how to automate test creation, verify results, and debug failures like a pro.

## 🤖 Part 1: Codegen (The Test Recorder)
Codegen is a powerful tool that records your interactions in the browser and generates the test code for you.

### ✅ Checklist: Using Codegen
* **Launch the Generator** 🚀: Run `npx playwright codegen [url]` in your terminal.
* **Interact with the Site** 🖱️: Click, type, and navigate as a user would.
* **Generate Assertions** ✅: Use the "Assert" icons in the toolbar to verify text or visibility.
* **Copy & Paste** 📋: Copy the generated code from the Playwright Inspector window into your test file.

---

## ✅ Part 2: Assertions & Logic
Assertions are the "checks" that determine if a test passes or fails. In Playwright, we use the `expect` library.

| What to check | Code Snippet |
| :--- | :--- |
| **Visibility** 👁️ | `await expect(locator).toBeVisible();` |
| **Text Content** 📝 | `await expect(locator).toHaveText('Welcome');` |
| **URL Path** 🌐 | `await expect(page).toHaveURL(/dashboard/);` |
| **Enabled State** 🔘 | `await expect(button).toBeEnabled();` |

---

## 🔍 Part 3: The Trace Viewer
The Trace Viewer is a "Time Machine" for your tests. It records everything that happened so you can investigate failures.

### ✅ Checklist: Investigating a Failure
* **Enable Tracing** ⚙️: In `playwright.config.ts`, set `trace: 'on'`.
* **Run Your Test** ▶️: Execute your tests normally.
* **Open the Trace** 📂: Run `npx playwright show-trace [path-to-results.zip]`.
* **Inspect the Timeline** 🕰️: Hover over the timeline to see snapshots of the "Before," "Action," and "After" states for every step.

---

## 💡 Pro Tip: Self-Healing & Retries
Playwright is designed to be "Flake-free."
1. **Auto-Waiting**: It waits for elements to be ready before acting.
2. **Retries**: You can configure Playwright to automatically re-run a failed test to see if it was a temporary glitch.