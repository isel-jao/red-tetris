import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameBoard } from './index';
import { useAppSelector } from '../../../../store/hooks';

// Mock the Redux hooks
vi.mock('../../../../store/hooks', () => ({
  useAppSelector: vi.fn()
}));

describe('GameBoard', () => {
  const mockBoard = [
    [null, null, 'I', null, null, null, null, null, null, null],
    [null, null, 'I', null, null, null, null, null, null, null],
    [null, null, 'I', null, null, null, null, null, null, null],
    [null, null, 'I', null, null, null, null, null, null, null],
    ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
  ];

  beforeEach(() => {
    // Reset mock before each test
    vi.clearAllMocks();
  });

  it('renders the game board with correct title for current user', () => {
    // Setup
    const userId = 'user123';
    useAppSelector.mockReturnValue('user123'); // Mock current user as the same as userId

    // Render
    render(<GameBoard board={mockBoard} userId={userId} />);
    
    // Assert
    expect(screen.getByText('Your Board')).toBeInTheDocument();
    
    // Verify we have the right number of rows
    const rows = document.querySelectorAll('.grid-cols-10');
    expect(rows.length).toBe(5);
  });

  it('renders the game board with player id for other user', () => {
    // Setup
    const userId = 'player2';
    useAppSelector.mockReturnValue('user123'); // Mock current user as different from userId

    // Render
    render(<GameBoard board={mockBoard} userId={userId} />);
    
    // Assert
    expect(screen.getByText('player2')).toBeInTheDocument();
  });

  it('renders empty cells correctly', () => {
    // Setup
    const userId = 'user123';
    useAppSelector.mockReturnValue('user123');

    // Render
    render(<GameBoard board={mockBoard} userId={userId} />);
    
    // Assert - count cells with empty class
    const emptyCells = document.querySelectorAll('.empty');
    expect(emptyCells.length).toBeGreaterThan(0);
  });

  it('renders filled cells correctly', () => {
    // Setup
    const userId = 'user123';
    useAppSelector.mockReturnValue('user123');

    // Render
    render(<GameBoard board={mockBoard} userId={userId} />);
    
    // Assert - count cells with filled class
    const filledCells = document.querySelectorAll('.filled');
    expect(filledCells.length).toBeGreaterThan(0);
  });

  it('renders X cells with skull emoji', () => {
    // Setup
    const userId = 'user123';
    useAppSelector.mockReturnValue('user123');

    // Render
    render(<GameBoard board={mockBoard} userId={userId} />);
    
    // Assert - check for skull emojis
    const skullEmojis = screen.getAllByText('☠️');
    expect(skullEmojis.length).toBe(10); // 10 X cells in the mockBoard
  });
});
