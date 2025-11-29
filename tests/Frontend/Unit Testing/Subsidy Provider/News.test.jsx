import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import News from '../../../../src/Components/Subsidy_Provider/News';
import api from '../../../../src/Components/User_Profile/api1';
import toast from 'react-hot-toast';

// Mock modules
vi.mock('../../../../src/Components/User_Profile/api1');
vi.mock('react-hot-toast');
vi.mock('../../../../src/Components/User_Profile/Header', () => ({
  default: () => <div data-testid="header">Header</div>
}));
vi.mock('../../../../src/Components/HomePage/Settings', () => ({
  default: () => <div data-testid="settings">Settings</div>
}));

// Mock react-icons
vi.mock('react-icons/ai', () => ({
  AiOutlineEye: () => <span>Eye Icon</span>,
  AiOutlineDelete: () => <span>Delete Icon</span>,
  AiOutlineEdit: () => <span>Edit Icon</span>,
  AiOutlineClose: () => <span>Close Icon</span>
}));

describe('News Component', () => {
  const mockNewsArticles = [
    {
      id: 1,
      title: 'New Subsidy Scheme Announced',
      date: '2024-01-15',
      source: 'Government of India',
      description: 'A new subsidy scheme for farmers has been announced',
      image: 'https://example.com/image1.jpg',
      tag: 'Agriculture'
    },
    {
      id: 2,
      title: 'Weather Update',
      date: '2024-01-20',
      source: 'Met Department',
      description: 'Heavy rainfall expected in the coming week',
      image: 'https://example.com/image2.jpg',
      tag: 'Weather'
    },
    {
      id: 3,
      title: 'Crop Insurance Guidelines',
      date: '2024-01-25',
      source: 'Agriculture Ministry',
      description: 'New guidelines for crop insurance have been released',
      image: null,
      tag: 'Insurance'
    }
  ];

  beforeEach(() => {
    localStorage.setItem('access', 'test-token');
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: mockNewsArticles });
    toast.success = vi.fn();
    toast.error = vi.fn();
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const renderNews = () => {
    return render(
      <BrowserRouter>
        <News />
      </BrowserRouter>
    );
  };

  describe('Initial Rendering and Loading', () => {
    it('renders Header and Settings components', async () => {
      renderNews();
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('settings')).toBeInTheDocument();
    });

    it('renders page title and description', async () => {
      renderNews();
      
      expect(screen.getByText('Post News')).toBeInTheDocument();
      expect(screen.getByText('Share updates and announcements with farmers')).toBeInTheDocument();
    });

    it('renders Post New Article button', async () => {
      renderNews();
      
      expect(screen.getByRole('button', { name: /post new article/i })).toBeInTheDocument();
    });

    it('renders search input', async () => {
      renderNews();
      
      const searchInput = screen.getByPlaceholderText('Search news articles...');
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Fetch News Articles', () => {
    it('fetches and displays news articles successfully', async () => {
      renderNews();

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/news/my-articles/', {
          headers: { Authorization: 'Bearer test-token' }
        });
      });

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
        expect(screen.getByText('Weather Update')).toBeInTheDocument();
        expect(screen.getByText('Crop Insurance Guidelines')).toBeInTheDocument();
      });
    });

    it('displays all article details correctly', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
        expect(screen.getByText('A new subsidy scheme for farmers has been announced')).toBeInTheDocument();
        expect(screen.getByText('Government of India')).toBeInTheDocument();
        expect(screen.getByText('Agriculture')).toBeInTheDocument();
      });
    });

    it('handles API error gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      api.get.mockRejectedValue(new Error('Network error'));

      renderNews();

      await waitFor(() => {
        expect(api.get).toHaveBeenCalled();
      });

      expect(consoleError).toHaveBeenCalledWith('Error fetching news:', expect.any(Error));
      consoleError.mockRestore();
    });

    it('displays empty state when no articles exist', async () => {
      api.get.mockResolvedValue({ data: [] });

      renderNews();

      await waitFor(() => {
        expect(screen.getByText(/no news articles available/i)).toBeInTheDocument();
      });
    });

    it('renders article images when available', async () => {
      renderNews();

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThan(0);
        expect(images[0]).toHaveAttribute('src', 'https://example.com/image1.jpg');
        expect(images[0]).toHaveAttribute('alt', 'New Subsidy Scheme Announced');
      });
    });

    it('displays formatted dates correctly', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
        expect(screen.getByText('Jan 20, 2024')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('filters news by title', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search news articles...');
      fireEvent.change(searchInput, { target: { value: 'Weather' } });

      await waitFor(() => {
        expect(screen.getByText('Weather Update')).toBeInTheDocument();
        expect(screen.queryByText('New Subsidy Scheme Announced')).not.toBeInTheDocument();
      });
    });

    it('filters news by description', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search news articles...');
      fireEvent.change(searchInput, { target: { value: 'rainfall' } });

      await waitFor(() => {
        expect(screen.getByText('Weather Update')).toBeInTheDocument();
        expect(screen.queryByText('New Subsidy Scheme Announced')).not.toBeInTheDocument();
      });
    });

    it('filters news by source', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search news articles...');
      fireEvent.change(searchInput, { target: { value: 'Met Department' } });

      await waitFor(() => {
        expect(screen.getByText('Weather Update')).toBeInTheDocument();
        expect(screen.queryByText('New Subsidy Scheme Announced')).not.toBeInTheDocument();
      });
    });

    it('search is case insensitive', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search news articles...');
      fireEvent.change(searchInput, { target: { value: 'WEATHER' } });

      await waitFor(() => {
        expect(screen.getByText('Weather Update')).toBeInTheDocument();
      });
    });

    it('shows no results when search has no matches', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search news articles...');
      fireEvent.change(searchInput, { target: { value: 'NonExistentTopic' } });

      await waitFor(() => {
        expect(screen.queryByText('New Subsidy Scheme Announced')).not.toBeInTheDocument();
        expect(screen.queryByText('Weather Update')).not.toBeInTheDocument();
        expect(screen.queryByText('Crop Insurance Guidelines')).not.toBeInTheDocument();
      });
    });
  });

  describe('Add/Post News Modal', () => {
    it('opens add modal when Post New Article button is clicked', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /post new article/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        const modalTitles = screen.getAllByText('Post New Article');
        expect(modalTitles.length).toBeGreaterThan(0);
        expect(screen.getByPlaceholderText('Enter article title')).toBeInTheDocument();
      });
    });

    it('displays all form fields in add modal', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /post new article/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter article title')).toBeInTheDocument();
        expect(document.querySelector('input[type="date"]')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/government of india/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter article description')).toBeInTheDocument();
      });
    });

    it('closes modal when close button is clicked', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /post new article/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        const modalTitles = screen.getAllByText('Post New Article');
        expect(modalTitles.length).toBeGreaterThan(0);
      });

      const closeButtons = screen.getAllByText('Close Icon');
      fireEvent.click(closeButtons[0]);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Post Article' })).not.toBeInTheDocument();
      });
    });

    it('closes modal when Cancel button is clicked', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /post new article/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        const modalTitles = screen.getAllByText('Post New Article');
        expect(modalTitles.length).toBeGreaterThan(0);
      });

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Post Article' })).not.toBeInTheDocument();
      });
    });

    it('handles form input changes', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /post new article/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter article title')).toBeInTheDocument();
      });

      const titleInput = screen.getByPlaceholderText('Enter article title');
      const dateInput = document.querySelector('input[type="date"]');
      const sourceInput = screen.getByPlaceholderText(/government of india/i);
      const descriptionInput = screen.getByPlaceholderText('Enter article description');

      fireEvent.change(titleInput, { target: { value: 'Test Article' } });
      fireEvent.change(dateInput, { target: { value: '2024-02-01' } });
      fireEvent.change(sourceInput, { target: { value: 'Test Source' } });
      fireEvent.change(descriptionInput, { target: { value: 'Test description' } });

      expect(titleInput).toHaveValue('Test Article');
      expect(dateInput).toHaveValue('2024-02-01');
      expect(sourceInput).toHaveValue('Test Source');
      expect(descriptionInput).toHaveValue('Test description');
    });

    it('handles image upload', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /post new article/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Upload Image')).toBeInTheDocument();
      });

      const fileInput = document.querySelector('input[type="file"]');
      const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
      
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(fileInput.files[0]).toBe(file);
      expect(fileInput.files).toHaveLength(1);
    });

    it('submits form and creates new article successfully', async () => {
      api.post.mockResolvedValue({ data: { id: 4, title: 'New Article' } });

      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /post new article/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter article title')).toBeInTheDocument();
      });

      const titleInput = screen.getByPlaceholderText('Enter article title');
      const dateInput = document.querySelector('input[type="date"]');
      const sourceInput = screen.getByPlaceholderText(/government of india/i);
      const descriptionInput = screen.getByPlaceholderText('Enter article description');

      fireEvent.change(titleInput, { target: { value: 'New Article' } });
      fireEvent.change(dateInput, { target: { value: '2024-02-01' } });
      fireEvent.change(sourceInput, { target: { value: 'Test Source' } });
      fireEvent.change(descriptionInput, { target: { value: 'Test description' } });

      const submitButton = screen.getByRole('button', { name: 'Post Article' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith(
          '/news/create/',
          expect.any(FormData),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Content-Type': 'multipart/form-data',
              Authorization: 'Bearer test-token'
            })
          })
        );
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('News posted');
      });
    });

    it('handles create article error', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      api.post.mockRejectedValue(new Error('Create failed'));

      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /post new article/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter article title')).toBeInTheDocument();
      });

      const titleInput = screen.getByPlaceholderText('Enter article title');
      const dateInput = document.querySelector('input[type="date"]');
      const sourceInput = screen.getByPlaceholderText(/government of india/i);
      const descriptionInput = screen.getByPlaceholderText('Enter article description');

      fireEvent.change(titleInput, { target: { value: 'New Article' } });
      fireEvent.change(dateInput, { target: { value: '2024-02-01' } });
      fireEvent.change(sourceInput, { target: { value: 'Test Source' } });
      fireEvent.change(descriptionInput, { target: { value: 'Test description' } });

      const submitButton = screen.getByRole('button', { name: 'Post Article' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to save article');
      });

      consoleError.mockRestore();
    });
  });

  describe('Edit News Modal', () => {
    it('opens edit modal when edit button is clicked', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit Icon');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Edit Article')).toBeInTheDocument();
      });
    });

    it('pre-populates form with existing article data', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit Icon');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByDisplayValue('New Subsidy Scheme Announced')).toBeInTheDocument();
        expect(screen.getByDisplayValue('2024-01-15')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Government of India')).toBeInTheDocument();
        expect(screen.getByDisplayValue('A new subsidy scheme for farmers has been announced')).toBeInTheDocument();
      });
    });

    it('updates article successfully', async () => {
      api.put.mockResolvedValue({ data: { id: 1 } });

      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit Icon');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Edit Article')).toBeInTheDocument();
      });

      const titleInput = screen.getByDisplayValue('New Subsidy Scheme Announced');
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

      const submitButton = screen.getByRole('button', { name: 'Update Article' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.put).toHaveBeenCalledWith(
          '/news/update/1/',
          expect.any(FormData),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Content-Type': 'multipart/form-data',
              Authorization: 'Bearer test-token'
            })
          })
        );
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('News article updated');
      });
    });

    it('handles update article error', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      api.put.mockRejectedValue(new Error('Update failed'));

      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit Icon');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Edit Article')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: 'Update Article' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to save article');
      });

      consoleError.mockRestore();
    });

    it('displays helper text about image upload in edit mode', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit Icon');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/leave empty to keep current image/i)).toBeInTheDocument();
      });
    });
  });

  describe('View News Modal', () => {
    it('opens view modal when View More button is clicked', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: /view more/i });
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('News Details')).toBeInTheDocument();
      });
    });

    it('displays full article details in view modal', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: /view more/i });
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('News Details')).toBeInTheDocument();
        const titles = screen.getAllByText('New Subsidy Scheme Announced');
        expect(titles.length).toBeGreaterThan(0);
      });
    });

    it('displays article image in view modal when available', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: /view more/i });
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        const images = screen.getAllByAltText('New Subsidy Scheme Announced');
        expect(images.length).toBeGreaterThan(0);
      });
    });

    it('closes view modal when close button is clicked', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: /view more/i });
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('News Details')).toBeInTheDocument();
      });

      const closeButtons = screen.getAllByText('Close Icon');
      fireEvent.click(closeButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText('News Details')).not.toBeInTheDocument();
      });
    });

    it('closes view modal when Close button at bottom is clicked', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: /view more/i });
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('News Details')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: 'Close' });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('News Details')).not.toBeInTheDocument();
      });
    });
  });

  describe('Delete News Modal', () => {
    it('opens delete confirmation modal when delete button is clicked', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText('Delete Icon');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
        expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
      });
    });

    it('closes delete modal when Cancel is clicked', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText('Delete Icon');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
      });

      const cancelButton = screen.getAllByRole('button', { name: 'Cancel' })[0];
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
      });
    });

    it('deletes article successfully when confirmed', async () => {
      api.delete.mockResolvedValue({});

      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText('Delete Icon');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: 'Delete' });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(api.delete).toHaveBeenCalledWith(
          '/news/delete/1/',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Content-Type': 'multipart/form-data',
              Authorization: 'Bearer test-token'
            })
          })
        );
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Deleted successfully');
      });
    });

    it('handles delete error gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      api.delete.mockRejectedValue(new Error('Delete failed'));

      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText('Delete Icon');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: 'Delete' });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to delete article');
      });

      consoleError.mockRestore();
    });
  });

  describe('Edge Cases and Utility Functions', () => {
    it('handles articles without images', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('Crop Insurance Guidelines')).toBeInTheDocument();
      });

      // Article card should still render without error
      expect(screen.getByText('Insurance')).toBeInTheDocument();
    });

    it('handles empty date string in formatDate', async () => {
      const newsWithEmptyDate = [{
        id: 4,
        title: 'Test Article',
        date: '',
        source: 'Test Source',
        description: 'Test description',
        image: null,
        tag: 'Test'
      }];

      api.get.mockResolvedValue({ data: newsWithEmptyDate });

      renderNews();

      await waitFor(() => {
        expect(screen.getByText('Test Article')).toBeInTheDocument();
      });

      // Should not throw error
    });

    it('renders action buttons for each article', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: /view more/i });
      const editIcons = screen.getAllByText('Edit Icon');
      const deleteIcons = screen.getAllByText('Delete Icon');

      expect(viewButtons.length).toBe(3);
      expect(editIcons.length).toBe(3);
      expect(deleteIcons.length).toBe(3);
    });

    it('handles form submission with image file', async () => {
      api.post.mockResolvedValue({ data: { id: 4 } });

      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /post new article/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter article title')).toBeInTheDocument();
      });

      const titleInput = screen.getByPlaceholderText('Enter article title');
      const dateInput = document.querySelector('input[type="date"]');
      const sourceInput = screen.getByPlaceholderText(/government of india/i);
      const descriptionInput = screen.getByPlaceholderText('Enter article description');
      const fileInput = document.querySelector('input[type="file"]');

      fireEvent.change(titleInput, { target: { value: 'New Article' } });
      fireEvent.change(dateInput, { target: { value: '2024-02-01' } });
      fireEvent.change(sourceInput, { target: { value: 'Test Source' } });
      fireEvent.change(descriptionInput, { target: { value: 'Test description' } });

      const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      const submitButton = screen.getByRole('button', { name: 'Post Article' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('News posted');
      });
    });

    it('clears form data when modal is closed', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('New Subsidy Scheme Announced')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /post new article/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter article title')).toBeInTheDocument();
      });

      const titleInput = screen.getByPlaceholderText('Enter article title');
      fireEvent.change(titleInput, { target: { value: 'Test' } });

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      // Reopen modal
      fireEvent.click(addButton);

      await waitFor(() => {
        const newTitleInput = screen.getByPlaceholderText('Enter article title');
        expect(newTitleInput).toHaveValue('');
      });
    });

    it('displays tag for each article', async () => {
      renderNews();

      await waitFor(() => {
        expect(screen.getByText('Agriculture')).toBeInTheDocument();
        expect(screen.getByText('Weather')).toBeInTheDocument();
        expect(screen.getByText('Insurance')).toBeInTheDocument();
      });
    });

    it('renders multiple articles in grid layout', async () => {
      renderNews();

      await waitFor(() => {
        const articleTitles = [
          screen.getByText('New Subsidy Scheme Announced'),
          screen.getByText('Weather Update'),
          screen.getByText('Crop Insurance Guidelines')
        ];
        
        expect(articleTitles.length).toBe(3);
      });
    });
  });
});


