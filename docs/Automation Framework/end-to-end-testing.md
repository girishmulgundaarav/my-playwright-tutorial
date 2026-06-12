---
title: End to End Test
sidebar_position: 3
---

# End-to-End Testing (Checkout Flow)

End-to-End (E2E) testing validates the complete user journey of an application from the initial landing page down to transaction completion. In an e-commerce platform like **OpenCart**, a robust E2E test ensures that searching for an item, checking out, and placing an order work seamlessly without failures.

---

## 🔗 Practice Sites & Test URLs

We execute our end-to-end tests against:
*   **Local Test Environment:** `http://localhost/opencart/upload/`
*   **Staging Demo Sandbox:** [Naveen Automation Labs OpenCart Demo](https://naveenautomationlabs.com/opencart/)

---

## 🛍️ The End-to-End User Journey

Automating a checkout flow involves navigating through multiple page boundaries, dealing with dynamic tables, and interacting with stepped forms (accordion menus). Here is the workflow diagram:

![Playwright Page Object Model E2E Checkout Flowchart](/img/playwright_e2e_checkout_flowchart.png)

---

## 📐 Designing Page Objects for Checkout

To automate this E2E journey, we create modular page object classes for the search, product display, shopping cart, and checkout sections. Store these classes under your `pages/` directory.

### 1. Search Results Page (`pages/SearchResultsPage.ts`)
Locates the thumbnail grid and targets specific products returned from search results:

```typescript
import { Page, Locator } from '@playwright/test';

export class SearchResultsPage {
  private readonly page: Page;
  private readonly productLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productLinks = page.locator('.product-thumb h4 a');
  }

  /**
   * Filters product thumbnails by text name and clicks it
   * @param productName - Name of the product to select
   */
  async selectProductByName(productName: string): Promise<void> {
    const targetLink = this.productLinks.filter({ hasText: productName });
    await targetLink.click();
  }
}
```

### 2. Product Details Page (`pages/ProductPage.ts`)
Handles product parameter configurations (like quantity) and clicks the purchase button:

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class ProductPage {
  private readonly page: Page;
  private readonly txtQuantity: Locator;
  private readonly btnAddToCart: Locator;
  private readonly successAlert: Locator;
  private readonly lnkShoppingCart: Locator;

  constructor(page: Page) {
    this.page = page;
    this.txtQuantity = page.locator('#input-quantity');
    this.btnAddToCart = page.locator('#button-cart');
    this.successAlert = page.locator('.alert-success');
    this.lnkShoppingCart = page.locator('a:has-text("shopping cart")');
  }

  async setQuantity(qty: string): Promise<void> {
    await this.txtQuantity.fill(qty);
  }

  async addToCart(): Promise<void> {
    await this.btnAddToCart.click();
  }

  async verifySuccessMessage(productName: string): Promise<void> {
    await expect(this.successAlert).toBeVisible();
    await expect(this.successAlert).toContainText(`Success: You have added ${productName} to your shopping cart!`);
  }

  async navigateToCart(): Promise<void> {
    await this.lnkShoppingCart.click();
  }
}
```

### 3. Shopping Cart Page (`pages/ShoppingCartPage.ts`)
Extracts and validates tabular cart items before proceeding to billing:

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class ShoppingCartPage {
  private readonly page: Page;
  private readonly cartTableRows: Locator;
  private readonly btnCheckout: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartTableRows = page.locator('.table-responsive tbody tr');
    this.btnCheckout = page.locator('.pull-right a:has-text("Checkout")');
  }

  /**
   * Compares the row cells matching a product with expected quantities and prices
   */
  async verifyProductInCart(productName: string, quantity: string, totalPrice: string): Promise<void> {
    const targetRow = this.cartTableRows.filter({ hasText: productName });
    await expect(targetRow).toBeVisible();
    
    const quantityInput = targetRow.locator('input[name^="quantity"]');
    await expect(quantityInput).toHaveValue(quantity);

    const priceCol = targetRow.locator('td').nth(5);
    await expect(priceCol).toHaveText(totalPrice);
  }

  async clickCheckout(): Promise<void> {
    await this.btnCheckout.click();
  }
}
```

### 4. Checkout Checkout Options Page (`pages/CheckoutPage.ts`)
Manages guest options, billing configurations, shipping forms, and order placements:

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {
  private readonly page: Page;
  private readonly rdoGuestCheckout: Locator;
  private readonly btnAccountOptionContinue: Locator;
  
  private readonly txtFirstname: Locator;
  private readonly txtLastname: Locator;
  private readonly txtAddress1: Locator;
  private readonly txtCity: Locator;
  private readonly txtPostcode: Locator;
  private readonly selCountry: Locator;
  private readonly selZone: Locator;
  private readonly btnBillingContinue: Locator;

  private readonly btnDeliveryMethodContinue: Locator;
  private readonly chkAgree: Locator;
  private readonly btnPaymentContinue: Locator;
  private readonly btnConfirmOrder: Locator;
  private readonly msgOrderSuccess: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Step 1 locators
    this.rdoGuestCheckout = page.locator('input[value="guest"]');
    this.btnAccountOptionContinue = page.locator('#button-account');
    
    // Step 2 locators (Billing Details)
    this.txtFirstname = page.locator('#input-payment-firstname');
    this.txtLastname = page.locator('#input-payment-lastname');
    this.txtAddress1 = page.locator('#input-payment-address-1');
    this.txtCity = page.locator('#input-payment-city');
    this.txtPostcode = page.locator('#input-payment-postcode');
    this.selCountry = page.locator('#input-payment-country');
    this.selZone = page.locator('#input-payment-zone');
    this.btnBillingContinue = page.locator('#button-guest');
    
    // Steps 3 & 4 locators
    this.btnDeliveryMethodContinue = page.locator('#button-shipping-method');
    
    // Step 5 locators (Payment Method)
    this.chkAgree = page.locator('input[name="agree"]');
    this.btnPaymentContinue = page.locator('#button-payment-method');
    
    // Step 6 locators (Confirm Order)
    this.btnConfirmOrder = page.locator('#button-confirm');
    this.msgOrderSuccess = page.locator('h1:has-text("Your Order Has Been Processed!")');
  }

  async selectGuestCheckout(): Promise<void> {
    await this.rdoGuestCheckout.check();
    await this.btnAccountOptionContinue.click();
  }

  async fillBillingDetails(details: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postcode: string;
    country: string;
    zone: string;
  }): Promise<void> {
    await this.txtFirstname.fill(details.firstName);
    await this.txtLastname.fill(details.lastName);
    await this.txtAddress1.fill(details.address);
    await this.txtCity.fill(details.city);
    await this.txtPostcode.fill(details.postcode);
    await this.selCountry.selectOption({ label: details.country });
    await this.selZone.selectOption({ label: details.zone });
    await this.btnBillingContinue.click();
  }

  async confirmShippingMethod(): Promise<void> {
    await this.btnDeliveryMethodContinue.click();
  }

  async acceptTermsAndContinue(): Promise<void> {
    await this.chkAgree.check();
    await this.btnPaymentContinue.click();
  }

  async placeOrder(): Promise<void> {
    await this.btnConfirmOrder.click();
    await expect(this.msgOrderSuccess).toBeVisible();
  }
}
```

---

## 🧪 Complete End-to-End Test Suite

Create `tests/EndToEndTest.spec.ts` using the modular POM components and environment configs:

```typescript
import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { ProductPage } from '../pages/ProductPage';
import { ShoppingCartPage } from '../pages/ShoppingCartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { TestConfig } from '../test.config';

test('TC_E2E_001: Search product, purchase as Guest, and place order', async ({ page }) => {
  const config = new TestConfig();
  const home = new HomePage(page);
  const searchResults = new SearchResultsPage(page);
  const productDetails = new ProductPage(page);
  const cart = new ShoppingCartPage(page);
  const checkout = new CheckoutPage(page);

  // 1. Navigate and search
  await page.goto(config.appUrl);
  await home.enterProductName(config.productName);
  await home.clickSearch();

  // 2. Select product from thumbnails
  await searchResults.selectProductByName(config.productName);

  // 3. Configure quantity and add to cart
  await productDetails.setQuantity(config.productQuantity);
  await productDetails.addToCart();
  await productDetails.verifySuccessMessage(config.productName);
  await productDetails.navigateToCart();

  // 4. Verify item details inside cart table
  await cart.verifyProductInCart(config.productName, config.productQuantity, config.totalPrice);
  await cart.clickCheckout();

  // 5. Complete Stepped Checkout forms
  await checkout.selectGuestCheckout();
  
  await checkout.fillBillingDetails({
    firstName: "Girish",
    lastName: "Mulgund",
    address: "123 Test automation lane",
    city: "San Jose",
    postcode: "95101",
    country: "United States",
    zone: "California"
  });

  await checkout.confirmShippingMethod();
  await checkout.acceptTermsAndContinue();
  await checkout.placeOrder();
});
```

---

## 🌟 E2E Resiliency Best Practices

*   **Implement Global Setup Configs:** E2E workflows are intensive. Set a baseline `actionTimeout: 10000` inside `playwright.config.ts` so that temporary database lags do not cause checkout steps to immediately error.
*   **Decouple Accounts Between Suites:** Always use unique guest emails or generate random account names (using Faker) during test runs to prevent state collision issues where old addresses block forms.
*   **Scaffold Database States:** In commercial deployment pipelines, run a setup database clean hook (`db-reset`) before running E2E suites to wipe cart tables and guarantee predictable product stocks.
