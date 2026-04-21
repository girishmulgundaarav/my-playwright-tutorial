---
sidebar_position: 4
---

# 🏆 Best Practices, CI/CD, & Challenges

Congratulations on reaching the final stage! This section covers how to keep your code clean, how to automate your tests, and a challenge to test your skills.

---

## 💎 Part 1: Best Practices (Do's and Don'ts)
Writing tests is easy; writing **maintainable** tests is the real skill.

| ✅ Do | ❌ Don't |
| :--- | :--- |
| **Use Web-First Assertions**: `expect(loc).toBeVisible()` | **Use Hard Waits**: `page.waitForTimeout(5000)` |
| **Use Locators**: `getByRole` or `getByText` | **Use Brittle Selectors**: Long XPath or deep CSS |
| **Keep Tests Independent**: Each test should run alone | **Chain Tests**: Don't make Test B rely on Test A |
| **Use BaseURL**: Set it in `playwright.config.ts` | **Hardcode URLs**: Avoid `page.goto('https://site.com/login')` |

---

## 🤖 Part 2: Continuous Integration (GitHub Actions)
In professional environments, tests run automatically every time code is pushed. Playwright makes this easy with GitHub Actions.

### ✅ Checklist: Setting up CI
* **Locate the YAML** 📄: When you initialized Playwright, it created `.github/workflows/playwright.yml`.
* **Push to GitHub** ⬆️: Push your project to a GitHub repository.
* **Check the "Actions" Tab** 🚀: GitHub will automatically detect the file and start running your tests.
* **View Results** 📊: If a test fails, GitHub will host the Playwright Report as an "artifact" for you to download and inspect.

---

## 🧠 Part 3: The Playwright Challenge
Apply everything you've learned in this mini-project.

**The Goal:** Automate a login flow on a practice site.
1. **Navigate**: Go to a practice site (e.g., `https://the-internet.herokuapp.com/login`).
2. **Locate & Fill**: Find the username and password fields using `getByLabel`.
3. **Submit**: Click the "Login" button using `getByRole`.
4. **Assert**: Verify that a success message appears and is visible.
5. **Trace**: Record a trace of this run and inspect it in the Trace Viewer.