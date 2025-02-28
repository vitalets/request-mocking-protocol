/**
 * Custom command for mocking server-side requests.
 *
 * @example cy.mockRemoteRequest('https://jsonplaceholder.typicode.com/users', {
 *   body: [{ id: 1, name: 'John Smith' }],
 * });
 */
import { MockRemoteRequest } from 'request-mocking-protocol';

Cypress.Commands.add('mockRemoteRequest', (reqSchema, resSchema) => {
  // run once
  if (!cy.state('aliases')?.mockRemoteRequest) {
    const mockRemoteRequest = new MockRemoteRequest();
    cy.wrap(mockRemoteRequest, { log: false }).as('mockRemoteRequest');
    cy.intercept('*', (req) => {
      Object.assign(req.headers, mockRemoteRequest.headers);
      req.continue();
    });
  }
  cy.get('@mockRemoteRequest', { log: false }).invoke('addMock', reqSchema, resSchema);
});
