---
title: Playwright Actions
sidebar_position: 1
---

# Element Interactions & Playwright Actionability

In modern web testing, automating user interactions requires more than simply triggering click or type events. Web pages are dynamic: buttons animate, overlays load asynchronously, and elements can be temporarily disabled or hidden.

To handle these challenges, Playwright uses **Actionability Checks**—an automated check system that ensures elements are ready for interaction before any action is executed.

---

## 1. Playwright Auto-Waiting & Actionability Pipeline

Before Playwright clicks, fills, checks, or interacts with any locator, it runs an internal pipeline of checks. If any check fails, Playwright will continuously retry the pipeline until it passes or the action times out (default is 30 seconds).

The following flowchart visualizes the sequence of actionability checks executed for a standard interaction (like a `.click()`):

![Playwright Actionability Checks Pipeline](/img/playwright_actionability_checks.png)

### The 6 Actionability Checks Explained:

1. **Attached**: The element must be attached to the DOM or a ShadowRoot.
2. **Visible**: The element must be visible. An element is considered visible if it has a non-empty bounding box and is not styled with `visibility: hidden` or `display: none`.
3. **Stable**: The element must be stable, meaning its bounding box has finished moving (e.g., transitions or slide-in animations have completed). Playwright checks this by comparing position changes across multiple animation frames.
4. **Enabled**: The element must be enabled (i.e. it does not have the `disabled` attribute).
5. **Editable**: For input modifications (like `fill()`), the element must be editable (not `readonly`).
6. **Receives Events**: The element must receive pointer events at its center point. If a modal overlay or loading spinner covers the target element, this check fails, preventing click actions on the wrong element.

---

## 2. Advanced Action Modifiers (Overriding Pipeline)

Playwright lets you override or test the actionability checks directly inside your action calls using options:

### A. Bypassing Checks: `{ force: true }`
If you need to click an element that is technically obscured or hidden behind a dynamic overlay, you can force the click:
```typescript
await page.locator('#submit').click({ force: true });
```
> [!CAUTION]
> Forcing actions bypasses visibility and event target checks. Use this sparingly as it does not reflect real user behavior and can hide genuine UI bugs.

### B. Dry-Run Check: `{ trial: true }`
You can verify if an element is ready to receive an action without actually triggering the action. This is perfect for asserting readystate without side effects:
```typescript
// Verifies if the button is visible, stable, and enabled, then returns
await page.locator('#submit').click({ trial: true });
```

### C. Keyboard Modifier Clicks: `{ modifiers: [...] }`
Simulate clicking an element while holding down keyboard keys (e.g., clicking a link to open in a new tab):
```typescript
// Click holding Shift key
await page.locator('a.details-link').click({ modifiers: ['Shift'] });

// Cross-platform Command (macOS) or Control (Windows/Linux) click
await page.locator('a.tab-link').click({ modifiers: ['ControlOrMeta'] });
```

---

## 3. Text Input Box Handling

Handling text boxes involves checking their state, inserting text, and verifying values. Playwright offers two ways to type.

### A. `.fill()` vs `.pressSequentially()`

* **`fill(text)` (Recommended)**: Clears the input and inserts the text instantly as a single value injection. It mimics a fast copy-paste action. It is fast and highly reliable.
* **`pressSequentially(text, [options])` (Formerly `.type()`)**: Simulates typing character-by-character, firing `keydown`, `keypress`, and `keyup` browser events for every letter. Use this for testing autocomplete search boxes or text fields that trigger dynamic search-as-you-type API requests.

```typescript
import { test, expect } from '@playwright/test';

test('Text Input Handling Demo', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');

  const textBox = page.locator('#name');

  // Verify initial states
  await expect(textBox).toBeVisible();
  await expect(textBox).toBeEnabled();
  await expect(textBox).toBeEditable();

  // Approach 1: Instant Fill (Best practice)
  await textBox.fill("John Canedy");
  await expect(textBox).toHaveValue("John Canedy");

  // Clear input
  await textBox.clear();
  await expect(textBox).toBeEmpty();

  // Approach 2: Sequential Typing (Simulating human delay)
  // Types "Playwright" with a 100ms delay between keypresses
  await textBox.pressSequentially("Playwright", { delay: 100 });
  
  // Read value back
  const enteredValue = await textBox.inputValue();
  expect(enteredValue).toBe("Playwright");
});
```

---

## 4. Radio Button Handling

Radio buttons allow users to select only **one option** from a predefined set.

* Use `.check()` to select the button.
* Assert the state using `.isChecked()` (returns boolean) or the web-first assertion `toBeChecked()`.

```typescript
test('Radio Button Selection', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');

  const maleRadio = page.locator('#male');
  const femaleRadio = page.locator('#female');

  // 1. Verify default state
  expect(await maleRadio.isChecked()).toBe(false);
  expect(await femaleRadio.isChecked()).toBe(false);

  // 2. Select Option
  await maleRadio.check();
  await expect(maleRadio).toBeChecked();
  expect(await femaleRadio.isChecked()).toBe(false);

  // 3. Select Alternative Option
  await femaleRadio.check();
  await expect(femaleRadio).toBeChecked();
  await expect(maleRadio).not.toBeChecked(); // Auto-unchecks because of group name
});
```

---

## 5. Checkbox Handling

Checkboxes allow users to select **multiple options** simultaneously. You can check, uncheck, and query states.

```typescript
test('Checkbox Multi-Selection Scenarios', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');

  // Define checkboxes
  const mondayCheckbox = page.getByLabel('Monday');
  const sundayCheckbox = page.getByLabel('Sunday');
  const daysArray = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Scenario 1: Select a specific checkbox
  await mondayCheckbox.check();
  await expect(mondayCheckbox).toBeChecked();

  // Scenario 2: Uncheck a checkbox
  await mondayCheckbox.uncheck();
  await expect(mondayCheckbox).not.toBeChecked();

  // Scenario 3: Bulk Select All Checkboxes
  for (const day of daysArray) {
    const cb = page.getByLabel(day);
    await cb.check();
    await expect(cb).toBeChecked();
  }

  // Scenario 4: Toggle States (Uncheck if checked, Check if unchecked)
  for (const day of daysArray) {
    const cb = page.getByLabel(day);
    if (await cb.isChecked()) {
      await cb.uncheck();
      await expect(cb).not.toBeChecked();
    } else {
      await cb.check();
      await expect(cb).toBeChecked();
    }
  }

  // Scenario 5: Selection by Indexes (Check first, third, and fifth)
  const locators = daysArray.map(day => page.getByLabel(day));
  const targetIndexes = [0, 2, 4]; // Monday, Wednesday, Friday
  for (const index of targetIndexes) {
    await locators[index].check();
    await expect(locators[index]).toBeChecked();
  }
});
```

---

## 6. Dropdowns & Select Option Elements

For standard HTML `<select>` elements, Playwright provides the `.selectOption()` API. You can select options by **value**, **label**, **index**, or clear selections.

```typescript
test('Dropdown Interactions', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');

  const countryDropdown = page.locator('#country');

  // Option A: Select by value attribute
  await countryDropdown.selectOption('usa');
  await expect(countryDropdown).toHaveValue('usa');

  // Option B: Select by visible label
  await countryDropdown.selectOption({ label: 'United Kingdom' });
  await expect(countryDropdown).toHaveValue('uk');

  // Option C: Select by index
  await countryDropdown.selectOption({ index: 3 }); // Selects the 4th option

  // Option D: Multi-select dropdowns
  const colorsDropdown = page.locator('#colors');
  // Pass an array of values, indices, or labels
  await colorsDropdown.selectOption(['red', 'blue', 'yellow']);

  // Option E: Clear all selections
  await colorsDropdown.selectOption([]);
});
```

---

## 7. Actions Reference Table

| Action / Element | Playwright API | Key Option Parameters | Web-First Assertion |
| :--- | :--- | :--- | :--- |
| **Input Box** | `.fill('text')` | `{ force: true }` | `await expect(loc).toHaveValue('text')` |
| **Input Box (slow)**| `.pressSequentially('text')`| `{ delay: 100 }` | `await expect(loc).toBeFocused()` |
| **Radio Button** | `.check()` | `{ force: true }` | `await expect(loc).toBeChecked()` |
| **Checkbox** | `.check()`, `.uncheck()` | `{ trial: true }` | `await expect(loc).not.toBeChecked()` |
| **Dropdown** | `.selectOption('val')` | `{ label: 'name' }`, `{ index: 1 }` | `await expect(loc).toHaveValue('val')` |
| **All Elements** | `.click()` | `{ button: 'right' }`, `{ modifiers: ['Shift'] }` | `await expect(loc).toBeVisible()` |

---

## 🏋️ Hands-on Lab Assignments

### Exercise 1: Form Registration Verification Spec

Write an automation script in a file named `tests/form-validation.spec.ts` that accomplishes the following tasks on `https://testautomationpractice.blogspot.com/`:

1. **Input Fields**:
   - Check that the `#name` text box is editable.
   - Enter your name. Verify the input value matches.
   - Clear the input field and assert it is empty.
2. **Radio Buttons**:
   - Verify that the Male (`#male`) and Female (`#female`) radio buttons are unselected by default.
   - Select the Female option.
   - Verify that Female is selected and Male is unselected.
3. **Checkbox Workflows**:
   - Locate the checkboxes for days of the week.
   - Loop and select all checkboxes. Assert all are checked.
   - Loop and uncheck the last 3 days of the week. Assert those 3 are unchecked, while others remain checked.
4. **Dropdown Selections**:
   - Select "Japan" from the Country dropdown using the **value** locator.
   - Select "Canada" from the Country dropdown using the **label** locator.

#### Try this template code to get started:
```typescript
import { test, expect } from '@playwright/test';

test('Lab Assignment: User Inputs & Selection Validation', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');

  // 1. Write input box code here...

  // 2. Write radio button code here...

  // 3. Write checkbox loops here...

  // 4. Write dropdown select option code here...
});
```

---

```quiz
{
  "question": "Which click option allows you to verify that an element is visible, stable, and enabled without actually firing a click event?",
  "options": [
    "await locator.click({ force: true })",
    "await locator.click({ checkOnly: true })",
    "await locator.click({ trial: true })",
    "await locator.click({ verify: true })"
  ],
  "answer": 2,
  "explanation": "The trial: true option runs all standard actionability checks (visibility, stability, and enabled status) but skips triggering the actual click action, allowing a 'dry-run' check."
}
```

```quiz
{
  "question": "When should you use locator.pressSequentially() instead of locator.fill() in Playwright?",
  "options": [
    "To speed up text entry on slow-loading servers",
    "To trigger dynamic page events (like autocomplete results or search-as-you-type) by mimicking actual keydown/keyup events",
    "When entering passwords or sensitive credit card numbers",
    "When inserting multi-line paragraph text into a textarea"
  ],
  "answer": 1,
  "explanation": "pressSequentially() types character-by-character and triggers individual browser keyboard events (keydown, keyup). This is useful for testing interactive fields like search autocomplete, whereas fill() is the standard and faster way to populate forms."
}
```

```quiz
{
  "question": "Which of the following describes the 'Event Target Check' in Playwright's actionability pipeline?",
  "options": [
    "Verifying that the element is registered to an onClick listener in JavaScript",
    "Checking that the element has correct ARIA accessibility tags",
    "Ensuring the element is not covered or obscured by another element (like a modal or loading screen) at the click coordinate",
    "Ensuring the element resides inside an active form block"
  ],
  "answer": 2,
  "explanation": "The Event Target Check ensures the element is targetable at its center point. If another element (e.g. an overlay modal, tooltip, or sticky header) obscures the target, Playwright will wait until the overlay vanishes."
}
```
