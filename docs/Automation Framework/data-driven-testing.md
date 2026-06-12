---
title: Data Driven Tests
sidebar_position: 2
---

# Data-Driven Testing in Playwright

Data-Driven Testing (DDT) is a powerful test automation strategy where test inputs, expected outcomes, and parameters are stored in external files rather than hardcoded inside execution scripts. This enables you to run the same test scenario repeatedly with different datasets to validate application robustness.

---

## 🔗 Practice Sites & Test URLs

For these data-driven examples, we target:
*   **Local Test Environment:** `http://localhost/opencart/upload/`
*   **Staging Demo Sandbox:** [Naveen Automation Labs OpenCart Demo](https://naveenautomationlabs.com/opencart/)

---

## 📊 Concept of Data-Driven Testing

In a standard script, login logic is written once for one user profile. If you need to test boundary conditions, special characters, long inputs, and invalid password sets, duplicating the test code multiple times is highly inefficient. 

Instead, DDT separates **data records** from the **automation workflow**:

![Data-Driven Testing DDT Execution Flow with Playwright](/img/playwright_ddt_flowchart.png)

### Static DDT vs. Dynamic Mocking
There are two primary ways to drive dynamic tests in this framework:
1.  **Static Data-Driven Testing:** Looping over predetermined records loaded from files (e.g. testing specific valid/invalid login combinations from a CSV or JSON file).
2.  **Dynamic Data Generation:** Generating randomized, unique inputs on the fly for each test run (e.g. creating fake passenger registration names or random emails using Faker to prevent database duplicates).

---

## 📂 Test Data File Formats

Save these test data sheets inside your project's `data/` folder.

### 1. JSON Data File (`data/logindata.json`)
Ideal for nested configurations and clean type objects:
```json
[
  {
    "testName": "Valid login check",
    "email": "pavanol@abc.com",
    "password": "test@123",
    "expected": "success"
  },
  {
    "testName": "Invalid email format",
    "email": "abcxyz@xyz.com",
    "password": "abcxyx",
    "expected": "failure"
  }
]
```

### 2. CSV Data File (`data/logindata.csv`)
Best for simple tabular rows:
```csv
testName,email,password,expected
Valid login check,pavanol@abc.com,test@123,success
Invalid email format,abcxyz@xyz.com,abcxyx,failure
```

---

## 🛠️ Implementation of Data Utilities

These utility files manage file streaming and mock data generation. Store them under the `utils/` folder.

### 1. Data Provider (`utils/dataProvider.ts`)
Uses the standard Node.js `fs` module and `csv-parse/sync` to read data synchronously before Playwright initiates execution blocks:

```typescript
import fs from 'fs';
import { parse } from 'csv-parse/sync';

export class DataProvider {
  /**
   * Reads and parses a JSON data file
   * @param filePath - Absolute path to the JSON file
   */
  static getTestDataFromJson(filePath: string) {
    const rawData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(rawData);
  }

  /**
   * Reads and parses a CSV data file into structured columns
   * @param filePath - Absolute path to the CSV file
   */
  static getTestDataFromCsv(filePath: string) {
    const rawData = fs.readFileSync(filePath);
    return parse(rawData, {
      columns: true,
      skip_empty_lines: true
    });
  }
}
```

### 2. Random Mock Data Generator (`utils/randomDataGenerator.ts`)
Leverages `@faker-js/faker` to output random, realistic values for registration forms to avoid duplicate entries:

```typescript
import { faker } from '@faker-js/faker';

export class RandomDataUtil {
  static getFirstName(): string {
    return faker.person.firstName();
  }

  static getLastName(): string {
    return faker.person.lastName();
  }

  static getEmail(): string {
    return faker.internet.email();
  }

  static getPhoneNumber(): string {
    return faker.phone.number();
  }

  static getPassword(): string {
    return faker.internet.password();
  }

  static getRandomNumeric(length: number): string {
    return faker.string.numeric(length);
  }

  static getRandomAlphanumeric(length: number): string {
    return faker.string.alphanumeric(length);
  }
}
```

---

## 🧪 Parameterized Spec Scripts

### 1. File-Driven Login Test (`tests/LoginDDT.spec.ts`)
This script loads the JSON datasets and registers separate, labeled tests inside an iteration loop. This results in distinct reporting entries for each record:

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { DataProvider } from '../utils/dataProvider';
import { TestConfig } from '../test.config';
import path from 'path';

// Parse data records before creating the test suite
const loginDataSet = DataProvider.getTestDataFromJson(
  path.resolve(__dirname, '../data/logindata.json')
);

test.describe('Data-Driven Login Tests', () => {
  for (const record of loginDataSet) {
    test(`Verification: ${record.testName}`, async ({ page }) => {
      const config = new TestConfig();
      const home = new HomePage(page);

      await page.goto(config.appUrl);
      await home.clickMyAccount();
      await home.clickLogin();

      // Enter login credentials from the dataset record
      await page.locator('#input-email').fill(record.email);
      await page.locator('#input-password').fill(record.password);
      await page.locator('input[value="Login"]').click();

      // Assert expected outcome dynamically
      if (record.expected === 'success') {
        await expect(page).toHaveTitle('My Account');
      } else {
        const errorAlert = page.locator('.alert-danger');
        await expect(errorAlert).toBeVisible();
        await expect(errorAlert).toContainText('Warning: No match for E-Mail Address and/or Password.');
      }
    });
  }
});
```

### 2. Random Data Registration Spec (`tests/AccountRegistration.spec.ts`)
Uses `RandomDataUtil` to build unique user details for registration on every test trigger:

```typescript
import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { RandomDataUtil } from '../utils/randomDataGenerator';
import { TestConfig } from '../test.config';

test('Dynamic Registration with Faker Data', async ({ page }) => {
  const config = new TestConfig();
  const home = new HomePage(page);
  const register = new RegistrationPage(page);

  await page.goto(config.appUrl);
  await home.clickMyAccount();
  await home.clickRegister();

  // Generate dynamic, unique mock credentials
  const userData = {
    firstName: RandomDataUtil.getFirstName(),
    lastName: RandomDataUtil.getLastName(),
    email: RandomDataUtil.getEmail(),
    telephone: RandomDataUtil.getPhoneNumber(),
    password: RandomDataUtil.getPassword()
  };

  // Perform workflow
  await register.completeRegistration(userData);
});
```

---

## 📈 Playwright DDT Best Practices

1.  **Do Not Mix Data Reading with Test Logic:** Always read files synchronously *outside* of the `test()` blocks. If you call asynchronous files inside tests, the runner may fail to load the records before launching threads.
2.  **Define Meaningful Test Names:** In the loop, label each test dynamically using record parameters (e.g. `test(\`Verification: \${record.testName}\`, ...)`) so test reports can isolate exactly which record failed.
3.  **Run Parameterized Tests in Parallel:** Enable `fullyParallel: true` in `playwright.config.ts` to execute each record loop concurrently, dramatically slashing total suite execution times.
