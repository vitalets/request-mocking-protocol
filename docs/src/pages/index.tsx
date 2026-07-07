/**
 * Homepage for the Request Mocking Protocol documentation site.
 * Renders a hero banner, a short feature grid and a call to action to the docs.
 */
import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

type Feature = {
  title: string;
  description: ReactNode;
};

const features: Feature[] = [
  {
    title: 'Declarative & Serializable',
    description: (
      <>
        Define mocks with plain JSON schemas. They can be serialized and sent over the network,
        enabling both client-side and server-side mocking.
      </>
    ),
  },
  {
    title: 'Per-test Isolation',
    description: (
      <>
        Each test defines its own mocks via a <code>MockClient</code>. Mocks are not shared across
        tests, enabling full parallelization.
      </>
    ),
  },
  {
    title: 'Works Everywhere',
    description: (
      <>
        Integrates with Playwright, Cypress, Next.js, Astro and any custom test runner or framework
        through simple interceptors.
      </>
    ),
  },
];

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs/getting-started/introduction">
            Get Started
          </Link>
          <Link className="button button--outline button--secondary button--lg" to="/docs/integrations/nextjs">
            Next.js Integration
          </Link>
        </div>
      </div>
    </header>
  );
}

function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {features.map((feature) => (
            <div key={feature.title} className={clsx('col col--4', styles.featureCard)}>
              <Heading as="h3">{feature.title}</Heading>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
