---
title: Date Pickers
sidebar_position: 6
---

# Handling Date Pickers (Calendars)

Date pickers (calendars) allow users to select dates for flight bookings, reservations, or date ranges. In test automation, you can interact with them either by **typing values directly** into inputs or by **navigating the calendar UI**.

---

## 🔗 Practice Sites & Test URLs

Before starting, navigate to these practice/test websites to try out the code examples:
*   **Test Automation Practice:** [https://testautomationpractice.blogspot.com/](https://testautomationpractice.blogspot.com/)
*   **Booking.com:** [https://www.booking.com/](https://www.booking.com/)
*   **Dummy Ticket:** [https://www.dummyticket.com/](https://www.dummyticket.com/)
*   **IRCTC Train Search:** [https://www.irctc.co.in/nget/train-search](https://www.irctc.co.in/nget/train-search)

---

## 1. Direct Input Fill vs. UI Navigation

### 1.1 Direct Input (Using `fill()`)
If the date input field is editable, you can write to it directly using `fill()`. This is the fastest method.

> [!WARNING]
> **HTML Date Format Warning:** When using `fill()` on native `<input type="date">` elements, the browser expects the date string in the ISO **`YYYY-MM-DD`** format (e.g. `2025-10-20`). 
> If you attempt to fill it using local standard formats like `DD-MM-YYYY` (e.g., `20-10-2025`), the browser will reject it, resulting in a **Malformed value** error.

### 1.2 UI-Based Calendar Navigation
If the input field is read-only, or you need to simulate real user behavior, you must open the calendar popup, click the next/previous navigation buttons until the target month/year is loaded, and then click the target date cell.

---

## 2. Standard jQuery Date Picker (Next/Prev Navigation)

Standard calendars display the active month and year as label text with next/previous buttons to slide the view.

### 🔍 Automation Steps:
1. Click the input box to expand the calendar.
2. Run a `while` loop to capture the currently displayed Month and Year.
3. If the displayed Month/Year doesn't match the target, click the **Next** button (for future dates) or the **Previous** button (for past dates).
4. Once the target month/year is reached, scrape all day cell locators, loop through them, and click the one matching your target date.

### 🔍 Code Example: Future & Past Navigation
```javascript
import { test, expect, Page } from '@playwright/test';

async function selectJQueryDate(
  page: Page,
  targetYear: string,
  targetMonth: string,
  targetDate: string,
  isFuture: boolean
) {
  // Loop until month and year match
  while (true) {
    const currentMonth = await page
      .locator('.ui-datepicker-month')
      .textContent();
    const currentYear = await page
      .locator('.ui-datepicker-year')
      .textContent();

    if (currentMonth === targetMonth && currentYear === targetYear) {
      break;
    }

    // Navigate forwards or backwards
    if (isFuture) {
      await page.locator('.ui-datepicker-next').click();
    } else {
      await page.locator('.ui-datepicker-prev').click();
    }
  }

  // Click the specific date cell
  const allDates = await page.locator('.ui-datepicker-calendar td a').all();
  for (const dateCell of allDates) {
    const dateText = await dateCell.innerText();
    if (dateText === targetDate) {
      await dateCell.click();
      break;
    }
  }
}

test('jQuery Datepicker Automation', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');
  const dateInput = page.locator('#datepicker');
  await dateInput.click();

  // Target: Past date 15th June 2024
  await selectJQueryDate(page, '2024', 'June', '15', false);

  // Assertion: Verify correct date format (MM/DD/YYYY)
  await expect(dateInput).toHaveValue('06/15/2024');
});
```

---

## 3. jQuery Date Picker with Dropdowns (Direct Select)

Some calendars include dropdown menus (`<select>`) for the Month and Year inside the calendar header. This enables direct selection without looping next/prev clicks.

### 🔍 Code Example: Dropdown Calendar
```javascript
async function selectDropdownDate(
  page: Page,
  targetYear: string,
  targetMonth: string,
  targetDate: string
) {
  // 1. Direct option select for Year
  await page
    .locator('select.ui-datepicker-year')
    .selectOption({ label: targetYear });

  // 2. Direct option select for Month
  await page
    .locator('select.ui-datepicker-month')
    .selectOption({ label: targetMonth });

  // 3. Click the date number cell
  const dateCells = await page.locator('table.ui-datepicker-calendar a').all();
  for (const cell of dateCells) {
    const dateText = await cell.innerText();
    if (dateText === targetDate) {
      await cell.click();
      break;
    }
  }
}

test('Date Picker with Dropdowns', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');
  const dateInput = page.locator('#txtDate');
  await dateInput.click();

  // Target: 15th May 2026
  await selectDropdownDate(page, '2026', 'May', '15');

  // Assertion: Verify correct date format (DD/MM/YYYY)
  await expect(dateInput).toHaveValue('15/05/2026');
});
```

---

## 4. Bootstrap Date Pickers (Side-by-Side Dual Calendars)

Websites like Booking.com display side-by-side calendars (e.g., Check-in and Check-out months). Since multiple grids are displayed simultaneously, you must use index selectors (`nth(0)`, `nth(1)`) to ensure actions target the correct grid.

### 🔍 Code Example: Booking.com Dates selection
```javascript
test('Booking.com Date Selection', async ({ page }) => {
  await page.goto('https://www.booking.com/');

  // Open calendar
  await page.getByTestId('searchbox-dates-container').click();

  const checkinYear = "2026";
  const checkinMonth = "June";
  const checkinDay = "20";

  // 1. Check-in Date Loop (left calendar grid - nth(0))
  while (true) {
    const header = page.locator("h3[aria-live='polite']").nth(0);
    const monthYearHeader = await header.innerText();
    const currentMonth = monthYearHeader.split(" ")[0];
    const currentYear = monthYearHeader.split(" ")[1];

    if (currentMonth === checkinMonth && currentYear === checkinYear) {
      break;
    } else {
      await page.locator('button[aria-label="Next month"]').click();
    }
  }

  // Click the day number inside the left grid
  const checkinDays = await page
    .locator('table.b8fcb0c66a tbody')
    .nth(0)
    .locator('td')
    .all();

  for (const dayCell of checkinDays) {
    const text = await dayCell.innerText();
    if (text === checkinDay) {
      await dayCell.click();
      break;
    }
  }
});
```

---

## 5. End-to-End Labs: Visas & Flights

### 5.1 Dummy Ticket visa Booking
The website `https://www.dummyticket.com` contains a full checkout application involving passenger forms, state/country select search items, and multiple dropdown-based calendars.

```javascript
test('Dummy Ticket Booking Form', async ({ page }) => {
  // Wrap long target URL to keep code layout bounded
  const dummyTicketUrl = 
    'https://www.dummyticket.com/' +
    'dummy-ticket-for-visa-application/';

  await page.goto(dummyTicketUrl);
  await expect(page).toHaveTitle(/Dummy ticket/);

  // Fill text and check radio options
  await page.locator('#product_549').check();
  await page.locator('[name="travname"]').fill('Akash');
  await page.locator('#travlastname').fill('Ratore');

  // 1. Date of Birth (uses datepicker selectors)
  await page.locator('#dob').click();
  await page
    .locator('select[data-handler="selectYear"]')
    .selectOption("2001");
  await page
    .locator('select.ui-datepicker-month')
    .selectOption("Mar");
  
  const dobCells = await page.locator('table.ui-datepicker-calendar td a').all();
  for (const cell of dobCells) {
    if (await cell.textContent() === "2") {
      await cell.click();
      break;
    }
  }

  // 2. Departure Date (uses selectMonth/selectYear)
  await page.locator('#departon').click();
  await page
    .locator('select[data-handler="selectYear"]')
    .selectOption("2025");
  await page
    .locator('select[aria-label="Select month"]')
    .selectOption("Nov");
  
  const departCells = await page
    .locator('table.ui-datepicker-calendar td a')
    .all();

  for (const cell of departCells) {
    if (await cell.textContent() === "25") {
      await cell.click();
      break;
    }
  }

  // Check form values filled successfully
  const dobValue = await page.locator('#dob').inputValue();
  expect(dobValue).not.toBe('');
});
```

### 5.2 IRCTC Ticket Calendar
On the IRCTC train search page, after clicking the departure field, automate month/year assertions and clicks on `a.ui-datepicker-next` before selecting the departure day cell.

```javascript
test('IRCTC Date Selection', async ({ page }) => {
  await page.goto('https://www.irctc.co.in/nget/train-search');
  
  const dateInput = page.locator('#jDate span input');
  await dateInput.click();

  // Find target June 2025
  while (true) {
    const currentMonth = await page
      .locator('span.ui-datepicker-month')
      .innerText();
    const currentYear = await page
      .locator('span.ui-datepicker-year')
      .innerText();

    if (currentMonth === 'June' && currentYear === '2025') {
      break;
    } else {
      await page.click('a.ui-datepicker-next');
    }
  }

  // Select 10th day
  const dateCells = await page
    .locator('table.ui-datepicker-calendar tbody td a')
    .all();

  for (const cell of dateCells) {
    if (await cell.innerText() === '10') {
      await cell.click();
      break;
    }
  }

  // Verify formatted value
  await expect(dateInput).toHaveValue('10/06/2025');
});
```

---
*Reference: [Pavan Online Trainings](https://www.pavanonlinetrainings.com) | [SDET Pavan YouTube](https://www.youtube.com/@sdetpavan)*
