describe('homepage', () => {
  it('shows list of users', () => {
    cy.mockServerRequest('GET', 'https://jsonplaceholder.typicode.com/users');
    cy.visit('/');
    // cy.mockServerRequest('GET', 'xxxxxx');
    // cy.visit('/');
    cy.get('li').first().should('have.text', 'John Smith');
  });

  // it('shows list of users', () => {
  //   // const mockServerRequest = cy.mockServerRequest();
  //   cy.mockServerRequest('GET', 'https://jsonplaceholder.typicode.com/users');
  //   // mockServerRequest.
  //   cy.visit('/');
  //   cy.mockServerRequest('GET', 'xxxxxx');
  //   cy.visit('/');
  //   // cy.get('li').first().should('have.text', 'Leanne Graham');
  // });
});
