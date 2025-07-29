import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFoundPage from './index';

// Mock the React Router's Link component
vi.mock('react-router', () => ({
  Link: ({ href, children }) => (
    <a href={href} data-testid="link">
      {children}
    </a>
  ),
}));

describe('NotFoundPage', () => {
  it('renders the 404 page correctly', () => {
    render(<NotFoundPage />);
    
    // Verify content
    expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
    expect(screen.getByText('Sorry, the page you are looking for does not exist.')).toBeInTheDocument();
    
    // Verify link back to home
    const homeLink = screen.getByTestId('link');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
    expect(homeLink).toHaveTextContent('home page');
  });
  
  it('renders inside a main container', () => {
    const { container } = render(<NotFoundPage />);
    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('container');
  });
});
