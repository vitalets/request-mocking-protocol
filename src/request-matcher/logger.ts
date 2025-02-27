/**
 * Class to log the request matching process, useful for debug.
 */

/* eslint-disable no-console */

export class RequestMatcherLogger {
  private entries: string[] = [];

  matchMethod(result: boolean, expectedMethod: string, actualMethod: string) {
    console.log(result, expectedMethod, actualMethod);
  }

  matchURL(result: boolean, urlPattern: string, actualUrl: string) {
    console.log(result, urlPattern, actualUrl);
  }
}
