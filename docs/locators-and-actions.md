---
sidebar_position: 2
---

# 🎯 Locators & User Actions

Finding an element is only half the battle. Once you find a button or input, you need to interact with it. This guide covers how to identify elements and perform actions like a real user.

## 🔎 Part 1: Recommended Locators
Playwright recommends using "User-Visible" attributes because they are resilient to changes in code.

* **getByRole()** 🎭: The strongest locator. Finds elements by their semantic role (e.g., `button`, `heading`, `checkbox`).
* **getByText()** 📝: Finds elements by the exact text shown on the screen.
* **getByLabel()** 🏷️: Targets form fields by the text in their associated `<label>`.
* **getByPlaceholder()** 📥: Targets input fields by their hint text.

## 🖱️ Part 2: Performing Actions
Once you have located an element, you can perform an action on it.

| Action | Code Example |
| :--- | :--- |
| **Click** | `await page.getByRole('button').click();` |
| **Type/Fill** | `await page.getByPlaceholder('Email').fill('hello@test.com');` |
| **Check** | `await page.getByRole('checkbox').check();` |
| **Hover** | `await page.getByText('Menu').hover();` |

## 🚨 Part 3: "Emergency" Selectors
When a website lacks good roles or labels, you may need to use developer-facing selectors. Use these sparingly!

### 🎨 CSS Selectors
Targets elements based on classes, IDs, or tags.
* **Syntax:** `await page.locator('.submit-btn').click();`

### 🏗️ XPath
Targets elements based on the XML path of the document.
* **Syntax:** `await page.locator('xpath=//div/button[2]').click();`

---

## ✅ Checklist: Writing an Interactive Test
* **Identify the Goal** 🎯: What do you want the user to do? (e.g., Log in).
* **Locate the Input** 📥: Use `getByLabel` or `getByPlaceholder` for the username.
* **Perform the Action** ⌨️: Use `.fill('my-password')` for the password field.
* **Submit** 🚀: Use `getByRole('button', { name: 'Login' }).click()`.