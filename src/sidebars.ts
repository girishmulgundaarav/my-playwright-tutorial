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
      ],
    },
  ],
};

export default sidebars;
