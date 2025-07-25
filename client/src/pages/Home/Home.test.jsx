import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TestRenderer from 'react-test-renderer';
import Home from './Home';

// Mock the Button component to simplify testing
vi.mock('../../components/Button/Button', () => ({
  default: ({ children, onClick, disabled, className, 'data-testid': testId }) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={className} 
      data-testid={testId}
    >
      {children}
    </button>
  ),
}));

describe('Home Page', () => {
  // Test using react-test-renderer for snapshot testing
  it('renders correctly', () => {
    const tree = TestRenderer.create(<Home />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  // Test using React Testing Library for interaction
  it('updates player name when input changes', () => {
    render(<Home />);
    const input = screen.getByTestId('player-name-input');
    
    fireEvent.change(input, { target: { value: 'Player1' } });
    
    expect(input.value).toBe('Player1');
  });

  it('enables create game button when player name is entered', () => {
    render(<Home />);
    const button = screen.getByTestId('create-game-button');
    const input = screen.getByTestId('player-name-input');
    
    // Initially button should be disabled
    expect(button).toBeDisabled();
    
    // Enter player name
    fireEvent.change(input, { target: { value: 'Player1' } });
    
    // Button should now be enabled
    expect(button).not.toBeDisabled();
  });

  it('enables join game button when player name and game ID are entered', () => {
    render(<Home />);
    const button = screen.getByTestId('join-game-button');
    const playerInput = screen.getByTestId('player-name-input');
    const gameIdInput = screen.getByTestId('game-id-input');
    
    // Initially button should be disabled
    expect(button).toBeDisabled();
    
    // Enter player name only
    fireEvent.change(playerInput, { target: { value: 'Player1' } });
    expect(button).toBeDisabled();
    
    // Enter game ID as well
    fireEvent.change(gameIdInput, { target: { value: 'game123' } });
    expect(button).not.toBeDisabled();
  });
});
