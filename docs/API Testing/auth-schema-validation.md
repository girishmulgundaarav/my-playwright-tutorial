---
title: API Auth & JSON Schema Validation
sidebar_position: 3
---

# API Auth & JSON Schema Validation

Production APIs are secured through different authorization protocols. Furthermore, functional tests only verify data values, whereas contract/schema tests verify that the structure of JSON response payloads conforms to exact data types and specifications.

---

## 🔒 1. API Authentication Strategies

Playwright can automate several authentication types by dynamically injecting tokens, keys, and credentials into request options.

![API Auth & JSON Schema Validation](/img/playwright_api_auth_schema_validation.png)

### A. Public APIs (No Authentication)
Endpoints that do not require any headers or access control to retrieve public data:

```typescript
import { test, expect } from '@playwright/test';

test('Public API - No Auth', async ({ request }) => {
  const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  console.log(data);
});
```

### B. Basic Authentication
Sends username and password parameters base64-encoded inside the `Authorization` request header:

```typescript
test('Basic Auth - HTTPBin', async ({ request }) => {
  const username = 'user';
  const password = 'pass';
  const credentialsBase64 = Buffer.from(`${username}:${password}`).toString('base64');

  const response = await request.get('https://httpbin.org/basic-auth/user/pass', {
    headers: {
      Authorization: `Basic ${credentialsBase64}`,
    },
  });

  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.authenticated).toBe(true);
});
```

### C. Bearer Token Authentication
Passes encrypted security tokens (such as JSON Web Tokens - JWT or Personal Access Tokens) within request headers:

```typescript
test('Verify Bearer Token Authentication (GitHub User Repos)', async ({ request }) => {
  const bearerToken = "ghp_YOUR_PERSONAL_ACCESS_TOKEN_HERE"; // Replace with real token

  const response = await request.get('https://api.github.com/user/repos', {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      'User-Agent': 'playwright', // GitHub API requires User-Agent
    },
  });

  expect(response.status()).toBe(200);
  const repos = await response.json();
  console.log(repos);
});
```

### D. API Key Authentication
API Keys are passed as parameters either inside request headers or as a query URL parameter:

```typescript
test('Verify API Key Authentication - URL Query Parameter', async ({ request }) => {
  const response = await request.get('https://api.weatherapi.com/v1/current.json', {
    params: {
      q: 'India',
      key: '59f38ebe55d5436ca0552856250606', // API Key passed as parameter
    },
  });

  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.location.country).toBe('India');
});
```

### E. Session Cookie/Token-Based Authentication
Requires sending user credentials to an authentication endpoint (`POST /auth`) first, extracting the generated token, and passing it in subsequent request headers:

```typescript
test('Session Token Authentication via Cookie', async ({ request }) => {
  // 1. Generate Token
  const authResponse = await request.post('/auth', {
    data: { username: "admin", password: "password123" }
  });
  const authBody = await authResponse.json();
  const token = authBody.token;

  // 2. Pass Token in Request Cookie Header
  const deleteResponse = await request.delete('/booking/1', {
    headers: { 'Cookie': `token=${token}` }
  });
  expect(deleteResponse.status()).toBe(201);
});
```

---

## 📐 2. JSON Schema Validation with AJV

Even if an API returns a `200 OK` status and matching data, structural updates (e.g. key deletions, incorrect field types, missing parameters) can break clients. **Schema Validation** ensures response bodies adhere to strict contracts.

We use **AJV (Another JSON Schema Validator)**, the industry-standard JS schema engine.

### Step 1: Install AJV Dependencies
Open your terminal inside the project directory and run:
```bash
npm install --save-dev ajv
```

### Step 2: Write Schema Validation Specs

AJV compiles a defined schema structure into a validator function using `ajv.compile(schema)`. Calling the compiler against the response body validates the payload:

```typescript
import { test, expect } from '@playwright/test';
import Ajv from 'ajv';

test('Validate JSON response with Schema - Mock Target', async ({ request }) => {
  const response = await request.get('https://mocktarget.apigee.net/json');
  const responseBody = await response.json();

  // Define JSON Schema specifications
  const schema = {
    type: 'object',
    properties: {
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      city: { type: 'string' },
      state: { type: 'string' },
    },
    required: ['firstName', 'lastName', 'city', 'state'],
    additionalProperties: false, // Disallow extra fields not declared above
  };

  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const isValid = validate(responseBody);

  // If validation fails, log schema validation errors
  if (!isValid) {
    console.error("AJV Validation Errors:", validate.errors);
  }

  expect(isValid).toBeTruthy();
});

test('Validate JSON response with Schema - JSONPlaceholder', async ({ request }) => {
  const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');
  const responseBody = await response.json();

  const schema = {
    type: 'object',
    properties: {
      userId: { type: 'integer' },
      id: { type: 'integer' },
      title: { type: 'string' },
      body: { type: 'string' },
    },
    required: ['userId', 'id', 'title', 'body'],
    additionalProperties: false,
  };

  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const isValid = validate(responseBody);

  expect(isValid).toBeTruthy();
});
```

### Why define `additionalProperties: false`?
Setting `additionalProperties: false` ensures that the API returns **only** the properties specified in the schema, preventing unexpected or undocumented API payload bloating.
