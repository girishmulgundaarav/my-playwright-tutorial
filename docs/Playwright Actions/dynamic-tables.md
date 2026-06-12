---
title: Dynamic & Paginated Tables
sidebar_position: 5
---

# Handling Dynamic & Paginated Tables

Modern web applications present tabular datasets that are either **dynamic** (content changes or shifts positions dynamically) or **paginated** (split across multiple pages). This guide covers how to handle dynamic text comparisons, multi-page pagination extraction, and a complete end-to-end flight booking flow.

---

## 🔗 Practice Sites & Test URLs

Before starting, navigate to these practice/test websites to try out the code examples:
*   **Blazedemo.com:** [https://blazedemo.com/](https://blazedemo.com/)
*   **DataTables Example:** [https://datatables.net/examples/basic_init/zero_configuration.html](https://datatables.net/examples/basic_init/zero_configuration.html)
*   **Test Automation Practice:** [https://testautomationpractice.blogspot.com/](https://testautomationpractice.blogspot.com/)

---

## 1. Handling Dynamic Web Tables

Dynamic tables change content (values, rows, or column orders) in real-time or upon page refresh. Locating cells based on static indices will fail. You must locate rows by scanning for unique text matching cell values.

### 🔍 Real-World Lab: CPU and Memory Validation
On practice pages like `https://testautomationpractice.blogspot.com/` (the Task Table) or `https://practice.expandtesting.com/dynamic-table`, a grid displays system processes. The goal is to find the row matching a specific process (e.g., `Chrome` or `Firefox`) and compare its values against colored summary cards.

#### 💡 Regex Matching for MB/s
When checking text matching elements, values like `MB` might match multiples. Using regular expressions like `/MB$/` ensures we match strings that end precisely with `MB`.

### 🔍 Code Example: Dynamic Table Automation
```javascript
import { test, expect, Locator } from '@playwright/test';

test('Scenario 1: Chrome CPU load should match yellow label', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');

  // Convert row locators to array
  const rows: Locator[] = await page.locator("table#taskTable tbody tr").all();

  for (const row of rows) {
    const processName = await row.locator('td').nth(0).innerText();
    
    // Find the Chrome row
    if (processName === 'Chrome') {
      const cpuLoad = await row.locator("td", { hasText: '%' }).innerText();
      const expectedCpu = await page.locator('strong.chrome-cpu').innerText();
      
      console.log(`Chrome CPU: Web=${cpuLoad} | Card=${expectedCpu}`);
      expect(cpuLoad).toBe(expectedCpu);
      break;
    }
  }
});

test('Scenario 2: Firefox Memory usage should match blue label', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');
  const rows: Locator[] = await page.locator("table#taskTable tbody tr").all();

  for (const row of rows) {
    const processName = await row.locator('td').nth(0).innerText();
    
    if (processName === 'Firefox') {
      // Use regex /MB$/ to avoid matches with 'MB/s'
      const memoryUsage = await row.locator("td", { hasText: /MB$/ }).innerText();
      const expectedMemory = await page.locator('strong.firefox-memory').innerText();
      
      console.log(`Firefox Memory: Web=${memoryUsage} | Card=${expectedMemory}`);
      expect(memoryUsage).toBe(expectedMemory);
      break;
    }
  }
});
```

---

## 2. Automating Paginated Tables

Paginated tables divide large datasets into page views. To scrape or interact with all elements, you must navigate through pages dynamically.

### 2.1 Strategy A: Using the "Next" Navigation Button
For tables with a "Next" button (e.g. DataTables pages), run a `while` loop that extracts the page's contents, clicks "Next", and halts when the Next button has the `disabled` CSS class.

```javascript
test('Extract data from all table pages using Next button', async ({ page }) => {
  await page.goto('https://datatables.net/examples/basic_init/zero_configuration.html');

  let hasMorePages = true;

  while (hasMorePages) {
    // 1. Scrape all rows on current page
    const rows = await page.locator("#example tbody tr").all();
    for (const row of rows) {
      console.log(await row.innerText());
    }

    // 2. Locate Next button and check classes
    const nextButton = page.locator("button[aria-label='Next']");
    const classAttribute = await nextButton.getAttribute('class');

    if (classAttribute?.includes('disabled')) {
      hasMorePages = false; // Last page reached
    } else {
      await nextButton.click(); // Click to next page
      await page.waitForTimeout(1000); // Wait for animations
    }
  }
});
```

### 2.2 Strategy B: Using Numbered Pagination Links
If the page features numbered links (e.g., page 1, page 2), scrape all page element locators, loop over them by index, and click each to handle row options.

```javascript
test('Check all checkboxes across paginated pages', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');

  // Scrape list items representing pages
  const pageLinks = await page.locator('ul#pagination li').all();
  console.log(`Table has ${pageLinks.length} pages.`);

  for (let i = 0; i < pageLinks.length; i++) {
    // Click page number
    await pageLinks[i].click();
    await page.waitForTimeout(1000);

    const rows = await page.locator('table#productTable tbody tr').all();
    for (const row of rows) {
      const id = await row.locator('td').nth(0).innerText();
      const name = await row.locator('td').nth(1).innerText();
      const price = await row.locator('td').nth(2).innerText();
      
      // Click the checkbox inside the 4th cell
      await row.locator('td').nth(3).locator('input').click();
      console.log(`Page ${i + 1} Checked: ID=${id} | Name=${name} | Price=${price}`);
    }
  }
});
```

---

## 3. End-to-End Lab: BlazeDemo Booking Flow

The flight-booking demo (`blazedemo.com`) involves selecting options, counting rows, finding the cheapest price from a dynamic table, purchasing, and confirming checkout.

```javascript
test('BlazeDemo Flight Booking Flow - Select Lowest Price Flight', async ({ page }) => {
  // 1. Navigate to BlazeDemo homepage
  await page.goto('https://blazedemo.com/');
 
  // 2. Select departure city
  await page.locator('select[name="fromPort"]').selectOption('Boston');

  // 3. Select destination city
  await page.locator('select[name="toPort"]').selectOption('London');

  // 4. Submit Search
  await page.locator('input[type="submit"]').click();

  // 5. Count flight matches in results table
  const rows = page.locator('table.table tbody tr');
  const rowCount = await rows.count();
  console.log('Available flight matches:', rowCount);
  expect(rowCount).toBeGreaterThan(0);

  // 6. Capture prices into array
  const prices: string[] = [];
  for (let i = 0; i < rowCount; i++) {
    const priceText = await rows.nth(i).locator('td').nth(5).innerText(); // 6th column (index 5)
    prices.push(priceText);
  }

  // 7. Sort the price strings to identify the cheapest flight
  console.log('Flight Prices Found:', prices);
  const sortedPrices = [...prices].sort();
  const lowestPrice = sortedPrices[0];
  console.log('Cheapest Price:', lowestPrice);

  // 8. Find cheapest flight row and click "Choose This Flight"
  for (let i = 0; i < rowCount; i++) {
    const priceText = await rows.nth(i).locator('td').nth(5).innerText();
    if (priceText === lowestPrice) {
      await rows.nth(i).locator('td input[type="submit"]').click();
      break;
    }
  }

  // 9. Complete passenger details form
  await page.locator('#inputName').fill('John');
  await page.locator('#address').fill('1403 American Beauty Ln');
  await page.locator('#city').fill('Columbus');
  await page.locator('#state').fill('OH');
  await page.locator('#zipCode').fill('43240');
  await page.locator("#cardType").selectOption("American Express");
  await page.locator('#creditCardNumber').fill('6789067345231267');
  await page.locator('#creditCardMonth').fill('10');  
  await page.locator('#creditCardYear').fill('2024'); 
  await page.locator('#nameOnCard').fill('John Canedy');

  // Click purchase submit button
  await page.locator('input[value="Purchase Flight"]').click();

  // 10. Confirm Booking Confirmation
  const confirmationText = await page.locator('h1').textContent();
  console.log('Server Message:', confirmationText);
  
  if (confirmationText?.includes('Thank you for your purchase')) {
    console.log('Success !! Passed');
  } else {
    console.log('Failed');
  }
  expect(confirmationText).toContain('Thank you for your purchase');
});
```

---
*Reference: [Pavan Online Trainings](https://www.pavanonlinetrainings.com) | [SDET Pavan YouTube](https://www.youtube.com/@sdetpavan)*
