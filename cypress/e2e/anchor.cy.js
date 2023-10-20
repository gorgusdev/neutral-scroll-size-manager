describe('Anchor', function() {
    describe('Top Left', function() {
        it('Should start with no top left CSS class', function() {
            cy.viewport(1000, 360);
            cy.visit('tests/test-anchor.html');
            cy.scrollTo(500, 180);
            cy.wait(50);
            cy.get('#anchor-pane').then((elem) => {
                expect(elem).to.have.class('top-left');
            });
        });
        it('Should swap to bottom left CSS class when scrolled up', function() {
            cy.viewport(1000, 360);
            cy.visit('tests/test-anchor.html');
            cy.scrollTo(500, 180);
            cy.wait(50);
            cy.get('#anchor-pane').then((elem) => {
                expect(elem).to.have.class('top-left');
            });
            cy.scrollTo(500, 0);
            cy.wait(50);
            cy.get('#anchor-pane').then((elem) => {
                expect(elem).to.have.class('bottom-left');
            });
        });
        it('Should swap to top right CSS class when scrolled left', function() {
            cy.viewport(1000, 360);
            cy.visit('tests/test-anchor.html');
            cy.scrollTo(500, 180);
            cy.wait(50);
            cy.get('#anchor-pane').then((elem) => {
                expect(elem).to.have.class('top-left');
            });
            cy.scrollTo(0, 180);
            cy.wait(50);
            cy.get('#anchor-pane').then((elem) => {
                expect(elem).to.have.class('top-right');
            });
        });
        it('Should swap to bottom right CSS class when scrolled up and left', function() {
            cy.viewport(1000, 360);
            cy.visit('tests/test-anchor.html');
            cy.scrollTo(500, 180);
            cy.wait(50);
            cy.get('#anchor-pane').then((elem) => {
                expect(elem).to.have.class('top-left');
            });
            cy.scrollTo(0, 0);
            cy.wait(50);
            cy.get('#anchor-pane').then((elem) => {
                expect(elem).to.have.class('bottom-right');
            });
        });
    });
});
