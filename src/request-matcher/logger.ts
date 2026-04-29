/**
 * Request matcher debug logger that accumulates all mock attempts for a single request.
 */

export class MatchingLogger {
  private static readonly maxUrlLength = 120;

  private lines: string[] = [];

  constructor(
    private req: Request,
    private enabled: boolean,
  ) {}

  private formatExpected(entity: string, value: unknown) {
    return `   Expected ${entity}: ${value}`;
  }

  private formatActual(entity: string, value: unknown) {
    return `     Actual ${entity}: ${value}`;
  }

  private formatMethodAndUrl(method: string, url: string, methodWidth: number) {
    return `${method.padStart(methodWidth)} ${this.truncateUrl(url)}`;
  }

  private truncateUrl(url: string) {
    if (url.length <= MatchingLogger.maxUrlLength) return url;
    return `${url.slice(0, MatchingLogger.maxUrlLength - 3)}...`;
  }

  init(totalMocks: number) {
    if (!this.enabled) return;
    // extra space is intentional here, to align with the mock done log.
    this.lines.push(`⬇️  Matching request (mocks: ${totalMocks})`);
  }

  addMock(method: string | undefined, url: string) {
    if (!this.enabled) return;
    const actualMethod = this.req.method;
    const expectedMethod = method || '*';
    const methodWidth = Math.max(actualMethod.length, expectedMethod.length);

    this.lines.push(
      this.formatActual('URL', this.formatMethodAndUrl(actualMethod, this.req.url, methodWidth)),
    );
    this.lines.push(
      this.formatExpected('URL', this.formatMethodAndUrl(expectedMethod, url, methodWidth)),
    );
  }

  log(entity: string, expected: unknown, actual: unknown) {
    if (!this.enabled) return;
    if (entity === 'method' || entity === 'URL') return;

    this.lines.push(this.formatActual(entity, actual));
    this.lines.push(this.formatExpected(entity, expected));
  }

  done(matched: boolean) {
    if (!this.enabled) return;
    this.lines.push(matched ? '✅ Mock matched.' : '❌ Mock not matched.');
  }

  finalize() {
    if (!this.enabled) return;
    // eslint-disable-next-line no-console
    console.log(this.lines.join('\n'));
  }
}
