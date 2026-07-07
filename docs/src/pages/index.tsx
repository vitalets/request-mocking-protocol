/**
 * Root page for the Request Mocking Protocol documentation site.
 * Redirects the root URL to the introduction page.
 */
import type { ReactNode } from 'react';
import { Redirect } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function Home(): ReactNode {
  return <Redirect to={useBaseUrl('/docs/getting-started/introduction')} />;
}
