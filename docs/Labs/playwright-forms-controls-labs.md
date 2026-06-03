---
title: Forms & Controls Lab
---

# Playwright Automation Lab Guide: Forms & Controls Practice

This lab guide contains hands-on automation challenges for all 12 zones on the **Forms & Controls Practice** playground. Students will learn how to automate complex workflows like file dropzones, input masking formats, password strength meters, debounced username check delays, OTP input arrays, WYSIWYG rich text editors, and intercepting native browser confirm dialogs.

---

## 🛠️ Global Setup

Before writing tests, students should configure their base test block:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Forms & Controls Automation Lab', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Forms & Controls playground page
    await page.goto('/forms');
  });
});
```

---

## 📝 Lab 1: Dynamic Consent Form (ZONE 1)
* **Goal**: Test conditional disabling of buttons based on checkbox toggles.

### 🔍 Elements & Selectors
* **Name Input**: `data-testid="consent-name"`
* **Email Input**: `data-testid="consent-email"`
* **Terms Checkbox**: `data-testid="consent-checkbox"`
* **Submit Consent Button**: `data-testid="consent-submit-btn"`
* **Success Message**: `data-testid="consent-success-msg"`

### 📋 Lab Exercises
1. Fill out the Name and Email fields.
2. Assert that the **Submit Consent** button is disabled before checking the checkbox.
3. Check the terms checkbox and verify the Submit button is enabled.
4. Click submit and assert that the success banner `consent-success-msg` is displayed.

<details>
<summary>💡 Click to reveal Solution Reference</summary>

```typescript
test('Lab 1: Consent Form', async ({ page }) => {
  const submitBtn = page.getByTestId('consent-submit-btn');
  const checkbox = page.getByTestId('consent-checkbox');

  await page.getByTestId('consent-name').fill('Alice Johnson');
  await page.getByTestId('consent-email').fill('alice@example.com');
  
  await expect(submitBtn).toBeDisabled();
  await checkbox.check();
  await expect(submitBtn).toBeEnabled();

  await submitBtn.click();
  await expect(page.getByTestId('consent-success-msg')).toBeVisible();
});
```
</details>

---

## 🔒 Lab 2: Password Strength & Visibility (ZONE 2)
* **Goal**: Test password input attribute toggles and verify CSS class modifications on strength bars.

### 🔍 Elements & Selectors
* **Password Input**: `data-testid="password-input"`
* **Visibility Toggle Button**: `data-testid="password-toggle-btn"`
* **Strength Label Badge**: `data-testid="password-strength-badge"`
* **Strength Bar Indicator**: `data-testid="password-strength-bar"`

### 📋 Lab Exercises
1. Verify the password field is initially in `password` type mode.
2. Fill the field and click the visibility button to assert that the attribute mutates to `text` type.
3. Test strength score thresholds:
   - Enter `"abc"`: verify badge says `"Weak (Too Short)"`.
   - Enter `"abcdef"`: verify badge says `"Weak"`.
   - Enter `"Abcdef1"`: verify badge says `"Strong"`.
   - Enter `"Abcdef1!"`: verify badge says `"Excellent"` and the strength bar width reaches `100%`.

<details>
<summary>💡 Click to reveal Solution Reference</summary>

```typescript
test('Lab 2: Password strength & Visibility', async ({ page }) => {
  const pwdInput = page.getByTestId('password-input');
  const toggleBtn = page.getByTestId('password-toggle-btn');
  const strengthBadge = page.getByTestId('password-strength-badge');
  const strengthBar = page.getByTestId('password-strength-bar');

  // Test visibility toggle
  await expect(pwdInput).toHaveAttribute('type', 'password');
  await pwdInput.fill('Secret123!');
  await toggleBtn.click();
  await expect(pwdInput).toHaveAttribute('type', 'text');

  // Verify Excellent score
  await expect(strengthBadge).toHaveText('Excellent');
  await expect(strengthBar).toHaveAttribute('style', 'width: 100%;');
});
```
</details>

---

## 🚫 Lab 3: Validation Feedback Form (ZONE 3)
* **Goal**: Test validation loop error visibility.

### 🔍 Elements & Selectors
* **Username Input**: `data-testid="reg-username"`
* **Password Input**: `data-testid="reg-password"`
* **Bio Textarea**: `data-testid="reg-bio"`
* **Submit Button**: `data-testid="reg-submit-btn"`
* **Error Labels**: `data-testid="reg-username-error"`, `data-testid="reg-password-error"`, `data-testid="reg-bio-error"`
* **Success Banner**: `data-testid="reg-success-msg"`

### 📋 Lab Exercises
1. Click **Register** directly on an empty form.
2. Assert that all three error tags become visible with correct text (e.g. `"Username is required"`).
3. Fill all fields and click Register. Assert errors disappear and `reg-success-msg` is displayed.

<details>
<summary>💡 Click to reveal Solution Reference</summary>

```typescript
test('Lab 3: Validation Feedback', async ({ page }) => {
  await page.getByTestId('reg-submit-btn').click();

  await expect(page.getByTestId('reg-username-error')).toHaveText('Username is required');
  await expect(page.getByTestId('reg-password-error')).toHaveText('Password is required');
  await expect(page.getByTestId('reg-bio-error')).toHaveText('Bio is required');

  await page.getByTestId('reg-username').fill('playwright_tester');
  await page.getByTestId('reg-password').fill('pass123');
  await page.getByTestId('reg-bio').fill('E2E Engineer');
  await page.getByTestId('reg-submit-btn').click();

  await expect(page.getByTestId('reg-success-msg')).toBeVisible();
});
```
</details>

---

## ⏱️ Lab 4: Real-Time Username Checker (ZONE 4)
* **Goal**: Handle debounced async API simulations and loaders.

### 🔍 Elements & Selectors
* **Checker Input**: `data-testid="username-checker-input"`
* **Loading Spinner**: `data-testid="username-loading"`
* **Status Message**: `data-testid="username-status-msg"`

### 📋 Lab Exercises
1. Type a name (e.g., `"test_user"`) into the check box.
2. Immediately assert that the spinner element `username-loading` is visible.
3. Wait for the debounce check to complete (simulated 800ms) and verify that the loading spinner disappears.
4. Verify the status message displays `"Username "test_user" is already taken."` (taken keyword trigger).
5. Type `"alice_cool"` and verify that the banner updates to available.

<details>
<summary>💡 Click to reveal Solution Reference</summary>

```typescript
test('Lab 4: Username Debounce Checker', async ({ page }) => {
  const input = page.getByTestId('username-checker-input');
  const loader = page.getByTestId('username-loading');
  const statusMsg = page.getByTestId('username-status-msg');

  // Input taken username
  await input.fill('test_admin');
  await expect(loader).toBeVisible();
  await expect(loader).toBeHidden({ timeout: 2000 });
  await expect(statusMsg).toContainText('already taken');

  // Input available username
  await input.fill('john_unique');
  await expect(statusMsg).toContainText('is available');
});
```
</details>

---

## 📳 Lab 5: Dynamic Input Masking (ZONE 5)
* **Goal**: Verify automated text formats formatted inside text inputs.

### 🔍 Elements & Selectors
* **Phone Input**: `data-testid="masked-phone-input"`
* **Card Input**: `data-testid="masked-card-input"`
* **Submit Verification**: `data-testid="mask-submit-btn"`
* **Success Banner**: `data-testid="mask-success-msg"`

### 📋 Lab Exercises
1. Type raw digits `"1234567890"` into the Phone Input and assert that it formats to `(123) 456-7890`.
2. Type `"4000123456789010"` into the Card Input and assert that it formats to `4000 1234 5678 9010`.
3. Submit and verify the success text displays correct values.

<details>
<summary>💡 Click to reveal Solution Reference</summary>

```typescript
test('Lab 5: Input Masking', async ({ page }) => {
  const phone = page.getByTestId('masked-phone-input');
  const card = page.getByTestId('masked-card-input');

  await phone.fill('1234567890');
  await expect(phone).toHaveValue('(123) 456-7890');

  await card.fill('4000123456789012');
  await expect(card).toHaveValue('4000 1234 5678 9012');

  await page.getByTestId('mask-submit-btn').click();
  await expect(page.getByTestId('mask-success-msg')).toBeVisible();
});
```
</details>

---

## 🔠 Lab 6: Character Counter & Limits (ZONE 6)
* **Goal**: Test input boundary limits and color display state shifts.

### 🔍 Elements & Selectors
* **Textarea**: `data-testid="counter-textarea"`
* **Counter display**: `data-testid="char-counter-display"`
* **Submit Button**: `data-testid="counter-submit-btn"`

### 📋 Lab Exercises
1. Verify counter shows `0 / 100 Chars` initially.
2. Fill text with 85 characters. Verify class change on the counter display (color shift).
3. Try to type a string longer than 100 characters. Verify that the Submit button is disabled if the limit is exceeded.

<details>
<summary>💡 Click to reveal Solution Reference</summary>

```typescript
test('Lab 6: Char Counter Limits', async ({ page }) => {
  const textarea = page.getByTestId('counter-textarea');
  const counter = page.getByTestId('char-counter-display');
  const submit = page.getByTestId('counter-submit-btn');

  await expect(counter).toHaveText('0 / 100 Chars');
  await expect(submit).toBeDisabled();

  // Test warning colors at 80+ chars
  await textarea.fill('a'.repeat(85));
  await expect(counter).toHaveText('85 / 100 Chars');
  await expect(counter).toHaveClass(/text-amber-500/);

  // Test error state
  await textarea.fill('a'.repeat(105));
  await expect(counter).toHaveClass(/text-red-500/);
  await expect(submit).toBeDisabled();
});
```
</details>

---

## 🔢 Lab 7: OTP Code Verification (ZONE 7)
* **Goal**: Automate active focus movements inside input arrays, and test clipboard paste automation.

### 🔍 Elements & Selectors
* **OTP Input Cells**: `data-testid="otp-input-0"` through `data-testid="otp-input-5"`
* **Success Indicator**: `data-testid="otp-success-msg"`

### 📋 Lab Exercises
1. Fill each OTP field cell one by one. Verify focus auto-shifts to the next cell.
2. Enter the valid mock key `"123456"` and assert that the success banner appears.
3. Test clipboard paste: focus on cell `otp-input-0` and paste `"123456"`. Verify that all six cells are populated.

<details>
<summary>💡 Click to reveal Solution Reference</summary>

```typescript
test('Lab 7: OTP Verification', async ({ page }) => {
  // Option A: Single character clicks
  for (let i = 0; i < 6; i++) {
    const cell = page.getByTestId(`otp-input-${i}`);
    await cell.fill(String(i + 1));
  }
  await expect(page.getByTestId('otp-success-msg')).toContainText('successful');

  // Option B: Clipboard paste
  await page.reload();
  const firstCell = page.getByTestId('otp-input-0');
  await firstCell.focus();
  
  // Use evaluation to simulate paste event
  await firstCell.evaluate((el: HTMLInputElement) => {
    const clipboardData = new DataTransfer();
    clipboardData.setData('text', '123456');
    const pasteEvent = new ClipboardEvent('paste', { clipboardData, bubbles: true });
    el.dispatchEvent(pasteEvent);
  });

  await expect(page.getByTestId('otp-success-msg')).toContainText('successful');
});
```
</details>

---

## 🏷️ Lab 8: Dynamic Tag Picker (ZONE 8)
* **Goal**: Practice keyboard press inputs (`Enter` and `,`) and dynamic list chip alterations.

### 🔍 Elements & Selectors
* **Tag Input Field**: `data-testid="tag-input"`
* **Tags Wrapper**: `data-testid="tag-list"`
* **Tag Chip Item**: `data-testid="tag-item-Playwright"`
* **Remove Tag Button**: `data-testid="tag-remove-Playwright"`

### 📋 Lab Exercises
1. Type a tag name (e.g. `"Testing"`) and press the `Enter` key.
2. Verify that the chip `tag-item-Testing` is created.
3. Verify that adding a 5th tag disables the tag input.
4. Click the close button on chip `"Playwright"` and verify it is removed from the DOM.

<details>
<summary>💡 Click to reveal Solution Reference</summary>

```typescript
test('Lab 8: Dynamic Tag Picker', async ({ page }) => {
  const input = page.getByTestId('tag-input');

  // Add tag
  await input.fill('Cypress');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('tag-item-Cypress')).toBeVisible();

  // Test limit
  await input.fill('CI');
  await page.keyboard.press('Enter');
  await input.fill('Docker');
  await page.keyboard.press('Enter');
  await expect(input).toBeDisabled();

  // Remove tag
  await page.getByTestId('tag-remove-Playwright').click();
  await expect(page.getByTestId('tag-item-Playwright')).toBeHidden();
  await expect(input).toBeEnabled();
});
```
</details>

---

## 🎏️ Lab 9: Dual-Slider Range Picker (ZONE 9)
* **Goal**: Practice adjusting min/max slider elements absolute-positioned on the same track.

### 🔍 Elements & Selectors
* **Min Range Input**: `data-testid="range-slider-min"`
* **Max Range Input**: `data-testid="range-slider-max"`
* **Min Value Display**: `data-testid="range-val-min"`
* **Max Value Display**: `data-testid="range-val-max"`

### 📋 Lab Exercises
1. Verify initial range displays `Min: 25 — Max: 75`.
2. Move the Min slider to `35` and the Max slider to `85`.
3. Assert value displays update correctly.

<details>
<summary>💡 Click to reveal Solution Reference</summary>

```typescript
test('Lab 9: Dual Slider Range', async ({ page }) => {
  const sliderMin = page.getByTestId('range-slider-min');
  const sliderMax = page.getByTestId('range-slider-max');

  await sliderMin.evaluate((el: HTMLInputElement) => {
    el.value = '35';
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await sliderMax.evaluate((el: HTMLInputElement) => {
    el.value = '85';
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(page.getByTestId('range-val-min')).toHaveText('35');
  await expect(page.getByTestId('range-val-max')).toHaveText('85');
});
```
</details>

---

## 🔒 Lab 10: Route Guard Dialogs (ZONE 10)
* **Goal**: Master intercepting and resolving browser dialog popups (`window.confirm`).

### 🔍 Elements & Selectors
* **Page Lock Switch**: `data-testid="nav-lock-switch"`
* **Simulate Navigate Button**: `data-testid="simulate-nav-btn"`

### 📋 Lab Exercises
1. Click **Simulate Navigate** when the lock is disabled. Verify navigation triggers immediately (redirects to `/`).
2. Reload page, toggle **Lock Page Navigation** to active.
3. Setup a Playwright dialog listener `page.on('dialog', ...)` to handle the confirmation.
4. Click **Simulate Navigate**, inspect the confirmation message, and click dismiss/cancel. Assert the page URL remains unchanged.
5. Click again, accept the dialog, and assert you land on the dashboard.

<details>
<summary>💡 Click to reveal Solution Reference</summary>

```typescript
test('Lab 10: Dialog Interceptors', async ({ page }) => {
  const lock = page.getByTestId('nav-lock-switch');
  const navBtn = page.getByTestId('simulate-nav-btn');

  await lock.click();

  // 1. Setup listener to dismiss dialog
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('unsaved changes');
    await dialog.dismiss();
  });
  await navBtn.click();
  await expect(page).toHaveURL(/\/forms/); // remained on page

  // 2. Setup listener to accept dialog
  page.once('dialog', async (dialog) => {
    await dialog.accept();
  });
  await navBtn.click();
  await expect(page).toHaveURL(/\/$/); // navigated back to dashboard root
});
```
</details>

---

## 📝 Lab 11: Rich Text WYSIWYG Editor (ZONE 11)
* **Goal**: Automate content updates inside a non-standard editable `div` container.

### 🔍 Elements & Selectors
* **Editable Editor Container**: `data-testid="wysiwyg-editor"`
* **Bold Button**: `data-testid="editor-bold-btn"`
* **Italic Button**: `data-testid="editor-italic-btn"`
* **Clear Formatting Button**: `data-testid="editor-clear-btn"`

### 📋 Lab Exercises
1. Focus on the editor container and clear the initial text.
2. Fill the editor with new text using `focus()` and `type()` commands.
3. Assert that the editor text matches the input text.

<details>
<summary>💡 Click to reveal Solution Reference</summary>

```typescript
test('Lab 11: WYSIWYG Editor', async ({ page }) => {
  const editor = page.getByTestId('wysiwyg-editor');

  await editor.focus();
  await editor.fill(''); // Clear text
  await editor.fill('Playwright is awesome.');

  await expect(editor).toHaveText('Playwright is awesome.');
});
```
</details>

---

## 📁 Lab 12: Advanced Multi-File Upload (ZONE 12)
* **Goal**: Practice file drop lists and validating error triggers on invalid upload queues.

### 🔍 Elements & Selectors
* **File Dropzone Card**: `data-testid="file-dropzone"`
* **Hidden File Input**: `data-testid="file-input"`
* **Queue List Wrapper**: `data-testid="file-list-container"`
* **Clear All Button**: `data-testid="file-clear-all-btn"`
* **Success Item Tag**: `data-testid="file-status-success-${fileName}"`
* **Error Item Tag**: `data-testid="file-status-error-${fileName}"`
* **Remove Button**: `data-testid="file-remove-btn-${fileName}"`

### 📋 Lab Exercises
1. Upload a valid file (e.g. `mock_resume.pdf` under 2MB). Verify that the file item appears with a success indicator (`✓ Ready`).
2. Attempt to upload a file exceeding 2MB (e.g. `big_video.mp4`). Verify that the item gets appended with an error description (`File exceeds 2MB size limit.`).
3. Click **Clear All** and verify the queue list empties.

<details>
<summary>💡 Click to reveal Solution Reference</summary>

```typescript
import path from 'path';

test('Lab 12: Multi-File Upload Queue', async ({ page }) => {
  const fileInput = page.getByTestId('file-input');

  // Simulate file upload from local path
  const file1 = path.join(__dirname, 'mock_resume.pdf');
  await fileInput.setInputFiles(file1);

  const successTag = page.getByTestId('file-status-success-mock_resume.pdf');
  await expect(successTag).toBeVisible();
  await expect(successTag).toHaveText('✓ Ready');

  // Clear queue
  await page.getByTestId('file-clear-all-btn').click();
  await expect(successTag).toBeHidden();
});
```
</details>
