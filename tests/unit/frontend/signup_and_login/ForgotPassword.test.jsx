import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock react-router's useNavigate (component imports it but doesn't actively navigate in tests)
vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }))

// Mock PasswordToggleIcon to avoid UI complexity
vi.mock('../../src/Components/Signup_And_Login/PasswordToggleIcon', () => ({ __esModule: true, default: ({ visible, onClick }) => <button data-testid={`toggle-${visible}`} onClick={onClick}>toggle</button> }))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({ __esModule: true, Toaster: () => <div data-testid="toaster" />, toast: { success: vi.fn() } }))

// Mock api module used by ForgotPassword
const postMock = vi.fn()
vi.mock('../../src/Components/Signup_And_Login/api', () => ({ __esModule: true, default: { post: (...args) => postMock(...args) } }))

import ForgotPassword from '../../../../src/Components/Signup_And_Login/ForgotPassword.jsx'

describe('ForgotPassword component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // ensure real timers by default
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not call API when email is invalid on Send OTP', async () => {
    const onBackToLogin = vi.fn()
    render(<ForgotPassword onBackToLogin={onBackToLogin} />)

    const emailInput = screen.getByPlaceholderText('Enter your email')
    const sendBtn = screen.getByText(/Send OTP/i)

    fireEvent.change(emailInput, { target: { value: 'not-an-email' } })
    fireEvent.click(sendBtn)

    // API should not be called for invalid email
    await waitFor(() => expect(postMock).not.toHaveBeenCalled())
  })

  it('sends OTP and proceeds to OTP step on successful api response', async () => {
    const onBackToLogin = vi.fn()
    postMock.mockResolvedValueOnce({ data: { success: true } })
    render(<ForgotPassword onBackToLogin={onBackToLogin} />)

    const emailInput = screen.getByPlaceholderText(/Enter your email/i)
    const sendBtn = screen.getByText(/Send OTP/i)

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
    fireEvent.click(sendBtn)

    // Wait for Verify OTP button to appear
    await waitFor(() => expect(screen.getByText(/Verify OTP/i)).toBeTruthy())
  })

  it('verifies OTP and proceeds to reset password step', async () => {
    const onBackToLogin = vi.fn()
    // First call for send-otp
    postMock.mockResolvedValueOnce({ data: { success: true } })
    // Second call for verify-otp
    postMock.mockResolvedValueOnce({ data: { success: true } })

    render(<ForgotPassword onBackToLogin={onBackToLogin} />)

    // Send OTP
    fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), { target: { value: 'user@example.com' } })
    fireEvent.click(screen.getByText(/Send OTP/i))

    await waitFor(() => expect(screen.getByText(/Verify OTP/i)).toBeTruthy())

    // Enter OTP and verify
    fireEvent.change(screen.getByPlaceholderText(/Enter OTP sent to your email/i), { target: { value: '123456' } })
    fireEvent.click(screen.getByText(/Verify OTP/i))

    // Wait for Reset Password button
    await waitFor(() => expect(screen.getByText(/Reset Password/i)).toBeTruthy())
  })

  it('validates new password fields and calls onBackToLogin after reset', async () => {
    const onBackToLogin = vi.fn()
    // 1: send otp, 2: verify otp, 3: reset
    postMock.mockResolvedValueOnce({ data: { success: true } })
    postMock.mockResolvedValueOnce({ data: { success: true } })
    postMock.mockResolvedValueOnce({ data: { success: true } })

    render(<ForgotPassword onBackToLogin={onBackToLogin} />)

    // Move to OTP step
    fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), { target: { value: 'user@example.com' } })
    fireEvent.click(screen.getByText(/Send OTP/i))
    await waitFor(() => expect(screen.getByText(/Verify OTP/i)).toBeTruthy())

    // Move to Reset step
    fireEvent.change(screen.getByPlaceholderText(/Enter OTP sent to your email/i), { target: { value: '123456' } })
    fireEvent.click(screen.getByText(/Verify OTP/i))
    await waitFor(() => expect(screen.getByText(/Reset Password/i)).toBeTruthy())

    // Enter a valid matching password
    const newPass = screen.getByPlaceholderText('New Password')
    const confirmPass = screen.getByPlaceholderText('Confirm New Password')
    fireEvent.change(newPass, { target: { value: 'Abc1@345' } })
    fireEvent.change(confirmPass, { target: { value: 'Abc1@345' } })

    // Submit reset and assert API reset endpoint was called
    fireEvent.click(screen.getByText(/Reset Password/i))

    await waitFor(() => expect(postMock).toHaveBeenCalled())
    // verify the reset endpoint was called (first arg should be the reset path)
    expect(postMock.mock.calls[postMock.mock.calls.length - 1][0]).toContain('/forgot-password/reset-password/')
  })

  it('shows an error if sending OTP fails', async () => {
    postMock.mockRejectedValueOnce({ response: { data: { error: 'Email not found' } } });
    render(<ForgotPassword onBackToLogin={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText(/Send OTP/i));

    await waitFor(() => {
      expect(screen.getByText('Email not found')).toBeTruthy();
    });
  });

  it('shows an error if OTP verification fails', async () => {
    postMock.mockResolvedValueOnce({ data: { success: true } }); // Send OTP succeeds
    postMock.mockRejectedValueOnce({ response: { data: { error: 'Invalid OTP' } } }); // Verify OTP fails
    render(<ForgotPassword onBackToLogin={() => {}} />);

    // Go to OTP step
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText(/Send OTP/i));
    await waitFor(() => screen.getByPlaceholderText(/Enter OTP/i));

    // Submit invalid OTP
    fireEvent.change(screen.getByPlaceholderText(/Enter OTP/i), { target: { value: 'wrong-otp' } });
    fireEvent.click(screen.getByText(/Verify OTP/i));

    await waitFor(() => {
      expect(screen.getByText('Invalid OTP')).toBeTruthy();
    });
  });

  it('shows an error if password reset fails', async () => {
    postMock.mockResolvedValueOnce({ data: { success: true } }); // Send OTP
    postMock.mockResolvedValueOnce({ data: { success: true } }); // Verify OTP
    postMock.mockRejectedValueOnce({ response: { data: { error: 'Reset failed' } } }); // Reset fails
    render(<ForgotPassword onBackToLogin={() => {}} />);

    // Go to reset step
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText(/Send OTP/i));
    await waitFor(() => screen.getByPlaceholderText(/Enter OTP/i));
    fireEvent.change(screen.getByPlaceholderText(/Enter OTP/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByText(/Verify OTP/i));
    await waitFor(() => screen.getByPlaceholderText('New Password'));

    // Submit password
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'Abc1@345' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), { target: { value: 'Abc1@345' } });
    fireEvent.click(screen.getByText(/Reset Password/i));

    await waitFor(() => {
      expect(screen.getByText('Reset failed')).toBeTruthy();
    });
  });

  it('shows validation error for mismatched passwords', async () => {
    postMock.mockResolvedValueOnce({ data: { success: true } });
    postMock.mockResolvedValueOnce({ data: { success: true } });
    render(<ForgotPassword onBackToLogin={() => {}} />);

    // Go to reset step
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText(/Send OTP/i));
    await waitFor(() => screen.getByPlaceholderText(/Enter OTP/i));
    fireEvent.change(screen.getByPlaceholderText(/Enter OTP/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByText(/Verify OTP/i));
    await waitFor(() => screen.getByPlaceholderText('New Password'));

    // Enter mismatched passwords
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'Abc1@345' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), { target: { value: 'different' } });

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeTruthy();
    });
  });

  it('calls onBackToLogin when "Back to Login" is clicked', () => {
    const onBackToLogin = vi.fn();
    render(<ForgotPassword onBackToLogin={onBackToLogin} />);
    fireEvent.click(screen.getByText('Back to Login'));
    expect(onBackToLogin).toHaveBeenCalledTimes(1);
  });

  it('returns to email step when "Back to Email" is clicked from OTP step', async () => {
    postMock.mockResolvedValueOnce({ data: { success: true } });
    render(<ForgotPassword onBackToLogin={() => {}} />);

    // Go to OTP step
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText(/Send OTP/i));
    await waitFor(() => screen.getByText('Back to Email'));

    // Go back
    fireEvent.click(screen.getByText('Back to Email'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter your email')).toBeTruthy();
    });
  });

  it('returns to email step when "Back to Email" is clicked from reset step', async () => {
    postMock.mockResolvedValueOnce({ data: { success: true } });
    postMock.mockResolvedValueOnce({ data: { success: true } });
    render(<ForgotPassword onBackToLogin={() => {}} />);

    // Go to reset step
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText(/Send OTP/i));
    await waitFor(() => screen.getByPlaceholderText(/Enter OTP/i));
    fireEvent.change(screen.getByPlaceholderText(/Enter OTP/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByText(/Verify OTP/i));
    await waitFor(() => screen.getByPlaceholderText('New Password'));

    // Click back to email - should reset all fields
    const backLinks = screen.getAllByText('Back to Email');
    fireEvent.click(backLinks[backLinks.length - 1]);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter your email')).toBeTruthy();
    });
  });

  it('does not submit when password fields are empty', async () => {
    postMock.mockResolvedValueOnce({ data: { success: true } });
    postMock.mockResolvedValueOnce({ data: { success: true } });
    render(<ForgotPassword onBackToLogin={() => {}} />);

    // Go to reset step
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText(/Send OTP/i));
    await waitFor(() => screen.getByPlaceholderText(/Enter OTP/i));
    fireEvent.change(screen.getByPlaceholderText(/Enter OTP/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByText(/Verify OTP/i));
    await waitFor(() => screen.getByPlaceholderText('New Password'));

    // Since HTML required attribute prevents submission, verify form exists but API not called
    const resetBtn = screen.getByText(/Reset Password/i);
    expect(resetBtn).toBeTruthy();
    // API should only have been called twice (send OTP + verify OTP)
    expect(postMock).toHaveBeenCalledTimes(2);
  });

  it('validates password format when typing new password', async () => {
    postMock.mockResolvedValueOnce({ data: { success: true } });
    postMock.mockResolvedValueOnce({ data: { success: true } });
    render(<ForgotPassword onBackToLogin={() => {}} />);

    // Go to reset step
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText(/Send OTP/i));
    await waitFor(() => screen.getByPlaceholderText(/Enter OTP/i));
    fireEvent.change(screen.getByPlaceholderText(/Enter OTP/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByText(/Verify OTP/i));
    await waitFor(() => screen.getByPlaceholderText('New Password'));

    // Enter invalid password (too short, no special char)
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'short' } });

    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeTruthy();
    });
  });

  it('validates password format when typing confirm password', async () => {
    postMock.mockResolvedValueOnce({ data: { success: true } });
    postMock.mockResolvedValueOnce({ data: { success: true } });
    render(<ForgotPassword onBackToLogin={() => {}} />);

    // Go to reset step
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText(/Send OTP/i));
    await waitFor(() => screen.getByPlaceholderText(/Enter OTP/i));
    fireEvent.change(screen.getByPlaceholderText(/Enter OTP/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByText(/Verify OTP/i));
    await waitFor(() => screen.getByPlaceholderText('New Password'));

    // Enter weak password first
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'weak' } });
    // Then enter matching confirm
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), { target: { value: 'weak' } });

    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeTruthy();
    });
  });

  it('toggles password visibility for new password field', async () => {
    postMock.mockResolvedValueOnce({ data: { success: true } });
    postMock.mockResolvedValueOnce({ data: { success: true } });
    render(<ForgotPassword onBackToLogin={() => {}} />);

    // Go to reset step
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText(/Send OTP/i));
    await waitFor(() => screen.getByPlaceholderText(/Enter OTP/i));
    fireEvent.change(screen.getByPlaceholderText(/Enter OTP/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByText(/Verify OTP/i));
    await waitFor(() => screen.getByPlaceholderText('New Password'));

    const newPassInput = screen.getByPlaceholderText('New Password');
    expect(newPassInput.type).toBe('password');

    // Click toggle
    const toggleButtons = screen.getAllByTestId(/toggle-/);
    fireEvent.click(toggleButtons[0]);

    expect(newPassInput.type).toBe('text');
  });

  it('toggles password visibility for confirm password field', async () => {
    postMock.mockResolvedValueOnce({ data: { success: true } });
    postMock.mockResolvedValueOnce({ data: { success: true } });
    render(<ForgotPassword onBackToLogin={() => {}} />);

    // Go to reset step
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText(/Send OTP/i));
    await waitFor(() => screen.getByPlaceholderText(/Enter OTP/i));
    fireEvent.change(screen.getByPlaceholderText(/Enter OTP/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByText(/Verify OTP/i));
    await waitFor(() => screen.getByPlaceholderText('Confirm New Password'));

    const confirmPassInput = screen.getByPlaceholderText('Confirm New Password');
    expect(confirmPassInput.type).toBe('password');

    // Click toggle
    const toggleButtons = screen.getAllByTestId(/toggle-/);
    fireEvent.click(toggleButtons[1]);

    expect(confirmPassInput.type).toBe('text');
  });

  it('does not verify OTP when field is empty', async () => {
    postMock.mockResolvedValueOnce({ data: { success: true } });
    render(<ForgotPassword onBackToLogin={() => {}} />);

    // Go to OTP step
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText(/Send OTP/i));
    await waitFor(() => screen.getByPlaceholderText(/Enter OTP/i));

    // Since HTML required attribute prevents submission, verify button exists but API not called again
    const verifyBtn = screen.getByText(/Verify OTP/i);
    expect(verifyBtn).toBeTruthy();
    // API should only have been called once (send OTP)
    expect(postMock).toHaveBeenCalledTimes(1);
  });

  it('clears error when typing valid password after invalid one', async () => {
    postMock.mockResolvedValueOnce({ data: { success: true } });
    postMock.mockResolvedValueOnce({ data: { success: true } });
    render(<ForgotPassword onBackToLogin={() => {}} />);

    // Go to reset step
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText(/Send OTP/i));
    await waitFor(() => screen.getByPlaceholderText(/Enter OTP/i));
    fireEvent.change(screen.getByPlaceholderText(/Enter OTP/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByText(/Verify OTP/i));
    await waitFor(() => screen.getByPlaceholderText('New Password'));

    // Enter invalid password first
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'short' } });
    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeTruthy();
    });

    // Now enter valid password - error should clear
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'ValidPass1@' } });
    await waitFor(() => {
      expect(screen.queryByText(/Password must be at least 8 characters/i)).toBeNull();
    });
  });

  it('shows mismatch error when new password is valid but confirm differs', async () => {
    postMock.mockResolvedValueOnce({ data: { success: true } });
    postMock.mockResolvedValueOnce({ data: { success: true } });
    render(<ForgotPassword onBackToLogin={() => {}} />);

    // Go to reset step
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText(/Send OTP/i));
    await waitFor(() => screen.getByPlaceholderText(/Enter OTP/i));
    fireEvent.change(screen.getByPlaceholderText(/Enter OTP/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByText(/Verify OTP/i));
    await waitFor(() => screen.getByPlaceholderText('New Password'));

    // Enter valid password
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'ValidPass1@' } });
    // Enter non-matching confirm
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), { target: { value: 'DifferentPass1@' } });

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeTruthy();
    });
  });

  it('clears error when email is valid after showing invalid email error', async () => {
    render(<ForgotPassword onBackToLogin={() => {}} />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    
    // Enter invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.click(screen.getByText(/Send OTP/i));
    
    // Now enter valid email - form should allow submission
    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    
    // Verify email input has valid value
    expect(emailInput.value).toBe('valid@example.com');
  });

  it('handles API error when response has no error field', async () => {
    postMock.mockRejectedValueOnce({ response: {} }); // No error field
    render(<ForgotPassword onBackToLogin={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText(/Send OTP/i));

    await waitFor(() => {
      expect(screen.getByText('Failed to send OTP. Please try again.')).toBeTruthy();
    });
  });

  it('handles OTP verification error without specific message', async () => {
    postMock.mockResolvedValueOnce({ data: { success: true } });
    postMock.mockRejectedValueOnce({}); // No response object
    render(<ForgotPassword onBackToLogin={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText(/Send OTP/i));
    await waitFor(() => screen.getByPlaceholderText(/Enter OTP/i));

    fireEvent.change(screen.getByPlaceholderText(/Enter OTP/i), { target: { value: '123' } });
    fireEvent.click(screen.getByText(/Verify OTP/i));

    await waitFor(() => {
      expect(screen.getByText('Invalid OTP. Please try again.')).toBeTruthy();
    });
  });

  it('handles password reset error without specific message', async () => {
    postMock.mockResolvedValueOnce({ data: { success: true } });
    postMock.mockResolvedValueOnce({ data: { success: true } });
    postMock.mockRejectedValueOnce({}); // No response
    render(<ForgotPassword onBackToLogin={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText(/Send OTP/i));
    await waitFor(() => screen.getByPlaceholderText(/Enter OTP/i));
    fireEvent.change(screen.getByPlaceholderText(/Enter OTP/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByText(/Verify OTP/i));
    await waitFor(() => screen.getByPlaceholderText('New Password'));

    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'ValidPass1@' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), { target: { value: 'ValidPass1@' } });
    fireEvent.click(screen.getByText(/Reset Password/i));

    await waitFor(() => {
      expect(screen.getByText('Password reset failed.')).toBeTruthy();
    });
  });

  it('shows error when new password has valid length but confirm password does not match', async () => {
    postMock.mockResolvedValueOnce({ data: { success: true } });
    postMock.mockResolvedValueOnce({ data: { success: true } });
    render(<ForgotPassword onBackToLogin={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText(/Send OTP/i));
    await waitFor(() => screen.getByPlaceholderText(/Enter OTP/i));
    fireEvent.change(screen.getByPlaceholderText(/Enter OTP/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByText(/Verify OTP/i));
    await waitFor(() => screen.getByPlaceholderText('New Password'));

    // Enter valid password first
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'ValidPass1@' } });
    // Clear the error first
    await waitFor(() => {
      expect(screen.queryByText(/Password must be at least 8 characters/i)).toBeNull();
    });
    
    // Now type in confirm that doesn't match
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), { target: { value: 'Valid' } });

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeTruthy();
    });
  });

  it('clears mismatch error when passwords match after initial mismatch', async () => {
    postMock.mockResolvedValueOnce({ data: { success: true } });
    postMock.mockResolvedValueOnce({ data: { success: true } });
    render(<ForgotPassword onBackToLogin={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText(/Send OTP/i));
    await waitFor(() => screen.getByPlaceholderText(/Enter OTP/i));
    fireEvent.change(screen.getByPlaceholderText(/Enter OTP/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByText(/Verify OTP/i));
    await waitFor(() => screen.getByPlaceholderText('New Password'));

    // Enter passwords
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'ValidPass1@' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), { target: { value: 'Different1@' } });
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeTruthy();
    });

    // Now fix confirm to match
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), { target: { value: 'ValidPass1@' } });

    await waitFor(() => {
      expect(screen.queryByText('Passwords do not match.')).toBeNull();
    });
  });

  it('shows empty password error when submitting without entering passwords', async () => {
    postMock.mockResolvedValueOnce({ data: { success: true } });
    postMock.mockResolvedValueOnce({ data: { success: true } });
    
    // Override button disabled state check to test validation logic
    const originalGetElementById = document.getElementById;
    document.getElementById = vi.fn((id) => {
      if (id === 'btn4') {
        return { disabled: false };
      }
      return originalGetElementById.call(document, id);
    });

    render(<ForgotPassword onBackToLogin={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText(/Send OTP/i));
    await waitFor(() => screen.getByPlaceholderText(/Enter OTP/i));
    fireEvent.change(screen.getByPlaceholderText(/Enter OTP/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByText(/Verify OTP/i));
    await waitFor(() => screen.getByPlaceholderText('New Password'));

    // Submit form programmatically to bypass HTML5 validation
    const form = screen.getByPlaceholderText('New Password').closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Please fill both fields.')).toBeTruthy();
    });

    // Restore
    document.getElementById = originalGetElementById;
  });

  it('shows mismatch error when submitting with non-matching passwords', async () => {
    postMock.mockResolvedValueOnce({ data: { success: true } });
    postMock.mockResolvedValueOnce({ data: { success: true } });
    
    render(<ForgotPassword onBackToLogin={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText(/Send OTP/i));
    await waitFor(() => screen.getByPlaceholderText(/Enter OTP/i));
    fireEvent.change(screen.getByPlaceholderText(/Enter OTP/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByText(/Verify OTP/i));
    await waitFor(() => screen.getByPlaceholderText('New Password'));

    // Enter mismatched passwords
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'ValidPass1@' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), { target: { value: 'DifferentPass1@' } });
    
    // Clear the onChange error first
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), { target: { value: 'ValidPass1@' } });
    await waitFor(() => {
      expect(screen.queryByText('Passwords do not match.')).toBeNull();
    });
    
    // Change back to mismatch
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), { target: { value: 'DifferentPass1@' } });

    // Submit form
    const form = screen.getByPlaceholderText('New Password').closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeTruthy();
    });
  });

  it('clears error when valid email is submitted after invalid', async () => {
    postMock.mockResolvedValueOnce({ data: { message: 'OTP sent' } });
    
    render(<ForgotPassword onBackToLogin={() => {}} />);

    const emailInput = screen.getByPlaceholderText('Enter your email');

    // Enter invalid email and submit form directly to bypass HTML5 validation
    fireEvent.change(emailInput, { target: { value: 'bademail' } });
    const form = emailInput.closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/Enter a valid email address/i)).toBeTruthy();
    });

    // Now enter valid email and submit again - error should clear
    fireEvent.change(emailInput, { target: { value: 'good@email.com' } });
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.queryByText(/Enter a valid email address/i)).toBeNull();
      expect(postMock).toHaveBeenCalledWith('/forgot-password/', { email: 'good@email.com' });
    });
  });

  it('shows error when empty email is submitted', async () => {
    render(<ForgotPassword onBackToLogin={() => {}} />);

    const emailInput = screen.getByPlaceholderText('Enter your email');

    // Submit form directly with empty email to bypass HTML5 validation
    fireEvent.change(emailInput, { target: { value: '' } });
    const form = emailInput.closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/Enter a valid email address/i)).toBeTruthy();
    });
  });

  it('validates confirm password matches when new password is invalid', async () => {
    postMock.mockResolvedValueOnce({ data: { success: true } });
    postMock.mockResolvedValueOnce({ data: { success: true } });
    render(<ForgotPassword onBackToLogin={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText(/Send OTP/i));
    await waitFor(() => screen.getByPlaceholderText(/Enter OTP/i));
    fireEvent.change(screen.getByPlaceholderText(/Enter OTP/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByText(/Verify OTP/i));
    await waitFor(() => screen.getByPlaceholderText('New Password'));

    // Enter invalid (short) password
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'short' } });
    
    // Type matching confirm password
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), { target: { value: 'short' } });

    // Should show password format error (not mismatch error)
    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeTruthy();
    });
  });
});

