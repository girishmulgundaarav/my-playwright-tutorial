# Playwright Automation Lab Guide: Advanced Interactions

This lab guide covers 9 distinct pointer and keyboard exercises designed to build proficiency in advanced browser automation using the Advanced Interactions sandbox page. These exercises teach students how to perform HTML5 drag-and-drop actions, handle hover-based menus, trigger infinite scrolls, audit accessibility violations, draw on Canvas grids, handle double/right clicks, perform click-and-drag lasso selections, resize panes, and send complex multi-key keyboard hotkeys.

---

## 🛠️ Global Setup

```typescript
import { test, expect } from '@playwright/test';

test.describe('Advanced Interactions Automation Lab', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Advanced Interactions page
    await page.goto('/advanced');
  });
});
```

---

## 📋 Part 1: Pointer Drag, Hovers, & Scrolls (Labs 1–3)

### Lab 1: HTML5 Drag & Drop Swap
* **Objective**: Click and drag elements across different container targets.
* **Selectors**:
  * Draggable Box A: `data-testid="draggable-box"`
  * Drop Target Box B: `data-testid="dropzone-box"`
* **Exercises**:
  1. Locate the draggable element Box A and the target zone Box B.
  2. Perform drag-and-drop by dragging Box A and dropping it inside Box B.
  3. Assert that Box B contains Box A and displays the success message `"Dropped Successfully!"`.

```typescript
test('Lab 1: HTML5 Drag & Drop Swap', async ({ page }) => {
  const source = page.getByTestId('draggable-box');
  const target = page.getByTestId('dropzone-box');

  // Drag and drop helper API
  await source.dragTo(target);

  // Assert successful drop state
  await expect(target).toContainText('Dropped Successfully!');
});
```

---

### Lab 2: Hover Reveal Menu
* **Objective**: Trigger hover-revealed menus and select dynamic options.
* **Selectors**:
  * Trigger element: `data-testid="hover-trigger"`
  * Dropdown container: `data-testid="hover-dropdown"`
  * Menu link 2: `data-testid="hover-link-2"`
* **Exercises**:
  1. Hover the mouse over the **Hover Me** button.
  2. Verify that the dropdown container becomes visible.
  3. Click **Automation Link 2**.

```typescript
test('Lab 2: Hover Reveal Menu', async ({ page }) => {
  const trigger = page.getByTestId('hover-trigger');
  const dropdown = page.getByTestId('hover-dropdown');
  const link2 = page.getByTestId('hover-link-2');

  // Initial menu checks
  await expect(dropdown).toBeHidden();

  // Perform hover action
  await trigger.hover();
  await expect(dropdown).toBeVisible();

  // Click link inside
  await link2.click();
});
```

---

### Lab 3: Infinite Scroll List
* **Objective**: Scroll elements inside virtual container panels to load new data streams.
* **Selectors**:
  * Scroll container: `data-testid="infinite-scroll-container"`
  * Scroll loading indicator: `data-testid="scroll-loader"`
* **Exercises**:
  1. Locate the scroll container.
  2. Scroll to the bottom of the container.
  3. Verify that the loader spinner becomes visible.
  4. Wait for the loader to hide.
  5. Assert that the total list rows count has increased (originally 10, now 20).

```typescript
test('Lab 3: Infinite Scroll List', async ({ page }) => {
  const container = page.getByTestId('infinite-scroll-container');

  // Verify initial rows length
  const initialRows = container.locator('div[data-testid^="scroll-item-"]');
  await expect(initialRows).toHaveCount(10);

  // Scroll inside container to bottom
  await container.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });

  // Verify loader is visible & wait for page stream loading
  const loader = page.getByTestId('scroll-loader');
  await expect(loader).toBeVisible();
  await expect(loader).toBeHidden();

  // Assert rows count increased to 20
  await expect(initialRows).toHaveCount(20);
});
```

---

## 📋 Part 2: Accessibility & Canvas Coordinates (Labs 4–5)

### Lab 4: Accessibility Compliance Auditor
* **Objective**: Parse page elements for accessibility issues.
* **Selectors**:
  * Password Input: `data-testid="a11y-no-label-input"`
  * Div Button: `data-testid="a11y-custom-div-button"`
  * Warning text: `data-testid="a11y-low-contrast-text"`
  * Alt image: `data-testid="a11y-no-alt-image"`
* **Exercises**:
  1. Verify the password input lacks an association label element (`label` or `aria-label`).
  2. Verify that the custom div button does not have role `"button"` or `tabindex="0"`.
  3. Verify that the placeholder image is missing `alt` attribute details.

```typescript
test('Lab 4: Accessibility Compliance Auditor', async ({ page }) => {
  const input = page.getByTestId('a11y-no-label-input');
  const customBtn = page.getByTestId('a11y-custom-div-button');
  const image = page.getByTestId('a11y-no-alt-image');

  // Assert input misses label tags (has no labeled elements in parent scope)
  const ariaLabel = await input.getAttribute('aria-label');
  expect(ariaLabel).toBeNull();

  // Assert div button misses accessible attributes
  const role = await customBtn.getAttribute('role');
  const tabIndex = await customBtn.getAttribute('tabindex');
  expect(role).toBeNull();
  expect(tabIndex).toBeNull();

  // Assert image misses alt description
  const alt = await image.getAttribute('alt');
  expect(alt).toBeNull();
});
```

---

### Lab 5: Canvas Signature Pad Drawing
* **Objective**: Draw shapes on a `<canvas>` coordinate system.
* **Selectors**:
  * Canvas pad: `data-testid="signature-pad"`
  * Status display: `data-testid="signature-status"`
* **Exercises**:
  1. Locate the signature pad canvas.
  2. Verify the signature status is `"Empty"`.
  3. Drag mouse relative to canvas dimensions (e.g. from coordinates x=100, y=100 to x=200, y=150) to paint.
  4. Assert the signature status changes to `"Signed"`.

```typescript
test('Lab 5: Canvas Signature Pad Drawing', async ({ page }) => {
  const canvas = page.getByTestId('signature-pad');
  const status = page.getByTestId('signature-status');

  await expect(status).toHaveText('Empty');

  // Locate canvas coordinates
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();

  if (box) {
    const startX = box.x + 100;
    const startY = box.y + 100;
    const endX = box.x + 200;
    const endY = box.y + 150;

    // Move pointer, press down, move relative, and release mouse
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY);
    await page.mouse.up();
  }

  // Verify signature status changes
  await expect(status).toHaveText('Signed');
});
```

---

## 📋 Part 3: Clicks, Splits, & Keyboard Shortcuts (Labs 6–9)

### Lab 6: Context Right-Clicks & Double-Clicks
* **Objective**: Handle pointer double-clicks and custom right-click context menus.
* **Selectors**:
  * Target box: `data-testid="context-menu-target"`
  * Context menu popup: `data-testid="context-menu-popup"`
  * Delete option: `data-testid="context-menu-item-delete"`
  * Confirm message: `data-testid="context-action-msg"`
* **Exercises**:
  1. Double-click the target box. Verify its color/class changes.
  2. Right-click the target box to reveal the custom context menu.
  3. Click **Delete** from the context menu popup.
  4. Assert that the confirmation message contains `"Action Triggered: Delete"`.

```typescript
test('Lab 6: Context Right-Clicks & Double-Clicks', async ({ page }) => {
  const target = page.getByTestId('context-menu-target');

  // 1. Double Click
  await target.dblclick();
  await expect(target).toHaveClass(/bg-indigo-650/);

  // 2. Right Click (Context Menu)
  await target.click({ button: 'right' });

  const popup = page.getByTestId('context-menu-popup');
  await expect(popup).toBeVisible();

  // Click Delete inside custom menu
  await page.getByTestId('context-menu-item-delete').click();
  await expect(page.getByTestId('context-action-msg')).toHaveText('🎉 Action Triggered: Delete');
});
```

---

### Lab 7: Mouse-Drag Lasso Multi-Select
* **Objective**: Drag select boxes across cells using coordinate marquee selections.
* **Selectors**:
  * Lasso Grid Container: `data-testid="lasso-container"`
  * Cell 1 element: `data-testid="lasso-cell-1"`
  * Cell 3 element: `data-testid="lasso-cell-3"`
  * Count badge: `data-testid="lasso-selected-count"`
* **Exercises**:
  1. Identify bounds of the grid container.
  2. Hold mouse down starting at empty coordinate inside the grid, drag it across Cell 1 and Cell 3, and release the mouse button.
  3. Verify that cells within the marquee box bounds change their selected status.
  4. Assert that the selected count badge matches the number of highlighted cells.

```typescript
test('Lab 7: Mouse-Drag Lasso Multi-Select', async ({ page }) => {
  const container = page.getByTestId('lasso-container');
  const countBadge = page.getByTestId('lasso-selected-count');

  // Verify starting selected count is 0
  await expect(countBadge).toHaveText('0');

  const box = await container.boundingBox();
  expect(box).not.toBeNull();

  if (box) {
    // Start marquee drag at relative coordinates inside container
    const startX = box.x + 10;
    const startY = box.y + 10;
    const endX = box.x + box.width - 10;
    const endY = box.y + 120; // drag vertical area covering cells 1,2,3

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY);
    await page.mouse.up();
  }

  // Verify count is updated
  const count = parseInt(await countBadge.innerText());
  expect(count).toBeGreaterThan(0);
});
```

---

### Lab 8: Resizable Drag Splitter
* **Objective**: Resize sidebar panes by dragging splitter bars.
* **Selectors**:
  * Splitter handle: `data-testid="resizable-splitter"`
  * Width indicator: `data-testid="resizable-left-width-display"`
* **Exercises**:
  1. Locate the splitter bar handle.
  2. Drag the splitter handle horizontally to the right.
  3. Assert that the sidebar panel width indicator updates and shows a percentage greater than `30%`.

```typescript
test('Lab 8: Resizable Drag Splitter', async ({ page }) => {
  const splitter = page.getByTestId('resizable-splitter');
  const widthDisplay = page.getByTestId('resizable-left-width-display');

  // Initial check (starts at 30%)
  await expect(widthDisplay).toHaveText('Width: 30%');

  const box = await splitter.boundingBox();
  expect(box).not.toBeNull();

  if (box) {
    // Drag splitter handle right
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    const endX = startX + 150; // drag right 150px

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, startY);
    await page.mouse.up();
  }

  // Assert new width percentage increases
  const widthText = await widthDisplay.innerText();
  const parsedWidth = parseInt(widthText.replace('Width: ', '').replace('%', ''));
  expect(parsedWidth).toBeGreaterThan(30);
});
```

---

### Lab 9: Keyboard Hotkeys Combination
* **Objective**: Send complex multi-key modifier keyboard shortcuts.
* **Selectors**:
  * Hotkey listener card: `data-testid="hotkey-listener-card"`
  * Status message: `data-testid="hotkey-status-msg"`
* **Exercises**:
  1. Click the hotkey listener card to focus the capture listener.
  2. Press the hotkey combination `Control + Shift + S`.
  3. Assert the status message displays `"Progress Saved Successfully!"`.
  4. Press **Escape** key.
  5. Assert the status message resets to `"Reset listener card state"`.

```typescript
test('Lab 9: Keyboard Hotkeys Combination', async ({ page }) => {
  const card = page.getByTestId('hotkey-listener-card');

  // Focus listener card
  await card.focus();

  // Send Control+Shift+S hotkeys combo
  await page.keyboard.press('Control+Shift+S');
  await expect(page.getByTestId('hotkey-status-msg')).toHaveText('Progress Saved Successfully!');

  // Reset using Escape
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('hotkey-status-msg')).toHaveText('Reset listener card state');
});
```
