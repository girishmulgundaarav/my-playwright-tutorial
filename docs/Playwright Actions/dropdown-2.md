---
title: Dropdowns - Part 2
sidebar_position: 3
---

# Dropdowns - Part 2: Custom & Dynamic Components

Modern web applications built with frameworks like React, Vue, Angular, or Tailwind UI rarely use standard HTML `<select>` tags. Instead, they implement custom dropdown components built using `<div>`, `<ul>`, `<li>`, and `<button>` elements to achieve custom styling.

This chapter covers how to automate these advanced dropdowns using web-first locating strategies, keyboard navigation, and debugging techniques.

---

## 1. Traditional vs. Custom Dropdowns

Understanding the differences between standard select tags and custom UI dropdowns dictates which locator strategies you must use:

![Traditional vs. Custom Selection Sequences](/img/dropdown_sequence.png)

---

## 2. Automating Custom Selects & Comboboxes (ARIA Roles)

Modern UI libraries (like Radix UI, Headless UI, React Select, and Material UI) add standard accessibility attributes called **ARIA roles** to make custom elements accessible.

Instead of writing complex CSS paths to locate items in custom dropdown containers, you should use Playwright's **Web-First ARIA Locators** (e.g., `getByRole`).

### Standard HTML Example
```html
<div class="custom-select-wrapper">
  <button id="select-btn" role="combobox" aria-expanded="false" aria-haspopup="listbox">Select Language</button>
  <ul class="select-options-list" role="listbox">
    <li role="option" aria-selected="false">TypeScript</li>
    <li role="option" aria-selected="false">Python</li>
  </ul>
</div>
```

### Playwright Web-First Script
To automate this, click the combobox container to expand it, and click the option based on its role and name:
```typescript
import { test, expect } from '@playwright/test';

test('Select option from custom ARIA combobox', async ({ page }) => {
  await page.goto('https://my-custom-combobox-demo.com/');

  // 1. Locate and click the combobox button
  const combobox = page.getByRole('combobox', { name: 'Select Language' });
  await combobox.click();

  // 2. Select option directly using role="option" and visible text
  const targetOption = page.getByRole('option', { name: 'TypeScript' });
  await targetOption.click();

  // 3. Assert the combobox value has updated
  await expect(combobox).toHaveText('TypeScript');
});
```

---

## 3. Keyboard-Driven Selection

In some applications, clicking custom dropdown options can be unstable because the dropdown menu immediately loses focus and closes (`blur` event) when the mouse pointer moves or clicks.

A highly resilient alternative is to type the search query and use **keyboard emulation** to navigate and select options.

```typescript
test('Keyboard Navigation on Auto-suggest dropdown', async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/');

  // Type query inside the input field
  const input = page.getByRole('textbox', { name: 'Employee Name' });
  await input.fill('John');

  // Wait for the dropdown options list to appear in the DOM
  await page.locator('.oxd-autocomplete-dropdown').waitFor({ state: 'visible' });

  // Navigate options list using arrow keys and select with Enter
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown'); // Move to second suggestion
  await page.keyboard.press('Enter');      // Select the active option
});
```

---

## 4. Advanced Techniques to Inspect Vanishing Elements

One of the biggest struggles in test automation is finding selectors for elements that disappear as soon as you click elsewhere in the browser to inspect them. Use these three professional Chrome DevTools techniques to freeze the UI:

### Technique 1: Freeze via Sources Breakpoint (Recommended)
1. Open Chrome DevTools (`F12`) and navigate to the **Sources** tab.
2. Click the dropdown in your web application to display the options overlay.
3. Press **`F8`** (on Mac: **`Cmd + \`** or **`F8`**) to freeze JavaScript execution immediately.
4. The screen will pause, allowing you to return to the **Elements** panel and inspect the dropdown option tags.

### Technique 2: DOM Breakpoint on Subtree Modifications
Use this if the options list is appended or removed dynamically from the DOM:
1. Open DevTools and go to the **Elements** panel.
2. Locate the parent `div` or `body` element where the dropdown overlay is appended.
3. Right-click the element and select **`Break on`** ➔ **`Subtree modifications`**.
4. Click the dropdown in your app to trigger the menu. The debugger will pause on the line of code appending the elements, freezing the DOM in place.

### Technique 3: Focus Page Emulation
Prevents the browser tab from losing focus (useful when blur events close the dropdown):
1. In DevTools, press **`Ctrl + Shift + P`** (Mac: **`Cmd + Shift + P`**) to open the Command Menu.
2. Type **`Emulate a focused page`** and press Enter.
3. The browser will behave as if it is always focused, keeping dynamic dropdowns open while you click around DevTools.
4. Turn it off by running **`Do not emulate a focused page`**.

---

## 5. Real-World Automation Labs

### 5.1 Lab A: Bootstrap Multi-Select Dropdowns
Unlike standard selects, Bootstrap dropdowns are lists of checkboxes disguised as dropdown options.

```typescript
import { test, expect } from '@playwright/test';

test('Automate Bootstrap Checkbox Dropdown', async ({ page }) => {
  await page.goto('https://jquery-az.com/boots/demo.php?ex=63.0_2');

  // Click the multiselect button container
  await page.locator('button.multiselect').click();

  // Query all option labels inside the container list
  const options = page.locator('ul.multiselect-container li label');
  const count = await options.count();
  console.log(`Dropdown Options Found: ${count}`);

  // Loop through items and select 'Angular' and 'Java'
  for (let i = 0; i < count; i++) {
    const text = await options.nth(i).textContent();
    
    if (text?.includes('Angular') || text?.includes('Java')) {
      const checkbox = options.nth(i).locator('input[type="checkbox"]');
      
      // Only check if it is not checked already
      if (!(await checkbox.isChecked())) {
        await options.nth(i).click();
      }
    }
  }

  // Assert selections are correct
  const activeSelections = page.locator('button.multiselect');
  await expect(activeSelections).toContainText('Java, Angular');
});
```

---

### 5.2 Lab B: Handling Dynamic Auto-Suggest lists (RedBus Example)
Auto-suggest dropdowns generate matches asynchronously as you type.

```typescript
test('Automate Flight/Bus Autocomplete Suggestions', async ({ page }) => {
  await page.goto('https://www.redbus.in/');

  const sourceInput = page.locator('#src');
  
  // 1. Type query in autocomplete input
  await sourceInput.fill('Delhi');

  // 2. Wait for autocomplete suggestions list container to appear
  const listContainer = page.locator('.placeHolderText');
  await expect(listContainer.first()).toBeVisible({ timeout: 5000 });

  // 3. Fetch suggestions count
  const count = await listContainer.count();
  console.log(`Found ${count} location suggestions`);

  // 4. Click specific matching destination
  for (let i = 0; i < count; i++) {
    const text = await listContainer.nth(i).textContent();
    
    if (text?.includes('Delhi Airport')) {
      await listContainer.nth(i).click();
      break;
    }
  }

  // 5. Verify input value reflects selected value
  await expect(sourceInput).toHaveValue(/Delhi Airport/i);
});
```

---

### 5.3 Lab C: Hidden Dropdowns (OrangeHRM Employee Search)
OrangeHRM uses hidden selects where options are dynamically rendered outside the visible panel.

```typescript
test('Handle Hidden Dynamic Dropdowns', async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/');

  // Login
  await page.getByPlaceholder('Username').fill('Admin');
  await page.getByPlaceholder('Password').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();

  // Navigate to PIM
  await page.getByRole('link', { name: 'PIM' }).click();

  // Locate and click the Employment Status custom select box
  const employmentStatusSelect = page.locator('//label[text()="Employment Status"]/parent::div/following-sibling::div');
  await employmentStatusSelect.click();

  // Locate options list
  const options = page.locator('.oxd-select-dropdown .oxd-select-option');
  await expect(options.first()).toBeVisible();

  const count = await options.count();
  console.log(`Found ${count} employment statuses`);

  // Iterate to find and click target status
  for (let i = 0; i < count; i++) {
    const text = await options.nth(i).textContent();
    if (text === 'Full-Time Permanent') {
      await options.nth(i).click();
      break;
    }
  }

  // Verify selections
  await expect(employmentStatusSelect).toContainText('Full-Time Permanent');
});
```

---

## 6. Text Retrieval Comparison

When querying option contents programmatically, selecting the correct text method prevents flakiness:

| Property | `textContent()` | `innerText()` |
| :--- | :--- | :--- |
| **Visibility Requirement** | None (Retrieves hidden elements) | Strict (Visible text only) |
| **Whitespace Handling** | Preserved exactly as declared in DOM | Normalized (Strips tabs & line-breaks) |
| **Hidden Markup Text** | Yes (includes `<span style="display:none">`) | No (ignores hidden subtree nodes) |
| **Common Use Case** | Fetching option attributes & list data | Asserting user-facing select displays |

---

## 🧠 Knowledge Check

```quiz
{
  "question": "Which DevTools keyboard shortcut pauses JavaScript execution immediately to inspect vanishing elements?",
  "options": [
    "F5",
    "F8 (or Cmd + \\ on Mac)",
    "F12",
    "Ctrl + Shift + P"
  ],
  "answer": 1,
  "explanation": "Pressing F8 or Cmd + \\ in Chrome DevTools pauses JavaScript execution, preventing menus from closing when focus changes."
}
```

```quiz
{
  "question": "What is the recommended web-first locator strategy to locate options inside custom modern combobox elements?",
  "options": [
    "page.locator('.select-options-list li')",
    "page.getByRole('option', { name: 'Option Name' })",
    "page.locator('//div[@class=\"option\"]')",
    "page.getByLabel('Option Name')"
  ],
  "answer": 1,
  "explanation": "getByRole('option', { name: '...' }) is the modern, web-first approach for testing custom accessible selects (like Radix, React Select) because it mirrors accessibility trees."
}
```
