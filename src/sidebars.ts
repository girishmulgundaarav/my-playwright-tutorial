export type SidebarItem = {
  type: 'doc' | 'category';
  id?: string;
  label: string;
  className?: string;
  collapsed?: boolean;
  items?: SidebarItem[];
};

export type SidebarsConfig = {
  tutorialSidebar: SidebarItem[];
};

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Introduction',
      className: 'sidebar-category-introduction',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'Introduction/getting-started',
          label: 'Getting Started',
          className: 'sidebar-item-getting-started',
        },
        {
          type: 'doc',
          id: 'Introduction/playwright-kickstart',
          label: 'Playwright Kickstart',
          className: 'sidebar-item-kickstart',
        },
      ],
    },

    {
      type: 'category',
      label: 'Locators',
      className: 'sidebar-category-locators',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'Locators/playwright-locators',
          label: 'Playwright Locators',
          className: 'sidebar-item-locators',
        },
        {
          type: 'doc',
          id: 'Locators/css-selectors',
          label: 'CSS Selectors',
          className: 'sidebar-item-css-selectors',
        },
        {
          type: 'doc',
          id: 'Locators/xpath-locators',
          label: 'XPath Locators',
          className: 'sidebar-item-xpath-locators',
        },
      ],
    },
    {
      type: 'category',
      label: 'Playwright Actions',
      className: 'sidebar-category-actions',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'Playwright Actions/actions',
          label: 'Actions',
          className: 'sidebar-item-actions',
        },
        {
          type: 'doc',
          id: 'Playwright Actions/dropdown-1',
          label: 'Dropdowns - Part 1',
          className: 'sidebar-item-dropdown-1',
        },
        {
          type: 'doc',
          id: 'Playwright Actions/dropdown-2',
          label: 'Dropdowns - Part 2',
          className: 'sidebar-item-dropdown-2',
        },
        {
          type: 'doc',
          id: 'Playwright Actions/web-tables',
          label: 'Web Tables',
          className: 'sidebar-item-web-tables',
        },
        {
          type: 'doc',
          id: 'Playwright Actions/dynamic-tables',
          label: 'Dynamic & Paginated Tables',
          className: 'sidebar-item-dynamic-tables',
        },
        {
          type: 'doc',
          id: 'Playwright Actions/date-pickers',
          label: 'Date Pickers',
          className: 'sidebar-item-date-pickers',
        },
        {
          type: 'doc',
          id: 'Playwright Actions/dialogs-frames',
          label: 'Dialogs & Iframes',
          className: 'sidebar-item-dialogs-frames',
        },
        {
          type: 'doc',
          id: 'Playwright Actions/browser-contexts',
          label: 'Browser Contexts, Tabs & Popups',
          className: 'sidebar-item-browser-contexts',
        },
        {
          type: 'doc',
          id: 'Playwright Actions/mouse-scrolling',
          label: 'Mouse Actions & Scrolling',
          className: 'sidebar-item-mouse-scrolling',
        },
        {
          type: 'doc',
          id: 'Playwright Actions/keyboard-upload-download',
          label: 'Keyboard, Uploads & Downloads',
          className: 'sidebar-item-keyboard-upload-download',
        },
        {
          type: 'doc',
          id: 'Playwright Actions/shadow-dom-cookies',
          label: 'Shadow DOM & Cookies',
          className: 'sidebar-item-shadow-dom-cookies',
        },
      ],
    },
    {
      type: 'category',
      label: 'Playwright Advanced',
      className: 'sidebar-category-advanced',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'Playwright Advanced/assertions-timeouts-codegen',
          label: 'Assertions, Timeouts & Codegen',
          className: 'sidebar-item-assertions-timeouts-codegen',
        },
        {
          type: 'doc',
          id: 'Playwright Advanced/screenshots-videos-tracing',
          label: 'Screenshots, Videos & Tracing',
          className: 'sidebar-item-screenshots-videos-tracing',
        },
        {
          type: 'doc',
          id: 'Playwright Advanced/grouping-hooks-tags-annotations',
          label: 'Grouping, Hooks, Tags & Annotations',
          className: 'sidebar-item-grouping-hooks-tags-annotations',
        },
        {
          type: 'doc',
          id: 'Playwright Advanced/parallel-testing',
          label: 'Parallelism & Parallel Testing',
          className: 'sidebar-item-parallel-testing',
        },
        {
          type: 'doc',
          id: 'Playwright Advanced/parameterization-data-driven-testing',
          label: 'Parameterization & Data-Driven Testing',
          className: 'sidebar-item-parameterization-data-driven-testing',
        },
        {
          type: 'doc',
          id: 'Playwright Advanced/reporters-custom-reporting',
          label: 'Reporters & Custom Reporting',
          className: 'sidebar-item-reporters-custom-reporting',
        },
        {
          type: 'doc',
          id: 'Playwright Advanced/visual-accessibility-testing',
          label: 'Visual & Accessibility Testing',
          className: 'sidebar-item-visual-accessibility-testing',
        },
        {
          type: 'doc',
          id: 'Playwright Advanced/page-object-model',
          label: 'Page Object Model (POM)',
          className: 'sidebar-item-page-object-model',
        },
        {
          type: 'doc',
          id: 'Playwright Advanced/testing-payfast',
          label: 'Fintech Payment Testing',
          className: 'sidebar-item-testing-payfast',
        },
      ],
    },
    {
      type: 'category',
      label: 'Playwright CLI',
      className: 'sidebar-category-cli',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'Playwright CLI/intro-and-two-clis',
          label: 'Introduction & The Two CLIs',
          className: 'sidebar-item-intro-two-clis',
        },
        {
          type: 'doc',
          id: 'Playwright CLI/codegen-and-locator-strategies',
          label: 'Codegen & Locator Strategies',
          className: 'sidebar-item-codegen-locators',
        },
        {
          type: 'doc',
          id: 'Playwright CLI/ai-agents-and-skills',
          label: 'AI Agent CLI & Skills Integration',
          className: 'sidebar-item-ai-agents-skills',
        },
      ],
    },
    {
      type: 'category',
      label: 'Labs',
      className: 'sidebar-category-labs',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'Labs/overview',
          label: 'Labs Overview',
          className: 'sidebar-item-labs-overview',
        },
        {
          type: 'doc',
          id: 'Labs/playwright-basic-controls-labs',
          label: 'Basic UI Controls Lab',
          className: 'sidebar-item-labs-basic-controls',
        },
        {
          type: 'doc',
          id: 'Labs/playwright-forms-controls-labs',
          label: 'Forms & Controls Lab',
          className: 'sidebar-item-labs-forms-controls',
        },
        {
          type: 'doc',
          id: 'Labs/playwright-dropdowns-labs',
          label: 'Dropdowns Lab',
          className: 'sidebar-item-labs-dropdowns',
        },
        {
          type: 'doc',
          id: 'Labs/playwright-tables-labs',
          label: 'Tables & Data Grids Lab',
          className: 'sidebar-item-labs-tables',
        },
        {
          type: 'doc',
          id: 'Labs/playwright-async-labs',
          label: 'Async Challenges Lab',
          className: 'sidebar-item-labs-async',
        },
      ],
    },
  ],
};

export default sidebars;
