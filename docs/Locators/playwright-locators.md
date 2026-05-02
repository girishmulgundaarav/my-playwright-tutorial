---
sidebar_position: 1
---

# 🎯 Playwright Locators

In Playwright, locators are a core concept that power its **auto-waiting** and **retry-ability** features.

### 📚 Core Concepts
- **Locator**: Identifies the element on the page.
- **DOM (Document Object Model)**: An API interface provided by the browser to interact with the structure of the document.

Simply put, a locator is a way to identify element(s) on the page at any given time, enabling stable and reliable tests.

## 🌟 Quick Reference: Recommended Built-in Locators

| Locator Method | Use Case |
| --- | --- |
| `page.getByRole()` | Locate elements by accessibility roles like button, checkbox, heading, etc. |
| `page.getByText()` | Locate by visible text content. |
| `page.getByLabel()` | Locate form controls using associated label text. |
| `page.getByPlaceholder()` | Locate inputs via placeholder text. |
| `page.getByAltText()` | Locate images by their alternative text (`alt` attribute). |
| `page.getByTitle()` | Locate elements by their `title` attribute. |
| `page.getByTestId()` | Locate by a custom data attribute like `data-testid`. |

---

## 🔍 Locating Elements

### 1. Locate by Role
`page.getByRole()` identifies elements based on how users and assistive technologies perceive them, using ARIA roles and accessible names.
Prefer this for interactive elements like buttons, checkboxes, links, lists, headings, tables, etc.

> [!TIP]
> **Role is not an attribute**. Role locators follow W3C specifications for ARIA roles, including buttons, checkboxes, headings, links, lists, tables, and many more.

> **What are ARIA roles?**
> ARIA (Accessible Rich Internet Applications) roles define the semantic purpose of an element in the DOM. Assistive technologies, like screen readers, use them to navigate and interact with web pages. Playwright leverages these roles to find elements the same way a real user would!

#### Common HTML Elements and their ARIA Roles
| HTML Element | ARIA Role |
| --- | --- |
| `<a href="...">`, `<area href="...">` | `link` |
| `<button>`, `<input type="button">`, `<input type="submit">`, `<input type="reset">` | `button` |
| `<form>` (with name attribute) | `form` |
| `<h1>` to `<h6>` | `heading` |
| `<header>` | `banner` (context-specific) |
| `<img>` (with alt) | `img` |
| `<input type="checkbox">` | `checkbox` |
| `<input type="email">`, `<input type="password">`, `<input type="text">`, `<textarea>` | `textbox` |
| `<input type="radio">` | `radio` |
| `<input type="range">` | `slider` |
| `<input type="search">` | `searchbox` |
| `<li>` | `listitem` |
| `<ol>`, `<ul>` | `list` |
| `<option>` | `option` |
| `<select>` | `listbox` (or `combobox`, depends on usage) |
| `<table>` | `table` |
| `<tbody>`, `<thead>`, `<tfoot>` | `rowgroup` |
| `<td>` | `cell` |
| `<th>` | `columnheader` or `rowheader` |
| `<tr>` | `row` |

**Example DOM:**
```html
<h3>Sign up</h3>
<label><input type="checkbox" /> Subscribe</label><br/>
<button>Submit</button>
```

**Test Actions:**
```javascript
await expect(page.getByRole('heading', { name: 'Sign up' })).toBeVisible();
await page.getByRole('checkbox', { name: 'Subscribe' }).check();
await page.getByRole('button', { name: /submit/i }).click();
```

### 2. Locate by Label
`page.getByLabel()` allows you to locate a form control using its associated label text. 

**When to use:** Ideal for form fields with visible labels.

**Example DOM:**
```html
<label>Password <input type="password" /></label>
```

**Test Action:**
```javascript
await page.getByLabel('Password').fill('secret');
```

### 3. Locate by Placeholder
`page.getByPlaceholder()` finds elements with a given placeholder text. 

**When to use:** Best for inputs without a label but having a placeholder.

**Example DOM:**
```html
<input type="email" placeholder="name@example.com" />
```

**Test Action:**
```javascript
await page.getByPlaceholder('name@example.com').fill('playwright@microsoft.com');
```

### 4. Locate by Text
`page.getByText()` finds elements based on their visible text content.

**When to use:** Use this locator for **non-interactive elements** like `<div>`, `<span>`, `<p>`, etc. 
For interactive elements like `button`, `a`, `input`, etc., prefer **role locators**.

**Example DOM:**
```html
<span>Welcome, John</span>
```

**Test Actions:**
```javascript
await expect(page.getByText('Welcome, John')).toBeVisible(); // Full string/full text
await expect(page.getByText('Welcome,')).toBeVisible(); // Partial match/substring
await expect(page.getByText(/Welcome\s+To\s+Our\s+Store/i)).toBeVisible(); // Regular expression
await expect(page.getByText('Welcome, John', { exact: true })).toBeVisible(); // Exact match
```

> [!CAUTION]
> **Strict Mode Violation**: If multiple elements match the text (e.g., 'Register'), Playwright will throw an error because it cannot decide which element to act upon. In such cases, use more specific locators like `getByRole`.

### 5. Locate by Alt Text & Title
- **Alt Text:** `page.getByAltText()` identifies images (and similar elements) based on the `alt` attribute. Use this when your element supports alt text, such as `<img>` and `<area>` elements.
- **Title:** `page.getByTitle()` locates elements based on their `title` attribute. Use this when your element has a meaningful title attribute.

**Test Actions:**
```javascript
await page.getByAltText('playwright logo').click();
await expect(page.getByTitle('Issues count')).toHaveText('25 issues');
```

### 6. Locate by Test ID
`page.getByTestId()` enables locating elements using a `data-testid` attribute (other attributes can be configured).

**When to use:** When text or role-based locators are unstable or not suitable.

**Test Action:**
```javascript
await page.getByTestId('directions').click();
```
*Note: Test IDs are not user-facing. Prefer role or text locators when they are semantically important to users.*

---

## ⚡ Beyond the Basics (Advanced Locator Features)

*Here is some extra information to make you a locator pro!*

### Filtering Locators
You can filter a locator to narrow down the search based on text or child elements using the `.filter()` method.
```javascript
// Find a row that contains the text 'John'
const row = page.getByRole('row').filter({ hasText: 'John' });

// Find a list item that has a button
const item = page.getByRole('listitem').filter({ has: page.getByRole('button') });
```

### Chaining Locators
You can chain locators to find elements within other elements.
```javascript
// Find a button inside a specific form
await page.locator('form#login').getByRole('button', { name: 'Sign In' }).click();
```

### Handling Multiple Matches
Playwright locators are **strict by default**. If multiple elements match, Playwright throws an exception (unless you are using methods that expect multiple items, like `.count()`).
To handle multiple elements, you can use `.first()`, `.last()`, or `.nth()`:
```javascript
const buttons = page.getByRole('button');
await buttons.first().click(); // Click the first button
await buttons.nth(1).click(); // Click the second button (0-indexed)
await buttons.last().click(); // Click the last button
```

### Locating Elements in Iframes
To interact with elements inside an `iframe`, use `page.frameLocator()`.
```javascript
const frame = page.frameLocator('#my-iframe');
await frame.getByRole('button', { name: 'Submit' }).click();
```

---

## ⚠️ Other Locator Options (Use with Caution)

### Locate by CSS or XPath
Use `page.locator()` for CSS or XPath selectors **only when absolutely necessary**.

```javascript
await page.locator('css=button').click();
await page.locator('xpath=//button').click();

// Auto-detect:
await page.locator('button').click();
await page.locator('//button').click();
```

**Warning:**
- CSS/XPath selectors are fragile and break easily with DOM changes.
- Avoid using long or deeply nested chains (e.g., `#tsf > div:nth-child(2) > div > input`).

## 💡 Final Tips
- **Favor** role, text, label, and placeholder locators first.
- **Avoid** overusing CSS or XPath locators unless unavoidable.
- **Remember** that locators are strict and will throw an error if they match multiple elements unexpectedly!

---

## 🛠️ Practice Application

Here is a complete, working HTML page that you can save locally as `app.html` and use to practice all the locators discussed above!

<details>
<summary><strong>Click to view the full Practice HTML Page</strong></summary>

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Playwright Locators Demo</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        section {
            margin-bottom: 30px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        h1, h2 {
            color: #2c3e50;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input, textarea, select, button {
            width: 100%;
            padding: 8px;
            box-sizing: border-box;
            margin-bottom: 10px;
        }
        button {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 10px 15px;
            cursor: pointer;
            width: auto;
        }
        button:hover {
            background-color: #2980b9;
        }
        .image-container {
            text-align: center;
            margin: 20px 0;
        }
        .image-container img {
            max-width: 200px;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 5px;
        }
        .card {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
        }
        .highlight {
            background-color: #fffde7;
            padding: 2px 5px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <header>
        <h1>Playwright Locators Demonstration</h1>
        <p>This page demonstrates various Playwright locators with properly aligned elements.</p>
    </header>

    <!-- getByRole() Section -->
    <section id="role-locators">
        <h2>1. <span class="highlight">getByRole()</span> Locators</h2>
        <p>Locate elements by their explicit or implicit ARIA roles.</p>
        
        <div class="grid">
            <div>
                <h3>Buttons</h3>
                <button role="button">Primary Action</button>
                <button aria-pressed="false">Toggle Button</button>
                <div role="button" tabindex="0" class="card">Div with button role</div>
            </div>
            
            <div>
                <h3>Form Elements</h3>
                <label for="username">Username:</label>
                <input type="text" id="username" role="textbox">
                
                <label>
                    <input type="checkbox" role="checkbox"> Accept terms
                </label>
            </div>
            
            <div>
                <h3>Navigation</h3>
                <nav role="navigation">
                    <ul>
                        <li role="menuitem"><a href="#">Home</a></li>
                        <li role="menuitem"><a href="#">Products</a></li>
                        <li role="menuitem"><a href="#">Contact</a></li>
                    </ul>
                </nav>
                
                <div role="alert" class="card">
                    This is an important alert message!
                </div>
            </div>
        </div>
    </section>

    <!-- getByText() Section -->
    <section id="text-locators">
        <h2>2. <span class="highlight">getByText()</span> Locators</h2>
        <p>Locate elements by their text content.</p>
        
        <div class="card">
            <p>This paragraph contains some <strong>important</strong> text that you might want to locate.</p>
            <p>Another paragraph with <span style="color: red">colored text</span> for demonstration.</p>
        </div>
        
        <ul>
            <li>List item 1</li>
            <li>List item 2 with <a href="#">link</a></li>
            <li>Special: Unique text identifier</li>
        </ul>
        
        <div class="card">
            <button>Submit Form</button>
            <p>Click the button above to submit your information.</p>
        </div>
    </section>

    <!-- getByLabel() Section -->
    <section id="label-locators">
        <h2>3. <span class="highlight">getByLabel()</span> Locators</h2>
        <p>Locate form controls by their associated label text.</p>
        
        <div class="form-group">
            <label for="email">Email Address:</label>
            <input type="email" id="email" name="email">
        </div>
        
        <div class="form-group">
            <label>
                Password:
                <input type="password" name="password">
            </label>
        </div>
        
        <div class="form-group">
            <label id="age-label">Your Age:</label>
            <input type="number" aria-labelledby="age-label">
        </div>
        
        <fieldset>
            <legend>Shipping Method</legend>
            <label><input type="radio" name="shipping" value="standard"> Standard</label>
            <label><input type="radio" name="shipping" value="express"> Express</label>
        </fieldset>
    </section>

    <!-- getByPlaceholder() Section -->
    <section id="placeholder-locators">
        <h2>4. <span class="highlight">getByPlaceholder()</span> Locators</h2>
        <p>Locate input elements by their placeholder text.</p>
        
        <div class="form-group">
            <input type="text" placeholder="Enter your full name" class="full-width">
        </div>
        
        <div class="form-group">
            <input type="tel" placeholder="Phone number (xxx-xxx-xxxx)">
        </div>
        
        <div class="form-group">
            <textarea placeholder="Type your message here..." rows="4"></textarea>
        </div>
        
        <div class="form-group">
            <input type="search" placeholder="Search products...">
            <button>Search</button>
        </div>
    </section>

    <!-- getByAltText() Section -->
    <section id="alttext-locators">
        <h2>5. <span class="highlight">getByAltText()</span> Locators</h2>
        <p>Locate elements (usually images) by their alt text.</p>
        
        <div class="image-container">
            <img src="https://playwright.dev/img/playwright-logo.svg" alt="logo image">
            <p>Playwright Logo</p>
        </div>
        
        </div>
    </section>

    <!-- getByTitle() Section -->
    <section id="title-locators">
        <h2>6. <span class="highlight">getByTitle()</span> Locators</h2>
        <p>Locate elements by their title attribute.</p>
        
        <div class="card">
            <p>Hover over these elements to see their titles:</p>
            <ul>
                <li><a href="#" title="Home page link">Home</a></li>
                <li><abbr title="HyperText Markup Language">HTML</abbr></li>
                <li><span title="Tooltip text">This text has a tooltip</span></li>
            </ul>
        </div>
        
       
        
        <button title="Click to save your changes">Save</button>
    </section>

    <!-- getByTestId() Section -->
    <section id="testid-locators">
        <h2>7. <span class="highlight">getByTestId()</span> Locators</h2>
        <p>Locate elements by their <code>data-testid</code> attribute (or other configured attribute).</p>
        
        <div class="card" data-testid="user-profile-card">
            <h3 data-testid="profile-name">John Doe</h3>
            <p data-testid="profile-email">john.doe@example.com</p>
            <!--<h3 data-pw="profile-name">John Doe</h3>
            <p data-pw="profile-email">john.doe@example.com</p> -->
            <button data-testid="edit-profile-btn">Edit Profile</button>
        </div>
        
        <div class="grid" data-testid="product-grid">
            <div class="card" data-testid="product-card-1">
                <h4 data-testid="product-name">Product A</h4>
                <p data-testid="product-price">$19.99</p>
            </div>
            <div class="card" data-testid="product-card-2">
                <h4 data-testid="product-name">Product B</h4>
                <p data-testid="product-price">$29.99</p>
            </div>
            <div class="card" data-testid="product-card-3">
                <h4 data-testid="product-name">Product C</h4>
                <p data-testid="product-price">$39.99</p>
            </div>
        </div>
        
        <nav data-testid="main-navigation">
            <ul>
                <li data-testid="nav-home"><a href="#">Home</a></li>
                <li data-testid="nav-products"><a href="#">Products</a></li>
                <li data-testid="nav-contact"><a href="#">Contact</a></li>
            </ul>
        </nav>
    </section>

    <footer>
        <p>This page demonstrates various Playwright locators for testing purposes.</p>
        <button data-testid="footer-button" title="Back to top">↑ Top</button>
    </footer>
</body>
</html>
```
</details>
