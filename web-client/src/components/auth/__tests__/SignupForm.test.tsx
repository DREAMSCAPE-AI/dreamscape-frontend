import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupForm from '../SignupForm';

describe('SignupForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnSwitchToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderSignupForm = (props = {}) => {
    return render(
      <SignupForm
        onSubmit={mockOnSubmit}
        onSwitchToLogin={mockOnSwitchToLogin}
        isLoading={false}
        {...props}
      />
    );
  };

  describe('Rendering', () => {
    it('should render all form fields', () => {
      renderSignupForm();

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByText(/choose your profile type/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('should render user type options', () => {
      renderSignupForm();

      expect(screen.getByText('Business Traveler')).toBeInTheDocument();
      expect(screen.getByText('Leisure Explorer')).toBeInTheDocument();
      expect(screen.getByText('Bleisure Enthusiast')).toBeInTheDocument();
    });

    it('should show loading state when isLoading is true', () => {
      renderSignupForm({ isLoading: true });

      const submitButton = screen.getByRole('button', { name: /create account/i });
      expect(submitButton).toBeDisabled();
      expect(screen.getByRole('button')).toHaveClass('disabled:opacity-50');
    });

    it('should render switch to login link', () => {
      renderSignupForm();

      const switchLink = screen.getByRole('button', { name: /sign in/i });
      expect(switchLink).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when name is empty', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when email is empty', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      const nameInput = screen.getByLabelText(/full name/i);
      await user.type(nameInput, 'Test User');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when email format is invalid', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      
      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when password is empty', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      
      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(screen.getByText('Password is required')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when password is too short', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      
      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, '123');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      
      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'TestPassword123!');
      await user.type(confirmPasswordInput, 'DifferentPassword123!');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when no user type is selected', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      
      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'TestPassword123!');
      await user.type(confirmPasswordInput, 'TestPassword123!');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(screen.getByText('Please select a profile type')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('User Interactions', () => {
    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
      const toggleButton = screen.getAllByRole('button', { name: '' })[0]; // Eye icon buttons

      expect(passwordInput.type).toBe('password');

      await user.click(toggleButton);
      expect(passwordInput.type).toBe('text');

      await user.click(toggleButton);
      expect(passwordInput.type).toBe('password');
    });

    it('should select user type', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      const businessOption = screen.getByText('Business Traveler').closest('button');
      expect(businessOption).toBeInTheDocument();
      
      if (businessOption) {
        await user.click(businessOption);
        expect(businessOption).toHaveClass('bg-orange-50 border-2 border-orange-500');
      }
    });

    it('should switch between user types', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      const businessOption = screen.getByText('Business Traveler').closest('button');
      const leisureOption = screen.getByText('Leisure Explorer').closest('button');
      
      if (businessOption && leisureOption) {
        await user.click(businessOption);
        expect(businessOption).toHaveClass('bg-orange-50 border-2 border-orange-500');

        await user.click(leisureOption);
        expect(leisureOption).toHaveClass('bg-orange-50 border-2 border-orange-500');
        expect(businessOption).not.toHaveClass('bg-orange-50 border-2 border-orange-500');
      }
    });

    it('should call onSwitchToLogin when sign in link is clicked', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      const switchLink = screen.getByRole('button', { name: /sign in/i });
      await user.click(switchLink);

      expect(mockOnSwitchToLogin).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      // Fill out form
      await user.type(screen.getByLabelText(/full name/i), 'Test User');
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'TestPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'TestPassword123!');

      // Select user type
      const leisureOption = screen.getByText('Leisure Explorer').closest('button');
      if (leisureOption) {
        await user.click(leisureOption);
      }

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith('Test User', 'test@example.com', 'TestPassword123!', 'LEISURE');
    });

    it('should submit form with business user type', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      // Fill out form
      await user.type(screen.getByLabelText(/full name/i), 'Business User');
      await user.type(screen.getByLabelText(/email address/i), 'business@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'BusinessPass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'BusinessPass123!');

      // Select business user type
      const businessOption = screen.getByText('Business Traveler').closest('button');
      if (businessOption) {
        await user.click(businessOption);
      }

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith('Business User', 'business@example.com', 'BusinessPass123!', 'BUSINESS');
    });

    it('should submit form with bleisure user type (mapped to BUSINESS)', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      // Fill out form
      await user.type(screen.getByLabelText(/full name/i), 'Bleisure User');
      await user.type(screen.getByLabelText(/email address/i), 'bleisure@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'BleisurePass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'BleisurePass123!');

      // Select bleisure user type
      const bleisureOption = screen.getByText('Bleisure Enthusiast').closest('button');
      if (bleisureOption) {
        await user.click(bleisureOption);
      }

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith('Bleisure User', 'bleisure@example.com', 'BleisurePass123!', 'BUSINESS');
    });

    it('should not submit form when loading', async () => {
      const user = userEvent.setup();
      renderSignupForm({ isLoading: true });

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Email Validation', () => {
    it('should accept valid email formats', async () => {
      const user = userEvent.setup();
      const validEmails = [
        'test@example.com',
        'user.name@example.co.uk',
        'user+tag@example.org',
        'user123@example-domain.com'
      ];

      for (const email of validEmails) {
        renderSignupForm();
        
        await user.type(screen.getByLabelText(/full name/i), 'Test User');
        await user.type(screen.getByLabelText(/email address/i), email);
        await user.type(screen.getByLabelText(/^password$/i), 'TestPassword123!');
        await user.type(screen.getByLabelText(/confirm password/i), 'TestPassword123!');

        const leisureOption = screen.getByText('Leisure Explorer').closest('button');
        if (leisureOption) {
          await user.click(leisureOption);
        }

        const submitButton = screen.getByRole('button', { name: /create account/i });
        await user.click(submitButton);

        expect(mockOnSubmit).toHaveBeenCalledWith('Test User', email, 'TestPassword123!', 'LEISURE');
        
        // Clean up for next iteration
        mockOnSubmit.mockClear();
        screen.getByTestId('signup-form')?.remove?.();
      }
    });

    it('should reject invalid email formats', async () => {
      const user = userEvent.setup();
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user space@example.com'
      ];

      for (const email of invalidEmails) {
        renderSignupForm();
        
        await user.type(screen.getByLabelText(/full name/i), 'Test User');
        await user.type(screen.getByLabelText(/email address/i), email);

        const submitButton = screen.getByRole('button', { name: /create account/i });
        await user.click(submitButton);

        expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
        expect(mockOnSubmit).not.toHaveBeenCalled();
        
        // Clean up for next iteration
        screen.getByTestId('signup-form')?.remove?.();
      }
    });
  });
});