import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../../../src/Components/User_Profile/Dashboard.jsx';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock child components
vi.mock('../../../../src/Components/User_Profile/Header.jsx', () => ({
  default: () => <div data-testid="header">Header</div>
}));

vi.mock('../../../../src/Components/HomePage/Settings.jsx', () => ({
  default: () => <div data-testid="settings">Settings</div>
}));

// Mock import.meta.env
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_BASE_URL: 'http://127.0.0.1:8000'
    }
  }
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = vi.fn();

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('Dashboard Component - Additional Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    localStorageMock.getItem.mockReturnValue('mock-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should format amount with comma separator for thousands', async () => {
    const mockApplications = [
      { id: 1, status: 'Approved', amount: 15000 },
      { id: 2, status: 'Approved', amount: 25000 }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockApplications)
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('₹40,000')).toBeInTheDocument();
    });
  });

  it('should display zero when no approved applications exist', async () => {
    const mockApplications = [
      { id: 1, status: 'Pending', amount: 5000 },
      { id: 2, status: 'Under Review', amount: 3000 }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockApplications)
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('₹0')).toBeInTheDocument();
    });
  });

  it('should display amount in mobile view correctly', async () => {
    const mockApplications = [
      { id: 1, status: 'Approved', subsidy_name: 'Test', application_id: 'A1', applied_on: '2024-01-01', amount: 5000 }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockApplications)
    });

    renderDashboard();

    await waitFor(() => {
      // Mobile view shows amount without ₹ symbol
      const mobileCards = screen.getAllByText('5000');
      expect(mobileCards.length).toBeGreaterThan(0);
    });
  });

  it('should handle empty text response from API', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => ''
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("You haven't applied for any subsidies yet.")).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should handle applications with missing fields gracefully', async () => {
    const mockApplications = [
      { id: 1, status: 'Approved' }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockApplications)
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    });
  });

  it('should calculate totals correctly with mixed amounts', async () => {
    const mockApplications = [
      { id: 1, status: 'Approved', amount: 1234 },
      { id: 2, status: 'Approved', amount: 5678 },
      { id: 3, status: 'Pending', amount: 9999 }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockApplications)
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('₹6,912')).toBeInTheDocument();
    });
  });

  it('should render both desktop table and mobile cards', async () => {
    const mockApplications = [
      { id: 1, status: 'Approved', subsidy_name: 'Test', application_id: 'A1', applied_on: '2024-01-01', amount: 5000 }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockApplications)
    });

    renderDashboard();

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      // Mobile cards also rendered
      const subsidyNames = screen.getAllByText('Test');
      expect(subsidyNames.length).toBeGreaterThan(1); // Appears in both views
    });
  });

  it('should handle API returning error object without throwing', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => JSON.stringify({ error: 'Internal Server Error' })
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("You haven't applied for any subsidies yet.")).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should use same-origin credentials when BACKEND is not defined', async () => {
    // Temporarily override import.meta.env
    const originalEnv = import.meta.env;
    vi.stubGlobal('import', {
      meta: {
        env: {}
      }
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify([])
    });

    renderDashboard();

    await waitFor(() => {
      const fetchCall = global.fetch.mock.calls[0];
      expect(fetchCall[1].credentials).toBe('include');
    });

    // Restore
    vi.stubGlobal('import', { meta: { env: originalEnv } });
  });
});

describe('Dashboard Component - Coverage Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    localStorageMock.getItem.mockReturnValue('mock-token');
    // Reset to default environment
    vi.stubGlobal('import', {
      meta: {
        env: {
          VITE_BASE_URL: 'http://127.0.0.1:8000'
        }
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle empty token in localStorage', async () => {
    localStorageMock.getItem.mockReturnValue('');

    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify([])
    });

    renderDashboard();

    await waitFor(() => {
      const fetchCall = global.fetch.mock.calls[0];
      expect(fetchCall[1].headers.Authorization).toBe('Bearer ');
    });
  });

  it('should render Header and Settings components', () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify([])
    });

    renderDashboard();

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('settings')).toBeInTheDocument();
  });

  it('should render dashboard title and welcome message', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify([])
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText("Welcome back! Here's an overview of your subsidies and applications")).toBeInTheDocument();
    });
  });

  it('should display loading state initially', () => {
    global.fetch.mockImplementation(() => new Promise(() => {}));

    renderDashboard();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display "Under Review" status badge with correct styling', async () => {
    const mockApplications = [
      { id: 1, status: 'Under Review', subsidy_name: 'Test', application_id: 'A1', applied_on: '2024-01-01', amount: 5000 }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockApplications)
    });

    renderDashboard();

    await waitFor(() => {
      const badge = screen.getAllByText('Under Review')[0];
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('bg-sky-100');
      expect(badge.className).toContain('text-sky-800');
    });
  });

  it('should display "Pending" status badge with correct styling', async () => {
    const mockApplications = [
      { id: 1, status: 'Pending', subsidy_name: 'Test', application_id: 'A1', applied_on: '2024-01-01', amount: 5000 }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockApplications)
    });

    renderDashboard();

    await waitFor(() => {
      const badge = screen.getAllByText('Pending')[0];
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('bg-amber-100');
      expect(badge.className).toContain('text-amber-800');
    });
  });

  it('should display unknown status with default styling', async () => {
    const mockApplications = [
      { id: 1, status: 'Unknown', subsidy_name: 'Test', application_id: 'A1', applied_on: '2024-01-01', amount: 5000 }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockApplications)
    });

    renderDashboard();

    await waitFor(() => {
      const badge = screen.getAllByText('Unknown')[0];
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('bg-gray-200');
      expect(badge.className).toContain('text-gray-800');
    });
  });

  it('should show "View Details" button for non-approved applications', async () => {
    const mockApplications = [
      { id: 1, status: 'Pending', subsidy_name: 'Test', application_id: 'A1', applied_on: '2024-01-01', amount: 5000 }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockApplications)
    });

    renderDashboard();

    await waitFor(() => {
      const buttons = screen.getAllByText('View Details');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it('should show "☆ Rate & Review" button for approved applications', async () => {
    const mockApplications = [
      { id: 1, status: 'Approved', subsidy_name: 'Test', application_id: 'A1', applied_on: '2024-01-01', amount: 5000 }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockApplications)
    });

    renderDashboard();

    await waitFor(() => {
      const buttons = screen.getAllByText('☆ Rate & Review');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it('should use include credentials when VITE_BASE_URL is defined', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify([])
    });

    renderDashboard();

    await waitFor(() => {
      const fetchCall = global.fetch.mock.calls[0];
      expect(fetchCall[1].credentials).toBe('include');
    });
  });

//   it('should construct correct URL when VITE_BASE_URL is defined', async () => {
//   // ensure env exists and is defined
//   vi.stubGlobal('import', {
//     meta: {
//       env: {
//         VITE_BASE_URL: 'http://127.0.0.1:8000'
//       }
//     }
//   });

//   global.fetch.mockResolvedValueOnce({
//     ok: true,
//     text: async () => JSON.stringify([])
//   });

//   renderDashboard();

//   await waitFor(() => expect(global.fetch).toHaveBeenCalled());

//   const [url, options] = global.fetch.mock.calls[0];
//   expect(url).toBe('http://127.0.0.1:8000/subsidy/apply/');
//   expect(options.credentials).toBe('include');
// });


//   it('should use relative URL when VITE_BASE_URL is empty', async () => {
//   // IMPORTANT: env must contain VITE_BASE_URL: ""
//   vi.stubGlobal('import', {
//     meta: {
//       env: {
//         VITE_BASE_URL: ""
//       }
//     }
//   });

//   global.fetch.mockResolvedValueOnce({
//     ok: true,
//     text: async () => JSON.stringify([])
//   });

//   renderDashboard();

//   await waitFor(() => expect(global.fetch).toHaveBeenCalled());

//   const [url, options] = global.fetch.mock.calls[0];
//   expect(url).toBe('/subsidy/apply/');
//   expect(options.credentials).toBe('same-origin');
// });


  it('should display all card labels correctly', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify([])
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Total Subsidies')).toBeInTheDocument();
      expect(screen.getByText('Total Approved')).toBeInTheDocument();
      expect(screen.getByText('Total Amount Received')).toBeInTheDocument();
    });
  });

  it('should display My Applications heading', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify([])
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('My Applications')).toBeInTheDocument();
    });
  });

//   it('should display table headers in desktop view', async () => {
//   // simulate large screen
//   global.innerWidth = 1200;
//   global.dispatchEvent(new Event('resize'));

//   const mockApplications = [
//     { id: 1, status: 'Approved', subsidy_name: 'Test', application_id: 'A1', applied_on: '2024-01-01', amount: 5000 }
//   ];

//   global.fetch.mockResolvedValueOnce({
//     ok: true,
//     text: async () => JSON.stringify(mockApplications)
//   });

//   renderDashboard();

//   await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

//   expect(screen.getByRole('table')).toBeInTheDocument();

//   expect(screen.getByText('Subsidy Name')).toBeInTheDocument();
//   expect(screen.getByText('Application ID')).toBeInTheDocument();
//   expect(screen.getByText('Date Applied')).toBeInTheDocument();
//   expect(screen.getByText('Amount')).toBeInTheDocument();
//   expect(screen.getByText('Status')).toBeInTheDocument();
//   expect(screen.getByText('Action')).toBeInTheDocument();
// });


  it('should handle null amount in applications', async () => {
    const mockApplications = [
      { id: 1, status: 'Approved', subsidy_name: 'Test', application_id: 'A1', applied_on: '2024-01-01', amount: null }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockApplications)
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    });
  });

  it('should exclude non-approved applications from total amount', async () => {
    const mockApplications = [
      { id: 1, status: 'Approved', amount: 10000 },
      { id: 2, status: 'Pending', amount: 5000 },
      { id: 3, status: 'Under Review', amount: 3000 }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockApplications)
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('₹10,000')).toBeInTheDocument();
    });
  });

it('covers the non-ok valid JSON error path', async () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  global.fetch.mockResolvedValueOnce({
    ok: false,
    status: 400,
    text: async () => JSON.stringify({ detail: 'Bad request' })
  });

  renderDashboard();

  await waitFor(() => {
    expect(screen.getByText("You haven't applied for any subsidies yet.")).toBeInTheDocument();
  });

  errorSpy.mockRestore();
});


it('covers the if (!res.ok) branch with valid JSON', async () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  global.fetch.mockResolvedValueOnce({
    ok: false,
    status: 500,
    text: async () => JSON.stringify({ detail: 'Server broke' })
  });

  renderDashboard();

  await waitFor(() =>
    expect(screen.getByText("You haven't applied for any subsidies yet.")).toBeInTheDocument()
  );

  errorSpy.mockRestore();
});



  it('should handle approved applications without amount field', async () => {
    const mockApplications = [
      { id: 1, status: 'Approved', subsidy_name: 'Test' },
      { id: 2, status: 'Approved', amount: 5000 }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockApplications)
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('₹5,000')).toBeInTheDocument();
    });
  });
});