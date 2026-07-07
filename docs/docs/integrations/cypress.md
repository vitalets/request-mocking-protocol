---
id: cypress
title: Cypress
slug: /integrations/cypress
sidebar_position: 3
---

# Cypress

1. Add a custom command `mockServerRequest` in support files, see example [mock-server-request.js](https://github.com/vitalets/request-mocking-protocol/blob/main/examples/astro-cypress/cypress/support/mock-server-request.js).

2. Use the custom command to define mocks:
    ```js
    it('shows list of users', () => {
      // set up server-side mock
      cy.mockServerRequest('https://jsonplaceholder.typicode.com/users', {
        body: [{ id: 1, name: 'John Smith' }],
      });

      // navigate to the page
      cy.visit('/');

      // assert page content according to mock
      cy.get('li').first().should('have.text', 'John Smith');
    });
    ```
