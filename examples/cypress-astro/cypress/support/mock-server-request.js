/**
 * Custom command for mocking server-side requests.
 *
 * @example cy.mockServerRequest('GET', 'https://example.com/api/users', {
 *   body: { id: 1, name: 'John Smith' },
 * });
 */
import { MockServerRequest } from 'mock-server-request';

Cypress.Commands.add('mockServerRequest', (method, url) => {
  if (!cy.state('aliases')?.mockServerRequest) {
    const mockServerRequest = new MockServerRequest();
    cy.wrap(mockServerRequest, { log: false }).as('mockServerRequest');
    cy.intercept('*', (req) => {
      Object.assign(req.headers, mockServerRequest.headers);
      req.continue();
    });
  }
  cy.get('@mockServerRequest', { log: false }).invoke('addMock', url, {
    body: JSON.stringify([{ id: 1, name: 'John Smith' }]),
  });
});
