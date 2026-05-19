---
title: Web Tables
sidebar_position: 4
---

# Web Tables & Element Iteration

In web automation, interacting with tabular data and iterating through lists of matched elements are frequent tasks. This guide covers how to compare text retrieval methods, use the Playwright `all()` iterator, and automate static web tables.

---

## 1. Comparing Text Methods: `innerText()` vs `textContent()`

When retrieving text from elements, Playwright offers several methods depending on whether you need visible text, raw DOM contents, single values, or arrays.

### 1.1 Single Element Methods
*   **`innerText()`**: Retrieves only the visible rendered text of an element (similar to what a user sees on the screen). It excludes hidden tags, handles CSS display properties, and normalizes whitespaces/line breaks.
*   **`textContent()`**: Retrieves all text from the node, including hidden elements (like elements with `display: none`). It retains all raw whitespaces, tabs, and line breaks.

### 1.2 Multi-Element Array Methods
*   **`allInnerTexts()`**: Queries all matching elements and returns an array of cleaned, visible text strings.
*   **`allTextContents()`**: Queries all matching elements and returns an array of raw text strings (retains whitespaces and hidden elements). Typically cleaned up using `.map(text => text.trim())`.

### 1.3 Summary Reference Table

| Method | Return Type | Includes Hidden Text? | Normalizes Whitespaces? | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **`innerText()`** | `Promise<string>` | No | Yes | Verifying user-visible text |
| **`textContent()`** | `Promise<string>` | Yes | No | Fetching raw DOM text |
| **`allInnerTexts()`** | `Promise<string[]>` | No | Yes | Quick lists of visible elements |
| **`allTextContents()`** | `Promise<string[]>` | Yes | No | Extracting complete data rows |

### 🔍 Code Example: Comparing Methods
```javascript
import { test, expect } from '@playwright/test';

test('Comparing Text Methods', async ({ page }) => {
  await page.goto('https://demowebshop.tricentis.com/');
  
  const products = page.locator('.product-title');

  // 1. Get text of the second product
  const visibleText = await products.nth(1).innerText();
  const rawText = await products.nth(1).textContent();
  
  console.log('innerText():', visibleText); 
  console.log('textContent():', rawText?.trim());

  // 2. Fetch all values into arrays
  const allVisibles = await products.allInnerTexts();
  const allRaws = await products.allTextContents();
  const allRawsTrimmed = allRaws.map(text => text.trim());

  console.log('allInnerTexts() Array:', allVisibles);
  console.log('allTextContents() Trimmed Array:', allRawsTrimmed);
});
```

---

## 2. Iterating Locators Using the `all()` Method

When query selectors match multiple elements on a page, you cannot directly index a `Locator` as a standard Javascript array (e.g. `locator[i]` will error). 

### The Solution: `locator.all()`
The `all()` method resolves a Locator group into an array of individual locators (`Locator[]`).
*   This lets you run standard JavaScript loops (`for...of` or `for...in`) directly.
*   You can call actions (like `click()`, `fill()`, or `innerText()`) on individual elements in the array.

### 🔍 Code Example: Iterating Elements
```javascript
test('Iterating Locators with all()', async ({ page }) => {
  await page.goto('https://demowebshop.tricentis.com/');
  
  const products = page.locator('.product-title');
  
  // Convert Locator to Locator[]
  const productLocators = await products.all();
  console.log(`Found ${productLocators.length} product elements.`);

  // Iterate using a standard loop
  for (const product of productLocators) {
    const title = await product.innerText();
    console.log('Product title item:', title.trim());
  }
});
```

---

## 3. Automating Static Web Tables

Web tables display structured datasets inside row (`<tr>`) and cell (`<td>`/`<th>`) patterns. Here is how to perform common table automation scenarios.

### 🔍 Table HTML Structure
```html
<table name="BookTable">
  <thead>
    <tr>
      <th>BookName</th>
      <th>Author</th>
      <th>Subject</th>
      <th>Price</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Learn Java</td>
      <td>Mukesh</td>
      <td>Java</td>
      <td>500</td>
    </tr>
  </tbody>
</table>
```

### 🔍 Code Example: Table Validations
The following script navigates to the practice page and validates row counts, column counts, reads cell data, and calculates aggregates.

```javascript
test('Static Web Table Validations', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');

  // 1. Locate the table body
  const table = page.locator("table[name='BookTable'] tbody");
  await expect(table).toBeVisible();

  // 2. Count rows (including the header row)
  const rows = table.locator('tr');
  await expect(rows).toHaveCount(7); // Assertion Option 1
  
  const rowCount = await rows.count();
  console.log('Number of rows in BookTable:', rowCount);
  expect(rowCount).toBe(7); // Assertion Option 2

  // 3. Count columns (header cells)
  const columns = rows.locator('th');
  await expect(columns).toHaveCount(4);
  
  const colCount = await columns.count();
  console.log('Number of columns:', colCount);
  expect(colCount).toBe(4);

  // 4. Read cells from a specific row (e.g. 3rd row / index 2)
  const thirdRowCells = rows.nth(2).locator('td');
  const thirdRowTexts = await thirdRowCells.allInnerTexts();
  console.log('3rd Row Values:', thirdRowTexts);
  // Assert exact matching cell texts
  await expect(thirdRowCells).toHaveText(['Learn Java', 'Mukesh', 'Java', '500']);

  // 5. Read all table data (excluding the header row)
  const allRows = await rows.all();
  console.log('Printing table entries:');
  console.log('BookName \t Author \t Subject \t Price');
  
  // Use slice(1) to skip the header row (index 0)
  for (const row of allRows.slice(1)) {
    const cellTexts = await row.locator('td').allInnerTexts();
    console.log(cellTexts.join('\t|\t'));
  }

  // 6. Filter rows by cell value (Find books written by Mukesh)
  console.log('\nBooks authored by Mukesh:');
  const mukeshBooks = [];
  for (const row of allRows.slice(1)) {
    const author = await row.locator('td').nth(1).innerText();
    const title = await row.locator('td').nth(0).innerText();
    
    if (author === 'Mukesh') {
      console.log(`- ${title}`);
      mukeshBooks.push(title);
    }
  }
  expect(mukeshBooks).toHaveLength(2);

  // 7. Calculate aggregate values (Total sum of Book Prices)
  let totalPrice = 0;
  for (const row of allRows.slice(1)) {
    const priceText = await row.locator('td').nth(3).innerText();
    totalPrice += parseInt(priceText, 10);
  }
  console.log('\nTotal Price of all books:', totalPrice);
  expect(totalPrice).toBe(7100);
});
```

---
*Reference: [Pavan Online Trainings](https://www.pavanonlinetrainings.com) | [SDET Pavan YouTube](https://www.youtube.com/@sdetpavan)*
