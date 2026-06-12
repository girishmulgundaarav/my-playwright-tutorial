---
title: Parameterization & Data-Driven Testing
sidebar_position: 5
---

# Parameterization & Data-Driven Testing

Hardcoding credentials, URLs, and inputs within your tests makes them rigid, difficult to maintain, and hard to scale. To keep your code clean and reusable, it is best practice to separate test logic from test data. 

**Data-Driven Testing (DDT)** is a methodology where test scripts are executed repeatedly using inputs read from external data stores (like local arrays, JSON files, CSV lists, or Excel spreadsheets).

This guide covers basic test parameterization techniques, reading structured datasets from JSON, parsing CSV tables, converting Excel workbooks into dynamic test scenarios, and executing concurrent parameterized tests in Playwright.

---

## 🔗 Practice Sites & Test URLs

Before starting, navigate to these practice/test websites to try out the code examples:
*   **Demo Web Shop:** [https://demowebshop.tricentis.com/](https://demowebshop.tricentis.com/)
*   **Demo Web Shop:** [https://demowebshop.tricentis.com/login](https://demowebshop.tricentis.com/login)

---

## 1. Data-Driven Testing Architecture

In a standard Playwright data-driven execution, external files are loaded and parsed into standard JavaScript objects during the test-runner initial compilation phase. These records are then looped over to instantiate distinct test case scenarios:

![Playwright Data-Driven Testing Flow](/img/playwright_data_driven.png)

---

## 2. Basic Parameterization (Local Arrays)

The simplest way to parameterize tests is by defining local data arrays directly inside your test file and looping over them to generate tests dynamically.

### A. Looping Over String Arrays (`for-of` and `forEach`)
To run the same search logic with different query terms, you can iterate over a list of items:

```typescript
import { test, expect } from '@playwright/test';

const searchItems: string[] = ['laptop', 'Gift card', 'smartphone', 'monitor'];

test.describe('Searching Items Suite', () => {
  // Option 1: Using forEach
  searchItems.forEach((item) => {
    test(`Search test for element: "${item}"`, async ({ page }) => {
      await page.goto('https://demowebshop.tricentis.com/');
      await page.locator('#small-searchterms').fill(item);
      await page.locator("input[value='Search']").click();
      
      // Verify results contain query term
      await expect.soft(page.locator('h2 a').nth(0))
        .toContainText(item, { ignoreCase: true });
    });
  });
});
```

### B. Multi-Parameter Array Loop (`string[][]`)
When validating complex behaviors like form submissions or user logins, you can loop over multi-dimensional arrays representing multiple inputs and expected outcomes:

```typescript
import { test, expect } from '@playwright/test';

// Format: [Email, Password, Validity]
const loginTestData: string[][] = [
  ["laura.taylor1234@example.com", "test123", "valid"],
  ["invaliduser@example.com", "wrongpassword", "invalid"],
  ["validuser@example.com", "wrongpassword2", "invalid"],
  ["", "", "invalid"],
];

for (const [email, password, validity] of loginTestData) {
  test.describe('Authentication Loops', () => {
    test(`Login test with email: "${email}" and password: "${password}"`, async ({ page }) => {
      await page.goto('https://demowebshop.tricentis.com/login');

      await page.locator('#Email').fill(email);
      await page.locator('#Password').fill(password);
      await page.locator('input[value="Log in"]').click();

      if (validity === 'valid') {
        // Assert logout link is visible (login successful)
        await expect(page.locator('a[href="/logout"]')).toBeVisible({ timeout: 5000 });
      } else {
        // Assert validation error container is visible
        await expect(page.locator('.validation-summary-errors')).toBeVisible({ timeout: 5000 });
        await expect(page).toHaveURL('https://demowebshop.tricentis.com/login');
      }
    });
  });
}
```

---

## 3. Reading Data from JSON

JSON (JavaScript Object Notation) is a lightweight, human-readable format. It is the built-in format for handling structured data in Node.js environments.

### A. The JSON Data File (`testdata/data.json`)
```json
[
  {
    "email": "laura.taylor1234@example.com",
    "password": "test123",
    "validity": "valid"
  },
  {
    "email": "invaliduser@example.com",
    "password": "wrongpassword",
    "validity": "invalid"
  }
]
```

### B. Reading JSON in Playwright Tests
Node.js provides the native File System (`fs`) module. You can use it alongside `JSON.parse` to read and load data synchronously during suite initialization:

```typescript
import { test, expect } from '@playwright/test';
import fs from 'fs';

// Load JSON test data synchronously
const jsonPath = 'testdata/data.json';
const loginData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

test.describe('JSON Data-Driven Authentication', () => {
  for (const { email, password, validity } of loginData) {
    test(`Login validation for ${email}`, async ({ page }) => {
      await page.goto('https://demowebshop.tricentis.com/login');

      await page.locator('#Email').fill(email);
      await page.locator('#Password').fill(password);
      await page.locator('input[value="Log in"]').click();

      if (validity.toLowerCase() === 'valid') {
        await expect(page.locator('a[href="/logout"]')).toBeVisible({ timeout: 5000 });
      } else {
        await expect(page.locator('.validation-summary-errors')).toBeVisible({ timeout: 5000 });
      }
    });
  }
});
```

---

## 4. Reading Data from CSV

CSV (Comma-Separated Values) is a tabular text file format. It is lightweight, flat, and ideal for storing bulk row-based structures.

### Prerequisites
To parse CSV files, install the `csv-parse` module:
```bash
npm install csv-parse
```

### A. The CSV Data File (`testdata/data.csv`)
```csv
email,password,validity
laura.taylor1234@example.com,test123,valid
invaliduser@example.com,wrongpassword,invalid
```

### B. Reading CSV in Playwright Tests
Use Node's `fs` to read the raw CSV text, and call the synchronous `parse` method from `csv-parse/sync` to convert it into object records:

```typescript
import { test, expect } from '@playwright/test';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

// Load and parse CSV file
const csvPath = 'testdata/data.csv';
const fileContent = fs.readFileSync(csvPath, 'utf-8');

const records = parse(fileContent, {
  columns: true,           // Treat the first row as header keys
  skip_empty_lines: true   // Filter out empty rows
});

test.describe('CSV Data-Driven Suite', () => {
  for (const data of records) {
    test(`CSV Login check: "${data.email}"`, async ({ page }) => {
      await page.goto('https://demowebshop.tricentis.com/login');

      await page.locator('#Email').fill(data.email);
      await page.locator('#Password').fill(data.password);
      await page.locator('input[value="Log in"]').click();

      if (data.validity.toLowerCase() === 'valid') {
        await expect(page.locator('a[href="/logout"]')).toBeVisible({ timeout: 5000 });
      } else {
        await expect(page.locator('.validation-summary-errors')).toBeVisible({ timeout: 5000 });
      }
    });
  }
});
```

---

## 5. Reading Data from Excel (XLSX)

Excel sheets are widely used in enterprise testing pipelines for managing datasets. Playwright can read worksheets using the popular `xlsx` library.

### Prerequisites
Install the `xlsx` parsing module:
```bash
npm install xlsx
```

### A. Reading Excel in Playwright Tests
The `xlsx` library loads a workbook file, letting you navigate its sheets, retrieve sheet contents, and convert tabular ranges directly into JSON object arrays using `sheet_to_json`:

```typescript
import { test, expect } from '@playwright/test';
import * as XLSX from 'xlsx';

// Load Workbook and Sheet
const excelPath = 'testdata/data.xlsx';
const workbook = XLSX.readFile(excelPath);
const firstSheetName = workbook.SheetNames[0]; // Selects the first sheet
const worksheet = workbook.Sheets[firstSheetName];

// Convert worksheet rows to JSON object array
const loginData: any[] = XLSX.utils.sheet_to_json(worksheet);

test.describe('Excel Data-Driven Suite', () => {
  for (const { email, password, validity } of loginData) {
    test(`Excel Authentication check: "${email}"`, async ({ page }) => {
      await page.goto('https://demowebshop.tricentis.com/login');

      await page.locator('#Email').fill(email);
      await page.locator('#Password').fill(password);
      await page.locator('input[value="Log in"]').click();

      if (validity.toLowerCase() === 'valid') {
        await expect(page.locator('a[href="/logout"]')).toBeVisible({ timeout: 5000 });
      } else {
        await expect(page.locator('.validation-summary-errors')).toBeVisible({ timeout: 5000 });
      }
    });
  }
});
```

---

## 💡 Advanced Best Practices

*   **Distinct Test Names**: Always assign unique names to your tests dynamically using string interpolation (e.g., ``test(`Login: ${email}`, ...)``). Duplicate test names can confuse test runners and clutter execution reports.
*   **Synchronous Initialization**: Since tests are defined dynamically, you must read and parse data files **synchronously** (e.g., `fs.readFileSync` or `XLSX.readFile`) at the root level of your file so the test blocks exist when Playwright scans your spec files.
*   **Environment Swapping**: You can point to different data files (e.g. `data-dev.json` vs `data-staging.json`) dynamically using environment variables:
    ```typescript
    const dataPath = process.env.TEST_ENV === 'staging' 
      ? 'testdata/staging-data.json' 
      : 'testdata/dev-data.json';
    ```

---

## 🏋️ Hands-on Lab Assignments

### Exercise 1: Looping String Array Search
1. Create a local array containing 4 search queries.
2. Structure a `forEach` loop that navigates to the Demo Web Shop search page, queries each item, and asserts that the search results header contains the queried keyword.

### Exercise 2: Implementing JSON Data Login
1. Setup a directory named `testdata/` at the root of your project.
2. Create a `testdata/login.json` file containing one valid credentials object and two invalid logins.
3. Write a spec file that imports `fs`, parses the JSON file, loops through each object, and executes the login sequence.

### Exercise 3: Reading Tabular Excel Data
1. Install the `xlsx` package.
2. Create an Excel sheet `testdata/users.xlsx` with three columns: `email`, `password`, and `validity`. Fill in multiple rows.
3. Write a Playwright script to parse sheet 0, translate the rows to JSON objects, and run login checks.

---

```quiz
{
  "question": "Why must you read external files synchronously (like fs.readFileSync) when using them for parameterized tests?",
  "options": [
    "Because asynchronous reads can block the browser launch",
    "Because Playwright requires all test definitions to be declared synchronously during the initial file evaluation phase",
    "Because Node.js does not support asynchronous file reading in test folders",
    "Because synchronous reads execute faster than asynchronous ones"
  ],
  "answer": 1,
  "explanation": "Playwright must register and know all test cases synchronously during the compilation/setup phase before execution begins. Using async reads (like fs.readFile) means the tests will not be declared when Playwright collects the suite."
}
```

```quiz
{
  "question": "Which package is commonly used in Playwright to parse CSV test data synchronously?",
  "options": [
    "csv-parse/sync",
    "csv-writer",
    "xlsx",
    "fs-extra"
  ],
  "answer": 0,
  "explanation": "The 'csv-parse' library (specifically importing 'parse' from 'csv-parse/sync') is standard for synchronously parsing CSV records in Playwright."
}
```

```quiz
{
  "question": "How do you convert a loaded Excel sheet into an array of JavaScript objects?",
  "options": [
    "JSON.parse(worksheet)",
    "XLSX.readFile(worksheet)",
    "XLSX.utils.sheet_to_json(worksheet)",
    "worksheet.toArray()"
  ],
  "answer": 2,
  "explanation": "XLSX.utils.sheet_to_json() takes a worksheet object and parses its rows and columns into an array of key-value objects, using the first row as object keys."
}
```
