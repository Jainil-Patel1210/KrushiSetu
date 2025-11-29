import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../../../../src/Components/Signup_And_Login/Login';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('react-hot-toast', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
  Toaster: () => <div data-testid="toaster" />,
}));

vi.mock('../../../../src/Components/Signup_And_Login/RoleDropDown', () => ({
  default: ({ role, isOpen, onClick, onSelect }) => (
    <div className="relative w-full">
      <input
        className="w-full p-2 pr-12 mb-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 cursor-pointer"
        type="text"
        placeholder="Role"
        value={role}
        onClick={onClick}
        readOnly
        required
      />
      <img
        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 pb-2"
        src="/Dropdown_Logo.svg"
        alt="Dropdown"
        onClick={onClick}
      />
      {isOpen && (
        <div data-testid="role-options" className="absolute left-0 right-0 bg-white border rounded shadow z-10">
          <p className="p-2 cursor-pointer hover:bg-gray-200" onClick={() => onSelect('Farmer')}>Farmer</p>
          <p className="p-2 cursor-pointer hover:bg-gray-200" onClick={() => onSelect('Officer')}>Officer</p>
          <p className="p-2 cursor-pointer hover:bg-gray-200" onClick={() => onSelect('Admin')}>Admin</p>
          <p className="p-2 cursor-pointer hover:bg-gray-200" onClick={() => onSelect('Subsidy_Provider')}>Subsidy Provider</p>
        </div>
      )}
    </div>
  ),
}));

vi.mock('../../../../src/Components/Signup_And_Login/SocialLogin', () => ({
  default: () => <div data-testid="social-login">Social Login</div>,
}));

vi.mock('../../../../src/Components/Signup_And_Login/PasswordToggleIcon', () => ({
  default: ({ visible, onClick }) => (
    <span 
      className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer' 
      onClick={onClick} 
      tabIndex={0} 
      role="button" 
      aria-label="Toggle password visibility"
    >
      {visible ? 'Hide' : 'Show'}
    </span>
  ),
}));

let postMock;
vi.mock('../../../../src/Components/Signup_And_Login/api', () => ({
  default: {
    post: (...args) => postMock(...args),
  },
}));

vi.mock('../../../../src/utils/auth', () => ({
  clearAuth: vi.fn(),
  normalizeRole: vi.fn((role) => role?.toLowerCase() || ''),
  storeTokens: vi.fn(),
  getRedirectPathForRole: vi.fn((role) => `/${role}-dashboard`),
}));

let mockNavigate;
let mockOnForgotPasswordClick;

describe('Login component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    postMock = vi.fn().mockRejectedValue(new Error('No mock response'));
    mockNavigate = vi.fn();
    mockOnForgotPasswordClick = vi.fn();
    localStorage.clear();
    // Set isLoggedOut to prevent auto-login logic
    localStorage.setItem('isLoggedOut', 'true');
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const renderLogin = (props = {}) => {
    return render(
      <BrowserRouter>
        <Login onForgotPasswordClick={mockOnForgotPasswordClick} {...props} />
      </BrowserRouter>
    );
  };

  const selectRole = async (roleName = 'Farmer') => {
    const roleInput = screen.getByPlaceholderText('Role');
    fireEvent.click(roleInput);
    await waitFor(() => {
      expect(screen.getByTestId('role-options')).toBeInTheDocument();
    });
    const roleOption = screen.getByText(roleName);
    fireEvent.click(roleOption);
    await waitFor(() => {
      expect(roleInput).toHaveValue(roleName);
    });
  };

  describe('Email/Password Login', () => {
    it('renders login form with email and password fields', () => {
      renderLogin();
      
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Log In/i })).toBeInTheDocument();
    });

    it('validates email format on input change', async () => {
      renderLogin();
      
      const emailInput = screen.getByPlaceholderText('Email');
      fireEvent.change(emailInput, { target: { value: 'invalidemail' } });
      
      expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    });

    it('clears email error when valid email is entered', async () => {
      renderLogin();
      
      const emailInput = screen.getByPlaceholderText('Email');
      fireEvent.change(emailInput, { target: { value: 'invalid' } });
      
      expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
      
      fireEvent.change(emailInput, { target: { value: 'valid@email.com' } });
      
      await waitFor(() => {
        expect(screen.queryByText('Enter a valid email address.')).toBeNull();
      });
    });

    it('toggles password visibility', () => {
      renderLogin();
      
      const passwordInput = screen.getByPlaceholderText('Password');
      const toggleButton = screen.getByLabelText('Toggle password visibility');
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
      
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('calls onForgotPasswordClick when "Forgot Password?" is clicked', () => {
      renderLogin();
      
      const forgotPasswordLink = screen.getByText('Forgot Password?');
      fireEvent.click(forgotPasswordLink);
      
      expect(mockOnForgotPasswordClick).toHaveBeenCalledTimes(1);
    });

    it('shows error when submitting without selecting role', async () => {
      const toast = await import('react-hot-toast');
      renderLogin();
      
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /Log In/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(toast.toast).toHaveBeenCalledWith('Please select a role.');
      });
    });

    it('successfully logs in with email and password', async () => {
      const toast = await import('react-hot-toast');
      postMock.mockResolvedValueOnce({
        data: {
          access: 'access-token',
          refresh: 'refresh-token',
        },
      });
      
      renderLogin();
      
      // Select role
      await selectRole();
      
      
      
      
      // Fill form
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const submitButton = screen.getByRole('button', { name: /Log In/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(postMock).toHaveBeenCalledWith('/token/', {
          email_address: 'test@example.com',
          password: 'password123',
          role: 'farmer',
          remember: false,
        });
        expect(toast.toast.success).toHaveBeenCalledWith('Logged in successfully!');
        expect(mockNavigate).toHaveBeenCalledWith('/farmer-dashboard');
      });
    });

    it('successfully logs in with mobile number and password', async () => {
      const toast = await import('react-hot-toast');
      postMock.mockResolvedValueOnce({
        data: {
          access: 'access-token',
          refresh: 'refresh-token',
        },
      });
      
      renderLogin();
      
      // Select role
      await selectRole();
      
      
      
      
      // Fill form with mobile
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      fireEvent.change(emailInput, { target: { value: '9876543210' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const submitButton = screen.getByRole('button', { name: /Log In/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(postMock).toHaveBeenCalledWith('/token/', {
          email_address: '9876543210',
          password: 'password123',
          role: 'farmer',
          remember: false,
        });
        expect(toast.toast.success).toHaveBeenCalledWith('Logged in successfully!');
      });
    });

    it('shows error for invalid email/mobile format on submit', async () => {
      renderLogin();
      
      // Select role
      const roleInput = screen.getByPlaceholderText('Role');
      fireEvent.click(roleInput);
      await waitFor(() => {
        expect(screen.getByTestId('role-options')).toBeInTheDocument();
      });
      
      
      
      
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      fireEvent.change(emailInput, { target: { value: '123' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const submitButton = screen.getByRole('button', { name: /Log In/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Enter a valid 10-digit mobile number or email.')).toBeInTheDocument();
      });
    });

    it('handles login API error', async () => {
      const toast = await import('react-hot-toast');
      postMock.mockRejectedValueOnce({
        response: { data: { error: 'Invalid credentials' } },
      });
      
      renderLogin();
      
      // Select role
      await selectRole();
      
      
      
      
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrong' } });
      
      const submitButton = screen.getByRole('button', { name: /Log In/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(toast.toast.error).toHaveBeenCalledWith('Invalid credentials');
      });
    });

    it('handles Remember Me checkbox', async () => {
      postMock.mockResolvedValueOnce({
        data: {
          access: 'access-token',
          refresh: 'refresh-token',
        },
      });
      
      renderLogin();
      
      // Select role
      await selectRole();
      
      
      
      
      const rememberCheckbox = screen.getByLabelText('Remember Me');
      fireEvent.click(rememberCheckbox);
      
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const submitButton = screen.getByRole('button', { name: /Log In/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(postMock).toHaveBeenCalledWith('/token/', {
          email_address: 'test@example.com',
          password: 'password123',
          role: 'farmer',
          remember: true,
        });
      });
    });

    it('redirects to custom path when redirectTo prop is provided', async () => {
      const toast = await import('react-hot-toast');
      postMock.mockResolvedValueOnce({
        data: {
          access: 'access-token',
          refresh: 'refresh-token',
        },
      });
      
      renderLogin({ redirectTo: '/custom-path' });
      
      // Select role
      await selectRole();
      
      
      
      
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const submitButton = screen.getByRole('button', { name: /Log In/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/custom-path');
      });
    });
  });

  describe('OTP Login', () => {
    it('switches to OTP login mode', () => {
      renderLogin();
      
      const switchLink = screen.getByText('Login with Mobile');
      fireEvent.click(switchLink);
      
      expect(screen.getByPlaceholderText('Mobile Number')).toBeInTheDocument();
      expect(screen.getByText('Login with Email')).toBeInTheDocument();
    });

    it('validates mobile number format', async () => {
      renderLogin();
      
      const switchLink = screen.getByText('Login with Mobile');
      fireEvent.click(switchLink);
      
      const mobileInput = screen.getByPlaceholderText('Mobile Number');
      fireEvent.change(mobileInput, { target: { value: '123' } });
      
      await waitFor(() => {
        expect(screen.getByText('Mobile number must be exactly 10 digits.')).toBeInTheDocument();
      });
    });

    it('clears mobile error when valid number is entered', async () => {
      renderLogin();
      
      const switchLink = screen.getByText('Login with Mobile');
      fireEvent.click(switchLink);
      
      const mobileInput = screen.getByPlaceholderText('Mobile Number');
      fireEvent.change(mobileInput, { target: { value: '123' } });
      
      await waitFor(() => {
        expect(screen.getByText('Mobile number must be exactly 10 digits.')).toBeInTheDocument();
      });
      
      fireEvent.change(mobileInput, { target: { value: '9876543210' } });
      
      await waitFor(() => {
        expect(screen.queryByText('Mobile number must be exactly 10 digits.')).toBeNull();
      });
    });

    it('shows error when submitting mobile without role', async () => {
      const toast = await import('react-hot-toast');
      renderLogin();
      
      const switchLink = screen.getByText('Login with Mobile');
      fireEvent.click(switchLink);
      
      const mobileInput = screen.getByPlaceholderText('Mobile Number');
      fireEvent.change(mobileInput, { target: { value: '9876543210' } });
      
      const submitButton = screen.getByRole('button', { name: /Send OTP/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(toast.toast).toHaveBeenCalledWith('Please select a role.');
      });
    });

    it('sends OTP successfully and shows OTP form', async () => {
      const toast = await import('react-hot-toast');
      postMock.mockResolvedValueOnce({
        data: {
          user_id: '123',
          message: 'OTP sent',
        },
      });
      
      renderLogin();
      
      const switchLink = screen.getByText('Login with Mobile');
      fireEvent.click(switchLink);
      
      // Select role
      await selectRole();
      
      
      
      
      const mobileInput = screen.getByPlaceholderText('Mobile Number');
      fireEvent.change(mobileInput, { target: { value: '9876543210' } });
      
      const submitButton = screen.getByRole('button', { name: /Send OTP/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(postMock).toHaveBeenCalledWith('/login/', {
          mobile_number: '9876543210',
          role: 'farmer',
          remember: false,
        });
        expect(toast.toast.success).toHaveBeenCalledWith('OTP sent');
        expect(screen.getByPlaceholderText('Enter OTP')).toBeInTheDocument();
      });
    });

    it('shows error when mobile number is invalid on OTP send', async () => {
      renderLogin();
      
      const switchLink = screen.getByText('Login with Mobile');
      fireEvent.click(switchLink);
      
      // Select role
      await selectRole();
      
      
      
      
      const mobileInput = screen.getByPlaceholderText('Mobile Number');
      fireEvent.change(mobileInput, { target: { value: '123' } });
      
      const submitButton = screen.getByRole('button', { name: /Send OTP/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid 10-digit mobile number.')).toBeInTheDocument();
      });
    });

    it('handles OTP send API error', async () => {
      const toast = await import('react-hot-toast');
      postMock.mockRejectedValueOnce({
        response: { data: { error: 'Mobile not registered' } },
      });
      
      renderLogin();
      
      const switchLink = screen.getByText('Login with Mobile');
      fireEvent.click(switchLink);
      
      // Select role
      await selectRole();
      
      
      
      
      const mobileInput = screen.getByPlaceholderText('Mobile Number');
      fireEvent.change(mobileInput, { target: { value: '9876543210' } });
      
      const submitButton = screen.getByRole('button', { name: /Send OTP/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(toast.toast.error).toHaveBeenCalledWith('Mobile not registered');
      });
    });

    it('verifies OTP and logs in successfully', async () => {
      const toast = await import('react-hot-toast');
      postMock
        .mockResolvedValueOnce({
          data: { user_id: '123', message: 'OTP sent' },
        })
        .mockResolvedValueOnce({
          data: {
            access: 'access-token',
            refresh: 'refresh-token',
          },
        });
      
      renderLogin();
      
      const switchLink = screen.getByText('Login with Mobile');
      fireEvent.click(switchLink);
      
      // Select role
      await selectRole();
      
      
      
      
      // Send OTP
      const mobileInput = screen.getByPlaceholderText('Mobile Number');
      fireEvent.change(mobileInput, { target: { value: '9876543210' } });
      
      let submitButton = screen.getByRole('button', { name: /Send OTP/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter OTP')).toBeInTheDocument();
      });
      
      // Verify OTP
      const otpInput = screen.getByPlaceholderText('Enter OTP');
      fireEvent.change(otpInput, { target: { value: '123456' } });
      
      submitButton = screen.getByRole('button', { name: /Verify OTP & Login/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(postMock).toHaveBeenCalledWith('/verify-otp/', {
          user_id: '123',
          otp: '123456',
          remember: false,
        });
        expect(toast.toast.success).toHaveBeenCalledWith('Logged in successfully!');
        expect(mockNavigate).toHaveBeenCalledWith('/farmer-dashboard');
      });
    });

    it('handles OTP verification error', async () => {
      const toast = await import('react-hot-toast');
      postMock
        .mockResolvedValueOnce({
          data: { user_id: '123', message: 'OTP sent' },
        })
        .mockRejectedValueOnce({
          response: { data: { error: 'Invalid OTP' } },
        });
      
      renderLogin();
      
      const switchLink = screen.getByText('Login with Mobile');
      fireEvent.click(switchLink);
      
      // Select role
      await selectRole();
      
      
      
      
      // Send OTP
      const mobileInput = screen.getByPlaceholderText('Mobile Number');
      fireEvent.change(mobileInput, { target: { value: '9876543210' } });
      
      let submitButton = screen.getByRole('button', { name: /Send OTP/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter OTP')).toBeInTheDocument();
      });
      
      // Verify OTP
      const otpInput = screen.getByPlaceholderText('Enter OTP');
      fireEvent.change(otpInput, { target: { value: 'wrong' } });
      
      submitButton = screen.getByRole('button', { name: /Verify OTP & Login/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(toast.toast.error).toHaveBeenCalledWith('Invalid OTP');
      });
    });

    it('shows OTP timer after sending OTP', async () => {
      postMock.mockResolvedValueOnce({
        data: { user_id: '123', message: 'OTP sent' },
      });
      
      renderLogin();
      
      const switchLink = screen.getByText('Login with Mobile');
      fireEvent.click(switchLink);
      
      // Select role
      selectRole();
      
      
      
      
      const mobileInput = screen.getByPlaceholderText('Mobile Number');
      fireEvent.change(mobileInput, { target: { value: '9876543210' } });
      
      const submitButton = screen.getByRole('button', { name: /Send OTP/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Resend OTP in 30s/i)).toBeInTheDocument();
      });
    });

    it('allows resending OTP after timer expires', async () => {
      postMock.mockResolvedValue({
        data: { user_id: '123', message: 'OTP sent' },
      });
      
      renderLogin();
      
      const switchLink = screen.getByText('Login with Mobile');
      fireEvent.click(switchLink);
      
      // Select role
      selectRole();
      
      
      
      
      const mobileInput = screen.getByPlaceholderText('Mobile Number');
      fireEvent.change(mobileInput, { target: { value: '9876543210' } });
      
      const submitButton = screen.getByRole('button', { name: /Send OTP/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Resend OTP in 30s/i)).toBeInTheDocument();
      });
      
      // Fast-forward timer
      vi.advanceTimersByTime(30000);
      
      await waitFor(() => {
        expect(screen.getByText(/Resend OTP/i)).toBeInTheDocument();
      });
      
      const resendLink = screen.getByText(/Resend OTP/i);
      fireEvent.click(resendLink);
      
      await waitFor(() => {
        expect(postMock).toHaveBeenCalledTimes(2);
      });
    });

    it('switches back to email login from OTP login', () => {
      renderLogin();
      
      const switchLink = screen.getByText('Login with Mobile');
      fireEvent.click(switchLink);
      
      expect(screen.getByPlaceholderText('Mobile Number')).toBeInTheDocument();
      
      const switchBackLink = screen.getByText('Login with Email');
      fireEvent.click(switchBackLink);
      
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });

    it('restricts mobile input to digits only and max 10 digits', () => {
      renderLogin();
      
      const switchLink = screen.getByText('Login with Mobile');
      fireEvent.click(switchLink);
      
      const mobileInput = screen.getByPlaceholderText('Mobile Number');
      fireEvent.change(mobileInput, { target: { value: 'abc12345678901' } });
      
      expect(mobileInput.value).toBe('1234567890');
    });

    it('filters non-alphanumeric characters in email input', () => {
      renderLogin();
      
      const emailInput = screen.getByPlaceholderText('Email');
      fireEvent.change(emailInput, { target: { value: 'test$%^@email.com' } });
      
      expect(emailInput.value).toBe('test@email.com');
    });
  });

  describe('Role Selection', () => {
    it('opens role dropdown when clicked', async () => {
      renderLogin();
      
      selectRole();

      
      
      expect(screen.getByTestId('role-options')).toBeInTheDocument();
    });

    it('selects a role and closes dropdown', async () => {
      renderLogin();
      
      selectRole();
      
      
      
      
      
      expect(screen.getByTestId('selected-role-text')).toHaveTextContent('farmer');
      expect(screen.queryByTestId('role-options')).not.toBeInTheDocument();
    });

    it('disables submit button when no role is selected', () => {
      renderLogin();
      
      const submitButton = screen.getByRole('button', { name: /Log In/i });
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when role is selected', async () => {
      renderLogin();
      
      selectRole();
      
      
      
      
      
      const submitButton = screen.getByRole('button', { name: /Log In/i });
      expect(submitButton).not.toBeDisabled();
    });
  });
});
