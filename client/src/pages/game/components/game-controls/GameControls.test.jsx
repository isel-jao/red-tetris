import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameControls, GameOverModal } from './index';
import * as reactRouter from 'react-router';
import * as reduxHooks from '../../../../store/hooks';
import {
  selectGame,
  selectIsLeader,
  selectCurrentUser,
} from '../../../../store/slices/gameSlice';

// Mock dependencies
vi.mock('react-router', () => ({
  useParams: vi.fn(),
  Link: vi.fn(({ to, children }) => <a href={to}>{children}</a>)
}));

vi.mock('../../../../store/hooks', () => ({
  useAppSelector: vi.fn()
}));

vi.mock('../../../../store/slices/gameSlice', () => ({
  selectGame: vi.fn(state => state.game),
  selectIsLeader: vi.fn(state => state.isLeader),
  selectCurrentUser: vi.fn(state => state.currentUser),
}));

describe('GameControls Component', () => {
  const mockOnStartGame = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    vi.mocked(reactRouter.useParams).mockReturnValue({ room: 'test-room' });
  });

  it('renders the game room name correctly', () => {
    // Setup
    vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
      if (selector === selectIsLeader) return false;
      if (selector === selectGame) return { status: 'waiting' };
      return {};
    });
    
    render(<GameControls onStartGame={mockOnStartGame} />);
    
    // Verify
    expect(screen.getByText(/test-room/i)).toBeInTheDocument();
  });

  it('shows start button for leader when game is in waiting state', () => {
    // Setup
    vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
      // Create a structured state object that matches what the selectors expect
      if (selector === selectIsLeader) return true;
      if (selector === selectGame) return { status: 'waiting' };
      return {};
    });
    
    render(<GameControls onStartGame={mockOnStartGame} />);
    
    // Verify
    const startButton = screen.getByText(/start game/i);
    expect(startButton).toBeInTheDocument();
    
    // Test the button click
    fireEvent.click(startButton);
    expect(mockOnStartGame).toHaveBeenCalledTimes(1);
  });

  it('shows waiting message for non-leader when game is in waiting state', () => {
    // Setup
    vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
      if (selector === selectIsLeader) return false;
      if (selector === selectGame) return { status: 'waiting' };
      return {};
    });
    
    render(<GameControls onStartGame={mockOnStartGame} />);
    
    // Verify
    expect(screen.getByText(/waiting for leader/i)).toBeInTheDocument();
    expect(screen.queryByText(/start game/i)).not.toBeInTheDocument();
  });
});

describe('GameOverModal Component', () => {
  const mockOnResetGame = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when game status is not finished', () => {
    // Setup
    vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
      if (selector === selectGame) return { status: 'playing' };
      return {};
    });
    
    const { container } = render(<GameOverModal onResetGame={mockOnResetGame} />);
    
    // Verify
    expect(container.firstChild).toBeNull();
  });

  it('renders game over modal with no winner message', () => {
    // Setup
    vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
      if (selector === selectGame) return { status: 'finished', winner: null };
      if (selector === selectCurrentUser) return 'user1';
      if (selector === selectIsLeader) return false;
      return {};
    });
    
    render(<GameOverModal onResetGame={mockOnResetGame} />);
    
    // Verify
    expect(screen.getByText(/game over/i)).toBeInTheDocument();
    expect(screen.getByText(/no winner/i)).toBeInTheDocument();
    expect(screen.getByText(/return to lobby/i)).toBeInTheDocument();
    expect(screen.getByText(/waiting for leader to reset/i)).toBeInTheDocument();
  });

  it('renders game over modal with "You" as winner when current user won', () => {
    // Setup
    const currentUser = 'user1';
    vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
      if (selector === selectGame) return { status: 'finished', winner: currentUser };
      if (selector === selectCurrentUser) return currentUser;
      if (selector === selectIsLeader) return false;
      return {};
    });
    
    render(<GameOverModal onResetGame={mockOnResetGame} />);
    
    // Verify
    expect(screen.getByText(/game over/i)).toBeInTheDocument();
    expect(screen.getByText(/winner: you/i, { exact: false })).toBeInTheDocument();
  });

  it('renders game over modal with winner user ID when another player won', () => {
    // Setup
    const winnerId = 'user2';
    vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
      if (selector === selectGame) return { status: 'finished', winner: winnerId };
      if (selector === selectCurrentUser) return 'user1';
      if (selector === selectIsLeader) return false;
      return {};
    });
    
    render(<GameOverModal onResetGame={mockOnResetGame} />);
    
    // Verify
    expect(screen.getByText(/game over/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`winner: ${winnerId}`, 'i'))).toBeInTheDocument();
  });

  it('shows reset game button for leader', () => {
    // Setup
    vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
      if (selector === selectGame) return { status: 'finished', winner: null };
      if (selector === selectCurrentUser) return 'user1';
      if (selector === selectIsLeader) return true;
      return {};
    });
    
    render(<GameOverModal onResetGame={mockOnResetGame} />);
    
    // Verify
    const resetButton = screen.getByText(/reset game/i);
    expect(resetButton).toBeInTheDocument();
    
    // Test the button click
    fireEvent.click(resetButton);
    expect(mockOnResetGame).toHaveBeenCalledTimes(1);
  });
});
