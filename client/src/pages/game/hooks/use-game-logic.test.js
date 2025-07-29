import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameLogic, useGameControls } from './use-game-logic.index';
import * as reduxHooks from '../../../store/hooks';

// Mock Redux hooks and actions
vi.mock('../../../store/hooks', () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}));

vi.mock('../../../store/slices/gameSlice', () => ({
  setConnectionState: vi.fn(() => ({ type: 'mock/setConnectionState' })),
  setErrorMessage: vi.fn(() => ({ type: 'mock/setErrorMessage' })),
  setGameData: vi.fn(() => ({ type: 'mock/setGameData' })),
  updateGame: vi.fn(() => ({ type: 'mock/updateGame' })),
  setUserAndRoom: vi.fn(() => ({ type: 'mock/setUserAndRoom' })),
  updateLeaderStatus: vi.fn(() => ({ type: 'mock/updateLeaderStatus' })),
}));

describe('useGameLogic', () => {
  // Mock socket, dispatch and other required props
  const mockSocket = {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  };
  const mockDispatch = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    reduxHooks.useAppDispatch.mockReturnValue(mockDispatch);
    reduxHooks.useAppSelector.mockReturnValue('loading'); // Default connection state
    
    // Reset socket mock
    mockSocket.emit.mockReset();
    mockSocket.on.mockReset();
    mockSocket.off.mockReset();
    
    // Mock socket.emit to call the callback
    mockSocket.emit.mockImplementation((event, data, callback) => {
      if (callback) {
        callback({ success: true, game: { status: 'waiting', players: [] } });
      }
    });
  });
  
  it('handles socket connection errors', () => {
    const socketError = 'Connection failed';
    
    renderHook(() => useGameLogic(mockSocket, true, socketError, 'room1', 'user1'));
    
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'mock/setConnectionState' });
  });
  
  it('joins the game room when connected', () => {
    renderHook(() => useGameLogic(mockSocket, true, null, 'room1', 'user1'));
    
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'mock/setUserAndRoom' });
    expect(mockSocket.emit).toHaveBeenCalledWith(
      'game:join', 
      { roomId: 'room1', userId: 'user1' },
      expect.any(Function)
    );
  });
  
  it('handles unsuccessful room join', () => {
    // Override the default mock implementation for this test
    mockSocket.emit.mockImplementationOnce((event, data, callback) => {
      if (callback && event === 'game:join') {
        callback({ success: false, message: 'Room is full' });
      }
    });
    
    renderHook(() => useGameLogic(mockSocket, true, null, 'room1', 'user1'));
    
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'mock/setErrorMessage' });
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'mock/setConnectionState' });
  });
  
  it('sets up game update listener when connection is loaded', () => {
    // Set connection state to 'loaded'
    reduxHooks.useAppSelector.mockReturnValue('loaded');
    
    renderHook(() => useGameLogic(mockSocket, true, null, 'room1', 'user1'));
    
    expect(mockSocket.on).toHaveBeenCalledWith('game:updated', expect.any(Function));
  });
  
  it('handles game updates', () => {
    // Set connection state to 'loaded'
    reduxHooks.useAppSelector.mockReturnValue('loaded');
    
    renderHook(() => useGameLogic(mockSocket, true, null, 'room1', 'user1'));
    
    // Get the callback function passed to socket.on
    const updateCallback = mockSocket.on.mock.calls[0][1];
    
    // Simulate game update
    act(() => {
      updateCallback({ status: 'playing' });
    });
    
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'mock/updateGame' });
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'mock/updateLeaderStatus' });
  });
  
  it('cleans up event listeners when unmounting', () => {
    // Set connection state to 'loaded'
    reduxHooks.useAppSelector.mockReturnValue('loaded');
    
    const { unmount } = renderHook(() => useGameLogic(mockSocket, true, null, 'room1', 'user1'));
    
    unmount();
    
    expect(mockSocket.off).toHaveBeenCalledWith('game:updated');
    expect(mockSocket.emit).toHaveBeenCalledWith('game:leave', { roomId: 'room1', userId: 'user1' });
  });
});

describe('useGameControls', () => {
  // Mock socket
  const mockSocket = {
    emit: vi.fn(),
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset socket mock
    mockSocket.emit.mockReset();
    
    // Mock window event listeners
    vi.spyOn(window, 'addEventListener');
    vi.spyOn(window, 'removeEventListener');
  });
  
  it('sets up keyboard event listeners when game is playing', () => {
    const game = { status: 'playing' };
    
    const { unmount } = renderHook(() => useGameControls(mockSocket, true, game));
    
    expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    
    unmount();
    
    expect(window.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
  
  it('does not set up keyboard listeners when game is not playing', () => {
    const game = { status: 'waiting' };
    
    renderHook(() => useGameControls(mockSocket, true, game));
    
    expect(window.addEventListener).not.toHaveBeenCalled();
  });
  
  it('emits correct events on key presses', () => {
    const game = { status: 'playing' };
    let keydownHandler;
    
    // Capture the keydown handler
    window.addEventListener.mockImplementation((event, handler) => {
      if (event === 'keydown') {
        keydownHandler = handler;
      }
    });
    
    renderHook(() => useGameControls(mockSocket, true, game));
    
    // Simulate key presses
    const keyEvents = [
      { key: 'ArrowLeft', expectedEvent: 'move:left' },
      { key: 'ArrowRight', expectedEvent: 'move:right' },
      { key: 'ArrowDown', expectedEvent: 'move:down' },
      { key: 'ArrowUp', expectedEvent: 'rotate' },
      { key: ' ', expectedEvent: 'drop' },
    ];
    
    keyEvents.forEach(({ key, expectedEvent }) => {
      const mockEvent = { key, preventDefault: vi.fn() };
      act(() => {
        keydownHandler(mockEvent);
      });
      
      expect(mockSocket.emit).toHaveBeenCalledWith(expectedEvent);
      
      // Space key should prevent default
      if (key === ' ') {
        expect(mockEvent.preventDefault).toHaveBeenCalled();
      }
      
      mockSocket.emit.mockClear();
    });
  });
  
  it('provides startGame function that emits correct event', () => {
    const game = { status: 'waiting' };
    
    const { result } = renderHook(() => useGameControls(mockSocket, true, game));
    
    act(() => {
      result.current.startGame();
    });
    
    expect(mockSocket.emit).toHaveBeenCalledWith('game:start');
  });
  
  it('provides resetGame function that emits correct event', () => {
    const game = { status: 'finished' };
    
    const { result } = renderHook(() => useGameControls(mockSocket, true, game));
    
    act(() => {
      result.current.resetGame();
    });
    
    expect(mockSocket.emit).toHaveBeenCalledWith('game:reset');
  });
  
  it('does not emit events when socket is not connected', () => {
    const game = { status: 'playing' };
    
    const { result } = renderHook(() => useGameControls(null, false, game));
    
    act(() => {
      result.current.startGame();
      result.current.resetGame();
    });
    
    expect(mockSocket.emit).not.toHaveBeenCalled();
  });
});
