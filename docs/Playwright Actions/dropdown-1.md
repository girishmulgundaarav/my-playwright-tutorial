---
title: Dropdowns - Part 1
sidebar_position: 2
---

# Dropdowns - Part 1

A dropdown allows users to select options from a list. It can be:
- **Single-select:** Only one item can be chosen (e.g., Country list).
- **Multi-select:** Multiple items can be selected (e.g., Favorite colors).

## 1. Selecting Options from Dropdowns
Playwright provides 4 simple ways to select options from a dropdown.

### For Single-select Dropdowns (like `#country`):

#### By Visible Text
Select "India" by visible label shown to users.
```javascript
await page.locator('#country').selectOption('India');
```

#### By Value Attribute
Select option using its value in HTML (e.g., `<option value="uk">UK</option>`).
```javascript
await page.locator('#country').selectOption({ value: 'uk' });
```

#### By Label
Alternative way to use label property explicitly.
```javascript
await page.locator('#country').selectOption({ label: 'India' });
```

#### By Index
Select option by its position (starting from 0).
```javascript
await page.locator('#country').selectOption({ index: 3 });
```

### For Multi-select Dropdowns (like `#colors`):
Use the same methods, but pass **arrays** to select multiple options.

**Example: Select multiple colors using visible text:**
```javascript
await page.locator('#colors').selectOption(['Red', 'Green', 'Blue']);
```

---

## 2. Count of Options
You can check how many options are available in the dropdown.

**Example:**
```javascript
const options = page.locator('#country > option');
await expect(options).toHaveCount(10);
```
> 📝 **Note:** Useful to validate if all expected choices are loaded.

---

## 3. Check If a Specific Option Exists
Get all dropdown option texts and check if a certain item exists.

**Example: Check if "Japan" is present**
```javascript
const optionsText = await page.locator('#country > option').allTextContents();
expect(optionsText).toContain('Japan');
```
> 📝 **Note:** Great for testing if expected options are present.

---

## 4. Print All Dropdown Options
You can loop through the list and log each item.

**Example:**
```javascript
const texts = await page.locator('#colors > option').allTextContents();
for (const text of texts) {
  console.log(text);
}
```
> 📝 **Note:** Helpful to verify the dropdown content visually or in logs.

---

## 5. Check for Duplicate Options
Use a `Set` to detect if any options are repeated in the dropdown.

**Example:**
```javascript
const options = await page.locator('#colors > option').allTextContents();
const set = new Set();
const duplicates = [];

for (const item of options) {
  if (set.has(item)) {
    duplicates.push(item);
  } else {
    set.add(item);
  }
}

console.log("Duplicate items:", duplicates);
```
> 📝 **Note:** Good practice to ensure data quality in dropdowns.

---

## 6. Check If Dropdown Is Sorted Alphabetically
Compare the original list with a sorted version.

**Example:**
```javascript
const options = await page.locator('#animals > option').allTextContents();
const original = [...options];
const sorted = [...options].sort();

expect(original).toEqual(sorted);
```
> 📝 **Note:** Ensures dropdown values appear in expected order (A to Z).

### 💡 Understanding the Spread Operator (`[...]`)
The syntax `[...]` is called the **spread operator** in JavaScript/TypeScript.

When you see:
```javascript
const originalList = [...options];
```
It means: **"Create a new array with the same elements as options."**

**Why it's used:**
It creates a **shallow copy** of the array `options`. This is important because:
```javascript
const sortedList = options.sort(); // ⚠️ This changes the original array!
```
If you sort the original array directly, you lose the original order. So instead, you do:
```javascript
const originalList = [...options]; // Save original order
const sortedList = [...options].sort(); // Sorted version, without modifying the original
```

---
*Reference: [Pavan Online Trainings](https://www.pavanonlinetrainings.com) | [SDET Pavan YouTube](https://www.youtube.com/@sdetpavan)*

---

# Assignment: Verify Product Sorting and Information Retrieval

Practice your skills with this hands-on assignment.

### 1. Navigate to the Webpage
- [ ] Open the URL: [bstackdemo.com](https://www.bstackdemo.com/)

### 2. Interact with the "Order by" Dropdown
- [ ] Locate the "Order by" dropdown element.
- [ ] Verify the dropdown is displayed and enabled.
- [ ] Select the option **"Lowest to highest"** from the dropdown.

### 3. Retrieve and Print Product Information
- [ ] Retrieve the list of product price elements.
- [ ] Retrieve the list of product name elements.
- [ ] Verify that the product names count and prices count are equal.
- [ ] Print each product name along with its corresponding price in the console.

### 4. Identify and Print the Lowest Priced Product
- [ ] Access the first element of the product prices list and the first element of the product names list.
- [ ] Print the lowest priced product name and its price in the console.

### 5. Identify and Print the Highest Priced Product
- [ ] Access the last element of the product prices list and the last element of the product names list.
- [ ] Print the highest priced product name and its price in the console.

---

```quiz
{
  "question": "Why is it important to use the spread operator [...options] before sorting an array of dropdown options?",
  "options": [
    "To convert HTML elements into strings",
    "Because .sort() is not available on standard arrays",
    "Because .sort() modifies the original array in-place, which loses the original order",
    "To automatically remove duplicate options"
  ],
  "answer": 2,
  "explanation": "The .sort() method in JavaScript modifies the array in-place. Using the spread operator creates a shallow copy, allowing you to compare the original sorted order with a new sorted version."
}
```
