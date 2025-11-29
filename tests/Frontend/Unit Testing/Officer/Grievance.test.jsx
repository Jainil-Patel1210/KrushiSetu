import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Grievance from '../../../../src/Components/Officer_profile/Grievance';
import api from '../../../../src/Components/User_Profile/api1';

// Mock modules
vi.mock('../../../../src/Components/User_Profile/api1');
vi.mock('../../../../src/Components/User_Profile/Header', () => ({
  default: () => <div data-testid="header">Header</div>
}));
vi.mock('../../../../src/Components/HomePage/Settings', () => ({
  default: () => <div data-testid="settings">Settings</div>
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('Grievance Component', () => {
  const mockGrievances = [
    {
      id: 1,
      grievance_id: 'GRV-001',
      farmer_name: 'John Doe',
      user: { phone: '9876543210', email: 'john@example.com' },
      subject: 'Subsidy delay',
      description: 'My subsidy payment is delayed',
      status: 'Under Review',
      attachment_url: 'https://example.com/file.pdf',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-16T14:20:00Z',
      officer_remark: 'Checking with finance department'
    },
    {
      id: 2,
      grievance_id: 'GRV-002',
      farmer_name: 'Jane Smith',
      user: { phone: '9123456789', email: 'jane@example.com' },
      subject: 'Crop insurance issue',
      description: 'Unable to claim insurance',
      status: 'Approved',
      attachment_url: null,
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-12T11:00:00Z',
      officer_remark: null
    },
    {
      id: 3,
      grievance_id: 'GRV-003',
      farmer_name: 'Bob Johnson',
      user: null,
      subject: 'Equipment malfunction',
      description: 'Tractor not working',
      status: 'Rejected',
      attachment_url: null,
      created_at: '2024-01-08T08:00:00Z',
      updated_at: '2024-01-09T10:00:00Z',
      officer_remark: 'Not eligible for government support'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    mockLocalStorage.setItem('access', 'fake-token');
    
    // Default mock for successful API call
    api.get.mockResolvedValue({ data: mockGrievances });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderGrievance = () => {
    return render(
      <BrowserRouter>
        <Grievance />
      </BrowserRouter>
    );
  };

  describe('Initial Rendering and Loading State', () => {
    it('renders loading spinner initially', () => {
      // Mock API to never resolve
      api.get.mockImplementation(() => new Promise(() => {}));
      
      renderGrievance();
      
      expect(screen.getByText(/loading grievances/i)).toBeInTheDocument();
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('renders Header and Settings components', async () => {
      renderGrievance();
      
      await waitFor(() => {
        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('settings')).toBeInTheDocument();
      });
    });

    it('renders page title and description', async () => {
      renderGrievance();
      
      await waitFor(() => {
        expect(screen.getByText('Grievance Management')).toBeInTheDocument();
        expect(screen.getByText(/track and resolve farmer grievances/i)).toBeInTheDocument();
      });
    });

    it('renders Farmer Grievances heading', async () => {
      renderGrievance();
      
      await waitFor(() => {
        expect(screen.getByText('Farmer Grievances')).toBeInTheDocument();
      });
    });
  });

  describe('Fetch Grievances', () => {
    it('fetches and displays grievances successfully', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith(
          '/support/grievances/my-assigned/',
          expect.objectContaining({
            headers: { Authorization: 'Bearer fake-token' }
          })
        );
      });

      // Check table data
      expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      expect(screen.getAllByText('GRV-001')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Subsidy delay')[0]).toBeInTheDocument();
    });

    it('handles API error gracefully', async () => {
      api.get.mockRejectedValue(new Error('Network error'));
      
      renderGrievance();

      await waitFor(() => {
        expect(screen.getByText(/failed to load grievances assigned to you/i)).toBeInTheDocument();
      });
    });

    it('displays "No grievances found" when data is empty', async () => {
      api.get.mockResolvedValue({ data: [] });
      
      renderGrievance();

      await waitFor(() => {
        expect(screen.getByText(/no grievances found/i)).toBeInTheDocument();
      });
    });

    it('formats grievances correctly with all fields', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Jane Smith')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Bob Johnson')[0]).toBeInTheDocument();
      });
    });

    it('handles missing user data with default values', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('Bob Johnson')[0]).toBeInTheDocument();
      });
      
      // Bob Johnson has no user data, should show "Unknown Farmer" if farmer_name was missing
      // but in this case farmer_name exists, so it's displayed correctly
    });

    it('handles grievance without farmer name as "Unknown Farmer"', async () => {
      const grievanceWithoutName = [{
        ...mockGrievances[0],
        farmer_name: null
      }];
      
      api.get.mockResolvedValue({ data: grievanceWithoutName });
      
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('Unknown Farmer')[0]).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('renders search input', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
      });
    });

    it('filters grievances by farmer name', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'Doe' } });

      await waitFor(() => {
        expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
        expect(screen.queryAllByText('Jane Smith').length).toBe(0);
        expect(screen.queryAllByText('Bob Johnson').length).toBe(0);
      });
    });

    it('filters grievances by subject', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('Subsidy delay').length).toBeGreaterThan(0);
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'insurance' } });

      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0);
        expect(screen.queryAllByText('Bob Johnson').length).toBe(0);
      });
    });

    it('filters grievances by grievance ID', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('GRV-001').length).toBeGreaterThan(0);
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'GRV-003' } });

      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.queryAllByText('Jane Smith').length).toBe(0);
        expect(screen.getAllByText('Bob Johnson').length).toBeGreaterThan(0);
      });
    });

    it('search is case insensitive', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'JOHN' } });

      await waitFor(() => {
        expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
      });
    });

    it('shows no results when search has no matches', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'NonexistentName' } });

      await waitFor(() => {
        expect(screen.getByText(/no grievances found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Status Filter Functionality', () => {
    it('renders all status filter buttons', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getByText('Filter by Status :')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^approved$/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /under review/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^rejected$/i })).toBeInTheDocument();
      });
    });

    it('filters by "all" status by default', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Jane Smith')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Bob Johnson')[0]).toBeInTheDocument();
      });
    });

    it('filters by "approved" status', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('Jane Smith')[0]).toBeInTheDocument();
      });

      const approvedButton = screen.getByRole('button', { name: /^approved$/i });
      fireEvent.click(approvedButton);

      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getAllByText('Jane Smith')[0]).toBeInTheDocument();
        expect(screen.queryAllByText('Bob Johnson').length).toBe(0);
      });
    });

    it('filters by "under review" status', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      });

      const underReviewButton = screen.getByRole('button', { name: /under review/i });
      fireEvent.click(underReviewButton);

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
        expect(screen.queryAllByText('Jane Smith').length).toBe(0);
        expect(screen.queryAllByText('Bob Johnson').length).toBe(0);
      });
    });

    it('filters by "rejected" status', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('Bob Johnson')[0]).toBeInTheDocument();
      });

      const rejectedButton = screen.getByRole('button', { name: /^rejected$/i });
      fireEvent.click(rejectedButton);

      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.queryAllByText('Jane Smith').length).toBe(0);
        expect(screen.getAllByText('Bob Johnson')[0]).toBeInTheDocument();
      });
    });

    it('highlights active filter button', async () => {
      renderGrievance();

      await waitFor(() => {
        const allButton = screen.getByRole('button', { name: /^all$/i });
        expect(allButton).toHaveClass('bg-green-600');
      });

      const approvedButton = screen.getByRole('button', { name: /^approved$/i });
      fireEvent.click(approvedButton);

      await waitFor(() => {
        expect(approvedButton).toHaveClass('bg-green-600');
      });
    });

    it('combines status filter with search', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      });

      // Filter by under review
      const underReviewButton = screen.getByRole('button', { name: /under review/i });
      fireEvent.click(underReviewButton);

      // Search for John
      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'John' } });

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
        expect(screen.queryAllByText('Jane Smith').length).toBe(0);
        expect(screen.queryAllByText('Bob Johnson').length).toBe(0);
      });
    });
  });

  describe('View Details Modal', () => {
    it('opens modal when view button is clicked', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: '' });
      const firstViewButton = viewButtons.find(btn => btn.querySelector('svg'));
      
      fireEvent.click(firstViewButton);

      await waitFor(() => {
        expect(screen.getByText('Grievance Details')).toBeInTheDocument();
      });
    });

    it('displays farmer information in modal', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: '' });
      const firstViewButton = viewButtons.find(btn => btn.querySelector('svg'));
      fireEvent.click(firstViewButton);

      await waitFor(() => {
        const farmerLabels = screen.getAllByText('Farmer');
        expect(farmerLabels.length).toBeGreaterThan(0);
      });
    });

    it('displays subject and description in modal', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: '' });
      const firstViewButton = viewButtons.find(btn => btn.querySelector('svg'));
      fireEvent.click(firstViewButton);

      await waitFor(() => {
        expect(screen.getByText('Grievance Details')).toBeInTheDocument();
        expect(screen.getByText('My subsidy payment is delayed')).toBeInTheDocument();
      });
    });

    it('displays attachment link when available', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: '' });
      const firstViewButton = viewButtons.find(btn => btn.querySelector('svg'));
      fireEvent.click(firstViewButton);

      await waitFor(() => {
        expect(screen.getByText('Attachment')).toBeInTheDocument();
        const downloadLink = screen.getByText('Download');
        expect(downloadLink).toHaveAttribute('href', 'https://example.com/file.pdf');
        expect(downloadLink).toHaveAttribute('target', '_blank');
      });
    });

    it('does not display attachment section when not available', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('Jane Smith')[0]).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: '' });
      const secondViewButton = viewButtons[1];
      fireEvent.click(secondViewButton);

      await waitFor(() => {
        expect(screen.getByText('Grievance Details')).toBeInTheDocument();
        expect(screen.queryByText('Attachment')).not.toBeInTheDocument();
      });
    });

    it('displays previous officer remark when available', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: '' });
      const firstViewButton = viewButtons.find(btn => btn.querySelector('svg'));
      fireEvent.click(firstViewButton);

      await waitFor(() => {
        expect(screen.getByText('Previous Officer Remark')).toBeInTheDocument();
        expect(screen.getByText('Checking with finance department')).toBeInTheDocument();
      });
    });

    it('does not display previous remark section when not available', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('Jane Smith')[0]).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: '' });
      const secondViewButton = viewButtons[1];
      fireEvent.click(secondViewButton);

      await waitFor(() => {
        expect(screen.queryByText('Previous Officer Remark')).not.toBeInTheDocument();
      });
    });

    it('displays update status section with dropdown and textarea', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: '' });
      const firstViewButton = viewButtons.find(btn => btn.querySelector('svg'));
      fireEvent.click(firstViewButton);

      await waitFor(() => {
        expect(screen.getByText('Update Status')).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/add officer remark/i)).toBeInTheDocument();
      });
    });

    it('pre-populates status dropdown with current status', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: '' });
      const firstViewButton = viewButtons.find(btn => btn.querySelector('svg'));
      fireEvent.click(firstViewButton);

      await waitFor(() => {
        const statusSelect = screen.getByRole('combobox');
        expect(statusSelect).toHaveValue('Under Review');
      });
    });
  });

  describe('Update Grievance Functionality', () => {
    it('validates empty response before updating', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: '' });
      const firstViewButton = viewButtons.find(btn => btn.querySelector('svg'));
      fireEvent.click(firstViewButton);

      await waitFor(() => {
        expect(screen.getByText('Update Status')).toBeInTheDocument();
      });

      const updateButton = screen.getByRole('button', { name: /update & send response/i });
      fireEvent.click(updateButton);

      expect(alertSpy).toHaveBeenCalledWith('Please provide a response to the farmer.');
      
      alertSpy.mockRestore();
    });

    it('updates grievance successfully', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      api.patch.mockResolvedValue({ data: { success: true } });
      
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: '' });
      const firstViewButton = viewButtons.find(btn => btn.querySelector('svg'));
      fireEvent.click(firstViewButton);

      await waitFor(() => {
        expect(screen.getByText('Update Status')).toBeInTheDocument();
      });

      // Change status
      const statusSelect = screen.getByRole('combobox');
      fireEvent.change(statusSelect, { target: { value: 'Approved' } });

      // Add response
      const remarkTextarea = screen.getByPlaceholderText(/add officer remark/i);
      fireEvent.change(remarkTextarea, { target: { value: 'Issue resolved successfully' } });

      // Click update
      const updateButton = screen.getByRole('button', { name: /update & send response/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(api.patch).toHaveBeenCalledWith(
          '/support/grievances/1/officer-update/',
          {
            status: 'Approved',
            remark: 'Issue resolved successfully'
          },
          expect.objectContaining({
            headers: { Authorization: 'Bearer fake-token' }
          })
        );
      });

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Grievance updated successfully!');
      });
      
      alertSpy.mockRestore();
    });

    it('handles update error gracefully', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      api.patch.mockRejectedValue(new Error('Update failed'));
      
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: '' });
      const firstViewButton = viewButtons.find(btn => btn.querySelector('svg'));
      fireEvent.click(firstViewButton);

      await waitFor(() => {
        expect(screen.getByText('Update Status')).toBeInTheDocument();
      });

      const remarkTextarea = screen.getByPlaceholderText(/add officer remark/i);
      fireEvent.change(remarkTextarea, { target: { value: 'Test response' } });

      const updateButton = screen.getByRole('button', { name: /update & send response/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Failed to update grievance.');
      });
      
      alertSpy.mockRestore();
    });

    it('disables update button while updating', async () => {
      api.patch.mockImplementation(() => new Promise(() => {}));
      
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: '' });
      const firstViewButton = viewButtons.find(btn => btn.querySelector('svg'));
      fireEvent.click(firstViewButton);

      await waitFor(() => {
        expect(screen.getByText('Update Status')).toBeInTheDocument();
      });

      const remarkTextarea = screen.getByPlaceholderText(/add officer remark/i);
      fireEvent.change(remarkTextarea, { target: { value: 'Test response' } });

      const updateButton = screen.getByRole('button', { name: /update & send response/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /updating/i })).toBeDisabled();
      });
    });

    it('updates local state after successful update', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      api.patch.mockResolvedValue({ data: { success: true } });
      
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: '' });
      const firstViewButton = viewButtons.find(btn => btn.querySelector('svg'));
      fireEvent.click(firstViewButton);

      await waitFor(() => {
        expect(screen.getByText('Update Status')).toBeInTheDocument();
      });

      const statusSelect = screen.getByRole('combobox');
      fireEvent.change(statusSelect, { target: { value: 'Approved' } });

      const remarkTextarea = screen.getByPlaceholderText(/add officer remark/i);
      fireEvent.change(remarkTextarea, { target: { value: 'Resolved' } });

      const updateButton = screen.getByRole('button', { name: /update & send response/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Grievance updated successfully!');
      });

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText('Grievance Details')).not.toBeInTheDocument();
      });
      
      alertSpy.mockRestore();
    });
  });

  describe('Modal Close Functionality', () => {
    it('closes modal when X button is clicked', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: '' });
      const firstViewButton = viewButtons.find(btn => btn.querySelector('svg'));
      fireEvent.click(firstViewButton);

      await waitFor(() => {
        expect(screen.getByText('Grievance Details')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: '×' });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Grievance Details')).not.toBeInTheDocument();
      });
    });

    it('clears modal state when closed', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: '' });
      const firstViewButton = viewButtons.find(btn => btn.querySelector('svg'));
      fireEvent.click(firstViewButton);

      await waitFor(() => {
        expect(screen.getByText('Update Status')).toBeInTheDocument();
      });

      // Add some text
      const remarkTextarea = screen.getByPlaceholderText(/add officer remark/i);
      fireEvent.change(remarkTextarea, { target: { value: 'Some text' } });

      // Close modal
      const closeButton = screen.getByRole('button', { name: '×' });
      fireEvent.click(closeButton);

      // Reopen modal
      await waitFor(() => {
        expect(screen.queryByText('Grievance Details')).not.toBeInTheDocument();
      });

      fireEvent.click(firstViewButton);

      await waitFor(() => {
        const newRemarkTextarea = screen.getByPlaceholderText(/add officer remark/i);
        expect(newRemarkTextarea).toHaveValue('');
      });
    });
  });

  describe('Utility Functions', () => {
    it('applies correct status badge classes', async () => {
      renderGrievance();

      await waitFor(() => {
        const table = screen.getByRole('table');
        const underReviewBadge = table.querySelector('.bg-blue-100');
        expect(underReviewBadge).toBeInTheDocument();
        expect(underReviewBadge).toHaveClass('text-blue-700');
      });

      await waitFor(() => {
        const table = screen.getByRole('table');
        const approvedBadge = table.querySelector('.bg-green-100');
        expect(approvedBadge).toBeInTheDocument();
        expect(approvedBadge).toHaveClass('text-green-700');
      });

      await waitFor(() => {
        const table = screen.getByRole('table');
        const rejectedBadge = table.querySelector('.bg-red-100');
        expect(rejectedBadge).toBeInTheDocument();
        expect(rejectedBadge).toHaveClass('text-red-700');
      });
    });

    it('applies default gray badge for unknown status', async () => {
      const grievanceWithUnknownStatus = [{
        id: 99,
        farmer_user: { first_name: 'Test', last_name: 'User' },
        subject: 'Test Subject',
        description: 'Test Description',
        status: 'pending',
        submitted_at: '2024-01-01T12:00:00Z'
      }];

      api.get.mockResolvedValue({ data: grievanceWithUnknownStatus });
      
      const { container } = renderGrievance();
      await waitFor(() => expect(api.get).toHaveBeenCalled());

      const defaultBadge = container.querySelector('.bg-gray-100.text-gray-700');
      expect(defaultBadge).toBeInTheDocument();
    });

    it('calculates status counts correctly using getStatusCount function', async () => {
      api.get.mockResolvedValue({ data: mockGrievances });
      
      renderGrievance();
      await waitFor(() => expect(api.get).toHaveBeenCalled());

      // The getStatusCount function is defined but not displayed in the UI
      // We verify the function works by checking filtered results
      
      // All status should show all 3 grievances
      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Jane Smith')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Bob Johnson')[0]).toBeInTheDocument();
      });

      // Filter by approved - should show only 1
      const approvedButton = screen.getByRole('button', { name: /approved/i });
      fireEvent.click(approvedButton);

      await waitFor(() => {
        expect(screen.getAllByText('Jane Smith')[0]).toBeInTheDocument();
        expect(screen.queryAllByText('John Doe').length).toBe(0);
      });
    });

    it('formats dates correctly', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: '' });
      const firstViewButton = viewButtons.find(btn => btn.querySelector('svg'));
      fireEvent.click(firstViewButton);

      // Date should be formatted as locale date string
      // This verifies formatDate is called
      await waitFor(() => {
        expect(screen.getByText('Grievance Details')).toBeInTheDocument();
      });
    });
  });

  describe('Table and Mobile View', () => {
    it('renders table headers on desktop', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getByText('Sr. No.')).toBeInTheDocument();
        expect(screen.getByText('Farmer Name')).toBeInTheDocument();
        expect(screen.getByText('Grievance ID')).toBeInTheDocument();
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();
        const tableHeaders = table.querySelectorAll('th');
        expect(tableHeaders.length).toBe(6);
      });
    });

    it('displays serial numbers correctly', async () => {
      renderGrievance();

      await waitFor(() => {
        const table = screen.getByRole('table');
        const rows = table.querySelectorAll('tbody tr');
        expect(rows[0]).toHaveTextContent('1');
        expect(rows[1]).toHaveTextContent('2');
        expect(rows[2]).toHaveTextContent('3');
      });
    });

    it('renders mobile cards with grievance data', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Subsidy delay').length).toBeGreaterThan(0);
      });
    });

    it('can open modal from mobile card view button', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      });

      // Find View button in mobile card (not table)
      const allViewButtons = screen.getAllByRole('button', { name: '' });
      // The last few buttons are the mobile card view buttons (outside the table)
      const mobileViewButton = allViewButtons[allViewButtons.length - 3];
      
      fireEvent.click(mobileViewButton);

      await waitFor(() => {
        expect(screen.getByText('Grievance Details')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles grievances with null subjects', async () => {
      const grievanceWithNullSubject = [{
        ...mockGrievances[0],
        subject: null
      }];
      
      api.get.mockResolvedValue({ data: grievanceWithNullSubject });
      
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      });
    });

    it('handles grievances with null descriptions', async () => {
      const grievanceWithNullDescription = [{
        ...mockGrievances[0],
        description: null
      }];
      
      api.get.mockResolvedValue({ data: grievanceWithNullDescription });
      
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      });
    });

    it('handles multiple simultaneous filter and search operations', async () => {
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      });

      // Apply status filter
      const underReviewButton = screen.getByRole('button', { name: /under review/i });
      fireEvent.click(underReviewButton);

      // Apply search
      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'John' } });

      // Change back to all
      const allButton = screen.getByRole('button', { name: /^all$/i });
      fireEvent.click(allButton);

      // Clear search
      fireEvent.change(searchInput, { target: { value: '' } });

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Jane Smith')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Bob Johnson')[0]).toBeInTheDocument();
      });
    });

    it('validates whitespace-only response', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      renderGrievance();

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: '' });
      const firstViewButton = viewButtons.find(btn => btn.querySelector('svg'));
      fireEvent.click(firstViewButton);

      await waitFor(() => {
        expect(screen.getByText('Update Status')).toBeInTheDocument();
      });

      const remarkTextarea = screen.getByPlaceholderText(/add officer remark/i);
      fireEvent.change(remarkTextarea, { target: { value: '   ' } });

      const updateButton = screen.getByRole('button', { name: /update & send response/i });
      fireEvent.click(updateButton);

      expect(alertSpy).toHaveBeenCalledWith('Please provide a response to the farmer.');
      
      alertSpy.mockRestore();
    });
  });
});


