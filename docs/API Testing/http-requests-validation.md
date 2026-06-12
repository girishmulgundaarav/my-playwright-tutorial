---
title: HTTP Requests & Validation
sidebar_position: 2
---

# HTTP Requests & Validation

Playwright features a built-in `APIRequestContext` that allows you to send raw HTTP requests directly to a server without launching a browser. This enables fast API automation, endpoint validation, and seeding/clearing test database states before UI executions.

---

## 📐 Playwright API Test Configuration

Before writing API tests, configure your baseline endpoint address in `playwright.config.ts`. This allows you to write relative paths (e.g., `/booking`) inside tests instead of absolute URLs.

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    // Define baseline URL for API requests
    baseURL: 'https://restful-booker.herokuapp.com',
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },
});
```

---

## 🧭 The HTTP Request & Validation Lifecycle

The diagram below maps how Playwright structures requests (GET, POST, PUT, PATCH, DELETE), feeds payloads, passes header attributes, and runs response checks.

![HTTP Request Validation in Playwright](/img/playwright_http_requests_validation.png)

---

## 🔍 1. GET Requests: Path vs. Query Parameters

GET requests fetch resources. Playwright allows passing identifiers directly in the URL (**Path Parameter**) or inside options as key-value pairs (**Query Parameter**).

### A. Fetching by ID (Path Parameter)
```typescript
import { test, expect } from '@playwright/test';

test('Get booking details by Id - Path Param', async ({ request }) => {
  const bookingId = 1;

  // Sends: GET /booking/1
  const response = await request.get(`/booking/${bookingId}`);

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);

  const responseBody = await response.json();
  console.log(responseBody);
});
```

### B. Filtering Results (Query Parameters)
```typescript
test('Get booking details by Name - Query Params', async ({ request }) => {
  const firstname = "Jim";
  const lastname = "Brown";

  // Sends: GET /booking?firstname=Jim&lastname=Brown
  const response = await request.get('/booking', {
    params: {
      firstname,
      lastname,
    }
  });

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);

  const responseBody = await response.json();
  expect(responseBody.length).toBeGreaterThan(0);

  // Validate the structure of each returned booking item
  for (const item of responseBody) {
    expect(item).toHaveProperty('bookingid');
    expect(typeof item.bookingid).toBe('number');
  }
});
```

---

## 📤 2. POST Requests: Payload Management Strategies

When creating new entities via `POST`, you can supply payloads in three ways: **inline static objects**, **JSON data sheets**, or **dynamic faker inputs**.

### Strategy A: Static Inline Objects
Best for simple, single-use configurations:

```typescript
test('Create Post request using static body', async ({ request }) => {
  const requestBody = {
    firstname: "Jim",
    lastname: "Brown",
    totalprice: 1000,
    depositpaid: true,
    bookingdates: {
      checkin: "2025-07-01",
      checkout: "2025-07-05",
    },
    additionalneeds: "super bowls",
  };

  const response = await request.post('/booking', { data: requestBody });
  expect(response.status()).toBe(200);

  const responseBody = await response.json();
  expect(responseBody).toHaveProperty('bookingid');
  
  // Verify deep object match
  expect(responseBody.booking).toMatchObject({
    firstname: "Jim",
    lastname: "Brown",
    totalprice: 1000,
    depositpaid: true,
    additionalneeds: "super bowls",
  });
});
```

### Strategy B: JSON File-Based Payloads
Useful to separate test data files from automation code logic. Read the JSON from a file dynamically using the Node.js File System (`fs`) module:

```typescript
import fs from 'fs';

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

test('Create Post request using json file body', async ({ request }) => {
  const requestBody = readJson('testdata/post_request_body.json');

  const response = await request.post('/booking', { data: requestBody });
  expect(response.status()).toBe(200);

  const responseBody = await response.json();
  const booking = responseBody.booking;

  // Validate matching criteria with source JSON data
  expect(booking).toMatchObject({
    firstname: requestBody.firstname,
    lastname: requestBody.lastname,
    totalprice: requestBody.totalprice,
    depositpaid: requestBody.depositpaid,
    additionalneeds: requestBody.additionalneeds
  });
});
```

### Strategy C: Dynamic Payload Generation (Faker + Luxon)
Generates randomized inputs on every run to detect input boundary errors, unique constraint failures, or format-based bugs.

```typescript
import { faker } from '@faker-js/faker';
import { DateTime } from 'luxon';

test('Create Post request using dynamic/faker body', async ({ request }) => {
  const firstname = faker.person.firstName();
  const lastname = faker.person.lastName();
  const totalprice = faker.number.int({ min: 100, max: 5000 });
  const depositpaid = faker.datatype.boolean();

  // Format dates to 'yyyy-MM-dd' using Luxon
  const checkindate = DateTime.now().toFormat("yyyy-MM-dd");
  const checkoutdate = DateTime.now().plus({ days: 5 }).toFormat("yyyy-MM-dd");

  const requestBody = {
    firstname,
    lastname,
    totalprice,
    depositpaid,
    bookingdates: {
      checkin: checkindate,
      checkout: checkoutdate,
    },
    additionalneeds: "super bowls",
  };

  const response = await request.post('/booking', { data: requestBody });
  expect(response.status()).toBe(200);

  const responseBody = await response.json();
  expect(responseBody.booking.firstname).toBe(firstname);
  expect(responseBody.booking.bookingdates.checkin).toBe(checkindate);
});
```

---

## 🔄 3. PUT & PATCH Requests: Modifying Resources

Updating resources requires authentication tokens. RESTful Booker requires an admin token generated via `/auth` passed in headers as a session Cookie.

*   **PUT:** Replaces the resource entirely.
*   **PATCH:** Modifies specific attributes of the resource (partial update).

```typescript
test('Update Booking (PUT) vs Partial Update (PATCH)', async ({ request }) => {
  // Step 1: Create a booking to acquire bookingid
  const postBody = readJson('testdata/post_request_body.json');
  const createResponse = await request.post('/booking', { data: postBody });
  const createResponseBody = await createResponse.json();
  const bookingId = createResponseBody.bookingid;

  // Step 2: Acquire Auth Token
  const credentials = { username: "admin", password: "password123" };
  const authResponse = await request.post('/auth', { data: credentials });
  const authBody = await authResponse.json();
  const token = authBody.token;

  // Step 3: Complete Update (PUT)
  const putBody = readJson('testdata/put_request_body.json');
  const updateResponse = await request.put(`/booking/${bookingId}`, {
    headers: { 'Cookie': `token=${token}` },
    data: putBody
  });
  expect(updateResponse.status()).toBe(200);

  // Step 4: Partial Update (PATCH)
  const patchBody = { firstname: "Scott", lastname: "Tiger" };
  const partialResponse = await request.patch(`/booking/${bookingId}`, {
    headers: { 'Cookie': `token=${token}` },
    data: patchBody
  });
  expect(partialResponse.status()).toBe(200);
  
  const finalBody = await partialResponse.json();
  expect(finalBody.firstname).toBe("Scott"); // Patched value
  expect(finalBody.totalprice).toBe(putBody.totalprice); // Unchanged from PUT
});
```

---

## 🗑️ 4. DELETE Requests & End-to-End Flow

A DELETE request removes resources. The code block below represents a full automated End-to-End API integration testing cycle (Create ➔ Read ➔ Update ➔ Delete).

```typescript
test('Delete booking end-to-end integration flow', async ({ request }) => {
  // 1. Create booking
  const postBody = readJson('testdata/post_request_body.json');
  const postResponse = await request.post("/booking", { data: postBody });
  const bookingId = (await postResponse.json()).bookingid;

  // 2. Read booking to verify setup
  const getResponse = await request.get(`/booking/${bookingId}`);
  expect(getResponse.status()).toBe(200);

  // 3. Update booking (requires auth token)
  const tokenBody = { username: "admin", password: "password123" };
  const tokenResponse = await request.post('/auth', { data: tokenBody });
  const token = (await tokenResponse.json()).token;

  const putBody = readJson('testdata/put_request_body.json');
  const putResponse = await request.put(`/booking/${bookingId}`, {
    headers: { 'Cookie': `token=${token}` },
    data: putBody
  });
  expect(putResponse.status()).toBe(200);

  // 4. Delete booking
  const deleteResponse = await request.delete(`/booking/${bookingId}`, {
    headers: { 'Cookie': `token=${token}` }
  });
  
  // RESTful Booker returns status 201 (Created) and statusText "Created" for successful deletions
  expect(deleteResponse.status()).toBe(201);
  expect(deleteResponse.statusText()).toBe("Created");

  // 5. Verify booking no longer exists
  const getVerify = await request.get(`/booking/${bookingId}`);
  expect(getVerify.status()).toBe(404);
});
```
