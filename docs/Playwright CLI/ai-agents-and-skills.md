---
title: AI Agent CLI & Skills Integration
sidebar_position: 3
---

# AI Agent CLI & Skills Integration

As AI-driven code generation and agentic systems advance, the need for browser automation toolsets optimized for algorithms has grown. Standard command-line interfaces are designed for human operations and can lead to high token costs.

This guide explores the new **`@playwright/cli`** package, which provides a client-daemon architecture, persistent session states, and integration options designed to optimize context window token usage for AI coding agents (such as Claude Code).

---

## 1. The @playwright/cli Architecture

Unlike standard test runners, `@playwright/cli` uses a **client-daemon architecture** communicating over Unix sockets or named pipes.

![Playwright AI Agent CLI Architecture](/img/playwright_agent_architecture.png)

This design provides two main benefits:
1.  **Persistent Browser Sessions**: The browser daemon keeps the browser instance active across separate CLI commands. State, cookies, pages, and context are preserved without relaunch overhead.
2.  **Snapshotting to Disk**: DOM and layout structures are written to local storage. Only compact accessibility maps are returned to the AI assistant's context window, reducing token usage.

---

## 2. Interactive Browser Control Commands

The `@playwright/cli` package includes commands designed for step-by-step interactive browser automation:

### Session Lifecycle Management
*   **`playwright-cli open [url] -s=[session-name] --persistent`**: Starts a persistent browser daemon and navigates to the target URL.
*   **`playwright-cli close -s=[session-name]`**: Closes the active session.
*   **`playwright-cli list`**: Shows active background browser daemon processes.
*   **`playwright-cli kill-all`**: Terminates all running daemons.

### Interactive Actions
Instead of executing code files, you send targeted actions directly to an active session:
```bash
# Fill a form field (targeting element ref 'e15' identified from snapshot)
playwright-cli fill e15 "my_login_email@example.com" -s=vwo-login

# Click a button (targeting element ref 'e28')
playwright-cli click e28 -s=vwo-login

# Type keys or select values
playwright-cli select e30 "USA" -s=vwo-login
```

### Visual and State Operations
*   **`playwright-cli snapshot -s=[session-name]`**: Captures a structural snapshot of the current DOM and outputs a simplified accessibility tree.
*   **`playwright-cli screenshot -s=[session-name]`**: Takes a page screenshot and saves it locally.
*   **`playwright-cli state-save [output.json] -s=[session-name]`**: Saves the current session state (cookies, local storage).
*   **`playwright-cli state-load [input.json] -s=[session-name]`**: Restores saved states into the active browser session.

---

## 3. Integrating with AI Agents (Claude Code)

To make these capabilities accessible to an AI assistant, you configure them as a **Skill**.

### Step 1: Install the Package and Skills
Run the installation and skill generation commands:
```bash
# Install globally
npm install -g @playwright/cli@latest

# Configure browser paths
playwright-cli install

# Install the skill definition
playwright-cli install --skills
```

### Step 2: Verify the Skill Definition
The installer generates a skill definition file in your agent configuration directory:
```bash
cat .claude/skills/playwright-cli/SKILL.md
```
This markdown file describes the tool triggers (`playwright`, `browser test`, `e2e test`) and available parameters, allowing the AI agent to call the browser daemon as a tool.

---

## 4. AI-Driven Browser Automation Workflow

Here is an example of the execution steps when you instruct Claude Code: *"Log in to app.vwo.com and verify that the dashboard loads."*

```
   Human Prompt: "Login to app.vwo.com"
        │
        ▼ (AI Agent starts execution)
 1. Open Session  ──> playwright-cli open https://app.vwo.com -s=auth --persistent
        │
        ▼
 2. Get Snapshot  ──> playwright-cli snapshot -s=auth
        │
        ▼ (AI reads local snapshot file)
 3. Fill Username ──> playwright-cli fill e15 "user@example.com" -s=auth
        │
        ▼
 4. Fill Password ──> playwright-cli fill e22 "password" -s=auth
        │
        ▼
 5. Click Sign-In ──> playwright-cli click e28 -s=auth
        │
        ▼
 6. Take Screenshot ──> playwright-cli screenshot -s=auth (Verify Dashboard loads)
```

---

## 5. Token Optimization

Traditional Model Context Protocol (MCP) integrations require sending the entire raw DOM structure to the LLM. For complex pages, this can exceed context windows and increase API costs.

### Token Usage: MCP vs. @playwright/cli

```
30-Action Login Flow:
┌────────────────────────────────────────────────────────────────────────┐
│ MCP Server (~115,000 tokens)                                           │
└────────────────────────────────────────────────────────────────────────┘
┌────────────────────────┐
│ @playwright/cli (~25,000 tokens)
└────────────────────────┘
```

By caching full DOM trees locally and communicating with the agent via simplified accessibility nodes (e.g. `[e15] input "Email"`), `@playwright/cli` achieves a **4.6x token reduction**. This helps reduce latency, prevent rate-limiting errors (like OpenAI's 429 TPM limits), and lower API costs.

---

## 🏋️ Hands-on Lab Assignments

### Exercise 1: Session Management Challenge
1.  Start a persistent session named `sandbox` and navigate to `https://the-internet.herokuapp.com/login`.
2.  Take a structural snapshot and locate the input fields and login button reference markers (e.g., `e1`, `e2`).
3.  Fill in the credentials using the reference elements.
4.  Capture a page screenshot and save it to your workspace.
5.  Close the session.

### Exercise 2: State Save & Restore
1.  Open a persistent session named `user-state` at `https://the-internet.herokuapp.com/`.
2.  Add a test cookie manually or navigate to trigger state changes.
3.  Save the session state using the `state-save` command to `state.json`.
4.  Close the session, open a new session named `restored-state`, and load the saved state file.
5.  Verify the states and cookies are restored.

---

## 📝 Interactive Quiz

```quiz
{
  "question": "How does @playwright/cli maintain browser state across multiple terminal commands?",
  "options": [
    "By saving the browser's memory dump to disk after every action",
    "By running a persistent background browser daemon process that communicates with the client over a Unix socket or named pipe",
    "By restarting the browser with state flags on every command",
    "By running the automation inside a Docker container"
  ],
  "answer": 1,
  "explanation": "The `@playwright/cli` package starts a persistent daemon. Subsequent commands communicate with this running daemon over local sockets, avoiding the need to reopen the browser and lose session state."
}
```

```quiz
{
  "question": "What is the function of the playwright-cli snapshot command?",
  "options": [
    "To capture a PNG image of the browser viewport",
    "To output a simplified accessibility node map of the active DOM tree, writing large payloads to local disk to save context tokens",
    "To save the browser configuration settings to a config file",
    "To take a performance profile trace of the page load time"
  ],
  "answer": 1,
  "explanation": "The `snapshot` command generates a simplified layout tree mapping elements to reference markers (like e1, e2). This allows AI agents to interact with elements using short references, reducing token usage."
}
```

```quiz
{
  "question": "Which command would you run to list all active background browser daemon sessions?",
  "options": [
    "playwright-cli ps",
    "playwright-cli status",
    "playwright-cli list",
    "playwright-cli show-sessions"
  ],
  "answer": 2,
  "explanation": "The `playwright-cli list` command displays the names and process IDs of all background browser daemon sessions currently active on the host machine."
}
```
