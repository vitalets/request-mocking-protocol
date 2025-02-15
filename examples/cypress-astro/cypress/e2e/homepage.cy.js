/// <reference types="cypress" />

describe('homepage', () => {
  it('shows list of users', () => {
    cy.visit('/');
    cy.get('li').first().should('have.text', 'Leanne1 Graham');
  });
});
