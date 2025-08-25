describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.clearAuth();
  });

  describe('Login Flow', () => {
    beforeEach(() => {
      cy.mockAuthAPI();
    });

    it('should display login form by default', () => {
      cy.visit('/auth');
      
      cy.get('[data-cy=login-form]').should('be.visible');
      cy.get('h2').should('contain.text', 'Welcome Back');
      cy.get('[data-cy=email-input]').should('be.visible');
      cy.get('[data-cy=password-input]').should('be.visible');
      cy.get('[data-cy=login-submit]').should('contain.text', 'Sign In');
    });

    it('should show validation errors for empty fields', () => {
      cy.visit('/auth');
      
      cy.get('[data-cy=login-submit]').click();
      
      cy.get('[data-cy=email-error]').should('contain.text', 'Email is required');
      cy.get('[data-cy=password-error]').should('contain.text', 'Password is required');
    });

    it('should show validation error for invalid email', () => {
      cy.visit('/auth');
      
      cy.get('[data-cy=email-input]').type('invalid-email');
      cy.get('[data-cy=login-submit]').click();
      
      cy.get('[data-cy=email-error]').should('contain.text', 'Please enter a valid email');
    });

    it('should show validation error for short password', () => {
      cy.visit('/auth');
      
      cy.get('[data-cy=email-input]').type('test@example.com');
      cy.get('[data-cy=password-input]').type('123');
      cy.get('[data-cy=login-submit]').click();
      
      cy.get('[data-cy=password-error]').should('contain.text', 'Password must be at least 8 characters');
    });

    it('should toggle password visibility', () => {
      cy.visit('/auth');
      
      cy.get('[data-cy=password-input]').should('have.attr', 'type', 'password');
      cy.get('[data-cy=password-toggle]').click();
      cy.get('[data-cy=password-input]').should('have.attr', 'type', 'text');
      cy.get('[data-cy=password-toggle]').click();
      cy.get('[data-cy=password-input]').should('have.attr', 'type', 'password');
    });

    it('should login successfully with valid credentials', () => {
      cy.visit('/auth');
      
      cy.get('[data-cy=email-input]').type('test@example.com');
      cy.get('[data-cy=password-input]').type('TestPassword123!');
      cy.get('[data-cy=login-submit]').click();
      
      // Check that API was called
      cy.wait('@loginRequest');
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard');
      
      // Should be authenticated
      cy.shouldBeLoggedIn();
    });

    it('should show loading state during login', () => {
      cy.visit('/auth');
      
      // Delay the API response
      cy.intercept('POST', '**/v1/auth/login', { delay: 1000 }).as('slowLogin');
      
      cy.get('[data-cy=email-input]').type('test@example.com');
      cy.get('[data-cy=password-input]').type('TestPassword123!');
      cy.get('[data-cy=login-submit]').click();
      
      // Button should be disabled and show loading
      cy.get('[data-cy=login-submit]').should('be.disabled');
    });

    it('should handle login errors gracefully', () => {
      cy.visit('/auth');
      
      // Mock failed login
      cy.intercept('POST', '**/v1/auth/login', {
        statusCode: 401,
        body: {
          success: false,
          message: 'Invalid credentials'
        }
      }).as('failedLogin');
      
      cy.get('[data-cy=email-input]').type('test@example.com');
      cy.get('[data-cy=password-input]').type('wrongpassword');
      cy.get('[data-cy=login-submit]').click();
      
      cy.wait('@failedLogin');
      
      // Should show error message
      cy.get('[data-cy=auth-error]').should('contain.text', 'Invalid credentials');
      
      // Should remain on auth page
      cy.url().should('include', '/auth');
      
      // Should not be authenticated
      cy.shouldBeLoggedOut();
    });
  });

  describe('Registration Flow', () => {
    beforeEach(() => {
      cy.mockAuthAPI();
    });

    it('should switch to registration form', () => {
      cy.visit('/auth');
      
      cy.get('[data-cy=switch-to-signup]').click();
      
      cy.get('[data-cy=signup-form]').should('be.visible');
      cy.get('h2').should('contain.text', 'Create Account');
      cy.get('[data-cy=name-input]').should('be.visible');
      cy.get('[data-cy=email-input]').should('be.visible');
      cy.get('[data-cy=password-input]').should('be.visible');
      cy.get('[data-cy=confirm-password-input]').should('be.visible');
    });

    it('should show validation errors for empty fields', () => {
      cy.visit('/auth');
      cy.get('[data-cy=switch-to-signup]').click();
      
      cy.get('[data-cy=signup-submit]').click();
      
      cy.get('[data-cy=name-error]').should('contain.text', 'Name is required');
      cy.get('[data-cy=email-error]').should('contain.text', 'Email is required');
      cy.get('[data-cy=password-error]').should('contain.text', 'Password is required');
      cy.get('[data-cy=user-type-error]').should('contain.text', 'Please select a profile type');
    });

    it('should show error when passwords do not match', () => {
      cy.visit('/auth');
      cy.get('[data-cy=switch-to-signup]').click();
      
      cy.get('[data-cy=name-input]').type('Test User');
      cy.get('[data-cy=email-input]').type('test@example.com');
      cy.get('[data-cy=password-input]').type('TestPassword123!');
      cy.get('[data-cy=confirm-password-input]').type('DifferentPassword123!');
      cy.get('[data-cy=signup-submit]').click();
      
      cy.get('[data-cy=confirm-password-error]').should('contain.text', 'Passwords do not match');
    });

    it('should display user type selection', () => {
      cy.visit('/auth');
      cy.get('[data-cy=switch-to-signup]').click();
      
      cy.get('[data-cy=user-type-business]').should('contain.text', 'Business Traveler');
      cy.get('[data-cy=user-type-leisure]').should('contain.text', 'Leisure Explorer');
      cy.get('[data-cy=user-type-bleisure]').should('contain.text', 'Bleisure Enthusiast');
    });

    it('should select user type and highlight selection', () => {
      cy.visit('/auth');
      cy.get('[data-cy=switch-to-signup]').click();
      
      cy.get('[data-cy=user-type-leisure]').click();
      cy.get('[data-cy=user-type-leisure]').should('have.class', 'border-orange-500');
      
      // Switch to different type
      cy.get('[data-cy=user-type-business]').click();
      cy.get('[data-cy=user-type-business]').should('have.class', 'border-orange-500');
      cy.get('[data-cy=user-type-leisure]').should('not.have.class', 'border-orange-500');
    });

    it('should register successfully with valid data', () => {
      cy.visit('/auth');
      cy.get('[data-cy=switch-to-signup]').click();
      
      cy.get('[data-cy=name-input]').type('Test User');
      cy.get('[data-cy=email-input]').type('test@example.com');
      cy.get('[data-cy=password-input]').type('TestPassword123!');
      cy.get('[data-cy=confirm-password-input]').type('TestPassword123!');
      cy.get('[data-cy=user-type-leisure]').click();
      cy.get('[data-cy=signup-submit]').click();
      
      // Check that API was called
      cy.wait('@registerRequest');
      
      // Should redirect to profile setup
      cy.url().should('include', '/profile/setup');
      
      // Should be authenticated
      cy.shouldBeLoggedIn();
    });

    it('should handle registration errors gracefully', () => {
      cy.visit('/auth');
      cy.get('[data-cy=switch-to-signup]').click();
      
      // Mock failed registration
      cy.intercept('POST', '**/v1/auth/register', {
        statusCode: 400,
        body: {
          success: false,
          message: 'Email already exists'
        }
      }).as('failedRegister');
      
      cy.get('[data-cy=name-input]').type('Test User');
      cy.get('[data-cy=email-input]').type('existing@example.com');
      cy.get('[data-cy=password-input]').type('TestPassword123!');
      cy.get('[data-cy=confirm-password-input]').type('TestPassword123!');
      cy.get('[data-cy=user-type-leisure]').click();
      cy.get('[data-cy=signup-submit]').click();
      
      cy.wait('@failedRegister');
      
      // Should show error message
      cy.get('[data-cy=auth-error]').should('contain.text', 'Email already exists');
      
      // Should remain on auth page
      cy.url().should('include', '/auth');
    });

    it('should switch back to login form', () => {
      cy.visit('/auth');
      cy.get('[data-cy=switch-to-signup]').click();
      cy.get('[data-cy=signup-form]').should('be.visible');
      
      cy.get('[data-cy=switch-to-login]').click();
      
      cy.get('[data-cy=login-form]').should('be.visible');
      cy.get('[data-cy=signup-form]').should('not.exist');
    });
  });

  describe('Authentication State', () => {
    it('should persist authentication across page refreshes', () => {
      // Login first
      cy.mockAuthAPI();
      cy.loginViaUI('test@example.com', 'TestPassword123!');
      
      // Refresh the page
      cy.reload();
      
      // Should still be authenticated
      cy.shouldBeLoggedIn();
      
      // Should not redirect to auth page
      cy.url().should('not.include', '/auth');
    });

    it('should redirect to auth page when accessing protected routes while logged out', () => {
      cy.visit('/dashboard');
      
      // Should redirect to auth page
      cy.url().should('include', '/auth');
    });

    it('should allow access to protected routes when logged in', () => {
      cy.mockAuthAPI();
      
      // Login via API (faster)
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/v1/auth/login`,
        body: {
          email: 'test@example.com',
          password: 'TestPassword123!'
        }
      }).then((response) => {
        // Store auth data
        const authData = {
          state: {
            user: response.body.data.user,
            token: response.body.data.token,
            isAuthenticated: true
          },
          version: 0
        };
        
        window.localStorage.setItem('auth-storage', JSON.stringify(authData));
        
        // Visit protected route
        cy.visit('/dashboard');
        
        // Should not redirect
        cy.url().should('include', '/dashboard');
      });
    });

    it('should logout and clear authentication state', () => {
      cy.mockAuthAPI();
      cy.loginViaUI('test@example.com', 'TestPassword123!');
      
      // Should be logged in
      cy.shouldBeLoggedIn();
      
      // Logout (assuming there's a logout button in the dashboard)
      cy.get('[data-cy=logout-button]').click();
      
      // Should be logged out
      cy.shouldBeLoggedOut();
      
      // Should redirect to auth page
      cy.url().should('include', '/auth');
    });
  });

  describe('Form Interactions', () => {
    it('should handle keyboard navigation', () => {
      cy.visit('/auth');
      
      cy.get('[data-cy=email-input]').type('test@example.com');
      cy.get('[data-cy=email-input]').type('{tab}');
      cy.focused().should('have.attr', 'data-cy', 'password-input');
      cy.focused().type('TestPassword123!');
      cy.focused().type('{enter}');
      
      // Should attempt to submit (will show validation or make API call)
    });

    it('should clear form data when switching between login and signup', () => {
      cy.visit('/auth');
      
      // Fill login form
      cy.get('[data-cy=email-input]').type('test@example.com');
      cy.get('[data-cy=password-input]').type('password123');
      
      // Switch to signup
      cy.get('[data-cy=switch-to-signup]').click();
      
      // Form should be clear
      cy.get('[data-cy=name-input]').should('have.value', '');
      cy.get('[data-cy=email-input]').should('have.value', '');
      cy.get('[data-cy=password-input]').should('have.value', '');
    });

    it('should handle form submission with Enter key', () => {
      cy.mockAuthAPI();
      cy.visit('/auth');
      
      cy.get('[data-cy=email-input]').type('test@example.com');
      cy.get('[data-cy=password-input]').type('TestPassword123!{enter}');
      
      cy.wait('@loginRequest');
      cy.url().should('include', '/dashboard');
    });
  });

  describe('Responsive Design', () => {
    const viewports = [
      { width: 375, height: 667, device: 'iPhone SE' },
      { width: 768, height: 1024, device: 'iPad' },
      { width: 1920, height: 1080, device: 'Desktop' }
    ];

    viewports.forEach(({ width, height, device }) => {
      it(`should display correctly on ${device}`, () => {
        cy.viewport(width, height);
        cy.visit('/auth');
        
        // Form should be visible and usable
        cy.get('[data-cy=login-form]').should('be.visible');
        cy.get('[data-cy=email-input]').should('be.visible');
        cy.get('[data-cy=password-input]').should('be.visible');
        cy.get('[data-cy=login-submit]').should('be.visible');
        
        // Test form functionality
        cy.get('[data-cy=email-input]').type('test@example.com');
        cy.get('[data-cy=password-input]').type('TestPassword123!');
        
        // Button should be clickable
        cy.get('[data-cy=login-submit]').should('not.be.disabled');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      cy.visit('/auth');
      
      // Mock network failure
      cy.intercept('POST', '**/v1/auth/login', { forceNetworkError: true }).as('networkError');
      
      cy.get('[data-cy=email-input]').type('test@example.com');
      cy.get('[data-cy=password-input]').type('TestPassword123!');
      cy.get('[data-cy=login-submit]').click();
      
      // Should show appropriate error message
      cy.get('[data-cy=auth-error]').should('be.visible');
    });

    it('should handle server errors gracefully', () => {
      cy.visit('/auth');
      
      // Mock server error
      cy.intercept('POST', '**/v1/auth/login', {
        statusCode: 500,
        body: {
          success: false,
          message: 'Internal server error'
        }
      }).as('serverError');
      
      cy.get('[data-cy=email-input]').type('test@example.com');
      cy.get('[data-cy=password-input]').type('TestPassword123!');
      cy.get('[data-cy=login-submit]').click();
      
      cy.wait('@serverError');
      
      // Should show error message
      cy.get('[data-cy=auth-error]').should('contain.text', 'Internal server error');
    });
  });
});