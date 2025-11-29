import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Homepage from '../../../../src/Components/HomePage/Homepage';

// Mock the child components
vi.mock('../../../../src/Components/HomePage/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>
}));

vi.mock('../../../../src/Components/HomePage/Subsidy', () => ({
  default: () => <div data-testid="subsidy">Subsidy</div>
}));

vi.mock('../../../../src/Components/HomePage/News', () => ({
  default: () => <div data-testid="news">News</div>
}));

vi.mock('../../../../src/Components/HomePage/Settings', () => ({
  default: () => <div data-testid="settings">Settings</div>
}));

vi.mock('../../../../src/Components/HomePage/FAQ', () => ({
  default: () => <div data-testid="faq">FAQ</div>
}));

vi.mock('../../../../src/Components/HomePage/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Homepage Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const renderHomepage = () => {
    return render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );
  };

  it('should render the Homepage component', () => {
    renderHomepage();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('should display the main heading', () => {
    renderHomepage();
    expect(screen.getByText(/Empowering Farmers/i)).toBeInTheDocument();
    expect(screen.getByText(/Enabling Growth with Subsidies/i)).toBeInTheDocument();
  });

  it('should display the tagline', () => {
    renderHomepage();
    expect(screen.getByText(/One platform to explore, apply,/i)).toBeInTheDocument();
  });

  it('should render the Learn More button', () => {
    renderHomepage();
    const button = screen.getByRole('button', { name: /learn more/i });
    expect(button).toBeInTheDocument();
  });

  it('should navigate to /learn-more when Learn More button is clicked', () => {
    renderHomepage();
    const button = screen.getByRole('button', { name: /learn more/i });
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith('/learn-more');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it('should render all child components', () => {
    renderHomepage();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('subsidy')).toBeInTheDocument();
    expect(screen.getByTestId('news')).toBeInTheDocument();
    expect(screen.getByTestId('settings')).toBeInTheDocument();
    expect(screen.getByTestId('faq')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should render the hero section with correct styling classes', () => {
    renderHomepage();
    const heroSection = screen.getByText(/Empowering Farmers/i).closest('div');
    expect(heroSection).toHaveClass('text-white');
  });

  it('should render the tractor image in the hero section', () => {
    renderHomepage();
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/Tractor.jpg');
  });

  it('should have the correct button styles', () => {
    renderHomepage();
    const button = screen.getByRole('button', { name: /learn more/i });
    expect(button).toHaveClass('bg-white');
    expect(button).toHaveClass('text-green-600');
    expect(button).toHaveClass('rounded-md');
  });

  it('should render the middle background section', () => {
    renderHomepage();
    const middleBg = document.querySelector('.middle-bg');
    expect(middleBg).toBeInTheDocument();
  });

  it('should render the green layer background', () => {
    renderHomepage();
    const greenLayer = document.querySelector('.bg_green_layer');
    expect(greenLayer).toBeInTheDocument();
  });

  it('should render components in the correct order', () => {
    renderHomepage();
    const components = [
      screen.getByTestId('navbar'),
      screen.getByTestId('subsidy'),
      screen.getByTestId('news'),
      screen.getByTestId('settings'),
      screen.getByTestId('faq'),
      screen.getByTestId('footer')
    ];
    
    components.forEach((component) => {
      expect(component).toBeInTheDocument();
    });
  });

  it('should have proper semantic structure', () => {
    renderHomepage();
    const button = screen.getByRole('button');
    const image = screen.getByRole('img');
    
    expect(button).toBeInTheDocument();
    expect(image).toBeInTheDocument();
  });
});
