import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../src/Components/Officer_profile/Dashboard.jsx';

// Mock the window.matchMedia function
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock the API module
const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock('../src/Components/User_Profile/api1.js', () => ({
  default: {
    get: mockGet,
    post: mockPost,
  },
}));

// Mock the components used in Dashboard
vi.mock('../src/Components/User_Profile/Header.jsx', () => ({
  default: () => <div data-testid="header">Header</div>
}));

vi.mock('../src/Components/HomePage/Settings.jsx', () => ({
  default: () => <div data-testid="settings">Settings</div>
}));

// Mock the react-icons
vi.mock('react-icons/ai', () => ({
  AiOutlineEye: () => <div data-testid="eye-icon">EyeIcon</div>,
  AiOutlineClose: () => <div data-testid="close-icon">CloseIcon</div>,
}));

describe('Dashboard Component', () => {
  const mockApplications = [
    {
      id: 1,
      full_name: 'John Doe',
      status: 'submitted',
      status_display: 'Submitted',
      subsidy_name: 'Farm Equipment Subsidy',
      submitted_at: '2023-01-01T12:00:00Z',
    },
    {
      id: 2,
      full_name: 'Jane Smith',
      status: 'approved',
      status_display: 'Approved',
      subsidy_name: 'Organic Farming Grant',
      submitted_at: '2023-01-02T12:00:00Z',
    },
  ];

  const mockApplicationDetail = {
    id: 1,
    applicant_name: 'John Doe',
    applicant_email: 'john@example.com',
    status: 'submitted',
    status_display: 'Submitted',
    subsidy_title: 'Farm Equipment Subsidy',
    submitted_at: '2023-01-01T12:00:00Z',
    document_status: 'pending',
    documents: [
      {
        id: 1,
        document_type: 'Aadhar Card',
        uploaded_at: '2023-01-01T12:00:00Z',
        file_url: 'http://example.com/doc1.pdf',
      },
    ],
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Mock the API responses
    mockGet.mockImplementation((url) => {
      if (url === '/subsidy/officer/dashboard/') {
        return Promise.resolve({ data: mockApplications });
      }
      if (url.includes('/subsidy/officer/applications/') && url.endsWith('/')) {
        return Promise.resolve({ data: mockApplicationDetail });
      }
      if (url.includes('/documents/')) {
        return Promise.resolve({ data: mockApplicationDetail.documents });
      }
      return Promise.reject(new Error('Not found'));
    });

    mockPost.mockImplementation((url) => {
      if (url.includes('/review/')) {
        return Promise.resolve({
          data: { status: 'under_review' }
        });
      }
      if (url.includes('/documents/verify/')) {
        return Promise.resolve({});
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  it('renders the dashboard with loading state', async () => {
    render(<Dashboard />);
    expect(screen.getByText('Loading applications…')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('Loading applications…')).not.toBeInTheDocument();
    });
  });

  it('displays the correct number of applications', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('filters applications by status', async () => {
    render(<Dashboard />);
    
    // Wait for applications to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click on 'Approved' filter
    fireEvent.click(screen.getByText('Approved'));
    
    // Only Jane's application should be visible (approved)
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('opens application details modal when view button is clicked', async () => {
    render(<Dashboard />);
    
    // Wait for applications to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click on view button for the first application
    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);

    // Check if modal is opened with correct content
    await waitFor(() => {
      expect(screen.getByText('Application Details')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  it('allows changing application status', async () => {
    render(<Dashboard />);
    
    // Wait for applications to load and open details
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByText('Application Details')).toBeInTheDocument();
    });

    // Click on 'Mark Under Review' button
    fireEvent.click(screen.getByText('Mark Under Review'));

    // Verify API was called with correct parameters
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        '/subsidy/officer/review/1/',
        {
          status: 'Under Review',
          officer_comment: '',
        }
      );
    });
  });

  it('handles document verification', async () => {
    render(<Dashboard />);
    
    // Open application details
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);

    // Wait for modal to open and documents to load
    await waitFor(() => {
      expect(screen.getByText('Aadhar Card')).toBeInTheDocument();
    });

    // Click on 'Mark Documents Verified' button
    fireEvent.click(screen.getByText('Mark Documents Verified'));

    // Verify API was called with correct parameters
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        '/subsidy/officer/applications/1/documents/verify/',
        { verified: true }
      );
    });
  });

  it('displays error message when API call fails', async () => {
    // Mock a failed API call
    mockGet.mockRejectedValueOnce(new Error('Network error'));

    render(<Dashboard />);
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Unable to load applications.')).toBeInTheDocument();
    });
  });

  it('closes the modal when close button is clicked', async () => {
    render(<Dashboard />);
    
    // Open the modal
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);

    // Verify modal is open
    await waitFor(() => {
      expect(screen.getByText('Application Details')).toBeInTheDocument();
    });

    // Click close button
    fireEvent.click(screen.getByTestId('close-icon').closest('button'));

    // Verify modal is closed
    await waitFor(() => {
      expect(screen.queryByText('Application Details')).not.toBeInTheDocument();
    });
  });
});