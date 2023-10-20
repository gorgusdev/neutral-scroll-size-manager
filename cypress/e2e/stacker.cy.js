describe('Scroll Stacker', function() {
    describe('Top Stacker', function() {
        it('Should start with no fixed blocks', function() {
            cy.visit('tests/test-top-stack.html');
            cy.get('#first-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
            cy.get('#second-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
            cy.get('#third-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
        });
        it('Should fix the first block when scrolling a small amount', function() {
            cy.visit('tests/test-top-stack.html');
            cy.scrollTo(0, 150, { duration: 100 });
            cy.get('#first-stack').then((elem) => {
                expect(elem).to.have.class('stacked');
            });
            cy.get('#second-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
            cy.get('#third-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
        });
        it('Should fix the first and second block when scrolling to within second block limit', function() {
            cy.visit('tests/test-top-stack.html');
            cy.scrollTo(0, 300, { duration: 100 });
            cy.get('#first-stack').then((elem) => {
                expect(elem).to.have.class('stacked');
            });
            cy.get('#second-stack').then((elem) => {
                expect(elem).to.have.class('stacked');
            });
            cy.get('#third-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
        });
        it('Should fix the first block and temporarily fix the second block while scrolling within second block limit', function() {
            cy.visit('tests/test-top-stack.html');
            cy.scrollTo(0, 300, { duration: 100 });
            cy.get('#first-stack').then((elem) => {
                expect(elem).to.have.class('stacked');
            });
            cy.get('#second-stack').then((elem) => {
                expect(elem).to.have.class('stacked');
            });
            cy.get('#third-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
            cy.scrollTo(0, 600, { duration: 100 });
            cy.get('#first-stack').then((elem) => {
                expect(elem).to.have.class('stacked');
            });
            cy.get('#second-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
            cy.get('#third-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });        
        });
        it('Should fix the first and third block while resizing from narrow to wide viewport', function() {
            cy.visit('tests/test-top-stack.html');
            cy.viewport(500, 660);
            cy.wait(100);
            cy.scrollTo(0, 1060, { duration: 100 });
            cy.get('#first-stack').then((elem) => {
                expect(elem).to.have.class('stacked');
            });
            cy.get('#second-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
            cy.get('#third-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
            cy.viewport(1000, 660);
            cy.wait(100);
            cy.get('#third-stack').then((elem) => {
                expect(elem).to.have.class('stacked');
            });
        });
        it('Should fix the first and third block and then toggle the third block as fixed when enabled / disabled', function() {
            cy.visit('tests/test-top-stack.html');
            cy.scrollTo(0, 1100, { duration: 100 });
            cy.get('#first-stack').then((elem) => {
                expect(elem).to.have.class('stacked');
            });
            cy.get('#second-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
            cy.get('#third-stack').then((elem) => {
                expect(elem).to.have.class('stacked');
            });
            cy.get('#ctrl-enable-disable').click();
            cy.get('#third-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
            cy.get('#ctrl-enable-disable').click();
            cy.get('#third-stack').then((elem) => {
                expect(elem).to.have.class('stacked');
            });
        });
        it('Should fix the first and third block and then toggle the third block as fixed when adding / removing', function() {
            cy.visit('tests/test-top-stack.html');
            cy.scrollTo(0, 1100, { duration: 100 });
            cy.get('#first-stack').then((elem) => {
                expect(elem).to.have.class('stacked');
            });
            cy.get('#second-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
            cy.get('#third-stack').then((elem) => {
                expect(elem).to.have.class('stacked');
            });
            cy.get('#ctrl-add-remove').click();
            cy.get('#third-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
            cy.get('#ctrl-add-remove').click();
            cy.get('#third-stack').then((elem) => {
                expect(elem).to.have.class('stacked');
            });
        });
    });
    describe('Bottom Stacker', function() {
        it('Should start with no fixed blocks', function() {
            cy.visit('tests/test-bottom-stack.html');
            cy.wait(50);
            cy.get('html').then((html) => {
                const height = html.height();
                cy.scrollTo(0, height - 660 + 1);
                cy.wait(50);
            })
            cy.get('#first-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
            cy.get('#second-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
            cy.get('#third-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
        });
        it('Should fix the first block when scrolling a small amount', function() {
            cy.visit('tests/test-bottom-stack.html');
            cy.wait(50);
            cy.get('html').then((html) => {
                const height = html.height();
                cy.scrollTo(0, height - 660 - 150);
                cy.wait(50);
                cy.get('#first-stack').then((elem) => {
                    expect(elem).to.have.class('stacked');
                });
                cy.get('#second-stack').then((elem) => {
                    expect(elem).to.not.have.class('stacked');
                });
                cy.get('#third-stack').then((elem) => {
                    expect(elem).to.not.have.class('stacked');
                });
            })
        });
        it('Should fix the first and second block when scrolling to within second block limit', function() {
            cy.visit('tests/test-bottom-stack.html');
            cy.wait(50);
            cy.get('html').then((html) => {
                const height = html.height();
                cy.scrollTo(0, height - 660 - 300);
                cy.wait(50);
                cy.get('#first-stack').then((elem) => {
                    expect(elem).to.have.class('stacked');
                });
                cy.get('#second-stack').then((elem) => {
                    expect(elem).to.have.class('stacked');
                });
                cy.get('#third-stack').then((elem) => {
                    expect(elem).to.not.have.class('stacked');
                });
            });
        });
        it('Should fix the first block and temporarily fix the second block while scrolling within second block limit', function() {
            cy.visit('tests/test-bottom-stack.html');
            cy.wait(50);
            cy.get('html').then((html) => {
                const height = html.height();
                cy.scrollTo(0, height - 660 - 300);
                cy.wait(50);
                cy.get('#first-stack').then((elem) => {
                    expect(elem).to.have.class('stacked');
                });
                cy.get('#second-stack').then((elem) => {
                    expect(elem).to.have.class('stacked');
                });
                cy.get('#third-stack').then((elem) => {
                    expect(elem).to.not.have.class('stacked');
                });
                cy.scrollTo(0, height - 660 - 600);
                cy.wait(50);
                cy.get('#first-stack').then((elem) => {
                    expect(elem).to.have.class('stacked');
                });
                cy.get('#second-stack').then((elem) => {
                    expect(elem).to.not.have.class('stacked');
                });
                cy.get('#third-stack').then((elem) => {
                    expect(elem).to.not.have.class('stacked');
                });
            });
        });
    });
    describe('Left Stacker', function() {
        it('Should start with no fixed blocks', function() {
            cy.visit('tests/test-left-stack.html');
            cy.wait(50);
            cy.get('#first-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
            cy.get('#second-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
            cy.get('#third-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
        });
        it('Should fix the first block when scrolling a small amount', function() {
            cy.visit('tests/test-left-stack.html');
            cy.scrollTo(250, 0, { duration: 100 });
            cy.get('#first-stack').then((elem) => {
                expect(elem).to.have.class('stacked');
            });
            cy.get('#second-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
            cy.get('#third-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
        });
        it('Should fix the first and second block when scrolling to within second block limit', function() {
            cy.visit('tests/test-left-stack.html');
            cy.scrollTo(500, 0, { duration: 100 });
            cy.get('#first-stack').then((elem) => {
                expect(elem).to.have.class('stacked');
            });
            cy.get('#second-stack').then((elem) => {
                expect(elem).to.have.class('stacked');
            });
            cy.get('#third-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
        });
        it('Should fix the first block and temporarily fix the second block while scrolling within second block limit', function() {
            cy.visit('tests/test-left-stack.html');
            cy.scrollTo(500, 0, { duration: 100 });
            cy.get('#first-stack').then((elem) => {
                expect(elem).to.have.class('stacked');
            });
            cy.get('#second-stack').then((elem) => {
                expect(elem).to.have.class('stacked');
            });
            cy.get('#third-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
            cy.scrollTo(1200, 0, { duration: 100 });
            cy.get('#first-stack').then((elem) => {
                expect(elem).to.have.class('stacked');
            });
            cy.get('#second-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
            cy.get('#third-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });        
        });
    });
    describe('Right Stacker', function() {
        it('Should start with no fixed blocks', function() {
            cy.visit('tests/test-right-stack.html');
            cy.wait(50);
            cy.get('html').then((html) => {
                const width = html[0].scrollWidth;
                cy.scrollTo(width - 1000 + 1, 0);
                cy.wait(50);
            })
            cy.get('#first-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
            cy.get('#second-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
            cy.get('#third-stack').then((elem) => {
                expect(elem).to.not.have.class('stacked');
            });
        });
        it('Should fix the first block when scrolling a small amount', function() {
            cy.visit('tests/test-right-stack.html');
            cy.wait(50);
            cy.get('html').then((html) => {
                const width = html[0].scrollWidth;
                cy.scrollTo(width - 1000 - 150, 0);
                cy.wait(50);
                cy.get('#first-stack').then((elem) => {
                    expect(elem).to.have.class('stacked');
                });
                cy.get('#second-stack').then((elem) => {
                    expect(elem).to.not.have.class('stacked');
                });
                cy.get('#third-stack').then((elem) => {
                    expect(elem).to.not.have.class('stacked');
                });
            })
        });
        it('Should fix the first and second block when scrolling to within second block limit', function() {
            cy.visit('tests/test-right-stack.html');
            cy.wait(50);
            cy.get('html').then((html) => {
                const width = html[0].scrollWidth;
                cy.scrollTo(width - 1000 - 350, 0);
                cy.wait(50);
                cy.get('#first-stack').then((elem) => {
                    expect(elem).to.have.class('stacked');
                });
                cy.get('#second-stack').then((elem) => {
                    expect(elem).to.have.class('stacked');
                });
                cy.get('#third-stack').then((elem) => {
                    expect(elem).to.not.have.class('stacked');
                });
            });
        });
        it('Should fix the first block and temporarily fix the second block while scrolling within second block limit', function() {
            cy.visit('tests/test-right-stack.html');
            cy.wait(50);
            cy.get('html').then((html) => {
                const width = html[0].scrollWidth;
                cy.scrollTo(width - 1000 - 350, 0);
                cy.wait(50);
                cy.get('#first-stack').then((elem) => {
                    expect(elem).to.have.class('stacked');
                });
                cy.get('#second-stack').then((elem) => {
                    expect(elem).to.have.class('stacked');
                });
                cy.get('#third-stack').then((elem) => {
                    expect(elem).to.not.have.class('stacked');
                });
                cy.scrollTo(width - 1000 - 1000, 0);
                cy.wait(50);
                cy.get('#first-stack').then((elem) => {
                    expect(elem).to.have.class('stacked');
                });
                cy.get('#second-stack').then((elem) => {
                    expect(elem).to.not.have.class('stacked');
                });
                cy.get('#third-stack').then((elem) => {
                    expect(elem).to.not.have.class('stacked');
                });
            });
        });
    });
});
