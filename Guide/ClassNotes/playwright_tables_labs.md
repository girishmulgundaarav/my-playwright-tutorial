# Playwright Automation Lab Guide: Tables & Data Grids

This lab guide covers 12 distinct automation exercises divided across three challenge areas: the Employee Directory Master Grid, the Infinite Scrolling Logs Feed, and the Dynamic Columns Table. These exercises teach students how to interact with grid structures, handle network delays, automate pagination, audit search highlights, monitor custom scrolls, handle file downloads, and write robust locators for dynamic columns.

---

## 🛠️ Global Setup

```typescript
import { test, expect } from '@playwright/test';

test.describe('Tables & Data Grids Automation Lab', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Tables & Data Grids page
    await page.goto('/tables');
  });
});
```

---

## 📋 Challenge A: The Employee Directory Master Grid (Labs 1–10)

This section targets the master employee table with advanced controls, state changes, and CRUD actions.

### Lab 1: Selection & Count Tracking
* **Objective**: Automate row selection checking individual checkboxes, master toggle check, and count badge sync.
* **Selectors**:
  * Row checkboxes: `data-testid="row-checkbox-${id}"`
  * Master checkbox: `data-testid="master-checkbox"`
  * Selection badge: `data-testid="selected-count-badge"`
* **Exercises**:
  1. Check individual checkboxes for Employee `1` (Alice) and Employee `3` (Charlie).
  2. Assert the selection badge displays `2`.
  3. Check the master checkbox to select all rows in the list.
  4. Assert the selection badge count matches the total number of employee records.
  5. Uncheck the master checkbox and verify that the selection badge resets to `0`.

```typescript
test('Lab 1: Selection & Count Tracking', async ({ page }) => {
  const badge = page.getByTestId('selected-count-badge');
  const masterBox = page.getByTestId('master-checkbox');

  // Select individual records
  await page.getByTestId('row-checkbox-1').check();
  await page.getByTestId('row-checkbox-3').check();
  await expect(badge).toHaveText('2');

  // Select all via master checkbox
  await masterBox.check();
  // Read total rows dynamically (for matching the badge value)
  const rows = page.locator('tbody tr[data-testid^="employee-row-"]');
  const totalCount = await rows.count();
  await expect(badge).toHaveText(String(totalCount));

  // Reset selection
  await masterBox.uncheck();
  await expect(badge).toHaveText('0');
});
```

---

### Lab 2: Search Query & Highlighting
* **Objective**: Filter records using search inputs and audit match highlights inside the cells.
* **Selectors**:
  * Search input: `data-testid="table-search-input"`
  * Highlighting tag: `data-testid="highlighted-text"`
  * Row container: `[data-testid^="employee-row-"]`
* **Exercises**:
  1. Click search input and type `"Security"`.
  2. Verify that the table filters the dataset to display only records containing "Security".
  3. Extract all elements matching `data-testid="highlighted-text"`.
  4. Assert that each highlighted element has the exact text `"Security"` (case-insensitive).

```typescript
test('Lab 2: Search Query & Highlighting', async ({ page }) => {
  const searchInput = page.getByTestId('table-search-input');
  await searchInput.fill('Security');

  // Wait for the table rows to update
  const rows = page.locator('tbody tr[data-testid^="employee-row-"]');
  await expect(rows).toHaveCount(3); // Hannah, Lara, Nancy

  // Audit highlighted text
  const highlights = page.getByTestId('highlighted-text');
  const count = await highlights.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const text = await highlights.nth(i).textContent();
    expect(text?.toLowerCase()).toBe('security');
  }
});
```

---

### Lab 3: Expandable Detail Panels
* **Objective**: Expand row sub-panels and extract hidden information.
* **Selectors**:
  * Expand/collapse button: `data-testid="row-expand-btn-${id}"`
  * Detail panel row: `data-testid="expanded-row-${id}"`
  * Salary detail element: `data-testid="detail-salary-${id}"`
* **Exercises**:
  1. Click the expand button for Employee `2` (Bob).
  2. Assert the detailed panel row (`data-testid="expanded-row-2"`) becomes visible.
  3. Extract the salary information from the sub-panel.
  4. Assert the salary matches Bob's salary value of `"$110,000"`.
  5. Collapse the panel and verify it is hidden.

```typescript
test('Lab 3: Expandable Detail Panels', async ({ page }) => {
  const expandBtn = page.getByTestId('row-expand-btn-2');
  const detailPanel = page.getByTestId('expanded-row-2');
  const salaryText = page.getByTestId('detail-salary-2');

  // Expand panel
  await expandBtn.click();
  await expect(detailPanel).toBeVisible();
  await expect(salaryText).toHaveText('$110,000');

  // Collapse panel
  await expandBtn.click();
  await expect(detailPanel).toBeHidden();
});
```

---

### Lab 4: Dynamic Sorting Auditor
* **Objective**: Verify that dynamic sorting works in ascending and descending orders by reading cell data.
* **Selectors**:
  * Header sort buttons: `data-testid="header-name"`, `data-testid="header-role"`
  * Cell values: `tbody tr[data-testid^="employee-row-"] td:nth-child(3)` (or locate by column class)
* **Exercises**:
  1. Click the **Name** header. Assert that column values are sorted alphabetically (A to Z).
  2. Click the **Name** header again. Assert that column values are sorted in reverse-alphabetical order (Z to A).

```typescript
test('Lab 4: Dynamic Sorting Auditor', async ({ page }) => {
  const nameHeader = page.getByTestId('header-name');

  // 1. Sort Ascending
  await nameHeader.click();
  // Helper to extract visible names (taking pagination into account)
  let names = await page.locator('tbody tr[data-testid^="employee-row-"] td:nth-child(3)').allTextContents();
  let sortedNamesAsc = [...names].sort((a, b) => a.localeCompare(b));
  expect(names).toEqual(sortedNamesAsc);

  // 2. Sort Descending
  await nameHeader.click();
  names = await page.locator('tbody tr[data-testid^="employee-row-"] td:nth-child(3)').allTextContents();
  let sortedNamesDesc = [...names].sort((a, b) => b.localeCompare(a));
  expect(names).toEqual(sortedNamesDesc);
});
```

---

### Lab 5: Dynamic Pagination
* **Objective**: Navigate multi-page data sets and verify status counters.
* **Selectors**:
  * Next page button: `data-testid="next-page-btn"`
  * Previous page button: `data-testid="prev-page-btn"`
  * Page indicator text: `data-testid="page-indicator"`
* **Exercises**:
  1. Verify the indicator says `"Page 1 of 3"` initially.
  2. Verify the **Previous** button is disabled.
  3. Click **Next** to navigate to Page 2.
  4. Verify the indicator changes to `"Page 2 of 3"`.
  5. Verify both **Previous** and **Next** buttons are enabled.

```typescript
test('Lab 5: Dynamic Pagination', async ({ page }) => {
  const prevBtn = page.getByTestId('prev-page-btn');
  const nextBtn = page.getByTestId('next-page-btn');
  const indicator = page.getByTestId('page-indicator');

  // Page 1 initial checks
  await expect(indicator).toHaveText('Page 1 of 3');
  await expect(prevBtn).toBeDisabled();

  // Navigate to Page 2
  await nextBtn.click();
  await expect(indicator).toHaveText('Page 2 of 3');
  await expect(prevBtn).toBeEnabled();
  await expect(nextBtn).toBeEnabled();
});
```

---

### Lab 6: Column Visibility Toggles
* **Objective**: Hide or show columns dynamically and assert structural layout updates.
* **Selectors**:
  * Toggle checkbox: `data-testid="column-toggle-${col}"` (e.g. `column-toggle-role`)
  * Header element: `data-testid="header-role"`
* **Exercises**:
  1. Uncheck the `"role"` toggle checkbox.
  2. Verify that the **Role** column header (`data-testid="header-role"`) is removed from the DOM.
  3. Check the `"role"` toggle checkbox.
  4. Verify that the column header becomes visible again.

```typescript
test('Lab 6: Column Visibility Toggles', async ({ page }) => {
  const roleToggle = page.getByTestId('column-toggle-role');
  const roleHeader = page.getByTestId('header-role');

  // Hide column
  await roleToggle.uncheck();
  await expect(roleHeader).toBeHidden();

  // Show column
  await roleToggle.check();
  await expect(roleHeader).toBeVisible();
});
```

---

### Lab 7: Inline Record CRUD: Edit & Update
* **Objective**: Perform inline modifications, handle edit states, and save updates.
* **Selectors**:
  * Edit button: `data-testid="edit-btn-${id}"`
  * Save button: `data-testid="edit-save-${id}"`
  * Input edit box: `data-testid="edit-name-input-${id}"`, `data-testid="edit-role-input-${id}"`, `data-testid="edit-status-select-${id}"`
* **Exercises**:
  1. Click **Edit** for Employee `1` (Alice).
  2. Fill the edit name field with `"Alice J. Smith"`.
  3. Select Status as `"On Leave"` from the inline status dropdown.
  4. Click **Save**.
  5. Assert the edit inputs disappear and values in the updated row reflect the changes.

```typescript
test('Lab 7: Inline Record CRUD: Edit & Update', async ({ page }) => {
  const editBtn = page.getByTestId('edit-btn-1');
  const saveBtn = page.getByTestId('edit-save-1');

  // Trigger Edit Mode
  await editBtn.click();

  const nameInput = page.getByTestId('edit-name-input-1');
  const statusSelect = page.getByTestId('edit-status-select-1');

  await nameInput.fill('Alice J. Smith');
  await statusSelect.selectOption('On Leave');
  await saveBtn.click();

  // Assert text changes
  const row = page.getByTestId('employee-row-1');
  await expect(row).toContainText('Alice J. Smith');
  await expect(row).toContainText('On Leave');
});
```

---

### Lab 8: Inline Record CRUD: Delete Record
* **Objective**: Remove items dynamically and assert table counts and values update.
* **Selectors**:
  * Delete button: `data-testid="delete-btn-${id}"`
  * Row container: `data-testid="employee-row-${id}"`
* **Exercises**:
  1. Click **Delete** on Employee `5` (Ethan Hunt).
  2. Verify that Employee row `5` is completely removed from the DOM.
  3. Verify the selection badge count and total pagination range updates.

```typescript
test('Lab 8: Inline Record CRUD: Delete Record', async ({ page }) => {
  const row5 = page.getByTestId('employee-row-5');
  const deleteBtn = page.getByTestId('delete-btn-5');

  await expect(row5).toBeVisible();
  await deleteBtn.click();

  // Assert removal
  await expect(row5).toBeHidden();
});
```

---

### Lab 9: Add Employee Form
* **Objective**: Add a record using the slide-down creation form.
* **Selectors**:
  * Add Button: `data-testid="add-employee-btn"`
  * Name field: `data-testid="add-emp-name"`
  * Role field: `data-testid="add-emp-role"`
  * Email field: `data-testid="add-emp-email"`
  * Department dropdown: `data-testid="add-emp-dept"`
  * Status radio button: checked by label `"Active"`
  * Submit button: `data-testid="add-emp-submit"`
* **Exercises**:
  1. Click **Add Employee** button.
  2. Fill Name with `"Girish Mulgund"`, Role with `"Principal Trainer"`, and Email with `"girish@comp.com"`.
  3. Select Department as `"Engineering"`.
  4. Submit the form.
  5. Assert the newly added record displays at the top of the grid.

```typescript
test('Lab 9: Add Employee Form', async ({ page }) => {
  // Open Form
  await page.getByTestId('add-employee-btn').click();

  // Populate Fields
  await page.getByTestId('add-emp-name').fill('Girish Mulgund');
  await page.getByTestId('add-emp-role').fill('Principal Trainer');
  await page.getByTestId('add-emp-email').fill('girish@comp.com');
  await page.getByTestId('add-emp-dept').selectOption('Engineering');
  
  // Submit Form
  await page.getByTestId('add-emp-submit').click();

  // Verify addition appears as the first element in the body
  const firstRow = page.locator('tbody tr[data-testid^="employee-row-"]').first();
  await expect(firstRow).toContainText('Girish Mulgund');
  await expect(firstRow).toContainText('Principal Trainer');
});
```

---

### Lab 10: Network Lag Simulator
* **Objective**: Automate pages with artificial latency overlays.
* **Selectors**:
  * Network Lag checkbox: `data-testid="toggle-network-lag"`
  * Loading overlay: `data-testid="table-loading-overlay"`
  * Pagination Button: `data-testid="next-page-btn"`
* **Exercises**:
  1. Check **Simulate Network Lag**.
  2. Click **Next** pagination button.
  3. Verify the loading overlay (`data-testid="table-loading-overlay"`) appears.
  4. Wait for the loading overlay to be hidden before continuing.
  5. Assert page changes succeeded.

```typescript
test('Lab 10: Network Lag Simulator', async ({ page }) => {
  // Enable Lag
  await page.getByTestId('toggle-network-lag').check();

  // Click Next
  await page.getByTestId('next-page-btn').click();

  // Assert loading overlay appears and wait for its completion
  const overlay = page.getByTestId('table-loading-overlay');
  await expect(overlay).toBeVisible();
  await expect(overlay).toBeHidden({ timeout: 2000 }); // Wait for overlay to hide

  // Verify page index changes
  await expect(page.getByTestId('page-indicator')).toHaveText('Page 2 of 3');
});
```

---

### Lab 11: Export to CSV File Download
* **Objective**: Trigger dynamic actions to capture browser file downloads.
* **Selectors**:
  * Export button: `data-testid="export-csv-btn"`
* **Exercises**:
  1. Start capturing download event streams in Playwright.
  2. Click **Export CSV**.
  3. Wait for the download process to complete.
  4. Read the file path, verify it is named `"employees.csv"`, and confirm it has a size greater than 0 bytes.

```typescript
test('Lab 11: Export to CSV File Download', async ({ page }) => {
  // Setup download event trigger listener
  const downloadPromise = page.waitForEvent('download');

  await page.getByTestId('export-csv-btn').click();

  const download = await downloadPromise;

  // Verify file details
  expect(download.suggestedFilename()).toBe('employees.csv');
  const path = await download.path();
  expect(path).not.toBeNull();
});
```

---

## 📋 Challenge B: Infinite Scrolling Logs Feed (Lab 12)

This section covers scrolling logic within virtual containers.

### Lab 12: Infinite Scroll Lazy Loading
* **Objective**: Perform scroll interactions within a container and wait for updates to populate.
* **Selectors**:
  * Scroll container: `data-testid="infinite-scroll-container"`
  * Total log count badge: `data-testid="log-count"`
  * Loading feed indicator: `data-testid="feed-loading-indicator"`
* **Exercises**:
  1. Locate the scroll container element.
  2. Get initial logs count from `data-testid="log-count"` (e.g. `12`).
  3. Scroll to the bottom of the container.
  4. Verify the loading spinner text displays.
  5. Wait for the feed load indicator to disappear.
  6. Assert the log count increases (e.g. to `22`).

```typescript
test('Lab 12: Infinite Scroll Lazy Loading', async ({ page }) => {
  const container = page.getByTestId('infinite-scroll-container');
  const countBadge = page.getByTestId('log-count');

  // Read initial count value
  const initialCount = parseInt(await countBadge.innerText());

  // Scroll to bottom of the div container
  await container.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });

  // Verify loading text appears
  const loader = page.getByTestId('feed-loading-indicator');
  await expect(loader).toBeVisible();
  await expect(loader).toBeHidden({ timeout: 2000 }); // Wait until loading completes

  // Assert logs count increased
  const newCount = parseInt(await countBadge.innerText());
  expect(newCount).toBeGreaterThan(initialCount);
});
```

---

## 📋 Challenge C: Dynamic Columns Table (Lab 13)

This section teaches students how to parse table elements that rearrange columns dynamically.

### Lab 13: Index-Independent Dynamic Table Parser
* **Objective**: Find dynamic values in table structures where columns shuffle layout indexes on load.
* **Selectors**:
  * Table grid: `data-testid="dynamic-columns-table"`
  * Shuffle trigger: `data-testid="randomize-columns-btn"`
  * Row selector: `data-testid="dyn-row-${id}"`
* **Exercises**:
  1. Click **Randomize Columns** button.
  2. Parse the table headers (`thead th`) to locate the column containing **"Email"** and find its dynamic index.
  3. Parse Row `1` (`data-testid="dyn-row-1"`) and locate the cell index matching the found header index.
  4. Assert the text matches `"alice.johnson@company.com"`.

```typescript
test('Lab 13: Index-Independent Dynamic Table Parser', async ({ page }) => {
  // Randomize Columns order
  await page.getByTestId('randomize-columns-btn').click();

  // Find dynamic column index of "Email" header
  const headers = page.locator('[data-testid="dynamic-columns-table"] thead th');
  const headerTexts = await headers.allTextContents();
  const emailIndex = headerTexts.indexOf('Email');
  
  expect(emailIndex).not.toBe(-1); // Verify Email column is present

  // Locate the cell dynamically using index in row 1
  const row1Cells = page.locator('[data-testid="dyn-row-1"] td');
  const emailCell = row1Cells.nth(emailIndex);

  await expect(emailCell).toHaveText('alice.johnson@company.com');
});
```
