# Playwright Tutorial Web App - End User Manual

Welcome to the **Playwright Tutorial Web Application**! This user manual is designed to guide you through the layout, features, and interactive components of this training platform. 

This platform serves as an interactive learning hub to help you master web automation and end-to-end (E2E) testing using Playwright.

---

## 🚀 Getting Started

### 1. Installation
To run this web application locally, ensure you have **Node.js (>=20.0)** installed. Clone the repository, navigate to the root directory, and install dependencies:

```bash
npm install
```

### 2. Running the App
Start the Vite development server locally:

```bash
npm run dev
```

The application will run by default on `http://localhost:5173` (or the next available port). Open this address in your browser to start using the app.

---

## 🛠️ Key Interface Features

The application features a modern, responsive user interface designed to maximize reading and learning efficiency.

### 1. Dynamic & Resizable Sidebar
* **Adjustable Width:** You can resize the sidebar to suit your display size. Simply click and drag the right border of the sidebar to resize it anywhere between **200px and 600px**.
* **Collapsible View:** Click the **Chevron/Menu toggle** in the header to fully collapse or expand the sidebar to maximize code reading space.
* **Responsive Layout:** On mobile devices, the sidebar transitions into a slide-over navigation drawer.

### 2. Progress Tracking & Completion Metrics
* **Real-time Progress Indicator:** At the top of the sidebar, a visual progress bar shows your overall completion percentage across all tutorial documents.
* **Completion Status Checkmarks:** 
  * As you read through the tutorial chapters, the system automatically marks them as completed.
  * A green checkmark (`CheckCircle`) appears next to completed pages.
  * Categories with all internal documents completed will also display a checkmark.
  * Your progress is persistently saved in your browser's `localStorage` so it remains intact across page refreshes.

### 3. Theme & Personalization
* **Dark & Light Mode Toggle:** Toggle between dark mode and light mode using the Sun/Moon icon in the top header.
* **Auto-Detection:** The theme automatically respects your system's `prefers-color-scheme` settings if no manual preference is saved.
* **Persistence:** Your theme choice is stored in `localStorage` for future visits.

---

## 🔍 Semantic Search & AI Assistant

The header houses an advanced search capability that supports two primary search modes. You can open the search interface at any time by pressing:
* **`Cmd + K`** (macOS) or **`Ctrl + K`** (Windows/Linux)

```
       +---------------------------------------------+
       |  Search docs or ask AI...          [Cmd+K]  |
       +---------------------------------------------+
                         |
        +----------------+----------------+
        |                                 |
        v                                 v
[ Instant Results ]             [ Ask AI Assistant ]
Client-side keyword match        Powered by OpenAI GPT-4o
Direct section deep-links        Direct answers with context
```

### Mode A: Instant Results (Local Search)
* **How it works:** Performs a fast, local keyword search across all `.md` tutorial documentation.
* **Interface:** Shows matching page titles, categories, and matches within specific headers (marked with a `#` icon).
* **Keyboard Navigation:** Use `ArrowUp` / `ArrowDown` to navigate results, `Enter` to navigate to the selected page, and `Esc` to exit.

### Mode B: Ask AI Assistant (Semantic Search)
* **How it works:** Queries OpenAI's **GPT-4o** using a custom integration. It filters, scores, and contextually injects the most relevant chapters into the AI prompt to answer your specific questions.
* **Interface:** Click the **"Ask AI Assistant"** tab or press `Enter` after typing. The assistant answers your question directly in the popup and provides a deep-link button (`Read full chapter`) to the source page.
* **Setup Required:** Make sure to set `VITE_OPENAI_API_KEY` in your `.env` file to enable the AI features.

---

## 🧪 Playwright Sandbox Labs

The platform is closely integrated with a dedicated practice ground:
🔗 **[Playwright Practice Sandbox](https://playwright-sandbox.vercel.app/)**

The sandbox offers **14 specific automation challenges** ranging from basic controls to complex E2E loops.

### Summary of Sandbox Challenges
1. **Basic UI Controls:** Verify state, radio groups, checkbox grids, and visibility toggles.
2. **Forms & Controls:** Masked inputs, character counters, password strength meters, and file dropzones.
3. **Multi-Type Dropdowns:** Searchable comboboxes, dependent selects, and tag selection widgets.
4. **Tables & Grids:** Sorting columns, parsing cell validation, and navigating paginated data.
5. **Async Challenges:** Testing dynamic spinner overlays, delayed fetch requests, and race conditions.
6. **DOM & Locating:** Handling nested iFrames, piercing Shadow DOM boundaries, and accepting alert dialogs.
7. **Advanced Actions:** Drag-and-drop, sliders, hover menus, double clicks, and key sequence events.
8. **Calendars & Pickers:** Interacting with custom popups, range calendars, and standard date pickers.
9. **Multi-Tab & Windows:** Handling popups, tabs, and `target="_blank"` redirects.
10. **Geolocation & Permissions:** Mocking browser permissions and device coordinates.
11. **Storage & Auth:** Caching state, managing tokens, SessionStorage, and handling session time-outs.
12. **API Sandbox:** Testing hybrid UI-and-API workflows, bearer tokens, and headers.
13. **Form Wizard:** Executing multi-step wizard processes, validating intermediate screens, and finishing checkout.
14. **E2E POM & Loops Lab:** Structuring Page Object Models, using dynamic `for`/`while` loops, and writing custom fixtures.

---

## 📝 Editing & Expanding the Curriculum

You can easily extend the tutorial content:
1. **Add Markdown Files:** Write standard Markdown files inside the `docs/` directory under their respective subfolders.
2. **Register in Sidebars:** Open [src/sidebars.ts](file:///Users/girishmulgund/my-playwright-tutorial/src/sidebars.ts) and add your document's ID (the relative path from `docs/` without `.md`) to the corresponding category.
3. **Hot-reloading:** Vite will automatically refresh the app in real-time, loading your new content with syntax highlighting and progressive tracking enabled.
