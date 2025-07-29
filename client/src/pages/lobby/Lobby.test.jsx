import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TestRenderer from 'react-test-renderer';
import LobbyPage from './index';
import { toast } from 'sonner';

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('LobbyPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test using react-test-renderer for snapshot testing
  it('renders correctly', () => {
    const tree = TestRenderer.create(<LobbyPage />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  // Test form rendering
  it('renders the form with correct elements', () => {
    render(<LobbyPage />);
    expect(screen.getByText('Join a Room')).toBeDefined();
    expect(screen.getByPlaceholderText('Insert room name')).toBeDefined();
    expect(screen.getByPlaceholderText('Insert user name')).toBeDefined();
    expect(screen.getByRole('button', { name: /join/i })).toBeDefined();
  });

  // Test form validation - empty fields
  it('shows error toast when form submitted with empty fields', () => {
    render(<LobbyPage />);
    
    // Get the form by its method attribute
    const form = document.querySelector('form[method="post"]');
    fireEvent.submit(form);
    
    expect(toast.error).toHaveBeenCalledWith('Please fill in all fields.');
  });

  // Test form validation - short inputs
  it('shows error toast when inputs are too short', () => {
    render(<LobbyPage />);
    
    // Fill in form with short values
    const roomInput = screen.getByPlaceholderText('Insert room name');
    const userInput = screen.getByPlaceholderText('Insert user name');
    
    fireEvent.change(roomInput, { target: { value: 'a' } });
    fireEvent.change(userInput, { target: { value: 'b' } });
    
    const submitButton = screen.getByRole('button', { name: /join/i });
    fireEvent.click(submitButton);
    
    expect(toast.error).toHaveBeenCalledWith('Room and user names must be at least 2 characters long.');
  });

  // Test successful form submission
  it('navigates to game room when form is submitted with valid inputs', () => {
    // mockNavigate is already set up in the module mock
    
    render(<LobbyPage />);
    
    // Fill in form with valid values
    const roomInput = screen.getByPlaceholderText('Insert room name');
    const userInput = screen.getByPlaceholderText('Insert user name');
    
    fireEvent.change(roomInput, { target: { value: 'testroom' } });
    fireEvent.change(userInput, { target: { value: 'testuser' } });
    
    const submitButton = screen.getByRole('button', { name: /join/i });
    fireEvent.click(submitButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/testroom/testuser');
  });
});
