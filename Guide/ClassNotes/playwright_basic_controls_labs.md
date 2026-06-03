# Playwright Automation Lab Guide: Basic UI Controls

This lab guide is designed for students learning Playwright. It covers 9 distinct testing zones on the **Basic UI Controls** page. Students will practice locating elements, typing, selecting radios/checkboxes, interacting with sliders, asserting dynamic visibility state modifications, and handling disabled buttons.

---

## 🛠️ Global Setup

Before writing tests, students should configure their base test block:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Basic UI Controls Automation Lab', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the practice site's Basic Controls page
    await page.goto('/basic-controls');
  });
});
```

---

## 📝 Lab 1: Text Input Box (ZONE 1)
* **Goal**: Learn how to interact with input boxes, check editability, clear inputs, and assert dynamic display updates.

### 🔍 Elements & Selectors
* **Input Box**: `data-testid="text-input-name"` or `id="name"`
* **Entered Value Display**: `data-testid="entered-name-display"`
* **Clear Button**: `role=button`, text `"Clear"` (only visible when input contains text)

### 📋 Lab Exercises
1. Locate the **Full Name** input box and assert that it is empty on load.
2. Verify that the entered value display shows `(empty)` initially.
3. Fill the text box with a name (e.g., `"John Doe"`).
4. Assert that the text box value contains `"John Doe"`.
5. Assert that the entered value display updates to show `"John Doe"`.
6. Click the **Clear** button and assert that the text box resets to empty.

### 💡 Solution Reference
```typescript
test('Lab 1: Text Input Box', async ({ page }) => {
  const nameInput = page.getByTestId('text-input-name');
  const display = page.getByTestId('entered-name-display');

  // Verify initial empty state
  await expect(nameInput).toHaveValue('');
  await expect(display).toHaveText('(empty)');

  // Fill text
  await nameInput.fill('John Doe');
  await expect(nameInput).toHaveValue('John Doe');
  await expect(display).toHaveText('John Doe');

  // Clear text
  await page.getByRole('button', { name: 'Clear' }).click();
  await expect(nameInput).toHaveValue('');
  await expect(display).toHaveText('(empty)');
});
```

---

## 📻 Lab 2: Radio Button Groups (ZONE 2)
* **Goal**: Practice asserting checked states, selecting options in a group, and verifying disabled radio states.

### 🔍 Elements & Selectors
* **Bronze Radio**: `data-testid="radio-bronze"`
* **Silver Radio**: `data-testid="radio-silver"`
* **Gold Radio (Disabled)**: `data-testid="radio-gold"`
* **Male Radio**: `data-testid="radio-male"`
* **Female Radio**: `data-testid="radio-female"`
* **Selected Gender Display**: `data-testid="selected-gender-display"`

### 📋 Lab Exercises
1. Assert that **Bronze** is checked by default on page load.
2. Assert that **Silver** is unchecked.
3. Assert that the **Gold** radio button is disabled.
4. Verify that **Gender Selection** is empty (`None`) initially.
5. Click the **Female** radio button and assert that `selected-gender-display` updates to `"female"`.
6. Click the **Male** radio button and assert that the selection switches.

### 💡 Solution Reference
```typescript
test('Lab 2: Radio Buttons', async ({ page }) => {
  // Membership radios
  const bronzeRadio = page.getByTestId('radio-bronze');
  const silverRadio = page.getByTestId('radio-silver');
  const goldRadio = page.getByTestId('radio-gold');

  await expect(bronzeRadio).toBeChecked();
  await expect(silverRadio).not.toBeChecked();
  await expect(goldRadio).toBeDisabled();

  // Gender selection
  const maleRadio = page.getByTestId('radio-male');
  const femaleRadio = page.getByTestId('radio-female');
  const genderDisplay = page.getByTestId('selected-gender-display');

  await expect(genderDisplay).toHaveText('None');

  await femaleRadio.check();
  await expect(femaleRadio).toBeChecked();
  await expect(genderDisplay).toHaveText('female');

  await maleRadio.check();
  await expect(maleRadio).toBeChecked();
  await expect(femaleRadio).not.toBeChecked();
  await expect(genderDisplay).toHaveText('male');
});
```

---

## 🗹 Lab 3: Checkbox Grids & Lists (ZONE 3)
* **Goal**: Practice checking/unchecking multiple items, looping through checkbox elements, and resetting states.

### 🔍 Elements & Selectors
* **Hobby Checkboxes**: `data-testid="checkbox-reading"`, `data-testid="checkbox-coding"`, `data-testid="checkbox-gaming"`, `data-testid="checkbox-sports"`, `data-testid="checkbox-music"`, `data-testid="checkbox-traveling"`
* **Clear Hobbies Button**: `data-testid="clear-hobbies-btn"`
* **Days of the Week Checkboxes**: `data-testid="checkbox-monday"`, `data-testid="checkbox-tuesday"`, etc.
* **Clear Days Button**: `data-testid="clear-days-btn"`

### 📋 Lab Exercises
1. Check **Reading** and **Coding** under Hobbies. Verify both are checked.
2. Click **Clear All** for Hobbies, and verify all checkboxes return to an unchecked state.
3. Perform a loop operation: Check all weekdays (Monday through Friday) and verify that weekend days (Saturday and Sunday) remain unchecked.
4. Click **Clear All** for Days of the Week and verify they reset.

### 💡 Solution Reference
```typescript
test('Lab 3: Checkboxes', async ({ page }) => {
  // Hobbies Checklist
  const reading = page.getByTestId('checkbox-reading');
  const coding = page.getByTestId('checkbox-coding');

  await reading.check();
  await coding.check();
  await expect(reading).toBeChecked();
  await expect(coding).toBeChecked();

  await page.getByTestId('clear-hobbies-btn').click();
  await expect(reading).not.toBeChecked();
  await expect(coding).not.toBeChecked();

  // Days Checklist loop
  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  for (const day of weekdays) {
    const dayBox = page.getByTestId(`checkbox-${day}`);
    await dayBox.check();
    await expect(dayBox).toBeChecked();
  }

  await expect(page.getByTestId('checkbox-saturday')).not.toBeChecked();
  await expect(page.getByTestId('checkbox-sunday')).not.toBeChecked();
});
```

---

## 🔄 Lab 4: Dynamic Text States (ZONE 4)
* **Goal**: Practice asserting visibility mutability (`visible` vs `hidden`) and text changes driven by a toggle switch.

### 🔍 Elements & Selectors
* **State Toggle Switch**: `data-testid="state-toggle"`
* **Dynamic Header**: `data-testid="dynamic-header"`

### 📋 Lab Exercises
1. Assert that the **Dynamic Header** is visible on page load and contains the text `"Active State - ON"`.
2. Flip the **State Toggle Switch** to off.
3. Assert that the header is hidden or contains the text `"Inactive State - OFF"` (depending on how the page implements it). In this sandbox, flipping the toggle checks the `hidden` attribute.
4. Flip the switch back on and verify that the header becomes visible again.

### 💡 Solution Reference
```typescript
test('Lab 4: Dynamic Text Visibility', async ({ page }) => {
  const toggle = page.getByTestId('state-toggle');
  const header = page.getByTestId('dynamic-header');

  // Verify initial state
  await expect(header).toBeVisible();
  await expect(header).toHaveText('Active State - ON');

  // Toggle off
  await toggle.uncheck();
  await expect(header).toBeHidden();

  // Toggle back on
  await toggle.check();
  await expect(header).toBeVisible();
  await expect(header).toHaveText('Active State - ON');
});
```

---

## 🎚️ Lab 5: Range Slider (ZONE 5)
* **Goal**: Test keyboard navigation or evaluation code to manipulate a slider control thumb.

### 🔍 Elements & Selectors
* **Range Slider Input**: `data-testid="range-slider"`
* **Slider Value Display**: `data-testid="slider-value-display"`

### 📋 Lab Exercises
1. Verify the initial slider value is set to `50`.
2. Use the arrow keys (e.g. `ArrowRight` or `ArrowLeft`) to step the slider position, or write an evaluation snippet (`el.value = 80`) and dispatch a `change` event.
3. Verify that the **Slider Value Display** matches the target position.

### 💡 Solution Reference
```typescript
test('Lab 5: Range Slider', async ({ page }) => {
  const slider = page.getByTestId('range-slider');
  const display = page.getByTestId('slider-value-display');

  await expect(display).toHaveText('50');

  // Adjusting value using Keyboard arrows (1 step per press)
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(display).toHaveText('52');

  // Adjusting value using evaluation/events for larger offsets
  await slider.evaluate((el: HTMLInputElement) => {
    el.value = '85';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(display).toHaveText('85');
});
```

---

## 🎯 Lab 6: Button States & Loading Indicators (ZONE 6)
* **Goal**: Handle async operations. Test waiting for loading indicators and disabled attributes during processing cycles.

### 🔍 Elements & Selectors
* **Action Button**: `data-testid="action-btn"`
* **Action Button Status**: `data-testid="action-btn-status"`
* **Permanently Disabled Button**: `data-testid="disabled-btn"`

### 📋 Lab Exercises
1. Verify the action button has the initial text `"Submit Request"`.
2. Click the button and immediately assert that the button becomes disabled and its text changes to `"Processing..."`.
3. Assert that the loading spinner is visible inside the button.
4. Wait for the loading cycle to resolve (simulated 1.5s delay) and assert that the text mutates to `"✓ Submitted!"`.
5. Verify that the permanently disabled button is non-clickable.

### 💡 Solution Reference
```typescript
test('Lab 6: Button States', async ({ page }) => {
  const actionBtn = page.getByTestId('action-btn');
  const statusDisplay = page.getByTestId('action-btn-status');
  const disabledBtn = page.getByTestId('disabled-btn');

  // Verify initial state
  await expect(actionBtn).toHaveText('Submit Request');
  await expect(statusDisplay).toHaveText('idle');
  await expect(disabledBtn).toBeDisabled();

  // Click and check processing transition
  await actionBtn.click();
  await expect(actionBtn).toBeDisabled();
  await expect(actionBtn).toContainText('Processing...');
  await expect(statusDisplay).toHaveText('loading');

  // Wait for success completion
  await expect(actionBtn).toHaveText('✓ Submitted!', { timeout: 3000 });
  await expect(statusDisplay).toHaveText('success');
});
```

---

## 📝 Lab 7: Textarea & Char Counter (ZONE 7)
* **Goal**: Practice typing into multi-line textareas, checking length limit validation, and verifying character counters.

### 🔍 Elements & Selectors
* **Textarea Input**: `data-testid="bio-textarea"`
* **Character Counter**: `data-testid="char-count-display"`
* **Clear Bio Button**: `data-testid="clear-bio-btn"`

### 📋 Lab Exercises
1. Verify that the character counter reads `"0/200"` on page load.
2. Fill the textarea with a custom bio sentence.
3. Assert that the counter updates accordingly (e.g. `"26/200"`).
4. Attempt to write a string longer than 200 characters and assert that the input truncates at 200 characters.
5. Click **Clear** and assert the counts reset.

### 💡 Solution Reference
```typescript
test('Lab 7: Textarea and Character Limit', async ({ page }) => {
  const textarea = page.getByTestId('bio-textarea');
  const counter = page.getByTestId('char-count-display');

  await expect(counter).toHaveText('0/200');

  const sampleBio = 'Automation is fun!';
  await textarea.fill(sampleBio);
  await expect(counter).toHaveText(`${sampleBio.length}/200`);

  // Test truncation
  const longText = 'a'.repeat(250);
  await textarea.fill(longText);
  await expect(textarea).toHaveValue('a'.repeat(200));
  await expect(counter).toHaveText('200/200');

  // Clear Textarea
  await page.getByTestId('clear-bio-btn').click();
  await expect(textarea).toHaveValue('');
  await expect(counter).toHaveText('0/200');
});
```

---

## 🔔 Lab 8: Alerts & Toasts (ZONE 8)
* **Goal**: Practice triggering dynamic toast banners, verifying alerts, and dismissing them.

### 🔍 Elements & Selectors
* **Show Success Trigger**: `data-testid="toast-success-btn"`
* **Show Warning Trigger**: `data-testid="toast-warning-btn"`
* **Show Error Trigger**: `data-testid="toast-error-btn"`
* **Success Toast**: `data-testid="toast-success"`
* **Dismiss Success Button**: `data-testid="dismiss-success"`

### 📋 Lab Exercises
1. Verify that no toasts are visible on launch.
2. Click **Show Success** and assert that the success toast appears.
3. Verify the toast's alert content contains `"✓ Action completed successfully!"`.
4. Click the **×** dismiss button inside the success toast.
5. Assert that the toast is successfully unmounted from the DOM.

### 💡 Solution Reference
```typescript
test('Lab 8: Alerts and Toasts', async ({ page }) => {
  const successBtn = page.getByTestId('toast-success-btn');
  const successToast = page.getByTestId('toast-success');
  const dismissBtn = page.getByTestId('dismiss-success');

  // Verify none are active initially
  await expect(successToast).toBeHidden();

  // Trigger toast
  await successBtn.click();
  await expect(successToast).toBeVisible();
  await expect(successToast).toContainText('Action completed successfully!');

  // Dismiss toast
  await dismissBtn.click();
  await expect(successToast).toBeHidden();
});
```

---

## 🔢 Lab 9: Counter with Limits (ZONE 9)
* **Goal**: Test boundary-value behaviors on interactive step controls.

### 🔍 Elements & Selectors
* **Increment Button**: `data-testid="increment-btn"`
* **Decrement Button**: `data-testid="decrement-btn"`
* **Counter Display**: `data-testid="counter-display"`
* **Reset Button**: `data-testid="reset-counter-btn"`

### 📋 Lab Exercises
1. Verify the initial count is `0` and that the **Decrement** and **Reset** buttons are disabled.
2. Click the **Increment** button twice. Verify the count displays `2` and that the Decrement and Reset buttons become enabled.
3. Click **Increment** repeatedly until the count reaches `10`. Verify that the **Increment** button becomes disabled (maximum boundary).
4. Click **Reset to 0** and assert the counter displays `0` and buttons lock back.

### 💡 Solution Reference
```typescript
test('Lab 9: Counter Boundary Checks', async ({ page }) => {
  const incBtn = page.getByTestId('increment-btn');
  const decBtn = page.getByTestId('decrement-btn');
  const resetBtn = page.getByTestId('reset-counter-btn');
  const display = page.getByTestId('counter-display');

  // Validate limits at 0
  await expect(display).toHaveText('0');
  await expect(decBtn).toBeDisabled();
  await expect(resetBtn).toBeDisabled();

  // Increment and assert buttons enable
  await incBtn.click();
  await incBtn.click();
  await expect(display).toHaveText('2');
  await expect(decBtn).toBeEnabled();
  await expect(resetBtn).toBeEnabled();

  // Advance to limit (10)
  for (let i = 0; i < 8; i++) {
    await incBtn.click();
  }
  await expect(display).toHaveText('10');
  await expect(incBtn).toBeDisabled();

  // Reset to 0
  await resetBtn.click();
  await expect(display).toHaveText('0');
  await expect(decBtn).toBeDisabled();
  await expect(resetBtn).toBeDisabled();
});
```
