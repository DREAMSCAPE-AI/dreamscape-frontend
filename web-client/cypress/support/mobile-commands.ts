/**
 * Cypress Custom Commands for Mobile Testing
 * Provides mobile-specific test utilities and viewport helpers
 */

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Set viewport to a predefined mobile device
       * @example cy.setMobileViewport('iphone-12')
       */
      setMobileViewport(device: MobileDevice): Chainable<void>;

      /**
       * Check if element has minimum touch target size (44x44px)
       * @example cy.get('button').shouldHaveTouchTarget()
       */
      shouldHaveTouchTarget(): Chainable<void>;

      /**
       * Simulate swipe gesture
       * @example cy.get('.drawer').swipe('left')
       */
      swipe(direction: 'left' | 'right' | 'up' | 'down', distance?: number): Chainable<void>;

      /**
       * Open mobile navigation drawer
       * @example cy.openMobileDrawer()
       */
      openMobileDrawer(): Chainable<void>;

      /**
       * Close mobile navigation drawer
       * @example cy.closeMobileDrawer()
       */
      closeMobileDrawer(): Chainable<void>;

      /**
       * Check if mobile drawer is visible
       * @example cy.mobileDrawerShouldBeVisible()
       */
      mobileDrawerShouldBeVisible(): Chainable<void>;

      /**
       * Check if mobile drawer is hidden
       * @example cy.mobileDrawerShouldBeHidden()
       */
      mobileDrawerShouldBeHidden(): Chainable<void>;

      /**
       * Simulate long press (touch and hold)
       * @example cy.get('button').longPress(1000)
       */
      longPress(duration?: number): Chainable<void>;
    }
  }
}

export type MobileDevice =
  | 'iphone-se'
  | 'iphone-12'
  | 'iphone-14-pro-max'
  | 'galaxy-s21'
  | 'galaxy-s21-ultra'
  | 'ipad-mini'
  | 'ipad-pro'
  | 'foldable';

const VIEWPORTS: Record<MobileDevice, { width: number; height: number }> = {
  'iphone-se': { width: 375, height: 667 },
  'iphone-12': { width: 390, height: 844 },
  'iphone-14-pro-max': { width: 430, height: 932 },
  'galaxy-s21': { width: 360, height: 800 },
  'galaxy-s21-ultra': { width: 412, height: 915 },
  'ipad-mini': { width: 768, height: 1024 },
  'ipad-pro': { width: 1024, height: 1366 },
  'foldable': { width: 884, height: 1104 },
};

// Set mobile viewport
Cypress.Commands.add('setMobileViewport', (device: MobileDevice) => {
  const viewport = VIEWPORTS[device];
  if (!viewport) {
    throw new Error(`Unknown device: ${device}`);
  }
  cy.viewport(viewport.width, viewport.height);
  cy.log(`Viewport set to ${device} (${viewport.width}x${viewport.height})`);
});

// Check touch target size
Cypress.Commands.add('shouldHaveTouchTarget', { prevSubject: true }, (subject) => {
  const MIN_SIZE = 44;

  cy.wrap(subject).then(($el) => {
    const rect = $el[0].getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    expect(width, 'Touch target width').to.be.at.least(MIN_SIZE);
    expect(height, 'Touch target height').to.be.at.least(MIN_SIZE);
  });
});

// Simulate swipe gesture
Cypress.Commands.add('swipe', { prevSubject: true }, (subject, direction, distance = 100) => {
  const coordinates: Record<string, { startX: number; startY: number; endX: number; endY: number }> = {
    left: { startX: 80, startY: 50, endX: 80 - distance, endY: 50 },
    right: { startX: 20, startY: 50, endX: 20 + distance, endY: 50 },
    up: { startX: 50, startY: 80, endX: 50, endY: 80 - distance },
    down: { startX: 50, startY: 20, endX: 50, endY: 20 + distance },
  };

  const coords = coordinates[direction];

  cy.wrap(subject)
    .trigger('touchstart', { touches: [{ clientX: coords.startX, clientY: coords.startY }] })
    .trigger('touchmove', { touches: [{ clientX: coords.endX, clientY: coords.endY }] })
    .trigger('touchend');
});

// Open mobile drawer
Cypress.Commands.add('openMobileDrawer', () => {
  cy.get('[data-testid="mobile-menu-button"]')
    .should('be.visible')
    .click();
  cy.get('[data-testid="mobile-drawer"]').should('be.visible');
});

// Close mobile drawer
Cypress.Commands.add('closeMobileDrawer', () => {
  cy.get('[data-testid="mobile-drawer-close"]')
    .should('be.visible')
    .click();
  cy.get('[data-testid="mobile-drawer"]').should('not.be.visible');
});

// Check mobile drawer visibility
Cypress.Commands.add('mobileDrawerShouldBeVisible', () => {
  cy.get('[data-testid="mobile-drawer"]').should('be.visible');
});

Cypress.Commands.add('mobileDrawerShouldBeHidden', () => {
  cy.get('[data-testid="mobile-drawer"]').should('not.exist');
});

// Simulate long press
Cypress.Commands.add('longPress', { prevSubject: true }, (subject, duration = 1000) => {
  cy.wrap(subject)
    .trigger('touchstart')
    .wait(duration)
    .trigger('touchend');
});

// Export for TypeScript
export {};
