---
title: Dialogs & Iframes
sidebar_position: 7
---

# Automating Dialogs & Iframes

In web applications, dialogs (JavaScript alerts) and iframes (embedded documents) are separate from the main page context. Playwright provides specialized listeners and selectors to handle them.

---

## 1. Browser Dialogs (Alerts, Confirms, Prompts)

Browser dialogs are native OS-level pop-ups triggered by JavaScript calls like `alert()`, `confirm()`, or `prompt()`.

> [!NOTE]
> **Auto-Dismiss Behavior:** By default, Playwright **auto-dismisses** all native dialogs during test execution. 
> To interact with, inspect, or input text into a dialog, you must register a **dialog event listener** (`page.on('dialog', ...)` *before* executing the action that triggers the dialog.

### 🔍 Dialog Helper Methods
*   `dialog.type()`: Returns the string type (`'alert'`, `'confirm'`, or `'prompt'`).
*   `dialog.message()`: Returns the text message displayed inside the pop-up.
*   `dialog.defaultValue()`: Returns the default input value of a prompt field.
*   `dialog.accept(text?)`: Clicks the "OK" / confirmation button, optionally passing text input for prompt forms.
*   `dialog.dismiss()`: Clicks the "Cancel" button.

### 🔍 Dialog Code Examples
```javascript
import { test, expect } from '@playwright/test';

test('Simple Alert Box', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');

  // 1. Register listener before click
  page.on('dialog', async (dialog) => {
    expect(dialog.type()).toBe('alert');
    expect(dialog.message()).toBe('I am an alert box!');
    await dialog.accept(); // Click OK
  });

  // 2. Trigger dialog
  await page.locator("#alertBtn").click();
});

test('Confirmation Dialog (OK/Cancel)', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');

  page.on('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm');
    expect(dialog.message()).toBe('Press a button!');
    await dialog.accept(); // Clicks OK (use .dismiss() for Cancel)
  });

  await page.locator("#confirmBtn").click();
  await expect(page.locator("#demo")).toHaveText("You pressed OK!");
});

test('Prompt Dialog with Input Text', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');

  page.on('dialog', async (dialog) => {
    expect(dialog.type()).toBe('prompt');
    expect(dialog.message()).toBe('Please enter your name:');
    expect(dialog.defaultValue()).toBe('Harry Potter');
    await dialog.accept('John'); // Type 'John' and click OK
  });

  await page.locator("#promptBtn").click();
  await expect(page.locator("#demo")).toHaveText("Hello John! How are you today?");
});
```

---

## 2. Accessing HTML Iframes

An **iframe** (inline frame) is an HTML document embedded inside a parent document. It has its own isolated DOM tree.

```
Main Page (page)
 ├── Iframe 1 (frameLocator / frame)
 └── Iframe 2 (frameLocator / frame)
```

Playwright offers two approaches to locate and interact with elements inside iframes:

### 2.1 Approach A: `page.frameLocator(selector)` (Recommended)
This is the modern and preferred approach. It returns a `FrameLocator` object, which supports Playwright's **auto-waiting** and element action chaining.

```javascript
test('Iframe interaction using frameLocator', async ({ page }) => {
  await page.goto('https://ui.vision/demo/webtest/frames/');

  // Locate the frame and input field, then fill it
  const input = page.frameLocator('frame[src="frame_1.html"]').locator('input[name="mytext1"]');
  await input.fill('Welcome');
  await expect(input).toHaveValue('Welcome');
});
```

### 2.2 Approach B: `page.frame(options)`
This approach queries the page's frame array and returns a `Frame` object or `null`. It is useful when locating frames by their specific **URLs** or **names**.

```javascript
test('Iframe interaction using page.frame', async ({ page }) => {
  await page.goto('https://ui.vision/demo/webtest/frames/');

  const frame2 = page.frame({ url: 'https://ui.vision/demo/webtest/frames/frame_2.html' });
  if (frame2) {
    await frame2.locator('input[name="mytext2"]').fill('Suneel');
    await expect(frame2.locator('input[name="mytext2"]')).toHaveValue('Suneel');
  } else {
    throw new Error('Frame 2 not found.');
  }
});
```

---

## 3. Nested Child Frames

If an iframe contains another nested iframe, you cannot target the child directly from the parent page. You must retrieve the parent frame first, and then access its nested frames using `.childFrames()`.

```
Main Page
 └── Parent Frame (Frame 3)
      └── Child Frame [0] (Google Form)
```

### 🔍 Code Example: Automating a Nested Form
```javascript
test('Nested Child Frame Validation', async ({ page }) => {
  await page.goto('https://ui.vision/demo/webtest/frames/');

  // 1. Get the parent frame (Frame 3)
  const frame3 = page.frame({ url: 'https://ui.vision/demo/webtest/frames/frame_3.html' });
  
  if (frame3) {
    // Write inside the parent frame's input field
    await frame3.locator('[name="mytext3"]').fill('You are in Frame 3 - Teal');

    // 2. Fetch the nested child frames array
    const childFrames = frame3.childFrames();
    const childFormFrame = childFrames[0]; // First child frame (contains Google Form)

    // 3. Interact with elements inside the nested form frame
    await childFormFrame.getByRole('radio', { name: 'Hi, I am the UI.Vision IDE' }).click();
    await childFormFrame.getByRole('checkbox', { name: 'Form Autofilling' }).click();
    
    // Select option in dropdown
    await childFormFrame.getByRole('option', { name: 'Choose' }).click();
    await page.waitForTimeout(1000);
    await childFormFrame.getByRole('option', { name: 'Yes' }).click();

    // Click Next
    await childFormFrame.getByRole('button', { name: 'Next' }).click();

    // Fill form answers
    const shortText = childFormFrame.getByRole('textbox', { name: 'Enter a short text' });
    await shortText.fill('We are here');
    await expect(shortText).toHaveValue('We are here');

    // Submit form
    await childFormFrame.getByRole('button', { name: 'Submit' }).click();
    
    // Confirm confirmation message inside child frame
    const successMsg = await childFormFrame.locator('.vHW8K').innerText();
    expect(successMsg).toContain('Thank you for testing the UI');
  } else {
    throw new Error('Frame 3 not found.');
  }
});
```

---

## 4. Link Clicks and DOM Navigation inside Iframes

When you click links inside an iframe that load new documents, the navigation occurs strictly **within the boundary of that iframe**. You can continue targeting the updated page by querying the same frame object.

```javascript
test('Frame 5: Click link and verify navigation logo', async ({ page }) => {
  await page.goto('https://ui.vision/demo/webtest/frames/');
  const frame5 = page.frame({ url: 'https://ui.vision/demo/webtest/frames/frame_5.html' });

  if (frame5) {
    await frame5.locator('input[name="mytext5"]').fill('playwright');
    
    // Click link that redirects within the frame context
    await frame5.locator('a[href="https://a9t9.com"]').click();
    await page.waitForTimeout(2000); // Wait for redirect to load

    // Verify visibility of new logo inside the frame
    const logo = frame5.locator('img.responsive-img').first();
    await expect(logo).toBeVisible();
  } else {
    throw new Error('Frame 5 not found.');
  }
});
```

---
*Reference: [Pavan Online Trainings](https://www.pavanonlinetrainings.com) | [SDET Pavan YouTube](https://www.youtube.com/@sdetpavan)*
