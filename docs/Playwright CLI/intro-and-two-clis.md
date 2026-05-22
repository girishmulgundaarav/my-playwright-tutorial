---
title: Introduction & The Two CLIs
sidebar_position: 1
---

# Introduction to Playwright CLI & The Two CLIs

The command-line interface (CLI) is a core component of the Playwright ecosystem. It enables QA engineers and automation developers to trigger test runs, manage browser engines, record user interactions, view execution reports, and inspect traces directly from the terminal.

This guide introduces the Playwright CLI capabilities and explores the two distinct CLI systems available: the standard **npx playwright CLI** and the new **@playwright/cli** tailored specifically for AI coding agents.

---

## 1. What is Playwright CLI?

The Playwright CLI is the unified entry point for configuring and executing browser automation tasks. In modern QA pipelines, using a CLI is crucial because it:
*   **Bypasses GUI Overhead**: Runs tests headlessly in terminals, saving memory and CPU resources.
*   **Facilitates CI/CD Integration**: CLI commands run natively inside Jenkins, GitHub Actions, GitLab CI, and Docker containers without requiring browser plugins.
*   **Boosts Developer Speed**: Commands allow filtering tests by name, sharding suites across parallel execution nodes, and retrying failures on the fly.

---

## 2. Standard CLI vs. @playwright/cli (AI Agent CLI)

While standard CLI commands are optimized for human developers and CI/CD pipelines, modern AI coding agents (such as Claude Code, Cursor, Copilot, and Windsurf) interact with browsers differently. For this reason, Playwright has introduced a second CLI package specifically optimized for AI-driven automation.

```
                     ┌──────────────────────────────────┐
                     │          Playwright CLI          │
                     └────────────────┬─────────────────┘
                                      │
             ┌────────────────────────┴────────────────────────┐
             ▼                                                 ▼
┌──────────────────────────┐                      ┌──────────────────────────┐
│   npx playwright (Std)   │                      │  @playwright/cli (Agent) │
├──────────────────────────┤                      ├──────────────────────────┤
│ • Runs Test Suites       │                      │ • Controls Live Browser  │
│ • Launches Codegen       │                      │ • Takes Disk Snapshots   │
│ • Generates Reports      │                      │ • Token-Efficient for AI │
│ • Headless CI Focus      │                      │ • Persistent Sessions    │
└──────────────────────────┘                      └──────────────────────────┘
```

### A. The Standard CLI (`npx playwright`)
*   **Purpose**: Traditional test execution, code generation (Codegen), report generation, and debugging.
*   **Under the Hood**: Ships directly inside the `@playwright/test` package.
*   **Execution Model**: One-shot execution. When you run `npx playwright test`, a test runner process starts, runs the suite, and exits.

### B. The AI Agent CLI (`@playwright/cli`)
*   **Purpose**: Interactive browser control designed specifically for AI coding agents.
*   **Under the Hood**: Installed as a separate package (`@playwright/cli`).
*   **Execution Model**: Client-daemon architecture communicating over Unix sockets. It starts a persistent browser daemon session that remains active across multiple separate command executions, saving launch times and preserving page states.
*   **Token Efficiency**: Traditional browser integration feeds entire DOM trees into AI contexts (often ~115,000 tokens for 30 actions). `@playwright/cli` outputs compressed accessibility snapshots and writes larger payloads to local disk, decreasing context sizes to ~25,000 tokens (a **4.6x token reduction**).

---

## 3. Installation Guide

Setting up your environment for both CLIs requires **Node.js 18+** and **npm 9+**.

### Setting Up Standard Playwright CLI
To initialize a new Playwright project, navigate to your workspace and run:
```bash
npm init playwright@latest
```
This command prompts you to configure TypeScript/JavaScript, a tests folder, and automatically generates:
1.  `playwright.config.ts` (Global configuration)
2.  `tests/example.spec.ts` (Sample test suite)
3.  `.github/workflows/playwright.yml` (GitHub Actions runner pipeline)

Next, download the required browser binaries (Chromium, Firefox, and WebKit) along with their operating system level dependencies:
```bash
# Install all configured browsers
npx playwright install

# Install browsers along with OS-level library dependencies (Crucial for Linux/CI)
npx playwright install --with-deps

# Target a specific browser engine only
npx playwright install chromium
```

### Setting Up AI Agent CLI
To install the new agent CLI globally on your machine:
```bash
npm install -g @playwright/cli@latest
```
After installation, download the browser binaries and register the skill sets required for AI agent integration:
```bash
# Install browsers for agent CLI
playwright-cli install

# Install skills (automatically configures integrations for Claude Code)
playwright-cli install --skills
```

---

## 4. MCP vs. Standard CLI vs. @playwright/cli

AI assistants can interact with browser environments in three main ways: the Model Context Protocol (MCP) server, standard Playwright CLI, or the new `@playwright/cli`.

| Aspect | Playwright MCP Server | Standard Playwright CLI | @playwright/cli (New) |
| :--- | :--- | :--- | :--- |
| **Architecture** | JSON-RPC over stdio/SSE; runs inside the AI agent process. | Standard CLI, executing one-shot commands. | Client-daemon over Unix sockets with persistent daemon sessions. |
| **Token Usage** | High (~115k tokens per 30 actions due to full-DOM snapshots). | N/A (not designed for direct AI assistant execution). | Low (~25k tokens per 30 actions; saves snapshots to local disk). |
| **Setup Method** | Added directly to the agent's MCP settings configuration file. | Run `npm init playwright@latest` in the local workspace directory. | Run `npm i -g @playwright/cli` and `playwright-cli install --skills`. |
| **Browser Lifetime** | Controlled by the MCP server lifecycle per tool call. | Launches and terminates completely per terminal execution. | Managed by a persistent background daemon surviving between commands. |
| **Multi-browser Support** | One browser engine active per session. | Supported in parallel via project configurations or sharding options. | Supported in parallel through named, isolated browser sessions. |
| **IDE / Agent Support** | Integrated directly into Claude Code, Cursor, Windsurf, etc. | Utilized inside VS Code or any standard terminal shell. | Integrated into Claude Code, Cursor, and Windsurf via registered skills. |
| **Codegen Recording** | No built-in recording interfaces. | Supported out-of-the-box via the graphical Playwright Inspector. | Supported; prints actions in YAML format and auto-generates test files. |
| **Network Mocking** | Not natively supported. | Supported inline inside test files via `page.route()`. | Supported via the command-line `route` utility. |

---

## 5. Decision Matrix: Which Tool to Use?

Use this checklist to choose the right Playwright tool for your workflow:

```
                  Which Playwright Tool is Best?
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
Are you a Human Developer?                     Are you an AI Agent?
        │                                               │
  [Standard CLI]                               ┌────────┴────────┐
                                               ▼                 ▼
                                        Need Token Savings?   Need Raw DOM?
                                               │                 │
                                        [@playwright/cli]   [MCP Server]
```

### Choose the Standard CLI (`npx playwright`) when:
*   You are manually writing, editing, or running test suites.
*   You are setting up automated regression pipelines in CI/CD environments.
*   You want to run codegen to record browser sessions and output JavaScript/Python scripts.
*   You are generating HTML execution reports or reviewing browser trace files.

### Choose an MCP Server when:
*   Your AI assistant needs direct, live access to an active browser window.
*   You are doing open-ended interactive web scraping.
*   The size of the context window is not a constraint.

### Choose the `@playwright/cli` when:
*   You are automating multi-step login flows via an AI coding agent.
*   You want to optimize token usage to reduce API costs and improve response times.
*   You need to persist page states and authentication cookies across multiple steps.
*   You need to mock API network requests or mock routes from the command line.

---

## 🏋️ Hands-on Lab Assignments

### Exercise 1: Project Initialization
1.  Create an empty directory in your workspace called `cli-sandbox`.
2.  Run the initialization CLI command to spin up a new Playwright project. Choose JavaScript and default directories.
3.  Verify that a `playwright.config.js` file and a sample tests folder have been created.
4.  Run the browser installation command targeting **webkit** only.

### Exercise 2: Global Configuration Check
1.  Run the version CLI command to verify your installed Playwright build version.
2.  Open your project's `playwright.config.ts` and inspect the default timeout values.

---

## 📝 Interactive Quiz

```quiz
{
  "question": "What is the primary architectural difference between the standard Playwright CLI and the new @playwright/cli?",
  "options": [
    "Standard CLI uses WebSockets while @playwright/cli uses REST endpoints",
    "Standard CLI runs in one-shot executions, while @playwright/cli uses a client-daemon model with persistent sessions",
    "Standard CLI only supports Chromium, while @playwright/cli supports all engines",
    "There is no difference; they are different names for the same package"
  ],
  "answer": 1,
  "explanation": "The standard CLI launches a browser process and exits when the command completes. The `@playwright/cli` starts a persistent background daemon, allowing subsequent commands to control the same open browser instance."
}
```

```quiz
{
  "question": "How does the new @playwright/cli package achieve a 4.6x token reduction compared to traditional MCP setups?",
  "options": [
    "By completely disabling CSS stylesheets",
    "By sending text-only outputs and writing large payloads (like DOM snapshots) to disk rather than streaming them into the context",
    "By translating all DOM inputs to binary formats",
    "By restricting browser automation to small screen viewports"
  ],
  "answer": 1,
  "explanation": "The `@playwright/cli` writes detailed HTML snapshots to local disk, returning compact accessibility maps to the AI agent context, which greatly lowers token usage."
}
```

```quiz
{
  "question": "Which command would you execute to download all browser engines along with required OS libraries for a Linux CI pipeline?",
  "options": [
    "npx playwright install-all",
    "npx playwright install --with-deps",
    "playwright-cli download --deps",
    "npm run playwright:install-deps"
  ],
  "answer": 1,
  "explanation": "The `--with-deps` flag instructs Playwright to install the browser engines (Chromium, Firefox, WebKit) and automatically fetch the system-level dependencies required to run them headlessly in Linux/CI environments."
}
```
