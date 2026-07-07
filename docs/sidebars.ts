import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

/**
 * Sidebars for the Request Mocking Protocol documentation.
 * `docsSidebar` groups the Docs section (Getting Started, Server-Side Mocking,
 * Client-Side Mocking, Writing Mocks, Concepts and Reference).
 * `apiSidebar` groups the API section (MockClient and Interceptors).
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
      link: { type: 'doc', id: 'server-side-mocking/overview' },
      items: [
        'server-side-mocking/overview',
        {
          type: 'category',
          label: 'Frameworks',
          collapsed: false,
          items: [
            'server-side-mocking/frameworks/nextjs',
            'server-side-mocking/frameworks/astro',
            'server-side-mocking/frameworks/custom',
          ],
        },
        {
          type: 'category',
          label: 'Test Runners',
          collapsed: false,
          items: [
            'server-side-mocking/test-runners/playwright',
            'server-side-mocking/test-runners/cypress',
            'server-side-mocking/test-runners/custom',
          ],
        },
        'server-side-mocking/limitations',
      ],
    },
    {
      type: 'category',
      label: 'Client-Side Mocking',
      collapsed: false,
      link: { type: 'doc', id: 'client-side-mocking/overview' },
      items: [
        'client-side-mocking/overview',
        'client-side-mocking/playwright',
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
    'comparison-with-msw',
  ],
  apiSidebar: [
    {
      type: 'category',
      label: 'API',
      collapsed: false,
      items: [
        'api/mock-client',
        'api/interceptors',
      ],
    },
  ],
};

export default sidebars;
