// cypress/support/commands.ts

/// <reference types="cypress" />

// Custom commands for authentication
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login via UI
       */
      loginViaUI(email: string, password: string): Chainable<void>;
      
      /**
       * Custom command to login via API
       */
      loginViaAPI(email: string, password: string): Chainable<void>;
      
      /**
       * Custom command to register via UI
       */
      registerViaUI(userData: {
        name: string;
        email: string;
        password: string;
        userType: 'business' | 'leisure' | 'bleisure';
      }): Chainable<void>;
      
      /**
       * Custom command to clear auth storage
       */
      clearAuth(): Chainable<void>;
      
      /**
       * Custom command to mock API responses
       */
      mockAuthAPI(): Chainable<void>;
      
      /**
       * Custom command to check if user is logged in
       */
      shouldBeLoggedIn(): Chainable<void>;
      
      /**
       * Custom command to check if user is logged out
       */
      shouldBeLoggedOut(): Chainable<void>;
    }
  }
}

// Login via UI
Cypress.Commands.add('loginViaUI', (email: string, password: string) => {
  cy.visit('/auth');
  
  // Make sure we're on the login form
  cy.get('[data-cy=login-form]').should('be.visible');
  
  // Fill in credentials
  cy.get('[data-cy=email-input]').type(email);
  cy.get('[data-cy=password-input]').type(password);
  
  // Submit form
  cy.get('[data-cy=login-submit]').click();
  
  // Wait for redirect or success
  cy.url().should('not.include', '/auth');
});

// Login via API
Cypress.Commands.add('loginViaAPI', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/v1/auth/login`,
    body: {
      email,
      password
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body.success).to.be.true;
    
    // Store token in localStorage
    const authData = {
      state: {
        user: response.body.data.user,
        token: response.body.data.token,
        isAuthenticated: true
      },
      version: 0
    };
    
    window.localStorage.setItem('auth-storage', JSON.stringify(authData));
  });
});

// Register via UI
Cypress.Commands.add('registerViaUI', (userData) => {
  cy.visit('/auth');
  
  // Switch to signup form
  cy.get('[data-cy=switch-to-signup]').click();
  cy.get('[data-cy=signup-form]').should('be.visible');
  
  // Fill in user data
  cy.get('[data-cy=name-input]').type(userData.name);
  cy.get('[data-cy=email-input]').type(userData.email);
  cy.get('[data-cy=password-input]').type(userData.password);
  cy.get('[data-cy=confirm-password-input]').type(userData.password);
  
  // Select user type
  cy.get(`[data-cy=user-type-${userData.userType}]`).click();
  
  // Submit form
  cy.get('[data-cy=signup-submit]').click();
  
  // Wait for redirect
  cy.url().should('not.include', '/auth');
});

// Clear authentication
Cypress.Commands.add('clearAuth', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('auth-storage');
    win.sessionStorage.clear();
  });
});

// Mock authentication API
Cypress.Commands.add('mockAuthAPI', () => {
  // Mock successful login
  cy.intercept('POST', '**/v1/auth/login', {
    statusCode: 200,
    body: {
      success: true,
      message: 'Login successful',
      data: {
        token: 'mock-jwt-token',
        user: {
          id: 'mock-user-id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          userCategory: 'LEISURE'
        }
      }
    }
  }).as('loginRequest');
  
  // Mock successful registration
  cy.intercept('POST', '**/v1/auth/register', {
    statusCode: 201,
    body: {
      success: true,
      message: 'Account created successfully',
      data: {
        token: 'mock-jwt-token',
        user: {
          id: 'mock-user-id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          userCategory: 'LEISURE'
        }
      }
    }
  }).as('registerRequest');
  
  // Mock token verification
  cy.intercept('POST', '**/v1/auth/verify-token', {
    statusCode: 200,
    body: {
      success: true,
      message: 'Token is valid',
      data: {
        user: {
          id: 'mock-user-id',
          email: 'test@example.com'
        }
      }
    }
  }).as('verifyTokenRequest');
});

// Check if user is logged in
Cypress.Commands.add('shouldBeLoggedIn', () => {
  cy.window().then((win) => {
    const authData = win.localStorage.getItem('auth-storage');
    expect(authData).to.not.be.null;
    
    if (authData) {
      const parsedAuth = JSON.parse(authData);
      expect(parsedAuth.state.isAuthenticated).to.be.true;
      expect(parsedAuth.state.token).to.not.be.null;
    }
  });
});

// Check if user is logged out
Cypress.Commands.add('shouldBeLoggedOut', () => {
  cy.window().then((win) => {
    const authData = win.localStorage.getItem('auth-storage');
    if (authData) {
      const parsedAuth = JSON.parse(authData);
      expect(parsedAuth.state.isAuthenticated).to.be.false;
    }
  });
});