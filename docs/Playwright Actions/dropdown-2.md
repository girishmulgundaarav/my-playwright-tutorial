---
title: Dropdowns - Part 2
sidebar_position: 3
---

# Dropdowns - Part 2

Modern web applications often use advanced dropdown components that do not rely on standard HTML `<select>` tags. In this chapter, we will learn how to handle Hidden, Bootstrap, and Auto-Suggest dropdowns using Playwright.

---

## 1. Types of Advanced Dropdowns

### 1.1 Bootstrap Dropdowns
Bootstrap dropdowns are built using standard HTML elements like `<div>`, `<button>`, `<ul>`, and `<li>` instead of `<select>` tags. 
*   **Challenge:** The standard `selectOption()` method does not work on them.
*   **Solution:** Click the dropdown button to expand the options, locate the list items, loop through them, and click the target option.

### 1.2 Hidden Dropdowns
Hidden dropdown elements are dynamically added or removed from the DOM when they are clicked. If you try to inspect them normally, they disappear as soon as focus is lost.
*   **Challenge:** Hard to inspect or find selectors for the options.
*   **Solution:** Freeze the browser using debugging tools to inspect the elements.

### 1.3 Auto-Suggest / Auto-Complete
Auto-suggest fields display list options dynamically as you type (e.g., Google Search, flight bookings like RedBus).
*   **Challenge:** Options are populated asynchronously based on search query.
*   **Solution:** Use `fill()` to type, wait for suggestion elements to appear, loop through elements, and click the matching item.

---

## 2. Techniques to Inspect Hidden Options

To locate and interact with hidden dropdown elements, use one of the following methods in Chrome DevTools:

### Technique 1: SelectorsHub Debugger
1. Open the **SelectorsHub** tab in DevTools.
2. Click the **Debugger** button (represented by a pause/debugger icon).
3. Click the dropdown in your application within 5 seconds.
4. The debugger will freeze the screen, allowing you to inspect the dropdown list items.

### Technique 2: Focus Page Emulation in Chrome DevTools
1. Press `F12` to open DevTools, then press `Ctrl + Shift + P` (or `Cmd + Shift + P` on Mac) to open the Command Menu.
2. Type `emulate a focused page` and press Enter.
3. Click on the dropdown in the UI. It will remain open even if you click away in the DOM pane to inspect selectors.
4. To turn it off, open the command menu again and type `Do not emulate a focused page`.

---

## 3. Comparing Text Retrieval: `textContent()` vs `innerText()`

When selecting dynamically rendered dropdown text, choosing the right method is critical:

| Feature | `textContent()` | `innerText()` |
| :--- | :--- | :--- |
| **Visibility matters?** | No (Reads hidden text) | Yes (Reads visible text only) |
| **Whitespace?** | Preserved exactly as-is | Normalized (Spaces and line breaks removed) |
| **Hidden elements?** | Included | Excluded |
| **Use case** | Parsing raw DOM text | Validating user-visible text |

### Comparison Example
Suppose we have the following HTML markup:
```html
<div id="demo">
  Welcome
  <span style="display:none">To Playwright</span>
</div>
```

*   `textContent()` returns: `"  Welcome\n  To Playwright\n"` (includes hidden text and whitespace).
*   `innerText()` returns: `"Welcome"` (excludes hidden text).

---

## 4. Code Implementation Examples

### 4.1 Handling Bootstrap Dropdowns
In this example, we click the dropdown button to display the options, locate the list, and select the item.

```javascript
import { test, expect } from '@playwright/test';

test('Handle Bootstrap Dropdown', async ({ page }) => {
  await page.goto('https://jquery-az.com/boots/demo.php?ex=63.0_2');

  // 1. Click the dropdown button to show options
  await page.locator('.multiselect').click();

  // 2. Locate all options in the list
  const options = await page.locator('ul.multiselect-container li label');
  const count = await options.count();
  console.log('Total options:', count);

  // 3. Loop through and select 'Angular'
  for (let i = 0; i < count; i++) {
    const text = await options.nth(i).textContent();
    console.log('Option text:', text);
    
    if (text?.includes('Angular') || text?.includes('Java')) {
      await options.nth(i).click();
    }
  }
  
  await page.waitForTimeout(2000);
});
```

---

### 4.2 Handling Hidden Dropdowns
Here, we interact with a hidden dropdown where option lists disappear on blur (e.g., OrangeHRM dropdowns).

```javascript
test('Handle Hidden Dropdown', async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');

  // Login
  await page.locator('[name="username"]').fill('Admin');
  await page.locator('[name="password"]').fill('admin123');
  await page.locator('button[type="submit"]').click();

  // Navigate to PIM
  await page.locator('//span[text()="PIM"]').click();

  // Click the hidden dropdown (e.g., Employment Status)
  await page.locator('//label[text()="Employment Status"]/parent::div/following-sibling::div').click();
  await page.waitForTimeout(1000);

  // Locate the dynamically generated list items
  const options = await page.locator('.oxd-select-dropdown .oxd-select-option');
  const count = await options.count();
  console.log('Total statuses found:', count);

  for (let i = 0; i < count; i++) {
    const text = await options.nth(i).textContent();
    console.log('Status option:', text);
    if (text === 'Full-Time Permanent') {
      await options.nth(i).click();
      break;
    }
  }
  
  await page.waitForTimeout(2000);
});
```

---

### 4.3 Handling Auto-Suggest / Auto-Complete Dropdowns
Here we type a keyword, wait for the search autocomplete suggestions to appear, and select the desired item.

```javascript
test('Handle Auto-Suggest Dropdown', async ({ page }) => {
  await page.goto('https://www.redbus.in/');

  // Type search input
  await page.locator('#src').fill('Delhi');
  
  // Wait for suggestions to render
  await page.waitForSelector('.placeHolderText');

  // Retrieve suggestion list items
  const suggestions = await page.locator('.placeHolderText');
  const count = await suggestions.count();
  console.log('Suggestions count:', count);

  for (let i = 0; i < count; i++) {
    const text = await suggestions.nth(i).textContent();
    console.log('Suggestion:', text);
    if (text?.includes('Delhi Airport')) {
      await suggestions.nth(i).click();
      break;
    }
  }
  
  await page.waitForTimeout(2000);
});
```

---

## 5. Summary of Essential Selectors and Methods

| Method / Property | Return Type | Description |
| :--- | :--- | :--- |
| `page.locator()` | `Locator` | Defines a Playwright locator to query elements. |
| `click()` | `Promise<void>` | Simulates clicking on a element/item. |
| `fill(text)` | `Promise<void>` | Inputs string text inside text elements. |
| `count()` | `Promise<number>` | Returns count of matching elements. |
| `nth(index)` | `Locator` | References element by index (0-based). |
| `textContent()` | `Promise<string>` | Retrieves element's text content (includes hidden elements). |
| `innerText()` | `Promise<string>` | Retrieves rendered text content (visible text only). |

---
*Reference: [Pavan Online Trainings](https://www.pavanonlinetrainings.com) | [SDET Pavan YouTube](https://www.youtube.com/@sdetpavan)*
