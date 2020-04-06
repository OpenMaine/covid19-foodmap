/// <reference types="cypress" />
describe('Food map', () => {
  it('Should show selected food categories', () => {
    cy.visit('http://localhost:3000')
    cy.get('#category-select').select('Food Pantry')
    cy.get('.leaflet-marker-icon').then(x => {
      cy.wrap(x).invoke('attr', 'src').should('contain', 'grocery.png')
    })
  })
})