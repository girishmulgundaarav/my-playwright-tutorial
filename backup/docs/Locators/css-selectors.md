---
sidebar_position: 2
---

# 🎨 CSS Selectors

## What are CSS Selectors?

**CSS (Cascading Style Sheets)** selectors are used to identify and locate web elements based on their `id`, `class`, `name`, attributes, and other properties.

CSS is a **preferred locator strategy** in automation because it is:
- ✅ Simpler and more readable to write than XPath
- ✅ Faster to execute in the browser
- ✅ Supported natively by all modern browsers

There are **two main types** of CSS selectors:
- **Absolute CSS Selectors** — Follow the full path from root to the target element.
- **Relative CSS Selectors** — Find the element using a shortcut path.

> 💡 **Practice Site:** [https://testpages.eviltester.com/styled/basic-web-page-test.html](https://testpages.eviltester.com/styled/basic-web-page-test.html)

---

## 1. Absolute CSS Selectors — Full Path

Absolute selectors trace the complete path from the root `html` element down to the target. They are like a GPS route that follows every turn.

| What it Selects | CSS Selector |
|---|---|
| Whole HTML Document | `html` |
| The body of the page | `html body` |
| `<p>` inside the body | `html body p` |
| `<p>` with `id="para1"` | `html body p#para1` |
| `<a>` with `class="link"` | `html body a.link` |
| `<p>` inside a `<div id="div1">` | `html body div#div1 p` |
| `<p>` with `class="sub"` | `html > body > div > div > p[class='sub']` |

### Alternate Formats:
```css
/* <p> with id="para1" */
html > body > div > div > p#para1

/* <p> with class="sub" */
html > body > div > div > p.sub

/* <p> with both id and class */
html > body > div > div > p[id='para1'][class='main']
```

> ⚠️ **Warning:** Tools like **SelectorsHub** actively avoid absolute paths because they are **long and fragile** — any DOM change will break them. Use relative selectors instead wherever possible.

---

## 2. Relative CSS Selectors — Shortcuts

Relative selectors find elements **directly** without tracing the full path from the root. They are the recommended approach.

| What you want | CSS Selector |
|---|---|
| `<p>` inside `<body>` | `body p` |
| `<p>` anywhere in the HTML | `html p` |
| `<p>` with `id="para2"` | `p[id='para2']` or `p#para2` |

### Selecting Specific Children by Position

You can select elements based on their **position** among siblings using pseudo-classes.

| Task | Selector |
|---|---|
| First child inside a div | `body > div > *:first-child` |
| Last child inside a div | `body > div > *:last-child` |
| 3rd child inside a div | `body > div > *:nth-child(3)` |

```javascript
// In Playwright
await page.locator('body > div > *:nth-child(3)').click();
await page.locator('ul > li:first-child').click();
await page.locator('ul > li:last-child').click();
```

---

## 3. Attribute Selectors (Pattern Matching)

Use these when you want to match **part of an attribute's value** — very useful for dynamic IDs or classes.

| Task | Selector | Meaning |
|---|---|---|
| Attribute **starts with** `"ma"` | `p[class^='ma']` | `^=` means "starts with" |
| Attribute **ends with** `"ub"` | `p[class$='ub']` | `$=` means "ends with" |
| Attribute **contains** `"ai"` | `p[class*='ai']` | `*=` means "contains" |

```javascript
// In Playwright
await page.locator('input[id^="user"]').fill('John');    // id starts with "user"
await page.locator('button[class$="primary"]').click(); // class ends with "primary"
await page.locator('div[class*="card"]').isVisible();   // class contains "card"
```

---

## 4. Combining Selectors

You can combine multiple selectors to create highly specific, yet resilient queries.

| Task | Selector |
|---|---|
| `<p>` with both id AND class | `p[id='para1'][class='main']` |
| `<p>` that does NOT have `id="para1"` | `p:not([id='para1'])` |
| `<p>` with `class="sub"` but NOT `id="para1"` | `p:not([id='para1'])[class='sub']` |
| `<p>` without `id="para1"` AND without `class="main"` | `p:not([id='para1']):not([class='main'])` |

```javascript
// In Playwright
await page.locator('input[type="text"]:not([disabled])').fill('test');
await page.locator('button[type="submit"]:not([class*="disabled"])').click();
```

---

## 5. Following Sibling Selectors

The `+` combinator selects an element that comes **immediately after** another element at the same level.

| Task | Selector |
|---|---|
| `<p>` right after `<p id='para1'>` | `p[id='para1'] + p` |
| Any tag right after `<head>` | `head + *` |

```javascript
// In Playwright — click the label that immediately follows a checkbox
await page.locator('input[type="checkbox"] + label').click();
```

---

## 6. Generic CSS Format in Automation

A quick-reference for the most common CSS selector patterns:

| CSS Selector Type | Format | Example |
|---|---|---|
| Tag with ID | `tag#id` | `input#username` |
| Tag with Class | `tag.classname` | `button.btn-primary` |
| Tag with Attribute | `tag[attribute="value"]` | `input[type="email"]` |
| Tag with Class and Attribute | `tag.classname[attribute="value"]` | `input.form-control[placeholder="Search"]` |

```javascript
// All of the above in Playwright
await page.locator('input#username').fill('admin');
await page.locator('button.btn-primary').click();
await page.locator('input[type="email"]').fill('test@example.com');
await page.locator('input.form-control[placeholder="Search"]').fill('Playwright');
```

---

## 💡 Tips & Tricks

### ✅ When to Use CSS Selectors
- When `getByRole`, `getByLabel`, or `getByText` are not feasible.
- When targeting elements with specific dynamic attributes (e.g., `data-*`).
- When the element has a unique `id` or `class`.

### 🔍 Using Browser DevTools to Find CSS Selectors
1. Right-click the element → **Inspect**
2. In the Elements panel, right-click the highlighted node
3. Select **Copy → Copy selector** (for absolute) or **Copy → Copy JS path**
4. Paste into Playwright and simplify it to a relative selector

### 🛠️ Playwright CSS Selector Examples
```javascript
// ID selector (fastest and most reliable)
await page.locator('#login-button').click();

// Class selector
await page.locator('.submit-btn').click();

// Attribute selector (great for inputs)
await page.locator('input[placeholder="Enter email"]').fill('user@test.com');

// Combining tag + class + attribute
await page.locator('input.form-control[type="password"]').fill('secret123');

// nth-child for table rows
await page.locator('table tbody tr:nth-child(2) td:first-child').textContent();

// Sibling combinator for form validation errors
await page.locator('input#email + span.error').isVisible();
```

### ⚠️ Common Mistakes to Avoid
| ❌ Bad Practice | ✅ Better Practice |
|---|---|
| Long absolute paths: `html > body > div > div > form > input` | Short relative: `form input[name="email"]` |
| Generic class: `.btn` (matches many elements) | Specific: `button.btn[type="submit"]` |
| Using CSS when a semantic locator works | Prefer `getByRole('button', {name: 'Submit'})` |
| Relying on `nth-child` for everything | Use unique `id` or `data-testid` when available |

### 🧪 Selector Specificity Order (Most to Least Reliable)
1. `id` (`#unique-id`) — Most specific, fastest
2. `[data-testid="..."]` — Stable, test-specific
3. `[name="..."]` or `[type="..."]` — Semantic attributes
4. `.classname` — Common, but can be non-unique
5. `tag` alone — Least specific, avoid unless combined
