---
title: Keyboard, Upload & Download
sidebar_position: 10
---

# Keyboard Actions, File Uploads & Downloads

In professional end-to-end testing, user actions frequently go beyond simple clicks and form typing. You will need to simulate keyboard shortcut combinations (like `Ctrl+C` and `Ctrl+V`), upload files (such as profile pictures, spreadsheets, or PDFs), and verify that reports or data exports download successfully from the web server.

Playwright provides powerful, native browser APIs to handle keyboard simulation, file uploads, and file downloads with high reliability.

---

## 1. Simulating Keyboard Actions

Playwright provides a dedicated `Keyboard` API accessible via `page.keyboard`. This allows you to simulate physical keystrokes, modifier keys, and typing sequences just as a real user would.

### Key Keyboard APIs

| Method | Syntax | Description |
| :--- | :--- | :--- |
| **`.down(key)`** | `await page.keyboard.down('Control')` | Simulates pressing and holding down a key. |
| **`.up(key)`** | `await page.keyboard.up('Control')` | Releases a key that was held down. |
| **`.press(key)`** | `await page.keyboard.press('Enter')` | Simulates a single keypress (presses and releases instantly). |
| **`.insertText(text)`** | `await page.keyboard.insertText('Text')` | Directly inserts text into a focused element (without triggering keydown/keyup events). |
| **`.type(text, [options])`** | `await page.keyboard.type('Text')` | Simulates typing character-by-character (useful for raw keyboard events, though `locator.pressSequentially` is preferred for form inputs). |

---

### Code Examples: Keyboard Short-cuts and Actions

Below are two ways to automate copying text from one input field and pasting it into others on [Test Automation Practice](https://testautomationpractice.blogspot.com/).

#### Approach A: The Manual Modifier Key Flow (Using down / up)
Use this when you want to simulate granular step-by-step key interactions (like holding down a key while pressing another).

```typescript
import { test, expect } from '@playwright/test';

test('Keyboard Actions - Granular Modifier Key Flow', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');

  const input1 = page.locator('#input1');
  
  // 1. Focus on the source input field
  await input1.focus();

  // 2. Type text using the direct insertText API
  await page.keyboard.insertText("welcome");

  // 3. Ctrl + A (Select All text)
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');

  // 4. Ctrl + C (Copy selected text)
  await page.keyboard.down('Control');
  await page.keyboard.press('C');
  await page.keyboard.up('Control');

  // 5. Press TAB twice to navigate focus to the next input field
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');

  // 6. Ctrl + V (Paste copied text into the second input)
  await page.keyboard.down('Control');
  await page.keyboard.press('V');
  await page.keyboard.up('Control');

  // 7. Verify the second input field received the value
  const input2 = page.locator('#input2');
  await expect(input2).toHaveValue('welcome');
});
```

#### Approach B: The Shorthand Combination Flow (Recommended)
You can combine modifiers directly inside the `.press()` command using a `+` symbol. This is cleaner and less error-prone.

```typescript
import { test, expect } from '@playwright/test';

test('Keyboard Actions - Shorthand Combination Flow', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');

  const input1 = page.locator('#input1');
  await input1.focus();
  await page.keyboard.insertText("welcome");

  // Perform clipboard commands with shorthand syntax
  await page.keyboard.press('Control+A'); // Select All
  await page.keyboard.press('Control+C'); // Copy

  // Press TAB twice to move focus
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');

  // Paste into the second input field
  await page.keyboard.press('Control+V'); // Paste

  const input2 = page.locator('#input2');
  await expect(input2).toHaveValue('welcome');
});
```

---

## 2. Uploading Files

Web applications use file upload inputs (like `<input type="file">`) to receive documents. Playwright makes uploading files simple using the `setInputFiles()` method on locator elements.

### Key Operations

* **Single File Upload**: Pass the path of the file as a string.
* **Multiple File Upload**: Pass the paths of the files inside an array `[]`.
* **Clearing Selection**: Pass an empty array `[]` to clear out all selected files.

> [!IMPORTANT] File Paths
> File paths specified in `setInputFiles()` are relative to your **project root** directory. Ensure the target files exist in your local workspace folders.

---

### Code Examples: File Upload Scenarios

#### Scenario 1: Uploading Files on Test Automation Practice

```typescript
import { test, expect } from '@playwright/test';

test('Single and Multiple File Upload - blogspot', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');

  // 1. Single File Upload
  // Select the single file input and upload a file from your uploads folder
  await page.locator('#singleFileInput').setInputFiles('uploads/Test1.txt');
  await page.locator('button:has-text("Upload Single File")').click();

  // Assert upload status text
  const singleMsg = await page.locator('#singleFileStatus').textContent();
  expect(singleMsg).toContain('Test1.txt');

  // 2. Multiple File Upload
  // Select the multiple files input and pass an array of file paths
  await page.locator('#multipleFilesInput').setInputFiles(['uploads/Test1.txt', 'uploads/Test2.txt']);
  await page.locator('button:has-text("Upload Multiple Files")').click();

  // Assert upload status text contains both files
  const multiMsg = await page.locator('#multipleFilesStatus').textContent();
  expect(multiMsg).toContain('Test1.txt');
  expect(multiMsg).toContain('Test2.txt');
});
```

#### Scenario 2: Uploading & Clearing Files on David Walsh Demo

```typescript
import { test, expect } from '@playwright/test';

test('File Upload and Clear Demo - David Walsh', async ({ page }) => {
  await page.goto('https://davidwalsh.name/demo/multiple-file-upload.php');

  const fileInput = page.locator('#filesToUpload');

  // 1. Upload multiple pdf files
  await fileInput.setInputFiles(['uploads/testfile1.pdf', 'uploads/testfile2.pdf']);

  // Assert they appear in the file list on the webpage
  await expect(page.locator('#fileList li:nth-child(1)')).toHaveText('testfile1.pdf');
  await expect(page.locator('#fileList li:nth-child(2)')).toHaveText('testfile2.pdf');

  // 2. Clear all selected files
  // Passing an empty array clears the input field selections
  await fileInput.setInputFiles([]);

  // Assert the list reports no files selected
  await expect(page.locator('#fileList li:nth-child(1)')).toHaveText('No Files Selected');
});
```

---

## 3. Downloading Files

Handling file downloads requires a specific pattern in Playwright. Because browser downloads are asynchronous background events, Playwright uses a listener structure to capture the downloaded file.

### Step-by-Step Flow to Handle Downloads:
1. **Prepare the Listener:** Set up `page.waitForEvent('download')`.
2. **Trigger the Download:** Click the download button or link.
3. **Execute in Parallel:** Wrap both actions in a `Promise.all` statement.
4. **Save the File:** Call `download.saveAs('custom/path')` to move the temporary file to a persistent folder.

> [!WARNING] Avoid Race Conditions
> You must run the listener and the trigger click together using `Promise.all`. If you click the link before setting up the listener, the download might start (or even finish) before Playwright starts watching for it, leading to test hangs.

---

### Code Examples: Text and PDF Downloads

Here is how you generate, download, verify, and clean up files using Playwright's download event and Node.js's built-in file system (`fs`) module.

```typescript
import { test, expect } from '@playwright/test';
import fs from 'fs';

test('Download and Verify Text File', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/p/download-files_25.html');

  // 1. Input text and generate the download file
  await page.locator('#inputText').fill("welcome");
  await page.locator('#generateTxt').click(); // Generates the file dynamically

  // 2. Wait for the download event and click the link simultaneously
  const [ download ] = await Promise.all([
    page.waitForEvent('download'), // 1. Start waiting for the event
    page.locator('#txtDownloadLink').click() // 2. Click link to start download
  ]);

  // 3. Save the downloaded file to a custom path in your project workspace
  const downloadPath = 'downloads/testfile.txt';
  await download.saveAs(downloadPath);

  // 4. Verify file exists on the disk using Node's fs module
  const fileExists = fs.existsSync(downloadPath);
  expect(fileExists).toBeTruthy();

  // 5. Clean up downloaded file (best practice to keep CI workspaces clean)
  if (fileExists) {
    fs.unlinkSync(downloadPath);
  }
});

test('Download and Verify PDF File', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/p/download-files_25.html');

  // 1. Input text and generate pdf
  await page.locator('#inputText').fill("welcome");
  await page.locator('#generatePdf').click(); // Generates the pdf file

  // 2. Trigger and wait for download
  const [ download ] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#pdfDownloadLink').click()
  ]);

  // 3. Save PDF file
  const downloadPath = 'downloads/testfile.pdf';
  await download.saveAs(downloadPath);

  // 4. Verify and clean up
  const fileExists = fs.existsSync(downloadPath);
  expect(fileExists).toBeTruthy();

  if (fileExists) {
    fs.unlinkSync(downloadPath);
  }
});
```

---

## 📝 Recap: Key Methods Summary

| API / Method | Purpose | Typical Use Case |
| :--- | :--- | :--- |
| `page.keyboard.press('Combo')` | Fires a quick key combination | Hitting shortcuts like `Control+C`, `Enter`, or `Backspace`. |
| `locator.setInputFiles(paths)` | Uploads files to input elements | Simulating attachment selection for profiles or forms. |
| `page.waitForEvent('download')` | Listens for a browser download event | Capturing generated text, image, or PDF files. |
| `download.saveAs(path)` | Saves the downloaded file locally | Relocating the file from temp folders to your test folder. |
| `fs.existsSync(path)` | Verifies if a file exists on disk | Confirming the download was successfully saved. |

---

## 🏋️ Hands-on Lab Assignments

### Exercise 1: Form Shortcut Replication
- [ ] Navigate to `https://testautomationpractice.blogspot.com/`
- [ ] Fill the text "Automation Practice" into the first text box (`#input1`).
- [ ] Use keyboard combos to copy the text.
- [ ] Navigate to the second input field (`#input2`) and paste the value.
- [ ] Assert that the second input field value is equal to the first field.

### Exercise 2: File Upload Validation
- [ ] Navigate to `https://davidwalsh.name/demo/multiple-file-upload.php`
- [ ] Upload three dummy files (e.g., `doc1.txt`, `doc2.txt`, `doc3.txt`).
- [ ] Verify that all three files are listed in the `#fileList` box.
- [ ] Clear the selection and assert that "No Files Selected" is displayed.

### Exercise 3: Dynamic Generation Download
- [ ] Navigate to `https://testautomationpractice.blogspot.com/p/download-files_25.html`
- [ ] Type a dynamic string (like a timestamp) in the `#inputText` box.
- [ ] Click generate, capture the download event, and save it as `downloads/dynamic.txt`.
- [ ] Check that the file exists, read its contents (optional), and clean up the file.

---

```quiz
{
  "question": "How do you clear all selected files from a file input element in Playwright?",
  "options": [
    "await locator.setInputFiles(null)",
    "await locator.setInputFiles([])",
    "await locator.clear()",
    "await locator.setInputFiles('')"
  ],
  "answer": 1,
  "explanation": "Passing an empty array `[]` to `setInputFiles()` clears all selected files from the input. Calling `.clear()` is meant for clearing text inputs."
}
```

```quiz
{
  "question": "Why must page.waitForEvent('download') and the click triggering the download be executed inside Promise.all?",
  "options": [
    "To speed up the network downloading time",
    "To run the download on multiple background threads",
    "To avoid race conditions where the download event starts before the listener is registered",
    "Because Playwright does not support standard async/await for downloads"
  ],
  "answer": 2,
  "explanation": "Running them in parallel using `Promise.all` ensures that Playwright starts listening for the download event *before* the click action triggers it, preventing a race condition where the event is missed."
}
```

```quiz
{
  "question": "Which keyboard method directly inserts text into a focused input without triggering keydown, keyup, or keypress events?",
  "options": [
    "page.keyboard.type()",
    "page.keyboard.press()",
    "page.keyboard.insertText()",
    "page.keyboard.down()"
  ],
  "answer": 2,
  "explanation": "page.keyboard.insertText() directly inserts the text into the focused field without firing individual keyboard key down/up/press events, making it fast and reliable when event triggers are not required."
}
```
