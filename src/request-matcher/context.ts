import { MatchingLogger } from './logger';

export class MatchingContext {
  params: Record<string, string> = {};
  #searchParams?: URLSearchParams;

  constructor(
    public req: Request,
    public logger?: MatchingLogger,
  ) {}

  get searchParams() {
    if (!this.#searchParams) {
      this.#searchParams = new URL(this.req.url).searchParams;
    }
    return this.#searchParams;
  }

  appendParams(groups: Record<string, string | undefined> = {}) {
    Object.keys(groups).forEach((key) => {
      const isNamedGroup = !/^\d+$/.test(key);
      if (isNamedGroup) this.params[key] = groups[key]!;
    });
  }
}
