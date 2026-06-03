# Playwright Automation Lab Guide: Dropdowns Sandbox

This lab guide covers 15 distinct dropdown exercises categorized into three levels: Standard Selects, Custom/Dynamic Components, and Advanced Cascading/Multi-Tag patterns. These exercises teach students how to select options, query lists, handle auto-suggestions, test sorting, verify disabled options, and interact with custom ARIA comboboxes.

---

## 🛠️ Global Setup

```typescript
import { test, expect } from '@playwright/test';

test.describe('Dropdowns Automation Lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dropdowns');
  });
});
```

---

## 📋 Part 1: Standard Elements (Labs 1–4)

### Lab 1: Standard HTML Select
* **Goal**: Interact with native `<select>` dropdowns using value, visible text, or index.
* **Selectors**: Select `data-testid="standard-select"` (or `#country`)
* **Exercises**:
  1. Select `"Canada"` by value (`"ca"`). Assert the selection.
  2. Select `"India"` by visible text (`"India"`). Assert the selection.
  3. Select `"Japan"` by index (6). Assert the selection.

```typescript
test('Lab 1: Standard HTML Select', async ({ page }) => {
  const select = page.getByTestId('standard-select');

  // Select by value
  await select.selectOption('ca');
  await expect(select).toHaveValue('ca');

  // Select by visible label
  await select.selectOption({ label: 'India' });
  await expect(select).toHaveValue('IN');

  // Select by index
  await select.selectOption({ index: 6 });
  await expect(select).toHaveValue('jp');
});
```

---

### Lab 2: Multi-Select Dropdown
* **Goal**: Handle multi-select lists and clear selections.
* **Selectors**: Select `#colors`
* **Exercises**:
  1. Select multiple colors: `"Red"`, `"Green"`, and `"Blue"`.
  2. Assert that the selected items count display shows `3`.
  3. Click `"Clear All"` and verify that all selections are cleared.

```typescript
test('Lab 2: Multi-Select Dropdown', async ({ page }) => {
  const select = page.locator('#colors');
  const count = page.locator('span:has-text("Selected count:")');

  // Multi-select by values
  await select.selectOption(['red_val', 'green_val', 'blue_val']);
  await expect(count).toContainText('Selected count: 3');

  // Clear selections
  await page.getByRole('button', { name: 'Clear All' }).click();
  await expect(count).toContainText('Selected count: 0');
});
```

---

### Lab 3: Alphabetical Sorting Auditor
* **Goal**: Audit if options inside a native dropdown are sorted alphabetically.
* **Selectors**: Select `#animals`
* **Exercises**:
  1. Extract all option text parameters from the select element.
  2. Assert that the list of options is sorted alphabetically (ignoring the placeholder option).

```typescript
test('Lab 3: Alphabetical Sorting Auditor', async ({ page }) => {
  const options = await page.locator('#animals option').allTextContents();
  const animalList = options.filter(opt => !opt.startsWith('--'));

  const sortedList = [...animalList].sort((a, b) => a.localeCompare(b));
  expect(animalList).toEqual(sortedList);
});
```

---

### Lab 4: Storefront Product Sorting
* **Goal**: Test sorting actions and verify that UI elements adapt dynamically.
* **Selectors**: Select `#sort-select`, Product Cards `.rounded-xl`
* **Exercises**:
  1. Select `"Lowest to highest"` from sorting.
  2. Read product prices from cards and assert they are sorted in ascending order.
  3. Select `"Highest to lowest"` from sorting.
  4. Assert prices are sorted in descending order.

```typescript
test('Lab 4: Storefront Product Sorting', async ({ page }) => {
  const sortSelect = page.locator('#sort-select');

  // Ascending sort
  await sortSelect.selectOption('lowesttopriced');
  let prices = await page.locator('span.text-base.font-bold').allTextContents();
  let parsedPrices = prices.map(p => parseFloat(p.replace('$', '')));
  expect(parsedPrices).toEqual([...parsedPrices].sort((a, b) => a - b));

  // Descending sort
  await sortSelect.selectOption('highesttopriced');
  prices = await page.locator('span.text-base.font-bold').allTextContents();
  parsedPrices = prices.map(p => parseFloat(p.replace('$', '')));
  expect(parsedPrices).toEqual([...parsedPrices].sort((a, b) => b - a));
});
```

---

## 📋 Part 2: Custom & Dynamic Components (Labs 5–9)

### Lab 5: Custom Accessible Select (ARIA Combobox)
* **Goal**: Test interactive components styled with ARIA roles instead of native `<select>` tags.
* **Selectors**: Button `role="combobox"`, List `role="listbox"`, Option `role="option"`
* **Exercises**:
  1. Click the language button to expand options.
  2. Assert that the listbox is visible.
  3. Select `"Rust"` from options.
  4. Assert the dropdown collapses and the button displays `"Rust"`.

```typescript
test('Lab 5: Custom ARIA Combobox', async ({ page }) => {
  const trigger = page.getByRole('combobox', { name: 'Select Language' });
  
  await trigger.click();
  const listbox = page.getByRole('listbox');
  await expect(listbox).toBeVisible();

  await page.getByRole('option', { name: 'Rust' }).click();
  await expect(listbox).toBeHidden();
  await expect(trigger).toHaveText('Rust');
});
```

---

### Lab 6: Keyboard-Driven Autocomplete
* **Goal**: Automate dropdown selections using key presses instead of mouse clicks.
* **Selectors**: Input `id="emp-search"`, Dropdown list `.oxd-autocomplete-dropdown`
* **Exercises**:
  1. Click inside the Employee input and type `"John"`.
  2. Verify autocomplete popup appears.
  3. Press `ArrowDown` to navigate options, and `Enter` to select.
  4. Verify input contains selected employee name.

```typescript
test('Lab 6: Keyboard-Driven Autocomplete', async ({ page }) => {
  const input = page.locator('#emp-search');
  await input.click();
  await input.pressSequentially('John', { delay: 100 });

  const dropdown = page.locator('.oxd-autocomplete-dropdown');
  await expect(dropdown).toBeVisible();

  // Navigate using Keyboard
  await input.press('ArrowDown');
  await input.press('ArrowDown'); // Highlight next
  await input.press('Enter');     // Confirm

  await expect(dropdown).toBeHidden();
  await expect(page.locator('text=Selected Employee:')).toBeVisible();
});
```

---

### Lab 7: Bootstrap Checkbox Dropdown
* **Goal**: Select multiple options inside a button multiselect checkbox list.
* **Selectors**: Trigger Button `.multiselect`, Options List `.multiselect-container`
* **Exercises**:
  1. Click the frameworks dropdown button to open selections.
  2. Select `"HTML"` and `"React"` checkboxes.
  3. Click outside or close the dropdown, then assert the button text matches `"HTML, React"`.

```typescript
test('Lab 7: Bootstrap Checkbox Select', async ({ page }) => {
  const trigger = page.locator('button.multiselect');
  await trigger.click();

  const htmlBox = page.locator('.multiselect-container input[type="checkbox"]').first();
  const reactBox = page.locator('.multiselect-container input[type="checkbox"]').last();

  await htmlBox.check();
  await reactBox.check();

  await trigger.click(); // Close
  await expect(trigger).toContainText('HTML, React');
});
```

---

### Lab 8: Travel Autocomplete Suggestions
* **Goal**: Target suggestions matching custom classes like `.placeHolderText`.
* **Selectors**: Input `id="src"`, Suggestion items `.placeHolderText`
* **Exercises**:
  1. Focus the **Departure City** search box and enter `"Delhi"`.
  2. Click the matching suggestion `"Delhi Airport"`.
  3. Assert choice confirmation output.

```typescript
test('Lab 8: Travel Autocomplete', async ({ page }) => {
  const input = page.locator('#src');
  await input.fill('Delhi');

  const suggestion = page.locator('.placeHolderText', { hasText: 'Delhi Airport' });
  await suggestion.click();

  await expect(page.locator('text=Selected Departure: Delhi Airport')).toBeVisible();
});
```

---

### Lab 9: Hidden Dynamic Select (OrangeHRM style)
* **Goal**: Target hidden options rendered in parent/sibling flex containers.
* **Selectors**: Wrapper `.oxd-select-wrapper`, Dropdown menu `.oxd-select-dropdown`, Option items `.oxd-select-option`
* **Exercises**:
  1. Click the wrapper container to expand options.
  2. Wait for `.oxd-select-dropdown` to emerge.
  3. Select `"Freelance"` and verify it resolves to the chosen state.

```typescript
test('Lab 9: Hidden Dynamic Select', async ({ page }) => {
  const trigger = page.locator('.oxd-select-wrapper');
  await trigger.click();

  const dropdown = page.locator('.oxd-select-dropdown');
  await expect(dropdown).toBeVisible();

  await page.locator('.oxd-select-option', { hasText: 'Freelance' }).click();
  await expect(dropdown).toBeHidden();
  await expect(trigger).toContainText('Freelance');
});
```

---

## 📋 Part 3: Advanced Patterns (Labs 10–15)

### Lab 10: Grouped Optgroup Select
* **Goal**: Pick selections inside labeled category tags.
* **Selectors**: Select `data-testid="optgroup-select"`
* **Exercises**:
  1. Select `"Backend Developer"` under `"Engineering"`.
  2. Verify value becomes `"backend"`.

```typescript
test('Lab 10: Grouped Optgroup Select', async ({ page }) => {
  const select = page.getByTestId('optgroup-select');
  await select.selectOption({ label: 'Backend Developer' });
  await expect(select).toHaveValue('backend');
});
```

---

### Lab 11: Disabled Options Select
* **Goal**: Validate that disabled items in standard selects cannot be clicked.
* **Selectors**: Select `data-testid="disabled-options-select"`, Option `data-testid="plan-option-pro"`
* **Exercises**:
  1. Assert that the `"Pro"` option is disabled.
  2. Assert that the `"Enterprise"` option is disabled.
  3. Select `"Team"` and verify the value is updated.

```typescript
test('Lab 11: Disabled Options Select', async ({ page }) => {
  const select = page.getByTestId('disabled-options-select');
  const proOption = page.getByTestId('plan-option-pro');

  await expect(proOption).toBeDisabled();
  await select.selectOption('team');
  await expect(select).toHaveValue('team');
});
```

---

### Lab 12: Dynamic Load Select
* **Goal**: Handle asynchronous option loading.
* **Selectors**: Load Button `data-testid="load-options-btn"`, Select `data-testid="dynamic-select"`
* **Exercises**:
  1. Click **Load Options**.
  2. Wait for the select dropdown to appear in the DOM.
  3. Select `"Tokyo"` and verify the output.

```typescript
test('Lab 12: Dynamic Load Select', async ({ page }) => {
  await page.getByTestId('load-options-btn').click();
  
  const select = page.getByTestId('dynamic-select');
  // Wait for element to emerge
  await expect(select).toBeVisible({ timeout: 2000 });

  await select.selectOption('tokyo');
  await expect(page.getByTestId('dynamic-select-display')).toHaveText('tokyo');
});
```

---

### Lab 13: 3-Level Cascading Selects
* **Goal**: Test dependent drop-down grids (Continent → Country → City).
* **Selectors**: Continent `data-testid="cascade-continent-select"`, Country `data-testid="cascade-country-select"`, City `data-testid="cascade-city-select"`
* **Exercises**:
  1. Verify Country and City selectors are initially disabled.
  2. Select `"Asia"` as Continent. Verify Country selector is enabled.
  3. Select `"Japan"` as Country. Verify City selector is enabled.
  4. Select `"Tokyo"` as City. Verify final location text matches `"Tokyo, Japan, Asia"`.

```typescript
test('Lab 13: 3-Level Cascading Selects', async ({ page }) => {
  const continent = page.getByTestId('cascade-continent-select');
  const country = page.getByTestId('cascade-country-select');
  const city = page.getByTestId('cascade-city-select');

  await expect(country).toBeDisabled();
  await expect(city).toBeDisabled();

  await continent.selectOption('Asia');
  await expect(country).toBeEnabled();

  await country.selectOption('Japan');
  await expect(city).toBeEnabled();

  await city.selectOption('Tokyo');
  await expect(page.getByTestId('cascade-selection-display')).toHaveText('Tokyo, Japan, Asia');
});
```

---

### Lab 14: Searchable Multi-Tag Select
* **Goal**: Search, add, and remove multiple tag elements inside custom containers.
* **Selectors**: Input `data-testid="skill-search-input"`, Container `data-testid="skill-tags-container"`, Tag remove button `data-testid="remove-skill-react"`
* **Exercises**:
  1. Enter `"React"` and click the option to add it.
  2. Enter `"Playwright"` and click the option to add it.
  3. Verify both tags exist.
  4. Click the **×** button next to the React tag and verify it is removed.

```typescript
test('Lab 14: Searchable Multi-Tag Select', async ({ page }) => {
  const input = page.getByTestId('skill-search-input');

  // Add React tag
  await input.fill('React');
  await page.getByTestId('skill-option-react').click();

  // Add Playwright tag
  await input.fill('Playwright');
  await page.getByTestId('skill-option-playwright').click();

  const container = page.getByTestId('skill-tags-container');
  await expect(container).toContainText('React');
  await expect(container).toContainText('Playwright');

  // Remove tag
  await page.getByTestId('remove-skill-react').click();
  await expect(container).not.toContainText('React');
});
```

---

### Lab 15: Clearable Select (React-Select Style)
* **Goal**: Select a custom single value and reset it using a clear button.
* **Selectors**: Trigger `data-testid="clearable-select-trigger"`, Clear button `data-testid="clearable-clear-btn"`, Option `data-testid="clearable-option-pro"`
* **Exercises**:
  1. Click the plan selector trigger.
  2. Select `"Pro Plan — $9/mo"`. Verify the display value.
  3. Click the clear **×** button and assert that the selection resets.

```typescript
test('Lab 15: Clearable Select', async ({ page }) => {
  const trigger = page.getByTestId('clearable-select-trigger');
  
  await trigger.click();
  await page.getByTestId('clearable-option-pro').click();
  await expect(page.getByTestId('clearable-selected-display')).toHaveText('pro');

  // Clear selection
  await page.getByTestId('clearable-clear-btn').click();
  await expect(page.getByTestId('clearable-empty-state')).toBeVisible();
});
```
