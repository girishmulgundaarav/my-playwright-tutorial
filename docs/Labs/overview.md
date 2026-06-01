---
title: Playwright Automation Labs Overview
---

# Playwright Automation Labs

Welcome to the **Playwright Automation Labs** section! This is a dedicated environment designed to test and sharpen your web automation skills on real-world scenarios. Each challenge represents a unique, complex UI dynamic that is commonly encountered in modern web applications.

:::tip
All code examples in this guide use the latest Playwright test runner features and follow standard best practices.
:::

## 🚀 The Challenges at a Glance

We have divided the automation exercises into three distinct challenge categories, covering 13 comprehensive labs in total.

| Challenge Area | Description | Total Labs | Focus Areas |
| :--- | :--- | :---: | :--- |
| **Challenge A: Employee Directory** | Grid structures, checkboxes, dynamic search filtering, sorting, pagination, CRUD, and network lag overlays. | 11 Labs | Advanced locators, pagination state, file downloads, wait states |
| **Challenge B: Infinite Scroll Feed** | Virtual scroll lists and lazy loading feeds. | 1 Lab | Custom scroll events, loading indicator assertions |
| **Challenge C: Dynamic Columns** | Columns shuffling their order dynamically. | 1 Lab | Index-independent table parsing, locator abstraction |

---

## 🛠️ Lab Specifications

Here is a summary of the labs that will be added and explored:

### 📋 Challenge A: Employee Directory Master Grid
* **Lab 1: Selection & Count Tracking** - Automate checkbox selection and verify sync count badges.
* **Lab 2: Search Query & Highlighting** - Validate search filter inputs and audit cell-highlighted text.
* **Lab 3: Expandable Detail Panels** - Expand hidden rows to audit inner text elements.
* **Lab 4: Dynamic Sorting Auditor** - Verify alphabetical and reverse sorting values.
* **Lab 5: Dynamic Pagination** - Navigate multi-page tables and assert page indices.
* **Lab 6: Column Visibility Toggles** - Uncheck columns to assert structural updates in the DOM tree.
* **Lab 7: Inline Record CRUD: Edit & Update** - Modify rows inline, select dropdown options, and save changes.
* **Lab 8: Inline Record CRUD: Delete Record** - Verify item deletion and check dynamic grid updates.
* **Lab 9: Add Employee Form** - Fill and submit sliding-drawer forms to inject new rows.
* **Lab 10: Network Lag Simulator** - Automate interactions with simulated latency overlays and spinners.
* **Lab 11: Export to CSV File Download** - Intercept browser downloads to verify generated file metadata.

### 📋 Challenge B: Infinite Scrolling Logs Feed
* **Lab 12: Infinite Scroll Lazy Loading** - Scroll containers to the bottom and wait for loaded logs.

### 📋 Challenge C: Dynamic Columns Table
* **Lab 13: Index-Independent Dynamic Table Parser** - Find specific cell values in rows where column order shuffles on load.

---

:::warning
Ensure your Playwright configuration has correct base URLs set up before executing the tests against local environments!
:::
