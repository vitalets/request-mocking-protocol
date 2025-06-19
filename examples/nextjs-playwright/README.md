# NextJS + Playwright

Example of using `request-mocking-protocol` in [Next.js](https://nextjs.org/) app with [Playwright](https://playwright.dev/) tests.

## How to run

1. Navigate to `examples/nextjs-playwright` directory:
   ```
   cd examples/nextjs-playwright
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Install Playwright browsers:
   ```
   PLAYWRIGHT_SKIP_BROWSER_GC=1 npx playwright install chromium
   ```   

4. Run dev server:
   ```
   npm run dev
   ```

5. Run tests in the second terminal window:
   ```
   npm test
   ```

6. To check live reload, change some file in `src/app` directory

7. Run tests again to ensure that interceptors are applied