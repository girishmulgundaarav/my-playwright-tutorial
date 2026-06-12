---
title: Introduction to framework
sidebar_position: 1
---

# Building an End-to-End POM Framework

In professional test automation, writing flat scripts where selectors and test logic are mixed leads to high maintenance costs and flakiness. To scale automation, we implement the **Page Object Model (POM)** design pattern. 

This guide walks through deploying the open-source **OpenCart** application locally and building a complete, enterprise-grade Playwright framework with TypeScript, dynamic data generation, and custom reporting.

---

## 🔗 Practice Sites & Test URLs

Before starting, prepare your execution targets:
*   **Local Test Environment:** `http://localhost/opencart/upload/` (Deploy locally using the instructions below)
*   **Online Demo Sandboxes (Fallbacks):** 
    *   [Naveen Automation Labs OpenCart Demo](https://naveenautomationlabs.com/opencart/)
    *   [TutorialsNinja OpenCart Demo](https://tutorialsninja.com/demo/)

---

## ⚙️ OpenCart Local Deployment Guide

Running tests against a locally hosted instance ensures speed and isolates execution from internet latency. 

![OpenCart Local Installation Setup Flowchart](/img/playwright_opencart_setup_flowchart.png)

### 1. Prerequisites Setup
1.  **Download OpenCart:** Fetch `opencart-3.0.3.8` from the [Official OpenCart Releases Page](https://www.opencart.com/index.php?route=cms/download).
2.  **Install XAMPP:** Install XAMPP with PHP 7.4.29 from [Apache Friends](https://www.apachefriends.org/download.html).

### 2. File Configuration
1.  Copy the unpacked `upload` directory from your OpenCart download to `C:\xampp\htdocs\opencart\`.
2.  Rename the configuration template files:
    *   Rename `C:\xampp\htdocs\opencart\upload\config-dist.php` to `config.php`.
    *   Rename `C:\xampp\htdocs\opencart\upload\admin\config-dist.php` to `config.php`.

### 3. Database & System Setup
1.  Open the XAMPP Control Panel and start **Apache** and **MySQL**.
2.  Navigate to [http://localhost/phpmyadmin/](http://localhost/phpmyadmin/) and create a new database named **`openshop`**.
3.  > [!TIP]
    > **GD Extension Error:** If the OpenCart pre-installation screen highlights `GD` as missing/off, open the XAMPP Control Panel, click the **Config** button for Apache, open `php.ini`, add/uncomment the line `extension=gd`, then restart Apache.
4.  Navigate to `http://localhost/opencart/upload/install/index.php` and complete the wizard using the `openshop` database (use credentials `root` with no password, and set your admin user details).
5.  **Critical Security Step:** Once installation completes, delete the `install` folder located at `C:\xampp\htdocs\opencart\upload\install`.

---

## 📐 Framework Architecture & File Structure

This framework separates concerns into modular layers, ensuring that modifications to UI selectors do not break test execution scripts.

![Playwright Page Object Model Framework Architecture Diagram](/img/playwright_framework_architecture_diagram.png)

Here is the folder structure matching our implementation:
```text
PlaywrightFramework/
├── data/
│   ├── logindata.csv         # CSV data sheet for Login tests
│   └── logindata.json        # JSON data sheet for Login tests
├── pages/
│   ├── HomePage.ts           # Locators & methods for landing options
│   └── RegistrationPage.ts   # Locators & methods for registration forms
├── utils/
│   ├── dataProvider.ts       # Parses CSV/JSON files dynamically
│   └── randomDataGenerator.ts# Emulates mock data using Faker
├── tests/
│   ├── AccountRegistration.spec.ts
│   └── LoginDDT.spec.ts
├── test.config.ts            # Global static parameters
├── playwright.config.ts      # Test Runner configuration
└── package.json
```

---

## 📥 Installation & Core Dependencies

Create a project directory, open your terminal, and run:
```bash
npm init playwright@latest -- --yes
```

Next, install additional utility packages to handle data parsing and dummy text generation:
```bash
npm install csv-parse xlsx @faker-js/faker
npm install -D allure-playwright
```

---

## ⚙️ Configuration Files

### 1. `playwright.config.ts`
This file serves as the framework's control room. It enforces retry policies, structures multiple report hooks, and configures Chromium:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 30 * 1000, // 30-second execution timeout
  testDir: './tests',
  fullyParallel: false,
  retries: 1,         // Retry failed tests once to check for flakiness
  workers: 1,         // Enforce single-worker execution during database tests

  reporter: [
    ['html'],
    ['allure-playwright'],
    ['dot'],
    ['list']
  ],

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    permissions: ['geolocation'],
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ]
});
```

### 2. `test.config.ts`
Stores environment variables and configurations. This allows updating target URLs across the framework in a single file:

```typescript
export class TestConfig {
  appUrl = "http://localhost/opencart/upload/";
  // appUrl = "https://naveenautomationlabs.com/opencart"; // Fallback URL
  
  // Static Credentials for login verification
  email = "pavanol@abc.com";
  password = "test@123";

  // Expected product details for assertions
  productName = "MacBook";
  productQuantity = "2";
  totalPrice = "$1,204.00";
}
```

---

## 🧩 Page Object Model (POM) Implementation

Page Object classes wrap the web element selectors and interactions of specific pages. 

### 1. `pages/HomePage.ts`
Handles navigation headers, account drop menus, and search bars:

```typescript
import { Page, Locator } from '@playwright/test';

export class HomePage {
  private readonly page: Page;
  private readonly lnkMyAccount: Locator;
  private readonly lnkRegister: Locator;
  private readonly linkLogin: Locator;
  private readonly txtSearchbox: Locator;
  private readonly btnSearch: Locator;

  constructor(page: Page) {
    this.page = page;
    this.lnkMyAccount = page.locator('span:has-text("My Account")');
    this.lnkRegister = page.locator('a:has-text("Register")');
    this.linkLogin = page.locator('a:has-text("Login")');
    this.txtSearchbox = page.locator('input[placeholder="Search"]');
    this.btnSearch = page.locator('#search button[type="button"]');
  }

  async isHomePageExists(): Promise<boolean> {
    const title = await this.page.title();
    return !!title;
  }

  async clickMyAccount(): Promise<void> {
    try {
      await this.lnkMyAccount.click();
    } catch (error) {
      console.error(`Exception occurred while clicking 'My Account': ${error}`);
      throw error;
    }
  }

  async clickRegister(): Promise<void> {
    try {
      await this.lnkRegister.click();
    } catch (error) {
      console.error(`Exception occurred while clicking 'Register': ${error}`);
      throw error;
    }
  }

  async clickLogin(): Promise<void> {
    try {
      await this.linkLogin.click();
    } catch (error) {
      console.error(`Exception occurred while clicking 'Login': ${error}`);
      throw error;
    }
  }

  async enterProductName(pName: string): Promise<void> {
    try {
      await this.txtSearchbox.fill(pName);
    } catch (error) {
      console.error(`Exception occurred while entering product: ${error}`);
      throw error;
    }
  }

  async clickSearch(): Promise<void> {
    try {
      await this.btnSearch.click();
    } catch (error) {
      console.error(`Exception occurred while clicking 'Search': ${error}`);
      throw error;
    }
  }
}
```

### 2. `pages/RegistrationPage.ts`
Encapsulates registration input forms and workflow assertions:

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class RegistrationPage {
  private readonly page: Page;
  private readonly txtFirstname: Locator;
  private readonly txtLastname: Locator;
  private readonly txtEmail: Locator;
  private readonly txtTelephone: Locator;
  private readonly txtPassword: Locator;
  private readonly txtConfirmPassword: Locator;
  private readonly chkdPolicy: Locator;
  private readonly btnContinue: Locator;
  private readonly msgConfirmation: Locator;

  constructor(page: Page) {
    this.page = page;
    this.txtFirstname = page.locator('#input-firstname');
    this.txtLastname = page.locator('#input-lastname');
    this.txtEmail = page.locator('#input-email');
    this.txtTelephone = page.locator('#input-telephone');
    this.txtPassword = page.locator('#input-password');
    this.txtConfirmPassword = page.locator('#input-confirm');
    this.chkdPolicy = page.locator('input[name="agree"]');
    this.btnContinue = page.locator('input[value="Continue"]');
    this.msgConfirmation = page.locator('h1:has-text("Your Account Has Been Created!")');
  }

  async setFirstName(fname: string): Promise<void> {
    await this.txtFirstname.fill(fname);
  }

  async setLastName(lname: string): Promise<void> {
    await this.txtLastname.fill(lname);
  }

  async setEmail(email: string): Promise<void> {
    await this.txtEmail.fill(email);
  }

  async setTelephone(tel: string): Promise<void> {
    await this.txtTelephone.fill(tel);
  }

  async setPassword(pwd: string): Promise<void> {
    await this.txtPassword.fill(pwd);
  }

  async setConfirmPassword(pwd: string): Promise<void> {
    await this.txtConfirmPassword.fill(pwd);
  }

  async setPrivacyPolicy(): Promise<void> {
    await this.chkdPolicy.check();
  }

  async clickContinue(): Promise<void> {
    await this.btnContinue.click();
  }

  async getConfirmationMsg(): Promise<string> {
    return await this.msgConfirmation.textContent() ?? '';
  }

  async completeRegistration(userData: {
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    password: string;
  }): Promise<void> {
    await this.setFirstName(userData.firstName);
    await this.setLastName(userData.lastName);
    await this.setEmail(userData.email);
    await this.setTelephone(userData.telephone);
    await this.setPassword(userData.password);
    await this.setConfirmPassword(userData.password);
    await this.setPrivacyPolicy();
    await this.clickContinue();
    await expect(this.msgConfirmation).toBeVisible();
  }
}
```

---

## 📂 Test Data & Data-Driven Testing (DDT)

For a detailed walkthrough on setting up dynamic mock data generators, reading test inputs from JSON and CSV files, and looping test runs dynamically, check out our deep-dive guide:

👉 **[Data Driven Tests](./data-driven-testing.md)**

---

## 🧪 Writing Execution Specs (Tests)

Here is a standard, clean Playwright spec file implementing our Page Objects and static configs. Create this file at `tests/AccountRegistration.spec.ts`:

```typescript
import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { TestConfig } from '../test.config';

test('TC_RF_001: Register account with standard fields', async ({ page }) => {
  const config = new TestConfig();
  const home = new HomePage(page);
  const register = new RegistrationPage(page);

  await page.goto(config.appUrl);
  await home.clickMyAccount();
  await home.clickRegister();

  // Create standard user profile using timestamp to prevent duplicate registration failures
  const standardUser = {
    firstName: "John",
    lastName: "Doe",
    email: `johndoe_${Date.now()}@abc.com`,
    telephone: "1234567890",
    password: config.password
  };

  await register.completeRegistration(standardUser);
});
```

---

## 🚦 Test Execution, Tagging & Reports

### 1. Tagging for Selective Run
You can mark tests with tags (e.g. `@sanity`, `@regression`) in their description text:
```typescript
test('User profile update check @sanity', async ({ page }) => { ... });
```

### 2. Add Run Commands to `package.json`
Configure shortcuts under the `"scripts"` section of `package.json`:

```json
"scripts": {
  "test:master": "playwright test --grep @master",
  "test:sanity": "playwright test --grep @sanity",
  "test:regression": "playwright test --grep @regression",
  "test:datadriven": "playwright test --grep @datadriven"
}
```

To run a specific test suite, execute:
```bash
npm run test:sanity
```

### 3. Allure Reporting Integration
To compile and view Allure dashboards following execution:
```bash
npx allure generate ./allure-results -o ./allure-report --clean
npx allure open ./allure-report
```

---

## 🏗️ Jenkins CI/CD Integration Overview

Integrating your framework with Jenkins enables automated regression testing on code check-ins.

![Playwright Jenkins CI/CD Integration Pipeline Flowchart](/img/playwright_jenkins_pipeline_flowchart.png)

### Configuration Steps
1.  **Configure Node.js Plugin:** Go to **Manage Jenkins** ➔ **Global Tool Configuration** and set up a Node.js installer.
2.  **Add Build Pipeline Step:** Add a **Execute Shell** (macOS/Linux) or **Execute Windows batch command** build step:
    ```bash
    npm install
    npx playwright install --with-deps
    npx playwright test
    ```
3.  **Publish Allure Results:** Add a post-build action using the **Allure Report** plugin. Configure it to read `./allure-results` to display execution graphs directly inside Jenkins dashboards.
