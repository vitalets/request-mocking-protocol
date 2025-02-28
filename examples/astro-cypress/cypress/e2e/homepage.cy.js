describe('homepage', () => {
  it('shows list of users', () => {
    cy.mockRemoteRequest('https://jsonplaceholder.typicode.com/users', {
      body: [{ id: 1, name: 'John Smith' }],
    });
    cy.visit('/');
    cy.get('li').first().should('have.text', 'John Smith');
  });
});
