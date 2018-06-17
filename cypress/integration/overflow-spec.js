describe('Overflow', function() {
    it('Should start with no overflow', function() {
        cy.visit('tests/test-overflow.html');
        cy.wait(50);
        cy.get('#overflow-container1').then((elem) => {
            expect(elem).to.not.have.class('overflowing');
        });
        cy.get('#overflow-container2').then((elem) => {
            expect(elem).to.not.have.class('overflowing');
        });
    });
    it('Should overflow when window is made smaller', function() {
        cy.visit('tests/test-overflow.html');
        cy.wait(50);
        cy.get('#overflow-container1').then((elem) => {
            expect(elem).to.not.have.class('overflowing');
        });
        cy.get('#overflow-container2').then((elem) => {
            expect(elem).to.not.have.class('overflowing');
        });
        cy.viewport(800, 660);
        cy.wait(50);
        cy.get('#overflow-container1').then((elem) => {
            expect(elem).to.have.class('overflowing');
        });
        cy.get('#overflow-container2').then((elem) => {
            expect(elem).to.have.class('overflowing');
        });        
    });
    it('Should toggle overflow when elements resize and checkResizeFromStateChange is called', function() {
        cy.visit('tests/test-overflow.html');
        cy.wait(50);
        cy.get('#overflow-container1').then((elem) => {
            expect(elem).to.not.have.class('overflowing');
        });
        cy.get('#overflow-container2').then((elem) => {
            expect(elem).to.not.have.class('overflowing');
        });
        cy.get('#toggle-button').click();
        cy.wait(50);
        cy.get('#overflow-container1').then((elem) => {
            expect(elem).to.have.class('overflowing');
        });
        cy.get('#overflow-container2').then((elem) => {
            expect(elem).to.have.class('overflowing');
        });        
        cy.get('#toggle-button').click();
        cy.wait(50);
        cy.get('#overflow-container1').then((elem) => {
            expect(elem).to.not.have.class('overflowing');
        });
        cy.get('#overflow-container2').then((elem) => {
            expect(elem).to.not.have.class('overflowing');
        });        
    });
});