import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, beforeAll, afterEach } from 'vitest';
// jest-dom is now loaded by vitest setupFiles (tests/setupTests.js)

// Mocks and mutable state for router hooks
const mockNavigate = vi.fn();
let locationState = { state: {} };
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => locationState,
}));

// Mock Settings so it doesn't render heavy layout
vi.mock('../src/Components/HomePage/Settings', () => ({ __esModule: true, default: () => <div data-testid="mock-settings">Settings</div> }));

// Mock fontawesome icon components
vi.mock('@fortawesome/react-fontawesome', () => ({ FontAwesomeIcon: ({ icon, className }) => <span data-testid="fa-icon" className={className} /> }));
vi.mock('@fortawesome/free-solid-svg-icons', () => ({ faArrowLeftLong: {} }));

// Mock child pages. Each mock exposes buttons that call the provided callbacks so tests can drive flows.
vi.mock('../src/Components/Signup_And_Login/Login', () => ({
  __esModule: true,
  default: ({ onForgotPasswordClick, onLoginSuccess, redirectTo }) => (
    <div>
      <button data-testid="login-forgot" onClick={onForgotPasswordClick}>Forgot</button>
      <button data-testid="login-success" onClick={onLoginSuccess}>LoginSuccess</button>
      <span data-testid="login-redirect">{redirectTo || ''}</span>
    </div>
  ),
}));

vi.mock('../src/Components/Signup_And_Login/Signup', () => ({
  __esModule: true,
  default: ({ onSignupSuccess }) => (
    <div>
      <button data-testid="signup-success" onClick={onSignupSuccess}>SignupSuccess</button>
    </div>
  ),
}));

vi.mock('../src/Components/Signup_And_Login/ForgotPassword', () => ({
  __esModule: true,
  default: ({ onBackToLogin }) => (
    <div>
      <button data-testid="forgot-back" onClick={onBackToLogin}>BackToLogin</button>
    </div>
  ),
}));

// Import component under test after mocks
import Authentication from '../../../../src/Components/Signup_And_Login/Authentication.jsx';

describe('Authentication component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // reset locationState default
    locationState = { state: {} };
  });

  // Ensure DOM is cleaned between tests to avoid duplicate nodes
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders Login by default and passes redirectTo prop', () => {
    locationState = { state: { redirectTo: '/custom' } };
    render(<Authentication />);

    // Login mock shows redirect prop in span
    expect(screen.getByTestId('login-redirect').textContent).toBe('/custom');
    // Settings should render
    expect(screen.getByTestId('mock-settings')).not.toBeNull();
  });

  it('navigates to redirectTo on login success', () => {
    locationState = { state: { redirectTo: '/somewhere' } };
    render(<Authentication />);

    // Trigger login success
    fireEvent.click(screen.getByTestId('login-success'));
    expect(mockNavigate).toHaveBeenCalledWith('/somewhere');
  });

  it('navigates to /sidebar when no redirect provided', () => {
    locationState = { state: {} };
    render(<Authentication />);

    fireEvent.click(screen.getByTestId('login-success'));
    expect(mockNavigate).toHaveBeenCalledWith('/sidebar');
  });

  it('activates forgot password flow when child signals it', () => {
    render(<Authentication />);

    // click the mock 'Forgot' button
    fireEvent.click(screen.getByTestId('login-forgot'));

    // ForgotPassword mock should now be present
    expect(screen.getByTestId('forgot-back')).not.toBeNull();

    // clicking back should return to login
    fireEvent.click(screen.getByTestId('forgot-back'));
    expect(screen.getByTestId('login-success')).not.toBeNull();
  });

  it('switches to signup and back to login on signup success', () => {
    render(<Authentication />);

    // click Sign Up tab
    fireEvent.click(screen.getByText('Sign Up'));

    // signup mock visible
    expect(screen.getByTestId('signup-success')).not.toBeNull();

    // click signup success -> should return to login view
    fireEvent.click(screen.getByTestId('signup-success'));
    expect(screen.getByTestId('login-success')).not.toBeNull();
  });
});

describe('computeTabClass helper', () => {
  let computeTabClass;
  beforeAll(async () => {
    const mod = await import('../../../../src/Components/Signup_And_Login/Authentication.jsx');
    computeTabClass = mod.computeTabClass;
  });

  it('returns active class for login when forgot is active', () => {
    expect(computeTabClass('login', true, 'login')).toBe('bg-[#07843A] text-white rounded-md');
  });

  it('returns active class for the selected tab', () => {
    expect(computeTabClass('signup', false, 'signup')).toBe('bg-[#07843A] text-white rounded-md');
  });

  it('returns empty string for non-active tab', () => {
    expect(computeTabClass('login', false, 'signup')).toBe('');
  });
});
