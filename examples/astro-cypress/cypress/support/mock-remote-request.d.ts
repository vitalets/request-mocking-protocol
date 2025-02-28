import type { MockRequestSchemaInit, MockResponseSchemaInit } from 'request-mocking-protocol';

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      mockRemoteRequest(
        reqSchema: MockRequestSchemaInit,
        resSchema: MockResponseSchemaInit,
      ): Chainable<any>;
    }

    interface cy {
      // See: https://stackoverflow.com/questions/74381450/is-there-a-way-to-check-if-alias-exists-in-a-cypress-test
      state(name: string): Record<string, any>;
    }
  }
}
