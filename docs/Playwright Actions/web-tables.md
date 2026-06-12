---
title: Web Tables
sidebar_position: 4
---

# Web Tables & Element Iteration

In web automation, interacting with tabular data and iterating through lists of matched elements are frequent tasks. This guide covers how to compare text retrieval methods, use the Playwright `all()` iterator, apply the powerful `filter()` method, and automate static web tables end-to-end.

---

## 🔗 Practice Sites & Test URLs

Before starting, navigate to these practice/test websites to try out the code examples:
*   **Demo Web Shop:** [https://demowebshop.tricentis.com/](https://demowebshop.tricentis.com/)
*   **Test Automation Practice:** [https://testautomationpractice.blogspot.com/](https://testautomationpractice.blogspot.com/)

---

## 🗺️ Concept Map: Web Table Automation in Playwright

![Web Tables & Element Iteration — Full Concept Map](/img/playwright_web_tables_concept_map.png)

---

## 1. Comparing Text Methods: `innerText()` vs `textContent()`

When retrieving text from elements, Playwright offers several methods depending on whether you need visible text, raw DOM contents, single values, or arrays.

### 1.1 Single Element Methods

*   **`innerText()`**: Retrieves only the **visible rendered text** of an element (similar to what a user sees on the screen). It excludes hidden tags, respects CSS `display` properties, and normalizes whitespaces/line breaks.
*   **`textContent()`**: Retrieves **all text from the node**, including hidden elements (like elements with `display: none`). It retains all raw whitespaces, tabs, and line breaks.

### 1.2 Multi-Element Array Methods

*   **`allInnerTexts()`**: Queries all matching elements and returns an array of cleaned, visible text strings.
*   **`allTextContents()`**: Queries all matching elements and returns an array of raw text strings (retains whitespaces and hidden elements). Typically cleaned up using `.map(text => text.trim())`.

> **📌 Official Recommendation:** If you need to **assert text on the page**, prefer `expect(locator).toHaveText()` (with the `useInnerText` option for `innerText` behavior) over `allInnerTexts()` / `allTextContents()`. The `expect()` assertion is **retry-able** and avoids timing flakiness. Use the array methods primarily for **reading/logging** values, not assertions.

### 1.3 Visual Comparison: How Each Method Reads the DOM

![innerText() vs textContent() — How Each Method Reads the DOM](/img/playwright_innertext_vs_textcontent.png)

### 1.4 Summary Reference Table

| Method | Return Type | Version Added | Includes Hidden Text? | Normalizes Whitespace? | Best For |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **`innerText()`** | `Promise<string>` | v1.14 | ❌ No | ✅ Yes | Verifying user-visible text of a single element |
| **`textContent()`** | `Promise<string \| null>` | v1.14 | ✅ Yes | ❌ No | Fetching raw DOM text including hidden nodes |
| **`allInnerTexts()`** | `Promise<string[]>` | v1.14 | ❌ No | ✅ Yes | Reading/logging lists of visible element texts |
| **`allTextContents()`** | `Promise<string[]>` | v1.14 | ✅ Yes | ❌ No | Extracting raw complete data (use `.trim()` after) |

> ⚠️ **`textContent()` can return `null`** if the element has no text node. Always use optional chaining: `rawText?.trim()`.

### 🔍 Code Example: Comparing Methods

```javascript
import { test, expect } from '@playwright/test';

test('Comparing Text Methods', async ({ page }) => {
  await page.goto('https://demowebshop.tricentis.com/');
  
  const products = page.locator('.product-title');

  // 1. Get text of the second product (index 1)
  const visibleText = await products.nth(1).innerText();
  const rawText = await products.nth(1).textContent(); // may be null

  console.log('innerText():', visibleText);
  console.log('textContent():', rawText?.trim()); // safe null-check

  // 2. Fetch all values into arrays (for reading/logging)
  const allVisibles = await products.allInnerTexts();
  const allRaws = await products.allTextContents();
  const allRawsTrimmed = allRaws.map(text => text.trim());

  console.log('allInnerTexts() Array:', allVisibles);
  console.log('allTextContents() Trimmed Array:', allRawsTrimmed);

  // ✅ PREFERRED for assertions: use expect().toHaveText() — it is retry-able
  await expect(products.first()).toHaveText('Some Expected Title');
});
```

---

## 2. Iterating Locators Using the `all()` Method

When query selectors match multiple elements on a page, you cannot directly index a `Locator` as a standard JavaScript array (e.g., `locator[i]` will error).

### The Solution: `locator.all()`

The `all()` method resolves a Locator group into an array of individual locators (`Locator[]`).
*   Lets you run standard JavaScript loops (`for...of`) directly over elements.
*   You can call actions (like `click()`, `fill()`, or `innerText()`) on individual elements in the array.
*   **Added in:** Playwright v1.29

### ⚠️ Critical Warning: `all()` Does NOT Auto-Wait

> **`locator.all()` does NOT wait for elements to match the locator** — it immediately returns whatever is currently present in the DOM.
>
> - If the list is **dynamically changing**, `all()` will produce **unpredictable and flaky results**.
> - If the list is **stable but loaded dynamically**, wait for the full list to finish loading *before* calling `all()` (e.g., use `await expect(locator).toHaveCount(N)` first).
> - Use `locator.count()` if you only need the count — it is safer for dynamic pages.

### 2.1 Which Method Do I Use? — Decision Guide

![locator.all() vs count() vs allInnerTexts() — Which to Use](/img/playwright_all_method_decision.png)

### 2.2 Index-based Access Shortcuts

Before iterating with `all()`, Playwright also provides convenient single-element accessors on a locator:

| Method | Description |
| :--- | :--- |
| `locator.nth(0)` | First element (0-indexed) |
| `locator.first()` | Shorthand alias for `.nth(0)` |
| `locator.last()` | Last matched element |
| `locator.nth(n)` | The `n`th element (0-indexed) |

### 🔍 Code Example: Iterating Elements

```javascript
test('Iterating Locators with all()', async ({ page }) => {
  await page.goto('https://demowebshop.tricentis.com/');
  
  const products = page.locator('.product-title');

  // ✅ Wait for at least some elements first (avoids empty-list race condition)
  await expect(products.first()).toBeVisible();

  // Convert Locator to Locator[]
  const productLocators = await products.all();
  console.log(`Found ${productLocators.length} product elements.`);

  // Iterate using a standard for...of loop
  for (const product of productLocators) {
    const title = await product.innerText();
    console.log('Product title:', title.trim());
  }

  // Shorthand accessors
  const firstTitle = await products.first().innerText();
  const lastTitle  = await products.last().innerText();
  const thirdTitle = await products.nth(2).innerText();

  console.log('First:', firstTitle);
  console.log('Last:', lastTitle);
  console.log('Third:', thirdTitle);
});
```

---

## 3. Filtering Locators with `locator.filter()`

Instead of iterating over all rows and checking conditions manually, Playwright's `filter()` method lets you narrow a locator to only the matching elements declaratively — **no loop needed**.

### 3.1 How `filter()` Works

![locator.filter() — Narrowing Rows Without a Loop](/img/playwright_filter_method_flow.png)

### 3.2 `filter()` API Options

| Option | Type | Description |
| :--- | :--- | :--- |
| `hasText` | `string \| RegExp` | Matches elements containing this text |
| `hasNotText` | `string \| RegExp` | Excludes elements containing this text *(v1.33+)* |
| `has` | `Locator` | Matches elements that contain a child matching the sub-locator |
| `hasNot` | `Locator` | Excludes elements that contain a child matching the sub-locator *(v1.33+)* |

### 🔍 Code Example: Using `filter()`

```javascript
test('Filter table rows with locator.filter()', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');

  const rows = page.locator("table[name='BookTable'] tbody tr");

  // 1. Filter rows that contain 'Mukesh' anywhere in the row
  const mukeshRows = rows.filter({ hasText: 'Mukesh' });
  console.log('Mukesh row count:', await mukeshRows.count());
  await expect(mukeshRows).toHaveCount(2);

  // 2. Filter with a sub-locator: rows that contain a <td> with text 'Java'
  const javaRows = rows.filter({
    has: page.locator('td', { hasText: 'Java' })
  });
  await expect(javaRows).toHaveCount(1);

  // 3. Chain filters: rows by Mukesh AND related to Java subject
  const specificRow = rows
    .filter({ hasText: 'Mukesh' })
    .filter({ has: page.locator('td', { hasText: 'Java' }) });
  
  await expect(specificRow).toHaveCount(1);
  const bookName = await specificRow.locator('td').first().innerText();
  console.log('Book found:', bookName);
});
```

---

## 4. Automating Static Web Tables

Web tables display structured datasets inside row (`<tr>`) and cell (`<td>`/`<th>`) patterns. Here is how the anatomy of a table maps to Playwright locator strategies.

### 4.1 HTML Table Anatomy & Playwright Locator Chain

![HTML Table Anatomy and Playwright Locator Chaining](/img/playwright_table_anatomy_locator_chain.png)

### 4.2 Table HTML Structure Reference

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
    <!-- ...more rows... -->
  </tbody>
</table>
```

### 4.3 Table Automation Scenarios — Quick Reference

![Table Automation Scenarios — What API to Use?](/img/playwright_table_scenario_guide.png)

### 🔍 Code Example: Complete Table Validations

The following script navigates to the practice page and performs row counts, column counts, cell reads, filtering, and aggregate calculations.

```javascript
import { test, expect } from '@playwright/test';

test('Static Web Table Validations', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');

  // ── SETUP ─────────────────────────────────────────────────────────────────
  // Note: We scope to <tbody> to exclude the <thead> header row from row counts
  const tableBody = page.locator("table[name='BookTable'] tbody");
  await expect(tableBody).toBeVisible();

  const rows = tableBody.locator('tr'); // all <tbody> data rows

  // ── 1. COUNT ROWS ─────────────────────────────────────────────────────────
  // Option A: retry-able assertion (preferred)
  await expect(rows).toHaveCount(7);

  // Option B: imperative count (use for logging/branching)
  const rowCount = await rows.count();
  console.log('Number of data rows in BookTable:', rowCount);

  // ── 2. COUNT COLUMNS (header cells in <thead>) ────────────────────────────
  const headerCells = page.locator("table[name='BookTable'] thead tr th");
  await expect(headerCells).toHaveCount(4);
  
  const colCount = await headerCells.count();
  console.log('Number of columns:', colCount);

  // ── 3. READ A SPECIFIC CELL (row index 2 = 3rd data row) ─────────────────
  const thirdRowCells = rows.nth(2).locator('td');
  const thirdRowTexts = await thirdRowCells.allInnerTexts();
  console.log('3rd Row Values:', thirdRowTexts);

  // ✅ Assert cell texts — prefer toHaveText for retry-ability
  await expect(thirdRowCells).toHaveText(['Learn Java', 'Mukesh', 'Java', '500']);

  // ── 4. READ ALL TABLE DATA ────────────────────────────────────────────────
  const allRows = await rows.all();
  console.log('Printing table entries:');
  console.log('BookName \t Author \t Subject \t Price');

  for (const row of allRows) {
    const cellTexts = await row.locator('td').allInnerTexts();
    console.log(cellTexts.join('\t|\t'));
  }

  // ── 5. FILTER ROWS BY CELL VALUE (books by Mukesh) ────────────────────────
  // ✅ Preferred approach: locator.filter() — no manual loop required
  const mukeshRows = rows.filter({ hasText: 'Mukesh' });
  await expect(mukeshRows).toHaveCount(2);

  for (const mRow of await mukeshRows.all()) {
    const title = await mRow.locator('td').nth(0).innerText();
    console.log(`- Mukesh book: ${title}`);
  }

  // ── 6. AGGREGATE: Sum of all book prices ──────────────────────────────────
  let totalPrice = 0;
  for (const row of allRows) {
    const priceText = await row.locator('td').nth(3).innerText();
    totalPrice += parseInt(priceText, 10);
  }
  console.log('\nTotal Price of all books:', totalPrice);
  expect(totalPrice).toBe(7100);
});
```

---

## 5. Locator Chaining for Complex Table Structures

Real-world tables often have nested elements, action buttons, or inputs inside cells. Playwright locators are fully chainable.

### 🔍 Code Example: Interacting with Table Action Buttons

```javascript
test('Interact with action buttons inside table rows', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');

  const rows = page.locator("table[name='BookTable'] tbody tr");

  // Find the row containing 'Selenium' and click its Delete button
  const seleniumRow = rows.filter({ hasText: 'Selenium' });
  
  // Verify the row exists before interacting
  await expect(seleniumRow).toHaveCount(1);

  // Click a button inside that row (e.g., an action button in the last column)
  // await seleniumRow.locator('button[aria-label="Delete"]').click();

  // Example: Read the price from the Selenium row
  const price = await seleniumRow.locator('td').nth(3).innerText();
  console.log('Selenium book price:', price);
});
```

### 🔍 Code Example: Reading Cell by Column Header Name (Resilient Pattern)

A robust approach is to find the column index from the header row dynamically, so your test doesn't break if columns are reordered.

```javascript
test('Read cell by column header name (resilient)', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');

  // 1. Collect header names into an array to find column index dynamically
  const headers = page.locator("table[name='BookTable'] thead tr th");
  const headerTexts = await headers.allInnerTexts();
  const priceColIndex = headerTexts.indexOf('Price');
  console.log('Price column is at index:', priceColIndex); // e.g., 3

  // 2. Use the dynamic index to read the price from every data row
  const rows = page.locator("table[name='BookTable'] tbody tr");
  for (const row of await rows.all()) {
    const price = await row.locator('td').nth(priceColIndex).innerText();
    console.log('Price:', price);
  }
});
```

---

## 6. Best Practices & Common Pitfalls

![Web Tables — Best Practices & Common Pitfalls](/img/playwright_table_best_practices.png)

| Scenario | ❌ Avoid | ✅ Prefer |
| :--- | :--- | :--- |
| Assert text content | `allInnerTexts()` + manual compare | `expect(locator).toHaveText(...)` |
| Count rows | `(await rows.all()).length` | `await rows.count()` or `expect(rows).toHaveCount(n)` |
| Filter rows by value | Manual `for` loop + `if` check | `rows.filter({ hasText: 'value' })` |
| Access first/last element | `(await locator.all())[0]` | `locator.first()` or `locator.last()` |
| Assert a single row's text | `innerText()` + `toBe()` | `expect(row.locator('td')).toHaveText([...])` |

---

## 7. API Quick Reference

| Method | Signature | Added | Description |
| :--- | :--- | :---: | :--- |
| `innerText()` | `→ Promise<string>` | v1.14 | Visible text of a single element |
| `textContent()` | `→ Promise<string \| null>` | v1.14 | Raw DOM text including hidden nodes |
| `allInnerTexts()` | `→ Promise<string[]>` | v1.14 | Visible text of all matching elements |
| `allTextContents()` | `→ Promise<string[]>` | v1.14 | Raw DOM text of all matching elements |
| `all()` | `→ Promise<Locator[]>` | v1.29 | Array of individual Locators (no auto-wait) |
| `count()` | `→ Promise<number>` | v1.14 | Number of matching elements |
| `nth(n)` | `→ Locator` | v1.14 | The nth matched element (0-indexed) |
| `first()` | `→ Locator` | v1.14 | Shorthand for `.nth(0)` |
| `last()` | `→ Locator` | v1.14 | The last matched element |
| `filter(options)` | `→ Locator` | v1.22 | Narrows locator by text or sub-locator |

---

*Reference: [Playwright Locator API](https://playwright.dev/docs/api/class-locator) | [Playwright Assertions](https://playwright.dev/docs/test-assertions) | [Pavan Online Trainings](https://www.pavanonlinetrainings.com) | [SDET Pavan YouTube](https://www.youtube.com/@sdetpavan)*
