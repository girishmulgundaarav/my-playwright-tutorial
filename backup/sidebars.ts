import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

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
      type: 'doc',
      id: 'advanced-tools',
      label: 'Advanced Tools & Assertions',
      className: 'sidebar-item-advanced-tools',
    },
    {
      type: 'category',
      label: 'Locators',
      className: 'sidebar-category-locators',
      collapsed: false,
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
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'Playwright Actions/handle-actions',
          label: 'Handle Actions',
          className: 'sidebar-item-handle-actions',
        },
        {
          type: 'doc',
          id: 'Playwright Actions/handle-dropdown-1',
          label: 'Handle Dropdowns - Part 1',
          className: 'sidebar-item-handle-dropdown-1',
        },
      ],
    },
  ],
};

export default sidebars;
