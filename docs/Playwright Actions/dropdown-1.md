---
title: Dropdowns - Part 1
sidebar_position: 2
---

# Dropdowns - Part 1: Standard Select Elements

A dropdown allows users to select options from a list. In standard HTML, dropdowns are built using the `<select>` tag containing nested `<option>` tags. These can be:
- **Single-select:** Only one item can be chosen at a time (e.g., Country list).
- **Multi-select:** Multiple items can be selected concurrently (e.g., Favorite colors).

Playwright provides a dedicated, native `selectOption()` API to handle standard HTML `<select>` dropdowns with extreme reliability.

---

## 1. Playwright's Actionability & Selection Pipeline

Before Playwright selects any option in a dropdown, it automatically performs a set of **Actionability Checks** on the `<select>` element. You do not need to write manual wait or sleep timers.

![Playwright Actionability & Selection Pipeline](/img/dropdown_pipeline.png)

---

## 2. Selecting Options from Dropdowns

Playwright's `selectOption()` method accepts string values, numeric indices, or configuration objects.

### 2.1 Single-select Dropdowns (e.g., `#country`)

#### A. By Visible Text or Value Attribute (Shorthand)
If you pass a plain string, Playwright will first attempt to match the option's value attribute. If no value matches, it falls back to matching the option's visible text.
```javascript
// Matches visible text "India" or value="India"
await page.locator('#country').selectOption('India');
```

#### B. By Value Attribute (Strict)
Specify the exact `value` attribute of the target `<option>` element.
```javascript
// Selects <option value="uk">United Kingdom</option>
await page.locator('#country').selectOption({ value: 'uk' });
```

#### C. By Label (Strict Visible Text)
Select an option matching the exact visible text displayed to the user.
```javascript
await page.locator('#country').selectOption({ label: 'India' });
```

#### D. By 0-Based Index
Select an option by its numerical position inside the dropdown list (starting from `0`).
```javascript
// Selects the 4th option in the list
await page.locator('#country').selectOption({ index: 3 });
```

---

### 2.2 Multi-select Dropdowns (e.g., `#colors`)

To select multiple options, pass an **array** containing any combination of values, labels, or indices.

#### A. Array of Visible Text / Values
```javascript
await page.locator('#colors').selectOption(['Red', 'Green', 'Blue']);
```

#### B. Mixed Array Selection
You can mix text, values, and indices in a single method call:
```javascript
await page.locator('#colors').selectOption([
  { label: 'Red' },        // By visible label
  { value: 'green_val' },  // By value attribute
  { index: 4 }             // By 0-based index position
]);
```

---

## 3. Deselecting & Clearing Options

*   **For Multi-select Dropdowns:**
    You can clear all currently selected options by passing `null` or an empty array `[]`.
    ```javascript
    // Clears all color selections
    await page.locator('#colors').selectOption([]);
    // Alternative approach
    await page.locator('#colors').selectOption(null);
    ```
*   **For Single-select Dropdowns:**
    Browsers do not support deselecting a single-select dropdown entirely. To "clear" it, you typically select the default blank option:
    ```javascript
    // Selects the placeholder/empty option
    await page.locator('#country').selectOption('');
    ```

---

## 4. Asserting Selection State

Always use **Web-First Assertions** to verify what is currently selected in your dropdowns. These assertions automatically retry until they pass or the timeout limit is reached.

### 4.1 Assert Single Selection Value
Use `toHaveValue()` to verify the selected option's **value attribute** (not visible text).
```javascript
// Select "India" which has value attribute "IN"
await page.locator('#country').selectOption({ label: 'India' });

// Assert value is "IN"
await expect(page.locator('#country')).toHaveValue('IN');
```

### 4.2 Assert Multi-Selection Values
Use `toHaveValues()` to verify the values of all selected options inside a multi-select element.
```javascript
await page.locator('#colors').selectOption(['Red', 'Blue']);

// Assert exact value attributes selected
await expect(page.locator('#colors')).toHaveValues(['red_val', 'blue_val']);
```

---

## 5. Retrieve Options Programmatically

Sometimes you need to inspect the dropdown contents or extract values dynamically during test execution.

### 5.1 Retrieve Current Selected Value
Use `inputValue()` to read the active value of a single-select dropdown:
```javascript
const selectedVal = await page.locator('#country').inputValue();
console.log('Active Value:', selectedVal);
```

### 5.2 Retrieve All Multi-Selected Values
Use `.evaluate()` to run browser-side JavaScript to retrieve all selected elements:
```javascript
const activeSelections = await page.locator('#colors').evaluate(el => 
  Array.from(el.selectedOptions).map(opt => opt.value)
);
console.log('Currently selected colors:', activeSelections);
```

### 5.3 Verify the Total Count of Options
```javascript
const options = page.locator('#country > option');
await expect(options).toHaveCount(10);
```

### 5.4 Check if a Specific Option Exists
```javascript
const optionsText = await page.locator('#country > option').allTextContents();
expect(optionsText).toContain('Japan');
```

---

## 6. Sorting & Data Validation

### 6.1 Check for Duplicate Options
Using a JavaScript `Set`, you can audit dropdown lists to ensure no duplicate items exist:
```javascript
const options = await page.locator('#colors > option').allTextContents();
const uniqueItems = new Set(options);

// If the sizes differ, duplicates exist in the list
expect(options.length).toBe(uniqueItems.size);
```

### 6.2 Check if Options are Alphabetically Sorted
Copy the elements into a new array, sort the copy, and compare:
```javascript
const options = await page.locator('#animals > option').allTextContents();

// Shallow copy the array using the spread operator [...]
const originalOrder = [...options];
const sortedOrder = [...options].sort();

expect(originalOrder).toEqual(sortedOrder);
```

> [!TIP]
> **Why use the spread operator (`[...]`)?**
> The `.sort()` method in JavaScript mutates the original array in-place. If you call `options.sort()` directly, the original order is lost. The spread operator creates a shallow copy, preserving the original array order for comparison.

---

# Hands-on Assignment: Verify Product Sorting and Selection

Validate your dropdown scripting skills with this practical automation lab.

### 1. Setup & Navigation
- [ ] Navigate to the demo storefront: [bstackdemo.com](https://www.bstackdemo.com/)
- [ ] Locate the "Order by" dropdown element.
- [ ] Verify the dropdown is visible, stable, and enabled.

### 2. Interaction & Value Assertions
- [ ] Select the option **"Lowest to highest"** by label text.
- [ ] Assert that the dropdown value has changed to `"lowesttopriced"`.
- [ ] Retrieve the selected value dynamically using `inputValue()` and print it.

### 3. Sorting & Product Validation
- [ ] Retrieve all product name and price elements on the page.
- [ ] Print each product name alongside its corresponding price.
- [ ] Assert that the first displayed product has the lowest price.
- [ ] Assert that the last displayed product has the highest price.

---

## 🧠 Knowledge Check

```quiz
{
  "question": "What is the difference between passing a plain string to selectOption() versus using the label configuration object?",
  "options": [
    "A plain string only checks indices, whereas the label object checks text content",
    "A plain string matches values first, then falls back to visible text; the label object strictly matches visible text",
    "The label object is faster because it bypasses actionability checks",
    "There is no difference; they are exact aliases"
  ],
  "answer": 1,
  "explanation": "Playwright's shorthand selectOption('string') tries to match the option value first, then visible text if no match is found. Passing { label: 'string' } strictly queries option text."
}
```

```quiz
{
  "question": "Which web-first assertion is used to verify multiple selected values inside a multi-select dropdown?",
  "options": [
    "await expect(locator).toHaveValue(['val1', 'val2'])",
    "await expect(locator).toHaveValues(['val1', 'val2'])",
    "await expect(locator).toContainValue(['val1', 'val2'])",
    "await expect(locator).toHaveSelected(['val1', 'val2'])"
  ],
  "answer": 1,
  "explanation": "toHaveValues() is the web-first assertion specifically designed for verifying selected values of a multi-select element in Playwright."
}
```

```quiz
{
  "question": "How do you completely clear/deselect all active selections in a multi-select dropdown element?",
  "options": [
    "await locator.clear()",
    "await locator.selectOption([]) or await locator.selectOption(null)",
    "await locator.fill('')",
    "await locator.selectOption({ index: -1 })"
  ],
  "answer": 1,
  "explanation": "Passing an empty array `[]` or `null` to `selectOption()` clears all active selections on a multi-select dropdown."
}
```
