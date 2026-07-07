import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

/**
 * Sidebars for the Request Mocking Protocol documentation.
 * `docsSidebar` groups the Docs section (Getting Started, Server-Side Mocking,
 * Client-Side Mocking, Writing Mocks, Concepts and Reference).
 * `apiSidebar` groups the API section (MockClient, Server-Side Interceptors
 * and Client-Side Interceptors).
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
        'getting-started/usage',
      ],
    },
    {
      type: 'category',
      label: 'Writing Mocks',
      collapsed: true,
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
      label: 'Server-Side Mocking',
      collapsed: true,
      items: [
        'server-side-mocking/overview',
        {
          type: 'category',
          label: 'Frameworks',
          collapsed: true,
          items: [
            'server-side-mocking/frameworks/nextjs',
            'server-side-mocking/frameworks/astro',
            'server-side-mocking/frameworks/custom',
          ],
        },
        {
          type: 'category',
          label: 'Test Runners',
          collapsed: true,
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
      collapsed: true,
      items: [
        'client-side-mocking/overview',
        'client-side-mocking/playwright',
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      collapsed: true,
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
        {
          type: 'category',
          label: 'Interceptors',
          collapsed: false,
          items: [
            'api/interceptors/fetch',
            'api/interceptors/msw',
            'api/interceptors/playwright',
          ],
        },
      ],
    },
  ],
};

export default sidebars;
