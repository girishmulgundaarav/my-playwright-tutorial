---
title: Parallelism & Parallel Testing
sidebar_position: 4
---

# Playwright Parallelism & Parallel Testing

Running end-to-end test suites can be slow due to the nature of web application loading, page interactions, and network request settlement. To optimize execution speeds and reduce developer feedback loops, Playwright executes tests in parallel by default, distributing them across multiple isolated processes called **Workers**.

This guide covers parallel and serial execution modes, configuring worker counts globally or programmatically, CLI commands for execution control, and advanced scaling using sharding.

---

## 1. Playwright Worker Architecture

In Playwright, all tests are executed by **Worker Processes**. 

*   **Isolated OS Processes**: Each worker is an independent operating system process.
*   **Isolated Browser Contexts**: Every worker operates its own browser instances and context instances. State (such as cookies, localStorage, and caches) is completely isolated between workers.
*   **CPU Utilization**: By default, Playwright allocates half of the physical CPU cores on your machine as active worker processes.

### Worker Execution Flow

Here is how the test runner orchestrates parallel execution across workers:

![Playwright Worker Architecture](/img/playwright_workers.png)

---

## 2. Serial Mode Execution

In **Serial Mode**, tests run sequentially, one after another. If a test fails in serial mode, all subsequent tests in the same file or group are skipped. This is helpful for testing steps that must run in a strict dependency sequence.

### A. Set Serial Mode globally in `playwright.config.ts`
To run your entire test suite sequentially:
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  fullyParallel: false, // Run test files sequentially
  workers: 1,           // Force execution to run in a single worker process
});
```

:::note Configuration Pairing
Setting `fullyParallel: false` is not enough to guarantee pure sequential execution across the entire suite if `workers` is set to a value greater than `1`. You must restrict `workers: 1` to ensure only one test executes at any given moment.
:::

### B. Set Serial Mode per Test File
To run tests sequentially only within a specific file or group, declare the serial configuration mode at the top of the test file:
```typescript
import { test, expect } from '@playwright/test';

// Configure the entire file to run sequentially
test.describe.configure({ mode: 'serial' });

test.describe('Sequential Checkout Flow', () => {
  test('Step 1: Add product to cart', async ({ page }) => {
    // Test logic
  });

  test('Step 2: Proceed to checkout', async ({ page }) => {
    // If Step 1 fails, this test is automatically skipped
  });
});
```

---

## 3. Parallel Mode Execution

In **Parallel Mode**, Playwright runs multiple tests concurrently. By default, tests within a single file run sequentially (in order), but different test files run in parallel.

### A. Enable Parallel Execution globally in `playwright.config.ts`
To make all tests in all files run in parallel concurrently:
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  fullyParallel: true, // Run all tests within files in parallel
  workers: 4,          // Allocate 4 concurrent worker processes
});
```

### B. Enable Parallel Execution per Test File
To force tests inside a single file to execute in parallel (instead of sequentially):
```typescript
import { test, expect } from '@playwright/test';

// Configure all tests in this file to run in parallel
test.describe.configure({ mode: 'parallel' });

test.describe('Product Verification Suite', () => {
  test('Verify Phones Category', async ({ page }) => {
    console.log("Running Test 1 in parallel...");
  });

  test('Verify Laptops Category', async ({ page }) => {
    console.log("Running Test 2 in parallel...");
  });
});
```

### C. Configure Concurrency per Browser Project
You can configure parallel execution options for specific browsers or configurations under the `projects` array:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      fullyParallel: true, // Only run Chromium tests in parallel
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      fullyParallel: false, // Run Firefox tests sequentially
    },
  ],
});
```

---

## 4. Worker CLI Configuration

You can override your global configuration file settings directly from the command line using the `--workers` flag.

### Command Execution Formats

#### 1. Limit worker allocation to speed up execution
Allocate a specific count of worker processes (e.g., 3 workers):
```bash
npx playwright test --workers 3
```

#### 2. Disable concurrency (Run in Serial Mode)
Force the suite to run on a single worker. This is helpful for local debugging, resource-constrained environments, or analyzing execution logs sequentially:
```bash
npx playwright test --workers 1
```

:::warning Worker Limits
You cannot assign more active worker processes than the total number of tests in your run. If you run 2 tests with `--workers 4`, Playwright will launch only 2 workers.
:::

---

## 5. Advanced Playwright Parallelism: Sharding

When managing large enterprise suites with thousands of tests, running them on a single machine is not sufficient. Playwright supports **Sharding**, which splits the test suite into subsets (shards) that run on completely separate machines in CI/CD pipelines (e.g., GitHub Actions, GitLab CI).

### Running Shards via CLI
Use the `--shard` flag formatted as `current-index/total-shards` to split your test run:

```bash
# Split tests into 3 shards and run the first shard
npx playwright test --shard=1/3

# Run the second shard
npx playwright test --shard=2/3

# Run the third shard
npx playwright test --shard=3/3
```

Each shard executes a balanced subset of files, allowing you to parallelize tests across multiple servers, reducing build times from hours to minutes.

---

## 🏋️ Hands-on Lab Assignments

### Exercise 1: Toggling Execution Modes
1. Create a test file `tests/paralleltesting.spec.ts` containing five tests.
2. Add a `console.log()` statement inside each test body to output the execution order.
3. Configure the file to run in **serial mode** using `test.describe.configure({ mode: 'serial' })`. Run the file and note the print sequence.
4. Modify the file to run in **parallel mode** using `test.describe.configure({ mode: 'parallel' })`. Run the file and notice how the console prints interlace due to concurrent execution.

### Exercise 2: Overriding Worker Limits in CLI
1. Run your test suite with `--workers 1`.
2. Notice the total execution duration and log structure.
3. Run the same test suite with `--workers 3`.
4. Inspect the test report and note the difference in execution speed.

### Exercise 3: Simulating CI Sharding
1. Execute the first half of your test suite using the `--shard=1/2` argument in your terminal.
2. Execute the second half of the suite using `--shard=2/2`.
3. Note how Playwright automatically divides the test files between the runs.

---

```quiz
{
  "question": "What is a Playwright Worker Process?",
  "options": [
    "A thread inside the main test runner process that shares browser cache",
    "An isolated OS process that runs browser contexts and executes a subset of tests",
    "A virtual machine instance deployed to cloud servers automatically",
    "A helper module that compiles TypeScript code"
  ],
  "answer": 1,
  "explanation": "Playwright workers are isolated OS processes. They do not share state (like cookies, cache, or localStorage) with each other, ensuring test execution safety."
}
```

```quiz
{
  "question": "Which combination of configuration options guarantees that all test files run sequentially?",
  "options": [
    "fullyParallel: true, workers: 4",
    "fullyParallel: false, workers: 4",
    "fullyParallel: false, workers: 1",
    "fullyParallel: true, workers: 1"
  ],
  "answer": 2,
  "explanation": "To run all tests sequentially (serial mode) globally, fullyParallel must be set to false and the worker allocation must be limited to 1. If workers > 1, files will still execute concurrently."
}
```

```quiz
{
  "question": "Which command executes the third shard of a test suite that is split across 5 total shards?",
  "options": [
    "npx playwright test --shard=5/3",
    "npx playwright test --shard 3/5",
    "npx playwright test --workers=3 --shards=5",
    "npx playwright test --split=3-5"
  ],
  "answer": 1,
  "explanation": "The --shard flag format is current-index/total-shards. Thus, --shard=3/5 executes the third shard of five total partitions."
}
```
