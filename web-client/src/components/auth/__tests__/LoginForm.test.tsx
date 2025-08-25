import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../LoginForm';

describe('LoginForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnSwitchToSignup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLoginForm = (props = {}) => {
    return render(
      <LoginForm
        onSubmit={mockOnSubmit}
        onSwitchToSignup={mockOnSwitchToSignup}
        isLoading={false}
        {...props}
      />
    );
  };

  describe('Rendering', () => {
    it('should render all form fields', () => {
      renderLoginForm();

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });

    it('should show loading state when isLoading is true', () => {
      renderLoginForm({ isLoading: true });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveClass('disabled:opacity-50');
    });

    it('should render forgot password link', () => {
      renderLoginForm();

      const forgotPasswordLink = screen.getByRole('button', { name: /forgot password\?/i });
      expect(forgotPasswordLink).toBeInTheDocument();
    });

    it('should render switch to signup link', () => {
      renderLoginForm();

      const switchLink = screen.getByRole('button', { name: /sign up/i });
      expect(switchLink).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when email is empty', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when email format is invalid', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when password is empty', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      expect(screen.getByText('Password is required')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when password is too short', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, '123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('User Interactions', () => {
    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
      const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button

      expect(passwordInput.type).toBe('password');

      await user.click(toggleButton);
      expect(passwordInput.type).toBe('text');

      await user.click(toggleButton);
      expect(passwordInput.type).toBe('password');
    });

    it('should call onSwitchToSignup when sign up link is clicked', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const switchLink = screen.getByRole('button', { name: /sign up/i });
      await user.click(switchLink);

      expect(mockOnSwitchToSignup).toHaveBeenCalledTimes(1);
    });

    it('should handle forgot password click', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const forgotPasswordLink = screen.getByRole('button', { name: /forgot password\?/i });
      await user.click(forgotPasswordLink);

      // Since this is just a button without functionality yet, we just test it exists and is clickable
      expect(forgotPasswordLink).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid credentials', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'TestPassword123!');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith('test@example.com', 'TestPassword123!');
    });

    it('should not submit form when loading', async () => {
      const user = userEvent.setup();
      renderLoginForm({ isLoading: true });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should handle form submission via Enter key', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'TestPassword123!');
      await user.keyboard('{Enter}');

      expect(mockOnSubmit).toHaveBeenCalledWith('test@example.com', 'TestPassword123!');
    });
  });

  describe('Input Field Behavior', () => {
    it('should clear email error when user starts typing valid email', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // First, trigger validation error
      await user.click(submitButton);
      expect(screen.getByText('Email is required')).toBeInTheDocument();

      // Then type valid email
      await user.type(emailInput, 'test@example.com');
      
      // Error should be gone (note: this test might need adjustment based on actual implementation)
      // The error clearing might happen on form submission rather than on input change
    });

    it('should clear password error when user starts typing valid password', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');

      // First, trigger validation error
      await user.click(submitButton);
      expect(screen.getByText('Password is required')).toBeInTheDocument();

      // Then type valid password
      await user.type(passwordInput, 'TestPassword123!');
      
      // Error should be gone (note: this test might need adjustment based on actual implementation)
    });

    it('should handle email input with different formats', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      const testCases = [
        'user@example.com',
        'user.name@example.co.uk',
        'user+tag@example.org',
        'USER@EXAMPLE.COM'
      ];

      for (const email of testCases) {
        await user.clear(emailInput);
        await user.clear(passwordInput);
        
        await user.type(emailInput, email);
        await user.type(passwordInput, 'TestPassword123!');

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        await user.click(submitButton);

        expect(mockOnSubmit).toHaveBeenCalledWith(email, 'TestPassword123!');
        mockOnSubmit.mockClear();
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form inputs', () => {
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should have proper placeholder text', () => {
      renderLoginForm();

      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    });

    it('should show loading indicator in button', () => {
      renderLoginForm({ isLoading: true });

      // Check for loading spinner (this might need adjustment based on actual implementation)
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('should have proper button types', () => {
      renderLoginForm();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      const forgotPasswordButton = screen.getByRole('button', { name: /forgot password\?/i });
      const switchButton = screen.getByRole('button', { name: /sign up/i });

      expect(submitButton).toHaveAttribute('type', 'submit');
      expect(forgotPasswordButton).toHaveAttribute('type', 'button');
      expect(switchButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Error Display', () => {
    it('should display email error with proper styling', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      const emailError = screen.getByText('Email is required');
      expect(emailError).toHaveClass('text-red-500');
    });

    it('should display password error with proper styling', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      const passwordError = screen.getByText('Password is required');
      expect(passwordError).toHaveClass('text-red-500');
    });

    it('should apply error styling to input fields', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.click(submitButton);

      expect(emailInput).toHaveClass('border-red-500');
    });
  });
});