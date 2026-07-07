import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

/**
 * Sidebar for the Request Mocking Protocol documentation.
 * Grouped into Getting Started, Server-Side Mocking, Client-Side Mocking, Writing Mocks, Concepts and Reference.
 */
const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/introduction',
        'getting-started/installation',
      ],
    },
    {
      type: 'category',
      label: 'Server-Side Mocking',
      collapsed: false,
      link: { type: 'doc', id: 'server-side/overview' },
      items: [
        'server-side/overview',
        {
          type: 'category',
          label: 'Frameworks',
          collapsed: false,
          items: [
            'server-side/frameworks/nextjs',
            'server-side/frameworks/astro',
            'server-side/frameworks/custom',
          ],
        },
        {
          type: 'category',
          label: 'Test Runners',
          collapsed: false,
          items: [
            'server-side/test-runners/playwright',
            'server-side/test-runners/cypress',
            'server-side/test-runners/custom',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Client-Side Mocking',
      collapsed: false,
      link: { type: 'doc', id: 'client-side/overview' },
      items: [
        'client-side/overview',
        'client-side/playwright',
      ],
    },
    {
      type: 'category',
      label: 'Writing Mocks',
      collapsed: false,
      items: [
        'writing-mocks/request-matching',
        'writing-mocks/response-mocking',
        'writing-mocks/response-patching',
        'writing-mocks/route-parameters',
        'writing-mocks/debugging',
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      collapsed: false,
      items: [
        'concepts/mock-schema',
        'concepts/request-schema',
        'concepts/response-schema',
        'concepts/transport',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: false,
      items: [
        'reference/mock-client',
        'reference/interceptors',
        'reference/limitations',
        'reference/comparison-with-msw',
      ],
    },
  ],
};

export default sidebars;
