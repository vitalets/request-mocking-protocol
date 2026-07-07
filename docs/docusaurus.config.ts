import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import npm2yarn from '@docusaurus/remark-plugin-npm2yarn';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Request Mocking Protocol',
  tagline: 'Declarative HTTP request mocking for end-to-end tests',
  favicon: 'img/favicon.ico',

  headTags: [
    {
      tagName: 'link',
      attributes: { rel: 'icon', type: 'image/svg+xml', href: '/request-mocking-protocol/img/favicon.svg' },
    },
    {
      tagName: 'link',
      attributes: { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/request-mocking-protocol/img/favicon-32x32.png' },
    },
    {
      tagName: 'link',
      attributes: { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/request-mocking-protocol/img/favicon-16x16.png' },
    },
    {
      tagName: 'link',
      attributes: { rel: 'apple-touch-icon', sizes: '180x180', href: '/request-mocking-protocol/img/apple-touch-icon.png' },
    },
    {
      tagName: 'link',
      attributes: { rel: 'manifest', href: '/request-mocking-protocol/img/site.webmanifest' },
    },
    {
      tagName: 'meta',
      attributes: { name: 'theme-color', content: '#0d9488' },
    },
  ],

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://vitalets.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/request-mocking-protocol/',

  // GitHub pages deployment config.
  organizationName: 'vitalets', // GitHub org/user name.
  projectName: 'request-mocking-protocol', // Repo name.

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang.
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          editUrl: 'https://github.com/vitalets/request-mocking-protocol/tree/main/docs/',
          remarkPlugins: [[npm2yarn, { sync: true, converters: ['yarn', 'pnpm'] }]],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/rmp-schema.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Request Mocking Protocol',
      logo: {
        alt: 'Request Mocking Protocol logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'API',
        },
        {
          href: 'https://www.npmjs.com/package/request-mocking-protocol',
          label: 'npm',
          position: 'right',
        },
        {
          href: 'https://github.com/vitalets/request-mocking-protocol',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: '/docs/getting-started/introduction',
            },
            {
              label: 'Next.js Integration',
              to: '/docs/server-side-mocking/frameworks/nextjs',
            },
            {
              label: 'API Reference',
              to: '/docs/api/mock-client',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'npm',
              href: 'https://www.npmjs.com/package/request-mocking-protocol',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/vitalets/request-mocking-protocol',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Request Mocking Protocol. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'diff'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
