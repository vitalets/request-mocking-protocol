import { headers } from 'next/headers';

if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV !== 'production') {
  const { setupFetchInterceptor } = await import('request-mocking-protocol/fetch');
  setupFetchInterceptor(() => headers());
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
