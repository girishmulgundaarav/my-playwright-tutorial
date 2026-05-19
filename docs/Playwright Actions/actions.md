---
title: Playwright Actions
sidebar_position: 1
---

# Playwright Actions – Input box, Radio buttons, Check boxes

This guide covers common user interactions in Playwright, including text inputs, radio buttons, and checkboxes.

## 1. Text Input / Text Box Handling
Text input boxes are used to enter user data. In Playwright, we use the `fill()` or `type()` methods to enter text.

### ✅ Key Actions:
- **Check if visible or enabled** using `toBeVisible()` and `toBeEnabled()`
- **Get attribute** like `maxlength` using `getAttribute()`
- **Set value** using `fill()`
- **Get entered value** using `inputValue()`

### 🔍 Example:
```javascript
const textBox = page.locator('#name');
await expect(textBox).toBeVisible();
await expect(textBox).toBeEnabled();

const maxLength = await textBox.getAttribute("maxlength");
expect(maxLength).toBe('15');

await textBox.fill("John Canedy");

const enteredValue = await textBox.inputValue();
expect(enteredValue).toBe("John Canedy");
```

---

## 2. Radio Button Handling
Radio buttons let users choose **one option** from a set. Use `.check()` to select.

### ✅ Key Actions:
- **Check visibility and enabled state**
- **Use `.check()` to select**
- **Verify selection** using `.isChecked()` or `.toBeChecked()`

### 🔍 Example:
```javascript
const maleRadio = page.locator('#male');
await expect(maleRadio).toBeVisible();
await expect(maleRadio).toBeEnabled();

expect(await maleRadio.isChecked()).toBe(false);

await maleRadio.check();
await expect(maleRadio).toBeChecked();
```

---

## 3. Checkbox Handling
Checkboxes allow selecting **multiple options**. You can check, uncheck, or toggle them.

### 📝 Scenarios Covered:

#### 1. Select a specific checkbox
```javascript
const sundayCheckbox = page.getByLabel('Sunday');
await sundayCheckbox.check();
await expect(sundayCheckbox).toBeChecked();
```

#### 2. Select all checkboxes
```javascript
const days = ['Sunday', 'Monday', 'Tuesday'];
const checkboxes = days.map(day => page.getByLabel(day));

for (const checkbox of checkboxes) {
  await checkbox.check();
  await expect(checkbox).toBeChecked();
}
```

#### 3. Uncheck last 3 checkboxes
```javascript
for (const checkbox of checkboxes.slice(-3)) {
  await checkbox.uncheck();
  await expect(checkbox).not.toBeChecked();
}
```

#### 4. Toggle checkboxes
```javascript
for (const checkbox of checkboxes) {
  if (await checkbox.isChecked()) {
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  } else {
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  }
}
```

#### 5. Select by specific indexes (e.g. 1, 3, 6)
```javascript
const indexes = [1, 3, 5];
for (const i of indexes) {
  await checkboxes[i].check();
  await expect(checkboxes[i]).toBeChecked();
}
```

#### 6. Select checkbox by label name
```javascript
const weekname = "Friday";
for (const label of days) {
  if (label.toLowerCase() === weekname.toLowerCase()) {
    const checkbox = page.getByLabel(label);
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  }
}
```

---

## Extra: More Playwright Actions

To build robust tests, you'll often need more than just basic input handling. Here are some extra actions you'll find useful:

### 🖱️ Mouse Actions
Playwright provides a simple API for common mouse interactions.

- **Click:** `await page.click('#submit')`
- **Double Click:** `await page.dblclick('#item')`
- **Right Click:** `await page.click('#item', { button: 'right' })`
- **Hover:** `await page.hover('#menu')`
- **Drag and Drop:**
  ```javascript
  await page.locator('#source').dragTo(page.locator('#target'));
  ```

### ⌨️ Keyboard Actions
You can simulate keyboard presses for shortcuts or navigation.

- **Press Enter:** `await page.press('#search', 'Enter')`
- **Control + A:** `await page.keyboard.press('Control+A')`

### 📂 Dropdowns (Select Elements)
For standard `<select>` elements, use `selectOption()`.

```javascript
// By value
await page.locator('#country').selectOption('usa');

// By label
await page.locator('#country').selectOption({ label: 'United States' });

// Multiple selection
await page.locator('#colors').selectOption(['red', 'blue', 'green']);
```

### 📤 File Uploads
Use `setInputFiles` to handle file upload inputs.

```javascript
await page.locator('#upload').setInputFiles('path/to/file.pdf');

// Multiple files
await page.locator('#upload').setInputFiles(['file1.txt', 'file2.txt']);
```

---

## Summary Table

| Element | Action | Playwright Method |
| :--- | :--- | :--- |
| **Text Input** | Enter text | `fill()`, `type()` |
| | Get value | `inputValue()` |
| **Radio Button** | Select option | `check()` |
| **Checkbox** | Select | `check()` |
| | Unselect | `uncheck()` |
| | Check status | `isChecked()`, `toBeChecked()` |
| **All Elements** | Visibility | `toBeVisible()`, `toBeEnabled()` |
| **Dropdown** | Select option | `selectOption()` |
| **Mouse** | Hover | `hover()` |
| **Keyboard** | Key press | `press()` |

---
*Reference: [Pavan Online Trainings](https://www.pavanonlinetrainings.com) | [SDET Pavan YouTube](https://www.youtube.com/@sdetpavan)*

---

# Lab Assignment: Input Text, Radio Buttons & Checkboxes

Practice your skills using the following lab assignment.

**Web URL:** [Automation Practice Table](https://testautomationpractice.blogspot.com/)

### 1. Input Box Validation: "Name"
**Tasks:**
- [ ] Check if the input box is displayed.
- [ ] Check if the input box is enabled.
- [ ] Enter your name in the "Name" input box.
- [ ] Retrieve and print the text from the input box.

### 2. Radio Button Validation: "Gender"
**Tasks:**
- [ ] Get the status of the "Male" radio button (is it selected by default?).
- [ ] Select the "Female" radio button.
- [ ] Verify that "Female" is selected and "Male" is unselected.

### 3. Checkbox Validation: "Days"
**Tasks:**
- [ ] Select the checkbox for "Sunday".
- [ ] Capture all available days and print the count.
- [ ] Check all days (Monday to Sunday) using a loop.
- [ ] Uncheck all days using a loop.
- [ ] Check the last 2 days (Friday and Saturday) using a loop.
- [ ] Check the first 3 days (Monday, Tuesday, Wednesday) using a loop.


