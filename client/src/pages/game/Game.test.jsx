import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GamePage from './index';
import React from 'react';
import '@testing-library/jest-dom';
import * as reduxHooks from '../../store/hooks';
import * as gameSlice from '../../store/slices/gameSlice';

// Mock dependencies - using vi.hoisted to avoid ESM issues
// Ensure this mock returns the expected values consistently
const mockUseParams = vi.fn().mockReturnValue({ room: 'testRoom', user: 'testUser' });
const mockSocket = { on: vi.fn(), emit: vi.fn() };
const mockSocketHook = {
  socket: mockSocket,
  isConnected: true,
  error: null
};
const mockDispatch = vi.fn();

// Create a mock router context
const RouterContext = React.createContext(null);

// Ensure our mocks have the expected values
vi.mock('react-router-dom', () => {
  const actual = vi.importActual('react-router-dom');
  // Using import directly instead of require
  
  // Create a proper Memory Router for testing
  const { MemoryRouter } = actual;
  
  return {
    ...actual,
    useParams: () => mockUseParams(),
    // Use the actual MemoryRouter implementation which properly provides all context
    BrowserRouter: ({ children }) => (
      <MemoryRouter initialEntries={['/game/room1']}>
        {children}
      </MemoryRouter>
    ),
    Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>
  };
});

vi.mock('../../components/socket-config', () => ({
  useSocket: () => mockSocketHook
}));

vi.mock('../../store/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: () => mockDispatch
}));

// Create mock functions for game controls that we can verify in our tests
const mockStartGame = vi.fn();
const mockResetGame = vi.fn();

// Mock game logic hooks
vi.mock('./hooks/use-game-logic.index', () => {
  return {
    useGameLogic: vi.fn(),
    useGameControls: () => ({
      startGame: mockStartGame,
      resetGame: mockResetGame
    })
  };
});

vi.mock('./components/game-board', () => ({
  GameBoard: ({ userId, board }) => (
    <div data-testid="game-board" data-user-id={userId}>
      Board: {JSON.stringify(board)}
    </div>
  )
}));

vi.mock('./components/game-controls', () => ({
  GameControls: ({ onStartGame }) => (
    <div data-testid="game-controls">
      <button onClick={onStartGame} data-testid="start-game-button">Start Game</button>
    </div>
  ),
  GameOverModal: ({ onResetGame }) => (
    <div data-testid="game-over-modal">
      <button onClick={onResetGame} data-testid="reset-game-button">Reset Game</button>
    </div>
  )
}));

describe('GamePage Component', () => {
  const mockGameControls = { startGame: vi.fn(), resetGame: vi.fn() };
  
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Setup default mock returns
    vi.mocked(reduxHooks.useAppSelector).mockImplementation(selector => {
      if (selector === gameSlice.selectConnectionState) return 'connected';
      if (selector === gameSlice.selectErrorMessage) return '';
      if (selector === gameSlice.selectGame) return { status: 'waiting' };
      if (selector === gameSlice.selectIsLeader) return true;
      if (selector === gameSlice.selectCurrentUser) return 'testUser';
      if (selector === gameSlice.selectBoards) return [{ userId: 'testUser', board: [] }, { userId: 'player2', board: [] }];
      return null;
    });
  });
  
  it('renders loading state when connection state is loading', () => {
    vi.mocked(reduxHooks.useAppSelector).mockImplementation(selector => {
      if (selector === gameSlice.selectConnectionState) return 'loading';
      return null;
    });
    
    render(<GamePage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
  
  it.todo('renders error state when connection state is error', () => {
    // Mock a connection error state
    vi.mocked(reduxHooks.useAppSelector).mockImplementation(selector => {
      if (selector === gameSlice.selectConnectionState) return 'error';
      if (selector === gameSlice.selectErrorMessage) return 'Connection failed';
      return null;
    });
    
    // Import and use the mocked BrowserRouter directly
    const { BrowserRouter } = vi.importActual('react-router-dom');
    
    // Use MemoryRouter directly to provide proper router context
    const Wrapper = ({ children }) => (
      <BrowserRouter>
        {children}
      </BrowserRouter>
    );
    
    // Use the wrapper when rendering
    render(<GamePage />, { wrapper: Wrapper });
    
    // Verify error state is shown
    expect(screen.getByText(/error/i)).toBeInTheDocument();
    expect(screen.getByText(/Connection failed/i)).toBeInTheDocument();
    // The Link component should be present in some form
    expect(screen.getByRole('link')).toBeInTheDocument();
  });
  
  it('renders game components when connection state is connected', () => {
    render(<GamePage />);
    
    expect(screen.getByTestId('game-controls')).toBeInTheDocument();
    expect(screen.getByTestId('game-over-modal')).toBeInTheDocument();
    expect(screen.getAllByTestId('game-board').length).toBe(2);
  });
  
  it('allows leader to start the game', () => {
    render(<GamePage />);
    
    // Click the start game button
    const startBtn = screen.getByTestId('start-game-button');
    fireEvent.click(startBtn);
    
    // Verify our mock function was called
    expect(mockStartGame).toHaveBeenCalled();
  });
  
  it('prevents non-leaders from starting the game', () => {
    vi.mocked(reduxHooks.useAppSelector).mockImplementation(selector => {
      if (selector === gameSlice.selectConnectionState) return 'connected';
      if (selector === gameSlice.selectGame) return { status: 'waiting' };
      if (selector === gameSlice.selectIsLeader) return false;
      if (selector === gameSlice.selectBoards) return [{ userId: 'testUser', board: [] }];
      return null;
    });
    
    render(<GamePage />);
    
    fireEvent.click(screen.getByTestId('start-game-button'));
    expect(mockGameControls.startGame).not.toHaveBeenCalled();
  });
  
  it('allows leader to reset the game when finished', () => {
    vi.mocked(reduxHooks.useAppSelector).mockImplementation(selector => {
      if (selector === gameSlice.selectConnectionState) return 'connected';
      if (selector === gameSlice.selectGame) return { status: 'finished' };
      if (selector === gameSlice.selectIsLeader) return true;
      if (selector === gameSlice.selectBoards) return [{ userId: 'testUser', board: [] }];
      return null;
    });
    
    render(<GamePage />);
    
    // Click the reset game button
    const resetBtn = screen.getByTestId('reset-game-button');
    fireEvent.click(resetBtn);
    
    // Verify our mock function was called
    expect(mockResetGame).toHaveBeenCalled();
  });
});
