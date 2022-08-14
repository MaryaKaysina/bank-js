///<reference types="cypress" />
describe('Банковская система хранения и операций над криптовалютными средствами.', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080');
    //Тестирование авторизации
    cy.get('input[name="login"]').type('developer');
    cy.get('input[name="password"]').type('skillbox');
    cy.get('button').click();
  });

  it('Список счетов', () => {
    // eslint-disable-next-line no-undef
    cy.get('div.card h3.number').should(
      'contain.text',
      '74213041477477406320783754'
    );
  });

  it('Перевод со счета на счет', () => {
    cy.get('div.card:first-child').children('button').click();
    cy.get('input[name="account"]').type('61253747452820828268825011');
    cy.get('input[name="sum"]').type('10');
    cy.get('button.send').click();
    cy.get('body').should('contain.text', 'Перевод успешно выполнен!');
  });

  it('Создание нового счета', () => {
    cy.get('button.create').click();
    cy.get('.cards').children('.card').should('have.length', 2);
  });

  it('Перевод с нового счета', () => {
    cy.get(`div.card:last-child .number`).then((el) => {
      const newAccount = el.text();
      cy.get('div.card:first-child').children('button').click();
      cy.get('input[name="account"]').type(newAccount);
      cy.get('input[name="sum"]').type('10');
      cy.get('button.send').click();
      cy.get('button.back').click();
      cy.get('div.card:last-child').children('button').click();
      cy.get('input[name="account"]').type('74213041477477406320783754');
      cy.get('input[name="sum"]').type('10');
      cy.get('button.send').click();
      cy.get('body').should('contain.text', 'Перевод успешно выполнен!');
    });
  });
});
