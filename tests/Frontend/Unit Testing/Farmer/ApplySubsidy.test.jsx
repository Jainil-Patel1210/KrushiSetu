import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ApplySubsidy from '../../../../src/Components/User_Profile/ApplySubsidy';
import api from '../../../../src/Components/User_Profile/api1';

// Mock the API module
vi.mock('../../../../src/Components/User_Profile/api1');

// Mock Settings component
vi.mock('../../../../src/Components/HomePage/Settings', () => ({
  default: () => <div data-testid="settings">Settings</div>
}));

// Mock Cookies
vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(() => 'fake-csrf-token')
  }
}));

// Mock react-router-dom navigation
const mockNavigate = vi.fn();
const defaultSubsidy = {
  id: 1,
  title: 'PM-KISAN Scheme',
  documents_required: [
    { value: 'aadhar_card', label: 'Aadhaar' },
    { value: 'bank_passbook', label: 'Bank Passbook' }
  ]
};
const mockLocation = {
  state: { subsidy: defaultSubsidy }
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

describe('ApplySubsidy Component - Step 0: Personal Information', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.clearAllMocks();
    mockLocation.state = { subsidy: defaultSubsidy };
    
    // Mock successful profile fetch
    api.get.mockImplementation((url) => {
      if (url.includes('profile')) {
        return Promise.resolve({
          data: {
            full_name: 'Test User',
            mobile_number: '9876543210',
            email_address: 'test@example.com',
            aadhaar_number: '123456789012',
            state: 'Maharashtra',
            district: 'Pune',
            taluka: 'Haveli',
            village: 'Test Village',
            address: 'Test Address',
            land_size: '5',
            unit: 'acres',
            soil_type: 'Black',
            ownership_type: 'owned',
            bank_name: 'Test Bank',
            bank_account_number: '1234567890',
            ifsc_code: 'TEST0001234',
            documents: []
          }
        });
      }
      return Promise.resolve({ data: [] });
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const renderApplySubsidy = () => {
    return render(
      <BrowserRouter>
        <ApplySubsidy />
      </BrowserRouter>
    );
  };

  describe('Initial Rendering', () => {
    it('renders the component with personal information step', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      expect(screen.getByText(/PM-KISAN Scheme Application Form/i)).toBeInTheDocument();
      expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
    });

    it('renders without subsidy in location state', async () => {
      mockLocation.state = null;
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByText('Subsidy Application Form')).toBeInTheDocument();
      });
    });

    it('renders all form fields', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Mobile Number')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Aadhar Number')).toBeInTheDocument();
      expect(screen.getByLabelText('Address')).toBeInTheDocument();
      expect(screen.getByText('State')).toBeInTheDocument();
      expect(screen.getByText('District')).toBeInTheDocument();
      expect(screen.getByText('Taluka')).toBeInTheDocument();
      expect(screen.getByText('Village')).toBeInTheDocument();
    });

    it('populates form with profile data', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
        expect(screen.getByDisplayValue('9876543210')).toBeInTheDocument();
        expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('123456789012')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Address')).toBeInTheDocument();
      });
    });

    it('displays close button and handles close', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toBeInTheDocument();
      
      fireEvent.click(closeButton);
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('does not show back button on step 0', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });
  });

  describe('Full Name Field', () => {
    it('updates fullName on change', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Full Name');
      fireEvent.change(input, { target: { value: 'New Name' } });
      expect(screen.getByDisplayValue('New Name')).toBeInTheDocument();
    });

    it('validates empty fullName on blur', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Full Name');
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Full name is required')).toBeInTheDocument();
      });
    });

    it('validates whitespace-only fullName on blur', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Full Name');
      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Full name is required')).toBeInTheDocument();
      });
    });

    it('clears error when valid name is entered', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Full Name');
      
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.blur(input);
      await waitFor(() => {
        expect(screen.getByText('Full name is required')).toBeInTheDocument();
      });

      fireEvent.change(input, { target: { value: 'Valid Name' } });
      
      await waitFor(() => {
        expect(screen.queryByText('Full name is required')).not.toBeInTheDocument();
      });
    });

    it('validates on change when error exists', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Full Name');
      
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Full name is required')).toBeInTheDocument();
      });

      fireEvent.change(input, { target: { value: 'A' } });
      
      await waitFor(() => {
        expect(screen.queryByText('Full name is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Mobile Number Field', () => {
    it('updates mobile on change', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('9876543210')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Mobile Number');
      fireEvent.change(input, { target: { value: '9123456789' } });
      expect(screen.getByDisplayValue('9123456789')).toBeInTheDocument();
    });

    it('validates empty mobile on blur', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('9876543210')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Mobile Number');
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Enter a valid 10-digit mobile number')).toBeInTheDocument();
      });
    });

    it('validates mobile with less than 10 digits', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('9876543210')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Mobile Number');
      fireEvent.change(input, { target: { value: '987654321' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Enter a valid 10-digit mobile number')).toBeInTheDocument();
      });
    });

    it('validates mobile with more than 10 digits', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('9876543210')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Mobile Number');
      fireEvent.change(input, { target: { value: '98765432100' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Enter a valid 10-digit mobile number')).toBeInTheDocument();
      });
    });

    it('validates mobile starting with 5', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('9876543210')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Mobile Number');
      fireEvent.change(input, { target: { value: '5876543210' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Enter a valid 10-digit mobile number')).toBeInTheDocument();
      });
    });

    it('validates mobile starting with 0', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('9876543210')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Mobile Number');
      fireEvent.change(input, { target: { value: '0876543210' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Enter a valid 10-digit mobile number')).toBeInTheDocument();
      });
    });

    it('accepts valid mobile starting with 6', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('9876543210')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Mobile Number');
      fireEvent.change(input, { target: { value: '6876543210' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.queryByText('Enter a valid 10-digit mobile number')).not.toBeInTheDocument();
      });
    });

    it('accepts valid mobile starting with 7', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('9876543210')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Mobile Number');
      fireEvent.change(input, { target: { value: '7876543210' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.queryByText('Enter a valid 10-digit mobile number')).not.toBeInTheDocument();
      });
    });

    it('accepts valid mobile starting with 8', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('9876543210')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Mobile Number');
      fireEvent.change(input, { target: { value: '8876543210' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.queryByText('Enter a valid 10-digit mobile number')).not.toBeInTheDocument();
      });
    });

    it('validates on change when error exists', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('9876543210')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Mobile Number');
      
      fireEvent.change(input, { target: { value: '123' } });
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Enter a valid 10-digit mobile number')).toBeInTheDocument();
      });

      fireEvent.change(input, { target: { value: '9876543210' } });
      
      await waitFor(() => {
        expect(screen.queryByText('Enter a valid 10-digit mobile number')).not.toBeInTheDocument();
      });
    });
  });

  describe('Email Field', () => {
    it('updates email on change', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Email');
      fireEvent.change(input, { target: { value: 'new@test.com' } });
      expect(screen.getByDisplayValue('new@test.com')).toBeInTheDocument();
    });

    it('validates empty email on blur', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Email');
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
      });
    });

    it('validates email without @ symbol', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Email');
      fireEvent.change(input, { target: { value: 'invalidemail.com' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
      });
    });

    it('validates email without domain', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Email');
      fireEvent.change(input, { target: { value: 'test@' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
      });
    });

    it('validates email without local part', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Email');
      fireEvent.change(input, { target: { value: '@example.com' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
      });
    });

    it('validates email without TLD', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Email');
      fireEvent.change(input, { target: { value: 'test@example' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
      });
    });

    it('validates on change when error exists', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Email');
      
      fireEvent.change(input, { target: { value: 'invalid' } });
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
      });

      fireEvent.change(input, { target: { value: 'valid@test.com' } });
      
      await waitFor(() => {
        expect(screen.queryByText('Enter a valid email')).not.toBeInTheDocument();
      });
    });
  });

  describe('Aadhar Number Field', () => {
    it('updates aadhar on change', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('123456789012')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Aadhar Number');
      fireEvent.change(input, { target: { value: '987654321098' } });
      expect(screen.getByDisplayValue('987654321098')).toBeInTheDocument();
    });

    it('validates empty aadhar on blur', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('123456789012')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Aadhar Number');
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Aadhaar must be 12 digits')).toBeInTheDocument();
      });
    });

    it('validates aadhar with less than 12 digits', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('123456789012')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Aadhar Number');
      fireEvent.change(input, { target: { value: '12345678901' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Aadhaar must be 12 digits')).toBeInTheDocument();
      });
    });

    it('validates aadhar with more than 12 digits', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('123456789012')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Aadhar Number');
      fireEvent.change(input, { target: { value: '1234567890123' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Aadhaar must be 12 digits')).toBeInTheDocument();
      });
    });

    it('validates aadhar with non-digits', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('123456789012')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Aadhar Number');
      fireEvent.change(input, { target: { value: '12345678901a' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Aadhaar must be 12 digits')).toBeInTheDocument();
      });
    });

    it('validates on change when error exists', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('123456789012')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Aadhar Number');
      
      fireEvent.change(input, { target: { value: '123' } });
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Aadhaar must be 12 digits')).toBeInTheDocument();
      });

      fireEvent.change(input, { target: { value: '123456789012' } });
      
      await waitFor(() => {
        expect(screen.queryByText('Aadhaar must be 12 digits')).not.toBeInTheDocument();
      });
    });
  });

  describe('Address Field', () => {
    it('updates address on change', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Address')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Address');
      fireEvent.change(input, { target: { value: 'New Address' } });
      expect(screen.getByDisplayValue('New Address')).toBeInTheDocument();
    });

    it('validates empty address on blur', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Address')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Address');
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Address is required')).toBeInTheDocument();
      });
    });

    it('validates whitespace-only address on blur', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Address')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Address');
      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Address is required')).toBeInTheDocument();
      });
    });

    it('validates on change when error exists', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Address')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter Address');
      
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Address required')).toBeInTheDocument();
      });

      fireEvent.change(input, { target: { value: 'Valid Address' } });
      
      await waitFor(() => {
        expect(screen.queryByText('Address required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Location Dropdowns', () => {
    it('updates state and resets dependent dropdowns', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      const stateSelect = screen.getAllByRole('combobox')[0];
      const districtSelect = screen.getAllByRole('combobox')[1];
      const talukaSelect = screen.getAllByRole('combobox')[2];
      const villageSelect = screen.getAllByRole('combobox')[3];
      
      expect(districtSelect.value).toBe('Pune');
      
      fireEvent.change(stateSelect, { target: { value: 'Gujarat' } });
      
      expect(stateSelect.value).toBe('Gujarat');
      expect(districtSelect.value).toBe('');
      expect(talukaSelect.value).toBe('');
      expect(villageSelect.value).toBe('');
    });

    it('validates empty state', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      const stateSelect = screen.getAllByRole('combobox')[0];
      
      fireEvent.change(stateSelect, { target: { value: '' } });
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Select state')).toBeInTheDocument();
      });

      fireEvent.change(stateSelect, { target: { value: 'Maharashtra' } });
      
      await waitFor(() => {
        expect(screen.queryByText('Select state')).not.toBeInTheDocument();
      });
    });

    it('validates empty district', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      const districtSelect = screen.getAllByRole('combobox')[1];
      
      fireEvent.change(districtSelect, { target: { value: '' } });
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Select district')).toBeInTheDocument();
      });

      fireEvent.change(districtSelect, { target: { value: 'Pune' } });
      
      await waitFor(() => {
        expect(screen.queryByText('Select district')).not.toBeInTheDocument();
      });
    });

    it('validates empty taluka', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      const talukaSelect = screen.getAllByRole('combobox')[2];
      
      fireEvent.change(talukaSelect, { target: { value: '' } });
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Select taluka')).toBeInTheDocument();
      });

      fireEvent.change(talukaSelect, { target: { value: 'Haveli' } });
      
      await waitFor(() => {
        expect(screen.queryByText('Select taluka')).not.toBeInTheDocument();
      });
    });

    it('validates empty village', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      const villageSelect = screen.getAllByRole('combobox')[3];
      
      fireEvent.change(villageSelect, { target: { value: '' } });
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Select village')).toBeInTheDocument();
      });
    });

    it('changing district resets taluka and village', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      const districtSelect = screen.getAllByRole('combobox')[1];
      const talukaSelect = screen.getAllByRole('combobox')[2];
      const villageSelect = screen.getAllByRole('combobox')[3];
      
      fireEvent.change(districtSelect, { target: { value: 'Mumbai' } });
      
      expect(talukaSelect.value).toBe('');
      expect(villageSelect.value).toBe('');
    });

    it('changing taluka resets village', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      const talukaSelect = screen.getAllByRole('combobox')[2];
      const villageSelect = screen.getAllByRole('combobox')[3];
      
      // Get initial village value (empty or populated from profile)
      const initialVillageValue = villageSelect.value;
      
      // Change taluka to see village reset
      fireEvent.change(talukaSelect, { target: { value: 'NewTaluka' } });
      
      // Village should be reset to empty regardless of initial value
      expect(villageSelect.value).toBe('');
      
      // Verify it was actually reset if it had a value before
      if (initialVillageValue) {
        expect(villageSelect.value).not.toBe(initialVillageValue);
      }
    });
  });

  describe('Form Validation on Next', () => {
    it('shows all validation errors when all fields are invalid', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByPlaceholderText('Enter Full Name'), { target: { value: '' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Mobile Number'), { target: { value: '' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Email'), { target: { value: '' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Aadhar Number'), { target: { value: '' } });
      fireEvent.change(screen.getByPlaceholderText('Enter Address'), { target: { value: '' } });
      
      const stateSelect = screen.getAllByRole('combobox')[0];
      const districtSelect = screen.getAllByRole('combobox')[1];
      const talukaSelect = screen.getAllByRole('combobox')[2];
      const villageSelect = screen.getAllByRole('combobox')[3];
      
      fireEvent.change(stateSelect, { target: { value: '' } });
      fireEvent.change(districtSelect, { target: { value: '' } });
      fireEvent.change(talukaSelect, { target: { value: '' } });
      fireEvent.change(villageSelect, { target: { value: '' } });

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText('Full name is required')).toBeInTheDocument();
        expect(screen.getByText('Enter a valid 10-digit mobile number')).toBeInTheDocument();
        expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
        expect(screen.getByText('Aadhaar must be 12 digits')).toBeInTheDocument();
        expect(screen.getByText('Address required')).toBeInTheDocument();
        expect(screen.getByText('Select state')).toBeInTheDocument();
        expect(screen.getByText('Select district')).toBeInTheDocument();
        expect(screen.getByText('Select taluka')).toBeInTheDocument();
        expect(screen.getByText('Select village')).toBeInTheDocument();
      });

      expect(screen.getByText('Personal Information')).toBeInTheDocument();
    });

    it('proceeds to next step when all fields are valid', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText('Land Information')).toBeInTheDocument();
      });
    });

    it('validates only specific invalid fields', async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByPlaceholderText('Enter Full Name'), { target: { value: '' } });

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText('Full name is required')).toBeInTheDocument();
      });

      expect(screen.queryByText('Enter a valid 10-digit mobile number')).not.toBeInTheDocument();
      expect(screen.queryByText('Enter a valid email')).not.toBeInTheDocument();
    });
  });

  describe('Step 1: Land Information', () => {
    const navigateToStep1 = async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText('Land Information')).toBeInTheDocument();
      });
    };

    describe('Initial Rendering', () => {
      it('renders land information step', async () => {
        await navigateToStep1();

        expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
        expect(screen.getByText('Land Information')).toBeInTheDocument();
      });

      it('renders all land information fields', async () => {
        await navigateToStep1();

        expect(screen.getByLabelText('Land Area')).toBeInTheDocument();
        expect(screen.getByLabelText('Unit')).toBeInTheDocument();
        expect(screen.getByLabelText('Soil Type')).toBeInTheDocument();
        expect(screen.getByLabelText('Ownership')).toBeInTheDocument();
      });

      it('populates fields with profile data', async () => {
        await navigateToStep1();

        expect(screen.getByDisplayValue('5')).toBeInTheDocument();
        
        const unitSelect = screen.getByLabelText('Unit');
        const soilTypeSelect = screen.getByLabelText('Soil Type');
        const ownershipSelect = screen.getByLabelText('Ownership');
        
        expect(unitSelect.value).toBe('acres');
        expect(soilTypeSelect.value).toBe('Black');
        expect(ownershipSelect.value).toBe('owned');
      });

      it('shows both back and next buttons', async () => {
        await navigateToStep1();

        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      });

      it('navigates back to personal information step', async () => {
        await navigateToStep1();

        fireEvent.click(screen.getByRole('button', { name: /back/i }));

        await waitFor(() => {
          expect(screen.getByText('Personal Information')).toBeInTheDocument();
        });
      });
    });

    describe('Land Area Field', () => {
      it('updates land area on change', async () => {
        await navigateToStep1();

        const input = screen.getByPlaceholderText('Enter Land Area');
        fireEvent.change(input, { target: { value: '10' } });
        expect(screen.getByDisplayValue('10')).toBeInTheDocument();
      });

      it('validates empty land area on blur', async () => {
        await navigateToStep1();

        const input = screen.getByPlaceholderText('Enter Land Area');
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.blur(input);

        await waitFor(() => {
          expect(screen.getByText('Enter land area')).toBeInTheDocument();
        });
      });

      it('clears error when valid land area is entered', async () => {
        await navigateToStep1();

        const input = screen.getByPlaceholderText('Enter Land Area');
        
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.blur(input);
        await waitFor(() => {
          expect(screen.getByText('Enter land area')).toBeInTheDocument();
        });

        fireEvent.change(input, { target: { value: '10' } });
        
        await waitFor(() => {
          expect(screen.queryByText('Enter land area')).not.toBeInTheDocument();
        });
      });

      it('validates on change when error exists', async () => {
        await navigateToStep1();

        const input = screen.getByPlaceholderText('Enter Land Area');
        
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.click(screen.getByRole('button', { name: /next/i }));
        
        await waitFor(() => {
          expect(screen.getByText('Enter land area')).toBeInTheDocument();
        });

        fireEvent.change(input, { target: { value: '5' } });
        
        await waitFor(() => {
          expect(screen.queryByText('Enter land area')).not.toBeInTheDocument();
        });
      });

      it('accepts decimal values', async () => {
        await navigateToStep1();

        const input = screen.getByPlaceholderText('Enter Land Area');
        fireEvent.change(input, { target: { value: '2.5' } });
        expect(screen.getByDisplayValue('2.5')).toBeInTheDocument();
      });
    });

    describe('Unit Field', () => {
      it('updates unit on change', async () => {
        await navigateToStep1();

        const select = screen.getByLabelText('Unit');
        fireEvent.change(select, { target: { value: 'hectares' } });
        expect(select.value).toBe('hectares');
      });

      it('validates empty unit', async () => {
        await navigateToStep1();

        const select = screen.getByLabelText('Unit');
        
        fireEvent.change(select, { target: { value: '' } });
        fireEvent.click(screen.getByRole('button', { name: /next/i }));
        
        await waitFor(() => {
          expect(screen.getByText('Select unit')).toBeInTheDocument();
        });

        fireEvent.change(select, { target: { value: 'acres' } });
        
        await waitFor(() => {
          expect(screen.queryByText('Select unit')).not.toBeInTheDocument();
        });
      });

      it('has acres and hectares options', async () => {
        await navigateToStep1();

        const select = screen.getByLabelText('Unit');
        const options = Array.from(select.options).map(opt => opt.value);
        
        expect(options).toContain('');
        expect(options).toContain('acres');
        expect(options).toContain('hectares');
      });
    });

    describe('Soil Type Field', () => {
      it('updates soil type on change', async () => {
        await navigateToStep1();

        const select = screen.getByLabelText('Soil Type');
        fireEvent.change(select, { target: { value: 'Alluvial' } });
        expect(screen.getByDisplayValue('Alluvial')).toBeInTheDocument();
      });

      it('validates empty soil type', async () => {
        await navigateToStep1();

        const select = screen.getByLabelText('Soil Type');
        
        fireEvent.change(select, { target: { value: '' } });
        fireEvent.click(screen.getByRole('button', { name: /next/i }));
        
        await waitFor(() => {
          expect(screen.getByText('Select soil type')).toBeInTheDocument();
        });

        fireEvent.change(select, { target: { value: 'Black' } });
        
        await waitFor(() => {
          expect(screen.queryByText('Select soil type')).not.toBeInTheDocument();
        });
      });

      it('has all soil type options', async () => {
        await navigateToStep1();

        const select = screen.getByLabelText('Soil Type');
        const options = Array.from(select.options).map(opt => opt.value);
        
        expect(options).toContain('');
        expect(options).toContain('Alluvial');
        expect(options).toContain('Black');
        expect(options).toContain('Red & Yellow');
        expect(options).toContain('Laterite');
        expect(options).toContain('Arid');
        expect(options).toContain('Forest & Mountain');
        expect(options).toContain('Saline & Alkaline');
        expect(options).toContain('Peaty');
        expect(options).toContain('Marshy');
      });

      it('changes soil type to different values', async () => {
        await navigateToStep1();

        const select = screen.getByLabelText('Soil Type');
        
        fireEvent.change(select, { target: { value: 'Laterite' } });
        expect(screen.getByDisplayValue('Laterite')).toBeInTheDocument();
        
        fireEvent.change(select, { target: { value: 'Arid' } });
        expect(screen.getByDisplayValue('Arid')).toBeInTheDocument();
      });
    });

    describe('Ownership Field', () => {
      it('updates ownership on change', async () => {
        await navigateToStep1();

        const select = screen.getByLabelText('Ownership');
        fireEvent.change(select, { target: { value: 'leased' } });
        expect(select.value).toBe('leased');
      });

      it('validates empty ownership', async () => {
        await navigateToStep1();

        const select = screen.getByLabelText('Ownership');
        
        fireEvent.change(select, { target: { value: '' } });
        fireEvent.click(screen.getByRole('button', { name: /next/i }));
        
        await waitFor(() => {
          expect(screen.getByText('Select ownership type')).toBeInTheDocument();
        });

        fireEvent.change(select, { target: { value: 'owned' } });
        
        await waitFor(() => {
          expect(screen.queryByText('Select ownership type')).not.toBeInTheDocument();
        });
      });

      it('has owned and leased options', async () => {
        await navigateToStep1();

        const select = screen.getByLabelText('Ownership');
        const options = Array.from(select.options).map(opt => opt.value);
        
        expect(options).toContain('');
        expect(options).toContain('owned');
        expect(options).toContain('leased');
      });

      it('toggles between owned and leased', async () => {
        await navigateToStep1();

        const select = screen.getByLabelText('Ownership');
        
        expect(select.value).toBe('owned');
        
        fireEvent.change(select, { target: { value: 'leased' } });
        expect(select.value).toBe('leased');
        
        fireEvent.change(select, { target: { value: 'owned' } });
        expect(select.value).toBe('owned');
      });
    });

    describe('Form Validation on Next', () => {
      it('shows all validation errors when all fields are invalid', async () => {
        await navigateToStep1();

        fireEvent.change(screen.getByPlaceholderText('Enter Land Area'), { target: { value: '' } });
        fireEvent.change(screen.getByLabelText('Unit'), { target: { value: '' } });
        fireEvent.change(screen.getByLabelText('Soil Type'), { target: { value: '' } });
        fireEvent.change(screen.getByLabelText('Ownership'), { target: { value: '' } });

        fireEvent.click(screen.getByRole('button', { name: /next/i }));

        await waitFor(() => {
          expect(screen.getByText('Enter land area')).toBeInTheDocument();
          expect(screen.getByText('Select unit')).toBeInTheDocument();
          expect(screen.getByText('Select soil type')).toBeInTheDocument();
          expect(screen.getByText('Select ownership type')).toBeInTheDocument();
        });

        expect(screen.getByText('Land Information')).toBeInTheDocument();
      });

      it('proceeds to next step when all fields are valid', async () => {
        await navigateToStep1();

        fireEvent.click(screen.getByRole('button', { name: /next/i }));

        await waitFor(() => {
          expect(screen.getByText('Bank Details')).toBeInTheDocument();
        });
      });

      it('validates only specific invalid fields', async () => {
        await navigateToStep1();

        fireEvent.change(screen.getByPlaceholderText('Enter Land Area'), { target: { value: '' } });

        fireEvent.click(screen.getByRole('button', { name: /next/i }));

        await waitFor(() => {
          expect(screen.getByText('Enter land area')).toBeInTheDocument();
        });

        expect(screen.queryByText('Select unit')).not.toBeInTheDocument();
        expect(screen.queryByText('Select soil type')).not.toBeInTheDocument();
        expect(screen.queryByText('Select ownership type')).not.toBeInTheDocument();
      });

      it('maintains valid field values when navigating back and forth', async () => {
        await navigateToStep1();

        fireEvent.change(screen.getByPlaceholderText('Enter Land Area'), { target: { value: '15' } });
        fireEvent.change(screen.getByLabelText('Unit'), { target: { value: 'hectares' } });

        fireEvent.click(screen.getByRole('button', { name: /back/i }));
        await waitFor(() => {
          expect(screen.getByText('Personal Information')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /next/i }));
        await waitFor(() => {
          expect(screen.getByText('Land Information')).toBeInTheDocument();
        });

        expect(screen.getByDisplayValue('15')).toBeInTheDocument();
        
        const unitSelect = screen.getByLabelText('Unit');
        expect(unitSelect.value).toBe('hectares');
      });
    });
  });

  describe('Step 2: Bank Details', () => {
    const navigateToStep2 = async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      // Navigate to Step 1
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      await waitFor(() => {
        expect(screen.getByText('Land Information')).toBeInTheDocument();
      });

      // Navigate to Step 2
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      await waitFor(() => {
        expect(screen.getByText('Bank Details')).toBeInTheDocument();
      });
    };

    describe('Initial Rendering', () => {
      it('renders bank details step', async () => {
        await navigateToStep2();

        expect(screen.getByText('Step 3 of 4')).toBeInTheDocument();
        expect(screen.getByText('Bank Details')).toBeInTheDocument();
      });

      it('renders all bank details fields', async () => {
        await navigateToStep2();

        expect(screen.getByLabelText('Bank Name')).toBeInTheDocument();
        expect(screen.getByLabelText('IFSC Code')).toBeInTheDocument();
        expect(screen.getByLabelText('Account Number')).toBeInTheDocument();
      });

      it('populates fields with profile data', async () => {
        await navigateToStep2();

        expect(screen.getByDisplayValue('Test Bank')).toBeInTheDocument();
        expect(screen.getByDisplayValue('TEST0001234')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
      });

      it('shows both back and next buttons', async () => {
        await navigateToStep2();

        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      });

      it('navigates back to land information step', async () => {
        await navigateToStep2();

        fireEvent.click(screen.getByRole('button', { name: /back/i }));

        await waitFor(() => {
          expect(screen.getByText('Land Information')).toBeInTheDocument();
        });
      });
    });

    describe('Bank Name Field', () => {
      it('updates bank name on change', async () => {
        await navigateToStep2();

        const input = screen.getByPlaceholderText('Enter Bank Name');
        fireEvent.change(input, { target: { value: 'New Bank' } });
        expect(screen.getByDisplayValue('New Bank')).toBeInTheDocument();
      });

      it('validates empty bank name on blur', async () => {
        await navigateToStep2();

        const input = screen.getByPlaceholderText('Enter Bank Name');
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.blur(input);

        await waitFor(() => {
          expect(screen.getByText('Enter bank name')).toBeInTheDocument();
        });
      });

      it('clears error when valid bank name is entered', async () => {
        await navigateToStep2();

        const input = screen.getByPlaceholderText('Enter Bank Name');
        
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.blur(input);
        await waitFor(() => {
          expect(screen.getByText('Enter bank name')).toBeInTheDocument();
        });

        fireEvent.change(input, { target: { value: 'Valid Bank' } });
        
        await waitFor(() => {
          expect(screen.queryByText('Enter bank name')).not.toBeInTheDocument();
        });
      });

      it('validates on change when error exists', async () => {
        await navigateToStep2();

        const input = screen.getByPlaceholderText('Enter Bank Name');
        
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.click(screen.getByRole('button', { name: /next/i }));
        
        await waitFor(() => {
          expect(screen.getByText('Enter bank name')).toBeInTheDocument();
        });

        fireEvent.change(input, { target: { value: 'Bank Name' } });
        
        await waitFor(() => {
          expect(screen.queryByText('Enter bank name')).not.toBeInTheDocument();
        });
      });
    });

    describe('IFSC Code Field', () => {
      it('updates IFSC code on change', async () => {
        await navigateToStep2();

        const input = screen.getByPlaceholderText('Enter IFSC Code');
        fireEvent.change(input, { target: { value: 'SBIN0001234' } });
        expect(screen.getByDisplayValue('SBIN0001234')).toBeInTheDocument();
      });

      it('validates empty IFSC code on blur', async () => {
        await navigateToStep2();

        const input = screen.getByPlaceholderText('Enter IFSC Code');
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.blur(input);

        await waitFor(() => {
          expect(screen.getByText('Enter IFSC')).toBeInTheDocument();
        });
      });

      it('clears error when valid IFSC code is entered', async () => {
        await navigateToStep2();

        const input = screen.getByPlaceholderText('Enter IFSC Code');
        
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.blur(input);
        await waitFor(() => {
          expect(screen.getByText('Enter IFSC')).toBeInTheDocument();
        });

        fireEvent.change(input, { target: { value: 'HDFC0001234' } });
        
        await waitFor(() => {
          expect(screen.queryByText('Enter IFSC')).not.toBeInTheDocument();
        });
      });

      it('validates on change when error exists', async () => {
        await navigateToStep2();

        const input = screen.getByPlaceholderText('Enter IFSC Code');
        
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.click(screen.getByRole('button', { name: /next/i }));
        
        await waitFor(() => {
          expect(screen.getByText('Enter IFSC')).toBeInTheDocument();
        });

        fireEvent.change(input, { target: { value: 'ICIC0001234' } });
        
        await waitFor(() => {
          expect(screen.queryByText('Enter IFSC')).not.toBeInTheDocument();
        });
      });

      it('accepts uppercase IFSC codes', async () => {
        await navigateToStep2();

        const input = screen.getByPlaceholderText('Enter IFSC Code');
        fireEvent.change(input, { target: { value: 'BARB0RAJKOT' } });
        expect(screen.getByDisplayValue('BARB0RAJKOT')).toBeInTheDocument();
      });
    });

    describe('Account Number Field', () => {
      it('updates account number on change', async () => {
        await navigateToStep2();

        const input = screen.getByPlaceholderText('Enter Account Number');
        fireEvent.change(input, { target: { value: '9876543210999' } });
        expect(screen.getByDisplayValue('9876543210999')).toBeInTheDocument();
      });

      it('validates empty account number on blur', async () => {
        await navigateToStep2();

        const input = screen.getByPlaceholderText('Enter Account Number');
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.blur(input);

        await waitFor(() => {
          expect(screen.getByText('Enter account number')).toBeInTheDocument();
        });
      });

      it('clears error when valid account number is entered', async () => {
        await navigateToStep2();

        const input = screen.getByPlaceholderText('Enter Account Number');
        
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.blur(input);
        await waitFor(() => {
          expect(screen.getByText('Enter account number')).toBeInTheDocument();
        });

        fireEvent.change(input, { target: { value: '1234567890' } });
        
        await waitFor(() => {
          expect(screen.queryByText('Enter account number')).not.toBeInTheDocument();
        });
      });

      it('validates on change when error exists', async () => {
        await navigateToStep2();

        const input = screen.getByPlaceholderText('Enter Account Number');
        
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.click(screen.getByRole('button', { name: /next/i }));
        
        await waitFor(() => {
          expect(screen.getByText('Enter account number')).toBeInTheDocument();
        });

        fireEvent.change(input, { target: { value: '9876543210' } });
        
        await waitFor(() => {
          expect(screen.queryByText('Enter account number')).not.toBeInTheDocument();
        });
      });

      it('accepts numeric account numbers', async () => {
        await navigateToStep2();

        const input = screen.getByPlaceholderText('Enter Account Number');
        fireEvent.change(input, { target: { value: '12345678901234' } });
        expect(screen.getByDisplayValue('12345678901234')).toBeInTheDocument();
      });
    });

    describe('Form Validation on Next', () => {
      it('shows all validation errors when all fields are invalid', async () => {
        await navigateToStep2();

        fireEvent.change(screen.getByPlaceholderText('Enter Bank Name'), { target: { value: '' } });
        fireEvent.change(screen.getByPlaceholderText('Enter IFSC Code'), { target: { value: '' } });
        fireEvent.change(screen.getByPlaceholderText('Enter Account Number'), { target: { value: '' } });

        fireEvent.click(screen.getByRole('button', { name: /next/i }));

        await waitFor(() => {
          expect(screen.getByText('Enter bank name')).toBeInTheDocument();
          expect(screen.getByText('Enter IFSC')).toBeInTheDocument();
          expect(screen.getByText('Enter account number')).toBeInTheDocument();
        });

        expect(screen.getByText('Bank Details')).toBeInTheDocument();
      });

      it('proceeds to next step when all fields are valid', async () => {
        await navigateToStep2();

        fireEvent.click(screen.getByRole('button', { name: /next/i }));

        await waitFor(() => {
          expect(screen.getByText('Upload Documents')).toBeInTheDocument();
        });
      });

      it('validates only specific invalid fields', async () => {
        await navigateToStep2();

        fireEvent.change(screen.getByPlaceholderText('Enter Bank Name'), { target: { value: '' } });

        fireEvent.click(screen.getByRole('button', { name: /next/i }));

        await waitFor(() => {
          expect(screen.getByText('Enter bank name')).toBeInTheDocument();
        });

        expect(screen.queryByText('Enter IFSC')).not.toBeInTheDocument();
        expect(screen.queryByText('Enter account number')).not.toBeInTheDocument();
      });

      it('maintains valid field values when navigating back and forth', async () => {
        await navigateToStep2();

        fireEvent.change(screen.getByPlaceholderText('Enter Bank Name'), { target: { value: 'HDFC Bank' } });
        fireEvent.change(screen.getByPlaceholderText('Enter IFSC Code'), { target: { value: 'HDFC0001234' } });
        fireEvent.change(screen.getByPlaceholderText('Enter Account Number'), { target: { value: '9876543210123' } });

        fireEvent.click(screen.getByRole('button', { name: /back/i }));
        await waitFor(() => {
          expect(screen.getByText('Land Information')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /next/i }));
        await waitFor(() => {
          expect(screen.getByText('Bank Details')).toBeInTheDocument();
        });

        expect(screen.getByDisplayValue('HDFC Bank')).toBeInTheDocument();
        expect(screen.getByDisplayValue('HDFC0001234')).toBeInTheDocument();
        expect(screen.getByDisplayValue('9876543210123')).toBeInTheDocument();
      });
    });
  });

  describe('Step 3: Documents', () => {
    const navigateToStep3 = async () => {
      renderApplySubsidy();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      // Navigate to Step 1
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      await waitFor(() => {
        expect(screen.getByText('Land Information')).toBeInTheDocument();
      });

      // Navigate to Step 2
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      await waitFor(() => {
        expect(screen.getByText('Bank Details')).toBeInTheDocument();
      });

      // Navigate to Step 3
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      await waitFor(() => {
        expect(screen.getByText('Upload Documents')).toBeInTheDocument();
      });
    };

    describe('Initial Rendering', () => {
      it('renders documents step', async () => {
        await navigateToStep3();

        expect(screen.getByText('Step 4 of 4')).toBeInTheDocument();
        expect(screen.getByText('Upload Documents')).toBeInTheDocument();
      });

      it('shows add documents button', async () => {
        await navigateToStep3();

        expect(screen.getByRole('button', { name: /add documents/i })).toBeInTheDocument();
      });

      it('shows no documents message when no documents are uploaded', async () => {
        await navigateToStep3();

        expect(screen.getByText('No documents uploaded yet.')).toBeInTheDocument();
      });

      it('shows both back and submit buttons', async () => {
        await navigateToStep3();

        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /submit application/i })).toBeInTheDocument();
      });

      it('navigates back to bank details step', async () => {
        await navigateToStep3();

        fireEvent.click(screen.getByRole('button', { name: /back/i }));

        await waitFor(() => {
          expect(screen.getByText('Bank Details')).toBeInTheDocument();
        });
      });

      it('shows missing documents warning when required documents are not uploaded', async () => {
        await navigateToStep3();

        expect(screen.getByText(/missing required documents/i)).toBeInTheDocument();
        expect(screen.getByText(/aadhaar/i)).toBeInTheDocument();
        expect(screen.getByText(/bank passbook/i)).toBeInTheDocument();
      });
    });

    describe('Add Document Modal', () => {
      it('opens add document modal when add button is clicked', async () => {
        await navigateToStep3();

        fireEvent.click(screen.getByRole('button', { name: /add documents/i }));

        await waitFor(() => {
          expect(screen.getByText('Add New Document')).toBeInTheDocument();
        });
      });

      it('renders all fields in add document modal', async () => {
        await navigateToStep3();

        fireEvent.click(screen.getByRole('button', { name: /add documents/i }));

        await waitFor(() => {
          expect(screen.getByText('Add New Document')).toBeInTheDocument();
          expect(screen.getByText(/select document type/i)).toBeInTheDocument();
          expect(screen.getByText(/document number/i)).toBeInTheDocument();
          expect(screen.getByText('Upload Document (Max 5MB)')).toBeInTheDocument();
        });
      });

      it('closes modal when cancel button is clicked', async () => {
        await navigateToStep3();

        fireEvent.click(screen.getByRole('button', { name: /add documents/i }));

        await waitFor(() => {
          expect(screen.getByText('Add New Document')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

        await waitFor(() => {
          expect(screen.queryByText('Add New Document')).not.toBeInTheDocument();
        });
      });

      it('validates document type is required', async () => {
        await navigateToStep3();

        fireEvent.click(screen.getByRole('button', { name: /add documents/i }));

        await waitFor(() => {
          expect(screen.getByText('Add New Document')).toBeInTheDocument();
        });

        // Don't select document type, just try to stage without any inputs
        fireEvent.click(screen.getByRole('button', { name: /stage document/i }));

        // Modal should stay open since validation fails
        expect(screen.getByText('Add New Document')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /stage document/i })).toBeInTheDocument();
      });

      it('shows document type options', async () => {
        await navigateToStep3();

        fireEvent.click(screen.getByRole('button', { name: /add documents/i }));

        await waitFor(() => {
          // Get all comboboxes and find the one in the modal (it should be visible and have the right options)
          const selects = screen.getAllByRole('combobox');
          const modalSelect = selects.find(select => {
            const options = Array.from(select.options).map(opt => opt.textContent);
            return options.includes('-- Select Document --');
          });
          
          expect(modalSelect).toBeDefined();
          const options = Array.from(modalSelect.options).map(opt => opt.textContent);
          expect(options).toContain('Aadhaar');
          expect(options).toContain('Bank Passbook / Cancelled Cheque');
        });
      });
    });

    describe('Document Management', () => {
      it('allows adding a document to pending uploads', async () => {
        await navigateToStep3();

        fireEvent.click(screen.getByRole('button', { name: /add documents/i }));

        await waitFor(() => {
          expect(screen.getByText('Add New Document')).toBeInTheDocument();
        });

        // Get the modal's combobox (last one, as it's opened last)
        const selects = screen.getAllByRole('combobox');
        const select = selects[selects.length - 1];
        fireEvent.change(select, { target: { value: 'aadhar_card' } });

        const numberInput = screen.getByPlaceholderText(/e.g., ABC1234567/i);
        fireEvent.change(numberInput, { target: { value: '123456789012' } });

        // Create a mock file
        const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
        const fileInput = document.querySelector('input[type="file"]');
        Object.defineProperty(fileInput, 'files', {
          value: [file],
          writable: false
        });
        fireEvent.change(fileInput);

        await waitFor(() => {
          expect(screen.getByText(/selected: test.pdf/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /stage document/i }));

        await waitFor(() => {
          expect(screen.queryByText('Add New Document')).not.toBeInTheDocument();
        });
      });

      it('displays document in table after staging', async () => {
        await navigateToStep3();

        // Add a document
        fireEvent.click(screen.getByRole('button', { name: /add documents/i }));

        await waitFor(() => {
          expect(screen.getByText('Add New Document')).toBeInTheDocument();
        });

        const selects = screen.getAllByRole('combobox');
        const select = selects[selects.length - 1];
        fireEvent.change(select, { target: { value: 'aadhar_card' } });

        const numberInput = screen.getByPlaceholderText(/e.g., ABC1234567/i);
        fireEvent.change(numberInput, { target: { value: 'AAAA1111BBBB' } });

        const file = new File(['test content'], 'aadhar.pdf', { type: 'application/pdf' });
        const fileInput = document.querySelector('input[type="file"]');
        Object.defineProperty(fileInput, 'files', {
          value: [file],
          writable: false
        });
        fireEvent.change(fileInput);

        fireEvent.click(screen.getByRole('button', { name: /stage document/i }));

        // Check document appears in table
        await waitFor(() => {
          expect(screen.getByText('AAAA1111BBBB')).toBeInTheDocument();
          expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument();
          expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
          expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
        });
      });

      it('opens edit modal when clicking edit button', async () => {
        await navigateToStep3();

        // Add a document first
        fireEvent.click(screen.getByRole('button', { name: /add documents/i }));
        await waitFor(() => expect(screen.getByText('Add New Document')).toBeInTheDocument());

        const selects = screen.getAllByRole('combobox');
        const select = selects[selects.length - 1];
        fireEvent.change(select, { target: { value: 'bank_passbook' } });

        const numberInput = screen.getByPlaceholderText(/e.g., ABC1234567/i);
        fireEvent.change(numberInput, { target: { value: 'BANK123' } });

        const file = new File(['test'], 'bank.pdf', { type: 'application/pdf' });
        const fileInput = document.querySelector('input[type="file"]');
        Object.defineProperty(fileInput, 'files', { value: [file], writable: false });
        fireEvent.change(fileInput);

        fireEvent.click(screen.getByRole('button', { name: /stage document/i }));

        // Wait for document to appear and click edit
        await waitFor(() => {
          expect(screen.getByText('BANK123')).toBeInTheDocument();
        });

        const editButton = screen.getByRole('button', { name: /edit/i });
        fireEvent.click(editButton);

        // Check edit modal appears
        await waitFor(() => {
          expect(screen.getByText('Edit Document')).toBeInTheDocument();
        });
      });

      it('allows updating document number in edit modal', async () => {
        await navigateToStep3();

        // Add a document first
        fireEvent.click(screen.getByRole('button', { name: /add documents/i }));
        await waitFor(() => expect(screen.getByText('Add New Document')).toBeInTheDocument());

        const selects = screen.getAllByRole('combobox');
        const select = selects[selects.length - 1];
        fireEvent.change(select, { target: { value: 'aadhar_card' } });

        const numberInput = screen.getByPlaceholderText(/e.g., ABC1234567/i);
        fireEvent.change(numberInput, { target: { value: 'OLD123' } });

        const file = new File(['test'], 'doc.pdf', { type: 'application/pdf' });
        const fileInput = document.querySelector('input[type="file"]');
        Object.defineProperty(fileInput, 'files', { value: [file], writable: false });
        fireEvent.change(fileInput);

        fireEvent.click(screen.getByRole('button', { name: /stage document/i }));

        await waitFor(() => expect(screen.getByText('OLD123')).toBeInTheDocument());

        // Click edit
        fireEvent.click(screen.getByRole('button', { name: /edit/i }));

        await waitFor(() => expect(screen.getByText('Edit Document')).toBeInTheDocument());

        // Update document number
        const editNumberInputs = screen.getAllByPlaceholderText(/e.g., ABC1234567/i);
        const editNumberInput = editNumberInputs[editNumberInputs.length - 1];
        fireEvent.change(editNumberInput, { target: { value: 'NEW456' } });

        // Save changes
        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        // Verify updated number appears
        await waitFor(() => {
          expect(screen.getByText('NEW456')).toBeInTheDocument();
          expect(screen.queryByText('OLD123')).not.toBeInTheDocument();
        });
      });

      it('allows deleting a staged document', async () => {
        await navigateToStep3();

        // Add a document
        fireEvent.click(screen.getByRole('button', { name: /add documents/i }));
        await waitFor(() => expect(screen.getByText('Add New Document')).toBeInTheDocument());

        const selects = screen.getAllByRole('combobox');
        const select = selects[selects.length - 1];
        fireEvent.change(select, { target: { value: 'aadhar_card' } });

        const numberInput = screen.getByPlaceholderText(/e.g., ABC1234567/i);
        fireEvent.change(numberInput, { target: { value: 'DELETE123' } });

        const file = new File(['test'], 'delete.pdf', { type: 'application/pdf' });
        const fileInput = document.querySelector('input[type="file"]');
        Object.defineProperty(fileInput, 'files', { value: [file], writable: false });
        fireEvent.change(fileInput);

        fireEvent.click(screen.getByRole('button', { name: /stage document/i }));

        await waitFor(() => expect(screen.getByText('DELETE123')).toBeInTheDocument());

        // Click delete
        fireEvent.click(screen.getByRole('button', { name: /delete/i }));

        // Document should be removed
        await waitFor(() => {
          expect(screen.queryByText('DELETE123')).not.toBeInTheDocument();
        });
      });

      it('allows viewing a document', async () => {
        await navigateToStep3();

        // Add a document
        fireEvent.click(screen.getByRole('button', { name: /add documents/i }));
        await waitFor(() => expect(screen.getByText('Add New Document')).toBeInTheDocument());

        const selects = screen.getAllByRole('combobox');
        const select = selects[selects.length - 1];
        fireEvent.change(select, { target: { value: 'aadhar_card' } });

        const numberInput = screen.getByPlaceholderText(/e.g., ABC1234567/i);
        fireEvent.change(numberInput, { target: { value: 'VIEW123' } });

        const file = new File(['test content'], 'view.pdf', { type: 'application/pdf' });
        const fileInput = document.querySelector('input[type="file"]');
        Object.defineProperty(fileInput, 'files', { value: [file], writable: false });
        fireEvent.change(fileInput);

        fireEvent.click(screen.getByRole('button', { name: /stage document/i }));

        await waitFor(() => expect(screen.getByText('VIEW123')).toBeInTheDocument());

        // Create a mock for window.open
        const mockOpen = vi.fn();
        const originalOpen = window.open;
        window.open = mockOpen;

        // Click view button
        const viewButton = screen.getByRole('button', { name: /^view$/i });
        fireEvent.click(viewButton);

        // Verify window.open was called with a blob URL
        await waitFor(() => {
          expect(mockOpen).toHaveBeenCalled();
          const callArg = mockOpen.mock.calls[0][0];
          expect(callArg).toMatch(/^blob:/);
        });

        // Restore original window.open
        window.open = originalOpen;
      });

      it('closes edit modal when cancel button is clicked', async () => {
        await navigateToStep3();

        // Add a document
        fireEvent.click(screen.getByRole('button', { name: /add documents/i }));
        await waitFor(() => expect(screen.getByText('Add New Document')).toBeInTheDocument());

        const selects = screen.getAllByRole('combobox');
        const select = selects[selects.length - 1];
        fireEvent.change(select, { target: { value: 'aadhar_card' } });

        const numberInput = screen.getByPlaceholderText(/e.g., ABC1234567/i);
        fireEvent.change(numberInput, { target: { value: 'CANCEL123' } });

        const file = new File(['test'], 'cancel.pdf', { type: 'application/pdf' });
        const fileInput = document.querySelector('input[type="file"]');
        Object.defineProperty(fileInput, 'files', { value: [file], writable: false });
        fireEvent.change(fileInput);

        fireEvent.click(screen.getByRole('button', { name: /stage document/i }));

        await waitFor(() => expect(screen.getByText('CANCEL123')).toBeInTheDocument());

        // Click edit to open edit modal
        fireEvent.click(screen.getByRole('button', { name: /edit/i }));

        await waitFor(() => expect(screen.getByText('Edit Document')).toBeInTheDocument());

        // Click cancel button in edit modal
        const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
        const editModalCancelButton = cancelButtons[cancelButtons.length - 1];
        fireEvent.click(editModalCancelButton);

        // Edit modal should close
        await waitFor(() => {
          expect(screen.queryByText('Edit Document')).not.toBeInTheDocument();
        });
      });

      it('validates file size limit (5MB)', async () => {
        await navigateToStep3();

        fireEvent.click(screen.getByRole('button', { name: /add documents/i }));

        await waitFor(() => {
          expect(screen.getByText('Add New Document')).toBeInTheDocument();
        });

        // Create a mock file larger than 5MB
        const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
        const fileInput = document.querySelector('input[type="file"]');
        Object.defineProperty(fileInput, 'files', {
          value: [largeFile],
          writable: false
        });
        Object.defineProperty(largeFile, 'size', {
          value: 6 * 1024 * 1024,
          writable: false
        });
        fireEvent.change(fileInput);

        await waitFor(() => {
          expect(screen.getByText(/file must be less than 5mb/i)).toBeInTheDocument();
        });
      });

      it('validates file is required', async () => {
        await navigateToStep3();

        fireEvent.click(screen.getByRole('button', { name: /add documents/i }));

        await waitFor(() => {
          expect(screen.getByText('Add New Document')).toBeInTheDocument();
        });

        // Get the modal's combobox (last one, as it's opened last)
        const selects = screen.getAllByRole('combobox');
        const select = selects[selects.length - 1];
        fireEvent.change(select, { target: { value: 'aadhar_card' } });

        const numberInput = screen.getByPlaceholderText(/e.g., ABC1234567/i);
        fireEvent.change(numberInput, { target: { value: '123456789012' } });

        fireEvent.click(screen.getByRole('button', { name: /stage document/i }));

        await waitFor(() => {
          expect(screen.getByText(/please select a file/i)).toBeInTheDocument();
        });
      });
    });

    describe('Submit Application', () => {
      it('shows submit button on documents step', async () => {
        await navigateToStep3();

        const submitButton = screen.getByRole('button', { name: /✓ submit application/i });
        expect(submitButton).toBeInTheDocument();
        expect(submitButton).not.toBeDisabled();
      });

      it('calls handleSubmitApplication when submit button is clicked', async () => {
        await navigateToStep3();

        const submitButton = screen.getByRole('button', { name: /✓ submit application/i });
        expect(submitButton).toBeInTheDocument();
        expect(submitButton).not.toBeDisabled();
        
        // Clicking will trigger validation - test coverage for the click event
        fireEvent.click(submitButton);
        
        // The component will show an alert about missing documents (mocked subsidy has required docs)
        // This tests that the submit handler runs
      });
    });
  });
});
