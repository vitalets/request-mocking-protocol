/**
 * Custom command for mocking server-side requests.
 *
 * @example cy.mockServerRequest('https://jsonplaceholder.typicode.com/users', {
 *   body: [{ id: 1, name: 'John Smith' }],
 * });
 */
import { MockClient } from 'request-mocking-protocol';

Cypress.Commands.add('mockServerRequest', (reqSchema, resSchema) => {
  // run once
  if (!cy.state('aliases')?.mockRemoteRequest) {
    const mockClient = new MockClient();
    cy.wrap(mockClient, { log: false }).as('mockServerRequest');
    cy.intercept('*', (req) => {
      Object.assign(req.headers, mockClient.headers);
      req.continue();
    });
  }
  cy.get('@mockServerRequest', { log: false }).invoke('addMock', reqSchema, resSchema);
});
