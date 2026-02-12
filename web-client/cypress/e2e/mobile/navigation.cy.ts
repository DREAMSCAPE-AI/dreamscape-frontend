/**
 * Mobile Navigation E2E Tests
 * Tests mobile drawer, accordion menus, and touch interactions
 */

/// <reference types="cypress" />
/// <reference types="../../support/mobile-commands" />

describe('Mobile Navigation', () => {
  beforeEach(() => {
    // Set mobile viewport (iPhone 12 Pro)
    cy.setMobileViewport('iphone-12');
    cy.visit('/');
  });

  describe('Mobile Menu Button', () => {
    it('should display mobile menu button on mobile viewport', () => {
      cy.get('[data-testid="mobile-menu-button"]')
        .should('be.visible')
        .shouldHaveTouchTarget();
    });

    it('should hide mobile menu button on desktop viewport', () => {
      cy.viewport(1280, 720);
      cy.get('[data-testid="mobile-menu-button"]').should('not.be.visible');
    });
  });

  describe('Mobile Drawer', () => {
    it('should open drawer when menu button is clicked', () => {
      cy.openMobileDrawer();
      cy.mobileDrawerShouldBeVisible();
    });

    it('should close drawer when close button is clicked', () => {
      cy.openMobileDrawer();
      cy.closeMobileDrawer();
      cy.mobileDrawerShouldBeHidden();
    });

    it('should close drawer when backdrop is clicked', () => {
      cy.openMobileDrawer();
      cy.get('body').click(10, 10); // Click outside drawer
      cy.mobileDrawerShouldBeHidden();
    });

    it('should close drawer when swiping left', () => {
      cy.openMobileDrawer();
      cy.get('[data-testid="mobile-drawer"]').swipe('left', 150);
      cy.wait(500); // Wait for animation
      cy.mobileDrawerShouldBeHidden();
    });

    it('should close drawer when escape key is pressed', () => {
      cy.openMobileDrawer();
      cy.get('body').type('{esc}');
      cy.mobileDrawerShouldBeHidden();
    });
  });

  describe('Navigation Links', () => {
    beforeEach(() => {
      cy.openMobileDrawer();
    });

    it('should display all main navigation links', () => {
      const mainLinks = ['Flights', 'Hotels', 'Activities', 'Itinerary'];
      mainLinks.forEach(link => {
        cy.contains(link).should('be.visible');
      });
    });

    it('should navigate to flights page when flights link is clicked', () => {
      cy.contains('Flights').click();
      cy.url().should('include', '/flights');
      cy.mobileDrawerShouldBeHidden();
    });

    it('should have proper touch target sizes for all links', () => {
      cy.contains('Flights').shouldHaveTouchTarget();
      cy.contains('Hotels').shouldHaveTouchTarget();
      cy.contains('Activities').shouldHaveTouchTarget();
    });
  });

  describe('Accordion Menus', () => {
    beforeEach(() => {
      cy.openMobileDrawer();
    });

    it('should expand Discover section when clicked', () => {
      cy.contains('Discover').click();
      cy.contains('Culture').should('be.visible');
      cy.contains('Adventure').should('be.visible');
      cy.contains('Relaxation').should('be.visible');
    });

    it('should collapse Discover section when clicked again', () => {
      cy.contains('Discover').click();
      cy.contains('Culture').should('be.visible');
      cy.contains('Discover').click();
      cy.contains('Culture').should('not.be.visible');
    });

    it('should expand Tools section with all items', () => {
      cy.contains('Tools').click();
      cy.contains('Budget Planner').should('be.visible');
      cy.contains('Packing List').should('be.visible');
      cy.contains('Weather Forecast').should('be.visible');
    });

    it('should collapse other sections when expanding a new one', () => {
      // Expand Discover
      cy.contains('Discover').click();
      cy.contains('Culture').should('be.visible');

      // Expand Tools (should collapse Discover)
      cy.contains('Tools').click();
      cy.contains('Budget Planner').should('be.visible');
      cy.contains('Culture').should('not.be.visible');
    });

    it('should navigate from submenu item and close drawer', () => {
      cy.contains('Discover').click();
      cy.contains('Culture').click();
      cy.url().should('include', '/destination/culture');
      cy.mobileDrawerShouldBeHidden();
    });
  });

  describe('User Authentication States', () => {
    it('should show login and register buttons when not logged in', () => {
      cy.openMobileDrawer();
      cy.contains('Login').should('be.visible');
      cy.contains('Register').should('be.visible');
    });

    // This test requires authentication setup
    it.skip('should show user profile when logged in', () => {
      // TODO: Implement login flow
      cy.login('test@example.com', 'password');
      cy.openMobileDrawer();
      cy.contains('My Account').should('be.visible');
      cy.contains('Logout').should('be.visible');
    });
  });

  describe('Cross-Device Compatibility', () => {
    const devices: Array<'iphone-se' | 'iphone-12' | 'galaxy-s21' | 'ipad-mini'> = [
      'iphone-se',
      'iphone-12',
      'galaxy-s21',
      'ipad-mini'
    ];

    devices.forEach(device => {
      it(`should work correctly on ${device}`, () => {
        cy.setMobileViewport(device);
        cy.visit('/');

        cy.openMobileDrawer();
        cy.mobileDrawerShouldBeVisible();

        cy.contains('Flights').should('be.visible');
        cy.closeMobileDrawer();
        cy.mobileDrawerShouldBeHidden();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on drawer', () => {
      cy.openMobileDrawer();
      cy.get('[data-testid="mobile-drawer"]')
        .should('have.attr', 'role', 'dialog')
        .should('have.attr', 'aria-modal', 'true');
    });

    it('should have accessible close button', () => {
      cy.openMobileDrawer();
      cy.get('[data-testid="mobile-drawer-close"]')
        .should('have.attr', 'aria-label');
    });

    it('should have proper aria-expanded state on accordion buttons', () => {
      cy.openMobileDrawer();
      cy.contains('Discover')
        .should('have.attr', 'aria-expanded', 'false');

      cy.contains('Discover').click();
      cy.contains('Discover')
        .should('have.attr', 'aria-expanded', 'true');
    });
  });

  describe('Performance', () => {
    it('should open drawer within 300ms', () => {
      const start = Date.now();
      cy.openMobileDrawer();
      cy.then(() => {
        const duration = Date.now() - start;
        expect(duration).to.be.lessThan(300);
      });
    });

    it('should not cause layout shift when opening drawer', () => {
      cy.get('body').then($body => {
        const initialHeight = $body.height();
        cy.openMobileDrawer();
        cy.get('body').should('have.css', 'overflow', 'hidden');
        cy.get('body').then($newBody => {
          const newHeight = $newBody.height();
          expect(Math.abs(newHeight! - initialHeight!)).to.be.lessThan(5);
        });
      });
    });
  });
});
