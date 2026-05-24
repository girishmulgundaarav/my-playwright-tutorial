---
title: Reporters & Custom Reporting
sidebar_position: 6
---

# Reporters & Custom Reporting

Reporters in Playwright are responsible for capturing execution events (such as suite launch, test starts, step steps, and assertions outcomes) and formatting them into readable visual guides.

Playwright provides robust built-in reporters, support for custom-coded reporters, and integrations with advanced third-party dashboards like Allure.

---

## 1. Reporters Architecture

During execution, Playwright runs tests across multiple isolated worker processes. These workers send status events (such as test started, step passed, or test failed) back to the coordinator. The coordinator then passes this raw data to a central dispatcher, which forwards it to all registered reporters:

![Playwright Reporters Architecture](/img/playwright_reporters.png)

---

## 2. Built-in Reporters

Playwright offers several built-in reporters that can be enabled via `playwright.config.ts` or on-demand using CLI flags.

### A. The HTML Reporter
The HTML reporter generates a standalone folder containing an interactive dashboard to inspect test results, step timelines, console logs, trace views, and attachments.

*   **Default Behavior**: Opens automatically in the browser if any test fails.
*   **Controlling Open Behavior**:
    You can customize the `open` option in your configuration file:
    *   `'always'`: Always open the HTML report after execution finishes.
    *   `'never'`: Do not open the HTML report automatically (ideal for CI servers).
    *   `'on-failure'`: Only open the browser tab if a test fails (default behavior).

#### Configuration Example:
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['html', { 
      open: 'never',                     // Do not open automatically
      outputFolder: 'custom-html-report' // Save to a custom folder
    }]
  ],
});
```

To view a report saved in a custom folder, run:
```bash
npx playwright show-report custom-html-report
```

---

### B. Console Terminal Reporters

| Reporter | Description | Configuration Value | CLI Option |
| :--- | :--- | :--- | :--- |
| **List** (Default) | Prints one line per test showing progress. Useful for detailed logs. | `reporter: 'list'` | `--reporter=list` |
| **Line** | Displays a single dynamic line that updates in-place. Compact and keeps console clean. | `reporter: 'line'` | `--reporter=line` |
| **Dot** | Displays a single character (dot `.`) per test execution. Ideal for CI builds. | `reporter: 'dot'` | `--reporter=dot` |

---

### C. Machine Integration Reporters

| Reporter | Output | Best Used For | Configuration Value |
| :--- | :--- | :--- | :--- |
| **JSON** | A single JSON file detailing execution parameters, times, and errors. | Database tracking or custom dashboards. | `[['json', { outputFile: 'results.json' }]]` |
| **JUnit XML** | An XML file following the standard JUnit structure. | Jenkins, GitLab, or Azure DevOps reporting integrations. | `[['junit', { outputFile: 'results.xml' }]]` |

---

## 3. Configuring Multiple Reporters

You can register multiple reporters simultaneously. For example, you can write XML files for CI, output JSON for a database, and print simple dots to the terminal:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['dot'],                                                // Print dots in terminal
    ['html', { open: 'never', outputFolder: 'test-run' }],  // Write HTML report
    ['json', { outputFile: 'test-results.json' }],         // Write JSON file
    ['junit', { outputFile: 'junit-results.xml' }]          // Write JUnit XML
  ],
});
```

---

## 4. Creating a Custom Reporter

If you want to send metrics to a Slack channel, log results to an external API, or format logs in a specific way, you can write a custom reporter class by implementing Playwright's `Reporter` interface.

### Step 1: Create the Custom Reporter Class (`custom-logger.ts`)
Create a custom logger file at the root or within a helpers directory:

```typescript
import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';

class CustomLogger implements Reporter {
  // Triggered once at the beginning of the entire test run
  onBegin(config: FullConfig, suite: Suite) {
    console.log(`\n🚀 Starting test execution with ${suite.allTests().length} tests total.`);
  }

  // Triggered when a single test starts executing
  onTestBegin(test: TestCase, result: TestResult) {
    console.log(`🔍 [STARTING] Test: "${test.title}"`);
  }

  // Triggered when a single test finishes executing
  onTestEnd(test: TestCase, result: TestResult) {
    const duration = result.duration;
    console.log(`✅ [FINISHED] Test: "${test.title}" | Status: ${result.status} | Duration: ${duration}ms`);
  }

  // Triggered once after all tests have completed
  onEnd(result: FullResult) {
    console.log(`\n🏁 Test run finished with status: [${result.status.toUpperCase()}]`);
  }
}

export default CustomLogger;
```

### Step 2: Register in configuration
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'],
    ['./custom-logger.ts'] // Path to your custom reporter class file
  ],
});
```

---

## 5. Integrating Allure Reports

**Allure Report** is a popular open-source framework designed to create beautiful, interactive, and comprehensive test report dashboards.

### Prerequisites

1.  **Install Allure CLI**:
    Allure CLI compiles raw test results into static HTML reports. Install it globally or locally via npm:
    ```bash
    npm install -g allure-commandline --save-dev
    ```
2.  **Install Allure Playwright Adapter**:
    Install the Playwright reporter plugin:
    ```bash
    npm install -D allure-playwright
    ```

---

### Step-by-Step Generation Workflow

#### Step 1: Execute Tests with Allure Reporter
You can register Allure in your config file or call it dynamically on the command line:

*   **Via Config file**:
    ```typescript
    export default defineConfig({
      reporter: 'allure-playwright',
    });
    ```
*   **Via CLI**:
    ```bash
    npx playwright test --reporter=allure-playwright
    ```

Executing this command runs your tests and generates raw JSON logs inside `./allure-results`.

#### Step 2: Compile Allure Results to HTML
Compile the raw results in `./allure-results` into a viewable web folder `./allure-report` (using `--clean` to remove old files):
```bash
allure generate ./allure-results -o ./allure-report --clean
```

#### Step 3: Serve the Allure Report
Launch a local web server to view the report in your browser:
```bash
allure open ./allure-report
```

---

## 🏋️ Hands-on Lab Assignments

### Exercise 1: Toggle Built-in HTML Parameters
1. Open your `playwright.config.ts`.
2. Configure the HTML reporter to save files inside a folder named `my-test-reports/` and set `open` to `'never'`.
3. Run your tests using `npx playwright test`. Verify the report is created in the correct folder and does not open automatically.
4. Launch the report manually using the `show-report` CLI utility.

### Exercise 2: Implementing a Custom Time-Stamping Reporter
1. Create a file named `my-custom-reporter.ts`.
2. Write a reporter class that prints the test file name and the exact execution start and end timestamps for every test.
3. Configure `playwright.config.ts` to run your custom reporter. Verify the terminal logs match your custom format.

### Exercise 3: Full Allure Integration Run
1. Install `allure-playwright`.
2. Execute your test suite with the allure reporter enabled via the CLI.
3. Generate the HTML allure folder and open it locally.

---

```quiz
{
  "question": "Which HTML reporter option prevents the browser from launching automatically after running tests?",
  "options": [
    "open: 'off'",
    "open: 'never'",
    "open: 'on-failure'",
    "autoOpen: false"
  ],
  "answer": 1,
  "explanation": "Setting open to 'never' stops the HTML reporter from opening the browser automatically after tests finish, which is the recommended setting for headless CI environments."
}
```

```quiz
{
  "question": "What is the purpose of the Dot reporter?",
  "options": [
    "It logs test details inside a JSON configuration file",
    "It displays a single character (a dot) per test execution to keep the terminal output clean and compact",
    "It captures screenshots for test steps",
    "It automatically opens the Playwright inspector debugger"
  ],
  "answer": 1,
  "explanation": "The Dot reporter displays a single character (dot) for each test execution, providing a very minimal and clean terminal logging output."
}
```

```quiz
{
  "question": "Which Allure CLI command compiles raw execution logs into a viewable static HTML site?",
  "options": [
    "allure open ./allure-results",
    "allure build ./allure-results",
    "allure generate ./allure-results -o ./allure-report --clean",
    "npx playwright show allure"
  ],
  "answer": 2,
  "explanation": "The 'allure generate' command reads raw execution data from the results directory and compiles it into a static HTML report folder."
}
```
