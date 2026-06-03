# Playwright Automation Lab Guide: Integrated API Sandbox

This lab guide covers 10 advanced hybrid E2E and API testing exercises designed to build E2E proficiency using the Integrated API Sandbox playground page. These exercises teach students how to combine standard UI automation with direct API testing, stub and mock HTTP endpoints, intercept and mutate network payloads, seed test databases, verify status code routing errors, mirror headers/methods, and validate CSV file downloads.

---

## 🛠️ Global Setup

Hybrid E2E testing involves standard UI interactions along with direct REST calls using Playwright's built-in `APIRequestContext`. You can configure global baseURL and tokens, or create custom requests inside tests.

```typescript
import { test, expect } from '@playwright/test';

test.describe('Integrated API Sandbox Lab', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the API Sandbox page
    await page.goto('/api-sandbox');
  });
});
```

---

## 📋 Part 1: Hybrid UI & Books Manager Workflows (Labs 1–4)

### Lab 1: Fetch Books & Validate JSON Response Structure
* **Objective**: Click the fetch trigger on the UI, intercept the response, and assert the raw JSON block output on the screen.
* **Selectors**:
  * Fetch button: `data-testid="api-get-btn"`
  * Raw JSON response dump: `data-testid="api-response-block"`
* **Exercises**:
  1. Click **Fetch Books**.
  2. Verify that the raw GET response dump container is populated.
  3. Parse the text content inside `data-testid="api-response-block"` as JSON.
  4. Assert the JSON parsed array contains standard keys: `id`, `title`, and `author`.

```typescript
test('Lab 1: Fetch Books & Validate JSON Response Structure', async ({ page }) => {
  // 1. Click fetch button
  await page.getByTestId('api-get-btn').click();

  // 2. Locate response block
  const responseBlock = page.getByTestId('api-response-block');
  await expect(responseBlock).not.toBeEmpty();

  // 3. Parse JSON content and verify fields
  const rawText = await responseBlock.innerText();
  const books = JSON.parse(rawText);

  expect(Array.isArray(books)).toBe(true);
  expect(books.length).toBeGreaterThan(0);
  expect(books[0]).toHaveProperty('id');
  expect(books[0]).toHaveProperty('title');
  expect(books[0]).toHaveProperty('author');
});
```

---

### Lab 2: Add Book via UI Form (POST)
* **Objective**: Test book creation with and without the mock Authorization Bearer token active.
* **Selectors**:
  * Auth token toggle checkbox: `data-testid="auth-header-toggle"`
  * Book title input: `data-testid="book-title-input"`
  * Book author input: `data-testid="book-author-input"`
  * Submit button: `data-testid="api-post-btn"`
  * Success message alert: `data-testid="api-success-msg"`
  * Error message alert: `data-testid="api-error-msg"`
* **Exercises**:
  1. Fill the Book Title with `"Fahrenheit 451"` and Author with `"Ray Bradbury"`.
  2. Leave the "Include Bearer Auth Token" checkbox unchecked.
  3. Click **Add Book** and verify the validation error alert `data-testid="api-error-msg"` displays `"Unauthorized: Missing or invalid token"`.
  4. Check the **Include Bearer Auth Token** checkbox.
  5. Fill the form again and click **Add Book**.
  6. Verify the success message reads `"Book successfully created!"`.

```typescript
test('Lab 2: Add Book via UI Form (POST)', async ({ page }) => {
  // Case A: Missing authentication token (Should error)
  await page.getByTestId('book-title-input').fill('Fahrenheit 451');
  await page.getByTestId('book-author-input').fill('Ray Bradbury');
  await page.getByTestId('api-post-btn').click();
  await expect(page.getByTestId('api-error-msg')).toContainText('Unauthorized');

  // Case B: Authentication token verified (Should succeed)
  await page.getByTestId('auth-header-toggle').check();
  await page.getByTestId('api-post-btn').click();
  await expect(page.getByTestId('api-success-msg')).toContainText('Book successfully created!');
});
```

---

### Lab 3: Edit Book Inline (PUT)
* **Objective**: Modify book details inline inside the list entries, authorizing the update requests.
* **Selectors**:
  * Auth token checkbox: `data-testid="auth-header-toggle"`
  * Edit inline button (Targeting book ID 2): `data-testid="inline-edit-btn-2"`
  * Edit Title input field: `data-testid="edit-title-2"`
  * Edit Author input field: `data-testid="edit-author-2"`
  * Save edit button: `data-testid="edit-save-btn-2"`
  * Success message: `data-testid="api-success-msg"`
* **Exercises**:
  1. Check **Include Bearer Auth Token** checkbox.
  2. Make sure books are fetched (or click Fetch Books).
  3. Locate the book with ID `2` and click **Edit**.
  4. Change the title input field to `"1984 - Special Edition"`.
  5. Click **Save**.
  6. Assert the success banner displays `"updated successfully"`.

```typescript
test('Lab 3: Edit Book Inline (PUT)', async ({ page }) => {
  // 1. Enable authorization token
  await page.getByTestId('auth-header-toggle').check();

  // 2. Load books
  await page.getByTestId('api-get-btn').click();

  // 3. Edit book with ID 2
  await page.getByTestId('inline-edit-btn-2').click();
  await page.getByTestId('edit-title-2').fill('1984 - Special Edition');
  await page.getByTestId('edit-save-btn-2').click();

  // 4. Verify update success
  await expect(page.getByTestId('api-success-msg')).toContainText('updated successfully');
});
```

---

### Lab 4: Delete Book (DELETE)
* **Objective**: Automate inline deletion operations and verify list updates.
* **Selectors**:
  * Auth token checkbox: `data-testid="auth-header-toggle"`
  * Fetch button: `data-testid="api-get-btn"`
  * Delete inline button (Targeting book ID 3): `data-testid="inline-delete-btn-3"`
  * Success message: `data-testid="api-success-msg"`
* **Exercises**:
  1. Check **Include Bearer Auth Token** checkbox.
  2. Click **Fetch Books** to populate list elements.
  3. Click **Delete** next to the book with ID `3` (The Great Gatsby).
  4. Verify the success alert contains `"deleted successfully"`.
  5. Assert the book list or response block no longer contains `"The Great Gatsby"`.

```typescript
test('Lab 4: Delete Book (DELETE)', async ({ page }) => {
  // 1. Toggle authentication check
  await page.getByTestId('auth-header-toggle').check();
  await page.getByTestId('api-get-btn').click();

  // 2. Trigger deletion
  await page.getByTestId('inline-delete-btn-3').click();

  // 3. Verify success message
  await expect(page.getByTestId('api-success-msg')).toContainText('deleted successfully');

  // 4. Verify book is removed from JSON response dump
  await expect(page.getByTestId('api-response-block')).not.toContainText('The Great Gatsby');
});
```

---

## 📋 Part 2: Advanced Interception, Stubbing & Direct Requests (Labs 5–7)

### Lab 5: Stub & Mock API Responses (`page.route`)
* **Objective**: Intercept outbound `/api/books` GET requests to return custom mocked JSON payloads instead of real database values.
* **Selectors**:
  * Fetch button: `data-testid="api-get-btn"`
  * Display container: `data-testid="api-response-block"`
* **Exercises**:
  1. Register a route interceptor using `page.route('**/api/books', route => ...)` to return a stubbed JSON list:
     `[{ "id": 99, "title": "Playwright Testing Secrets", "author": "Automation Guru" }]`.
  2. Click **Fetch Books**.
  3. Verify the screen displays only the mock title and author.
  4. Assert the backend was not hit (e.g. verify the JSON contains `"Playwright Testing Secrets"`).

```typescript
test('Lab 5: Stub & Mock API Responses', async ({ page }) => {
  // 1. Mock GET /api/books
  await page.route('**/api/books', async (route) => {
    const mockPayload = [
      { id: 99, title: 'Playwright Testing Secrets', author: 'Automation Guru' }
    ];
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockPayload)
    });
  });

  // 2. Trigger fetch
  await page.getByTestId('api-get-btn').click();

  // 3. Verify mock data is injected
  await expect(page.getByTestId('api-response-block')).toContainText('Playwright Testing Secrets');
});
```

---

### Lab 6: Intercept & Mutate Network Payloads
* **Objective**: Intercept outbound POST creation requests, read the parameters, and dynamically append values to payloads before sending them to the backend server.
* **Selectors**:
  * Auth token: `data-testid="auth-header-toggle"`
  * Title input: `data-testid="book-title-input"`
  * Author input: `data-testid="book-author-input"`
  * Add button: `data-testid="api-post-btn"`
* **Exercises**:
  1. Setup a request interceptor via `page.route('**/api/books', async (route, request) => ...)` targeting `"POST"` requests.
  2. Read the request JSON body payload, mutate the book title to append `"[INTERCEPTED] "` to it.
  3. Continue request transmission with the updated body payload using `route.continue({ postData: ... })`.
  4. Fill inputs, enable auth token, and submit the book creation.
  5. Fetch books and verify that the title is saved as `"[INTERCEPTED] Book Title"`.

```typescript
test('Lab 6: Intercept & Mutate Network Payloads', async ({ page }) => {
  // 1. Intercept POST and mutate body payload
  await page.route('**/api/books', async (route) => {
    const req = route.request();
    if (req.method() === 'POST') {
      const payload = req.postDataJSON();
      payload.title = `[INTERCEPTED] ${payload.title}`;
      await route.continue({
        postData: JSON.stringify(payload)
      });
    } else {
      await route.continue();
    }
  });

  // 2. Perform creation via UI
  await page.getByTestId('auth-header-toggle').check();
  await page.getByTestId('book-title-input').fill('Animal Farm');
  await page.getByTestId('book-author-input').fill('George Orwell');
  await page.getByTestId('api-post-btn').click();

  // 3. Verify intercepted text was saved
  await page.getByTestId('api-get-btn').click();
  await expect(page.getByTestId('api-response-block')).toContainText('[INTERCEPTED] Animal Farm');
});
```

---

### Lab 7: Seed Database via Direct API Requests
* **Objective**: Use Playwright's `request` client context to seed records directly into the endpoint database before loading the UI.
* **Selectors**:
  * Fetch button: `data-testid="api-get-btn"`
  * Response Block: `data-testid="api-response-block"`
* **Exercises**:
  1. Issue a direct `request.post('/api/books', { headers: { Authorization: 'Bearer mock-token' }, data: { title: 'Dune', author: 'Frank Herbert' } })` call.
  2. Assert the response code returns `201`.
  3. Load the page `/api-sandbox`.
  4. Click **Fetch Books** and verify `"Dune"` appears in the returned data block.

```typescript
test('Lab 7: Seed Database via Direct API Requests', async ({ page, request }) => {
  // 1. Seed data using API RequestContext
  const response = await request.post('/api/books', {
    headers: {
      'Authorization': 'Bearer mock-token',
      'Content-Type': 'application/json'
    },
    data: {
      title: 'Dune',
      author: 'Frank Herbert'
    }
  });
  expect(response.status()).toBe(201);

  // 2. Load page & verify seeded item in UI
  await page.goto('/api-sandbox');
  await page.getByTestId('api-get-btn').click();
  await expect(page.getByTestId('api-response-block')).toContainText('Dune');
});
```

---

## 📋 Part 3: Query Filters, Statuses & File Exports (Labs 8–10)

### Lab 8: Query Parameter Filters Verification
* **Objective**: Assert API behavior when searching and limiting query results.
* **Selectors**:
  * Search text box: `data-testid="query-search-input"`
  * Limit select dropdown: `data-testid="query-limit-select"`
  * Submit filter button: `data-testid="query-fetch-btn"`
  * Status code display: `data-testid="query-result-code"`
* **Exercises**:
  1. Type `"Orwell"` inside Search Text input.
  2. Select `"1"` from the Limit count dropdown.
  3. Click **Fetch Filtered**.
  4. Assert the HTTP Status Code reads `200`.
  5. Assert the query response body contains only one book object matching `"George Orwell"`.

```typescript
test('Lab 8: Query Parameter Filters Verification', async ({ page }) => {
  // 1. Enter query params
  await page.getByTestId('query-search-input').fill('Orwell');
  await page.getByTestId('query-limit-select').selectOption('1');
  await page.getByTestId('query-fetch-btn').click();

  // 2. Validate Response
  await expect(page.getByTestId('query-result-code')).toHaveText('200');
  
  const results = page.getByTestId('api-response-block'); // or query response field
  await expect(results).toContainText('George Orwell');
});
```

---

### Lab 9: HTTP Status Error Handlers Tester
* **Objective**: Verify that custom backend error codes are returned and reported correctly.
* **Selectors**:
  * Status selection box: `data-testid="status-code-select"`
  * Trigger button: `data-testid="trigger-status-btn"`
  * Response code box: `data-testid="status-response-code"`
* **Exercises**:
  1. Select `"500"` (Internal Server Error) from the code selection box.
  2. Click **Trigger Request**.
  3. Assert that Response Status Code changes to `"500"`.
  4. Repeat with `"404"` (Not Found) and assert the display updates accordingly.

```typescript
test('Lab 9: HTTP Status Error Handlers Tester', async ({ page }) => {
  // Case A: 500 error status check
  await page.getByTestId('status-code-select').selectOption('500');
  await page.getByTestId('trigger-status-btn').click();
  await expect(page.getByTestId('status-response-code')).toHaveText('500');

  // Case B: 404 error status check
  await page.getByTestId('status-code-select').selectOption('404');
  await page.getByTestId('trigger-status-btn').click();
  await expect(page.getByTestId('status-response-code')).toHaveText('404');
});
```

---

### Lab 10: Intercept and Validate CSV Downloads
* **Objective**: Handle browser file streams triggers and verify downloaded CSV formatting layouts.
* **Selectors**:
  * Export button: `data-testid="api-export-btn"`
  * Channel status: `data-testid="api-export-status"`
* **Exercises**:
  1. Initialize download listener hook using `page.waitForEvent('download')`.
  2. Click **Export CSV Data**.
  3. Wait for download stream completion.
  4. Read the file content parameters.
  5. Assert the file layout contains CSV headers `"ID,Title,Author"`.

```typescript
test('Lab 10: Intercept and Validate CSV Downloads', async ({ page }) => {
  // 1. Setup download event listener
  const downloadPromise = page.waitForEvent('download');

  // 2. Click export button
  await page.getByTestId('api-export-btn').click();

  // 3. Resolve download
  const download = await downloadPromise;
  
  // 4. Verify file metadata
  expect(download.suggestedFilename()).toBe('books_export.csv');

  // 5. Read downloaded file contents
  const path = await download.path();
  const fs = require('fs');
  const fileContent = fs.readFileSync(path, 'utf8');

  // 6. Assert CSV headers are present
  expect(fileContent).toContain('ID,Title,Author');
});
```
