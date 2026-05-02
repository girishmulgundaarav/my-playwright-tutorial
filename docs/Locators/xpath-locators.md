---
sidebar_position: 3
---

# 🎯 XPath Locators

XPath (XML Path Language) is a powerful syntax for navigating through elements and attributes in an XML document. Since HTML is a form of XML, XPath is widely used in web automation to locate elements by their structure and attributes.

## 📖 Understanding XPath and DOM

The **DOM (Document Object Model)** is a structured representation of a webpage as a tree of nodes. XPath allows you to locate specific nodes within this tree.

![DOM Tree and HTML Structure](/img/locators/xpath-dom-tree.png)
*Visualizing the relationship between HTML code and the DOM tree structure.*

### Types of XPath

1.  **Absolute XPath (Full XPath)**:
    *   The full path from the root node to the target element.
    *   Starts with a single forward slash `/`.
    *   *Example*: `/html/body/div/div/input`
    *   **Cons**: Very brittle. If the page structure changes even slightly, the XPath breaks.

2.  **Relative XPath**:
    *   A flexible way to find elements by searching anywhere in the document.
    *   Starts with a double forward slash `//`.
    *   *Example*: `//input[@name="search"]`
    *   **Pros**: Shorter, easier to maintain, and much more robust.

![DOM Rendered View](/img/locators/xpath-dom-rendered.png)
*How the DOM is rendered as a user interface.*

---

## ⚖️ Absolute vs. Relative XPath

| Absolute XPath | Relative XPath |
| :--- | :--- |
| Starts with `/` | Starts with `//` |
| Full path from root node | Can directly target elements |
| Does not typically use attributes | Primarily works with attributes |
| Traverses every node | Jumps directly to the element |

---

## 🛠️ Common XPath Strategies

### 1. XPath with Single Attribute
Locate an element using a specific attribute like `id`, `name`, or `class`.
*   **Format**: `//tagname[@attribute='value']`
*   **Example**: `//input[@id='small-searchterms']`

### 2. XPath with Multiple Attributes
Combine multiple attributes for higher accuracy.
*   **Format**: `//tagname[@attribute1='value1'][@attribute2='value2']`
*   **Example**: `//input[@value='Search'][@type='submit']`

### 3. XPath with Logical Operators (`and`, `or`)
*   **and**: Both conditions must be true.
    *   `//input[@value='Search' and @type='submit']`
*   **or**: Either condition can be true.
    *   `//input[@value='Search' or @type='submit']`

---

## 🔍 Advanced XPath Functions

### `contains()`
Finds elements that contain a specific substring in their attribute value.
*   **Format**: `//*[contains(@attribute, 'substring')]`
*   **Example**: `//h2//a[contains(@href,'computer')]`

### `starts-with()`
Finds elements whose attribute value starts with a specific string.
*   **Format**: `//*[starts-with(@attribute, 'prefix')]`
*   **Example**: `//h2//a[starts-with(@href,'/build')]`

### `text()`
Locates elements based on their visible inner text.
*   **Format**: `//*[text()='Exact Text']`
*   **Partial Text**: `//*[contains(text(), 'Partial Text')]`

---

## ⚡ Dynamic XPath Handling

When elements have dynamic IDs or names, you can use combinations of the functions above to create stable locators.

![Dynamic Buttons Example](/img/locators/xpath-dynamic-buttons.png)
*Example UI with START and STOP buttons often used for testing dynamic locators.*

| XPath | Technique |
| :--- | :--- |
| `//button[@name='start']` | Exact Match |
| `//button[contains(@name,'st')]` | `contains()` |
| `//button[starts-with(@name,'st')]` | `starts-with()` |
| `//button[text()='START' or text()='STOP']` | `text()` with `or` |

---

:::tip Pro Tip
In Playwright, while XPath is fully supported, it is often recommended to use **Locators** (like `getByRole` or `getByText`) first, as they are more resilient to DOM changes and better reflect user behavior. Use XPath when you need to traverse the DOM tree (e.g., finding a parent or sibling) that CSS or built-in locators can't easily reach.
:::
