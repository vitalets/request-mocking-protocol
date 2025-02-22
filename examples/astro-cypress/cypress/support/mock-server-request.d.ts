declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Custom command to mock server-side requests.
       * @example cy.mockServerRequest('GET', 'https://example.com/api/users')
       */
      mockServerRequest(method: string, url: string): Chainable<any>;
    }

    interface cy {
      // See: https://stackoverflow.com/questions/74381450/is-there-a-way-to-check-if-alias-exists-in-a-cypress-test
      state(name: string): Record<string, any>;
    }
  }
}
