import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

/**
 * Sidebar for the Request Mocking Protocol documentation.
 * Grouped into Getting Started, Guides, Framework Integration, Test Runner Integration, Concepts and Reference.
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
      label: 'Guides',
      collapsed: false,
      items: [
        'guides/request-matching',
        'guides/response-mocking',
        'guides/response-patching',
        'guides/route-parameters',
        'guides/client-side-mocks',
        'guides/debugging',
      ],
    },
    {
      type: 'category',
      label: 'Framework Integration',
      collapsed: false,
      items: [
        'integrations/frameworks/nextjs',
        'integrations/frameworks/astro',
        'integrations/frameworks/custom',
      ],
    },
    {
      type: 'category',
      label: 'Test Runner Integration',
      collapsed: false,
      items: [
        'integrations/test-runner/playwright',
        'integrations/test-runner/cypress',
        'integrations/test-runner/custom',
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
