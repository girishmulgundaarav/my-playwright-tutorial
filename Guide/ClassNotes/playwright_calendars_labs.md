# Playwright Automation Lab Guide: Calendars & Date Pickers

This lab guide covers 10 advanced automation exercises focusing on date pickers, calendar grids, date-ranges, keyboard calendar navigation, and time components. These exercises teach students how to fill native date inputs, handle month/year navigations, test restricted blackout slots, parse datetime slot selectors, verify multi-date collections, automate dual range views with presets, simulate keyboard-driven roving tabindex navigation, verify grid switcher layouts, and adjust time sliders or stepper controls.

---

## 🛠️ Global Setup

```typescript
import { test, expect } from '@playwright/test';

test.describe('Calendars & Date Pickers Automation Lab', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Calendars & Date Pickers page
    await page.goto('/calendars');
  });
});
```

---

## 📋 Part 1: Standard & Custom Date Pickers (Labs 1–4)

### Lab 1: Native HTML Date Input
* **Objective**: Automate native `<input type="date">` elements using text injection.
* **Selectors**:
  * Input element: `data-testid="standard-date-input"`
* **Exercises**:
  1. Locate the native date input.
  2. Type or fill the value `"2026-09-25"` directly.
  3. Assert that the input contains the value `"2026-09-25"`.

```typescript
test('Lab 1: Native HTML Date Input', async ({ page }) => {
  const input = page.getByTestId('standard-date-input');

  // Input standard date string (YYYY-MM-DD)
  await input.fill('2026-09-25');
  await expect(input).toHaveValue('2026-09-25');
});
```

---

### Lab 2: Custom Calendar Popup Month Navigation
* **Objective**: Click navigation arrows to select dates in future or past months.
* **Selectors**:
  * Custom input trigger: `data-testid="custom-date-input"`
  * Next month arrow: `data-testid="custom-next-month-btn"`
  * Target day cell: `data-testid="custom-date-cell-2026-07-15"` (picking July 15, 2026)
* **Exercises**:
  1. Click the custom date input to expand the calendar.
  2. Click the **Next Month** button twice (moving from May 2026 to July 2026).
  3. Click the day cell for `"2026-07-15"`.
  4. Assert the picker closes and the input box displays the value `"2026-07-15"`.

```typescript
test('Lab 2: Custom Calendar Popup Month Navigation', async ({ page }) => {
  const input = page.getByTestId('custom-date-input');
  
  // Expand Calendar
  await input.click();

  const nextBtn = page.getByTestId('custom-next-month-btn');
  // Click Next Month twice (May -> June -> July)
  await nextBtn.click();
  await nextBtn.click();

  // Select July 15, 2026
  await page.getByTestId('custom-date-cell-2026-07-15').click();

  // Assert input has correct resolved date value
  await expect(input).toHaveValue('2026-07-15');
});
```

---

### Lab 3: Blackout Calendar Restrictions
* **Objective**: Audit disabled attributes on restricted blackout dates (weekends, holidays, past dates).
* **Selectors**:
  * Past date cell: `data-testid="blackout-cell-2026-04-28"` (past)
  * Weekend cell: `data-testid="blackout-cell-2026-05-10"` (Sunday)
  * Valid weekday cell: `data-testid="blackout-cell-2026-05-15"` (Friday)
* **Exercises**:
  1. Locate the past date cell and verify it is disabled.
  2. Locate the weekend cell (Sunday) and verify it is disabled.
  3. Locate the valid weekday cell (Friday) and click it.
  4. Verify that the success selection message reads `"Success! Selected slot: 2026-05-15"`.

```typescript
test('Lab 3: Blackout Calendar Restrictions', async ({ page }) => {
  const pastCell = page.getByTestId('blackout-cell-2026-04-28');
  const weekendCell = page.getByTestId('blackout-cell-2026-05-10');
  const validCell = page.getByTestId('blackout-cell-2026-05-15');

  // Verify disabled constraints
  await expect(pastCell).toBeDisabled();
  await expect(weekendCell).toBeDisabled();

  // Click valid weekday cell
  await validCell.click();
  await expect(page.getByTestId('blackout-selection-msg')).toHaveText('Success! Selected slot: 2026-05-15');
});
```

---

### Lab 4: Fast Navigation Dropdowns
* **Objective**: Target dropdown selectors inside calendar headers to change calendar years and months instantly.
* **Selectors**:
  * Input trigger: `data-testid="fast-nav-input"`
  * Month dropdown: `data-testid="fast-nav-month-select"`
  * Year dropdown: `data-testid="fast-nav-year-select"`
  * Target cell: `data-testid="fast-nav-cell-2030-12-25"`
* **Exercises**:
  1. Click the jump-date input to open the picker overlay.
  2. Select Month option `"11"` (December) and Year option `"2030"`.
  3. Click the day cell `"2030-12-25"`.
  4. Assert the input display matches `"2030-12-25"`.

```typescript
test('Lab 4: Fast Navigation Dropdowns', async ({ page }) => {
  await page.getByTestId('fast-nav-input').click();

  // Select December (month index 11) & Year 2030
  await page.getByTestId('fast-nav-month-select').selectOption('11');
  await page.getByTestId('fast-nav-year-select').selectOption('2030');

  // Click Dec 25, 2030 day cell
  await page.getByTestId('fast-nav-cell-2030-12-25').click();

  await expect(page.getByTestId('fast-nav-input')).toHaveValue('2030-12-25');
});
```

---

## 📋 Part 2: Advanced Schedulers & Range Pickers (Labs 5–7)

### Lab 5: Datetime Appointment Scheduler
* **Objective**: Automate dual date-and-time slots selections.
* **Selectors**:
  * Input trigger: `data-testid="sched-input"`
  * Target day: `data-testid="sched-date-cell-2026-05-18"`
  * Target slot: `data-testid="sched-time-slot-01:00-PM"`
  * Submit button: `data-testid="sched-submit-btn"`
  * Success message: `data-testid="sched-success-msg"`
* **Exercises**:
  1. Expand the appointment scheduler input.
  2. Click the day cell `"2026-05-18"`.
  3. Verify that the time slots column becomes visible.
  4. Click the `"01:00 PM"` time slot.
  5. Click the **Confirm Booking Slot** button.
  6. Assert the success message contains `"Booking Complete!"` with the correct date and time.

```typescript
test('Lab 5: Datetime Appointment Scheduler', async ({ page }) => {
  await page.getByTestId('sched-input').click();

  // Select Date (May 18, 2026)
  await page.getByTestId('sched-date-cell-2026-05-18').click();

  // Select Time Slot (1:00 PM)
  const slotBtn = page.getByTestId('sched-time-slot-01:00-PM');
  await expect(slotBtn).toBeVisible();
  await slotBtn.click();

  // Confirm booking
  await page.getByTestId('sched-submit-btn').click();
  await expect(page.getByTestId('sched-success-msg')).toContainText('Scheduled for 2026-05-18 at 01:00 PM');
});
```

---

### Lab 6: Discrete Multi-Date Selector
* **Objective**: Pick multiple separate dates and verify tags (chips) can be created and removed.
* **Selectors**:
  * Input trigger: `data-testid="multi-date-input"`
  * Day cell 1: `data-testid="multi-cell-2026-05-12"`
  * Day cell 2: `data-testid="multi-cell-2026-05-14"`
  * Tag chip: `data-testid="multi-selected-chip-${date}"`
  * Remove button: `data-testid="multi-remove-btn-${date}"`
* **Exercises**:
  1. Open the multi-date input.
  2. Select `"2026-05-12"` and `"2026-05-14"`.
  3. Verify that both chips displaying dates appear inside the container.
  4. Click the remove **×** button on the `"2026-05-12"` chip.
  5. Verify that only the `"2026-05-14"` chip remains.

```typescript
test('Lab 6: Discrete Multi-Date Selector', async ({ page }) => {
  await page.getByTestId('multi-date-input').click();

  // Select two dates
  await page.getByTestId('multi-cell-2026-05-12').click();
  await page.getByTestId('multi-cell-2026-05-14').click();

  // Close calendar popup by clicking outside
  await page.click('body', { position: { x: 0, y: 0 } });

  const container = page.getByTestId('multi-selected-container');
  await expect(container).toContainText('2026-05-12');
  await expect(container).toContainText('2026-05-14');

  // Remove first tag
  await page.getByTestId('multi-remove-btn-2026-05-12').click();
  await expect(container).not.toContainText('2026-05-12');
  await expect(container).toContainText('2026-05-14');
});
```

---

### Lab 7: Date-Range Dual Picker & Presets
* **Objective**: Test range presets and dual monthly views.
* **Selectors**:
  * Preset button: `data-testid="preset-btn-last-7"`
  * Left month cells: `data-testid="range-left-cell-2026-05-10"`
  * Right month cells: `data-testid="range-right-cell-2026-06-05"`
  * Inputs: `data-testid="range-start-input"`, `data-testid="range-end-input"`
* **Exercises**:
  1. Click the **Last 7 Days** preset button.
  2. Assert the start and end input values are populated.
  3. Click the Start Date input to expand the calendar overlay.
  4. Select a custom range: click `"2026-05-10"` on the left calendar and `"2026-06-05"` on the right calendar.
  5. Assert that the start input contains `"2026-05-10"` and the end input contains `"2026-06-05"`.

```typescript
test('Lab 7: Date-Range Dual Picker & Presets', async ({ page }) => {
  // Test presets
  await page.getByTestId('preset-btn-last-7').click();
  const startVal = await page.getByTestId('range-start-input').inputValue();
  const endVal = await page.getByTestId('range-end-input').inputValue();
  expect(startVal).not.toBe('');
  expect(endVal).not.toBe('');

  // Expand calendars
  await page.getByTestId('range-start-input').click();

  // Click start date on the left monthly grid (May 10)
  await page.getByTestId('range-left-cell-2026-05-10').click();
  
  // Click end date on the right monthly grid (June 5)
  await page.getByTestId('range-right-cell-2026-06-05').click();

  await expect(page.getByTestId('range-start-input')).toHaveValue('2026-05-10');
  await expect(page.getByTestId('range-end-input')).toHaveValue('2026-06-05');
});
```

---

## 📋 Part 3: Accessibility & Week-Starts Layouts (Labs 8–10)

### Lab 8: Keyboard-Accessible Calendar (Roving Tabindex)
* **Objective**: Test accessibility grids using keyboard events and roving tabIndex states.
* **Selectors**:
  * Focus grid container: `data-testid="kbd-calendar-grid"`
  * Cell cells: `data-testid="kbd-cell-2026-05-15"`
  * Success message: `data-testid="kbd-selected-msg"`
* **Exercises**:
  1. Focus on the calendar day `"2026-05-15"` by clicking it.
  2. Press **ArrowRight** key to focus `"2026-05-16"`. Assert tabIndex of `2026-05-16` becomes `0`.
  3. Press **ArrowDown** key to focus `"2026-05-23"`.
  4. Press **Space** or **Enter** key to select the date.
  5. Verify the success message displays containing `"Selected Date: 2026-05-23"`.

```typescript
test('Lab 8: Keyboard-Accessible Calendar', async ({ page }) => {
  const cell15 = page.getByTestId('kbd-cell-2026-05-15');
  const cell16 = page.getByTestId('kbd-cell-2026-05-16');

  // Focus starting date cell
  await cell15.focus();

  // Navigate using Keyboard arrows
  await page.keyboard.press('ArrowRight'); // move to 16
  await expect(cell16).toHaveAttribute('tabindex', '0');
  await expect(cell15).toHaveAttribute('tabindex', '-1'); // roving check

  await page.keyboard.press('ArrowDown');  // move to 23
  await page.keyboard.press('Enter');     // select

  await expect(page.getByTestId('kbd-selected-msg')).toHaveText('🎉 Selected Date: 2026-05-23');
});
```

---

### Lab 9: Week-Start Grid Switcher Layout Auditor
* **Objective**: Verify day cells shift relative to layout switcher (Sunday vs Monday first).
* **Selectors**:
  * Grid Switcher toggle: `data-testid="week-start-toggle"`
  * Header label 0: `data-testid="week-grid-header-0"`
* **Exercises**:
  1. Assert that the first header element (`data-testid="week-grid-header-0"`) has label `"Su"` (Sunday-first layout).
  2. Click the **Toggle** switcher button.
  3. Assert that the layout label header changes to `"Mo"` (Monday-first layout).
  4. Toggle it back to verify it returns to Sunday.

```typescript
test('Lab 9: Week-Start Grid Switcher Layout Auditor', async ({ page }) => {
  const toggleBtn = page.getByTestId('week-start-toggle');
  const header0 = page.getByTestId('week-grid-header-0');

  // Initial Sunday layout check
  await expect(header0).toHaveText('Su');

  // Toggle Mon-Start
  await toggleBtn.click();
  await expect(header0).toHaveText('Mo');

  // Reset
  await toggleBtn.click();
  await expect(header0).toHaveText('Su');
});
```

---

### Lab 10: Standalone Time Picker controls
* **Objective**: Automate hours/minutes selection sliders, stepper controls, and period selectors.
* **Selectors**:
  * Hours increment stepper: `data-testid="time-hour-inc"`
  * Minutes slider input: `data-testid="time-min-slider"`
  * AM/PM period toggle: `data-testid="time-ampm-toggle"`
  * Submit button: `data-testid="time-submit-btn"`
  * Success message: `data-testid="time-success-msg"`
* **Exercises**:
  1. Click the hours stepper increment button `+` twice (moving hours from 9 to 11).
  2. Drag or evaluate the minutes slider input (`data-testid="time-min-slider"`) to setting value `45`.
  3. Click the period toggle button to switch between AM and PM (setting to `"PM"`).
  4. Click **Confirm Time**.
  5. Assert the success message matches `"Time confirmed: 11:45 PM"`.

```typescript
test('Lab 10: Standalone Time Picker controls', async ({ page }) => {
  // 1. Adjust Hours using steppers (9 -> 11)
  const hourInc = page.getByTestId('time-hour-inc');
  await hourInc.click();
  await hourInc.click();

  // 2. Adjust Minutes using sliders (set to 45)
  const minSlider = page.getByTestId('time-min-slider');
  await minSlider.fill('45');

  // 3. Toggle Period (AM -> PM)
  const periodToggle = page.getByTestId('time-ampm-toggle');
  const currentPeriod = await periodToggle.innerText();
  if (currentPeriod === 'AM') {
    await periodToggle.click();
  }

  // Confirm Selection
  await page.getByTestId('time-submit-btn').click();
  await expect(page.getByTestId('time-success-msg')).toHaveText('🎉 Time confirmed: 11:45 PM');
});
```
