export class MatchingContext {
  logs: string[] = [];
  params: Record<string, string> = {};
  #searchParams?: URLSearchParams;

  constructor(public req: Request) {
    this.logs.push(`Matching request: ${req.method} ${req.url}`);
  }

  get searchParams() {
    if (!this.#searchParams) {
      this.#searchParams = new URL(this.req.url).searchParams;
    }
    return this.#searchParams;
  }

  log(result: boolean, entity: string, expected: unknown, actual: unknown) {
    const icon = result ? '✅' : '❌';
    this.logs.push(`${icon} Expected ${entity}: ${expected}`);
    this.logs.push(`${' '.repeat(4)} Actual ${entity}: ${actual}`);
  }

  logDone(matched: boolean) {
    this.logs.push(`Request ${matched ? 'matched' : 'not matched'}.`);
  }

  appendParams(groups: Record<string, string | undefined> = {}) {
    Object.keys(groups).forEach((key) => {
      const isNamedGroup = !/^\d+$/.test(key);
      if (isNamedGroup) this.params[key] = groups[key]!;
    });
  }
}
