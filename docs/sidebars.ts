import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

/**
 * Sidebar for the Request Mocking Protocol documentation.
 * Grouped into Getting Started, Guides, Integrations, Concepts and Reference.
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
        'getting-started/quick-start',
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
      label: 'Integrations',
      collapsed: false,
      items: [
        'integrations/nextjs',
        'integrations/playwright',
        'integrations/cypress',
        'integrations/astro',
        'integrations/custom-test-runner',
        'integrations/custom-framework',
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      collapsed: false,
      items: ['concepts/overview'],
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
