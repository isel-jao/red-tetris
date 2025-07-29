import { describe, it, expect } from 'vitest';
import reducer, {
  setConnectionState,
  setErrorMessage,
  setGameData,
  updateGame,
  setUserAndRoom,
  updateLeaderStatus,
  resetGame,
  selectConnectionState,
  selectErrorMessage,
  selectGame,
  selectIsLeader,
  selectCurrentUser,
  selectCurrentRoom,
  selectBoards
} from './gameSlice';

describe('gameSlice', () => {
  const initialState = {
    connectionState: 'loading',
    errorMessage: null,
    game: {
      status: 'waiting',
      players: [],
      winner: null,
    },
    isLeader: false,
    currentUser: null,
    currentRoom: null,
  };

  it('should return the initial state on first run', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('reducers', () => {
    it('should handle setConnectionState', () => {
      const nextState = reducer(initialState, setConnectionState('loaded'));
      expect(nextState.connectionState).toEqual('loaded');
    });

    it('should handle setErrorMessage', () => {
      const errorMsg = 'Connection failed';
      const nextState = reducer(initialState, setErrorMessage(errorMsg));
      expect(nextState.errorMessage).toEqual(errorMsg);
    });

    it('should handle setGameData', () => {
      const gameData = { 
        status: 'playing',
        players: [{ id: 'player1', board: [] }],
      };
      const nextState = reducer(initialState, setGameData(gameData));
      expect(nextState.game).toEqual({
        ...initialState.game,
        ...gameData
      });
    });

    it('should handle updateGame', () => {
      const gameUpdate = { winner: 'player1' };
      const nextState = reducer(initialState, updateGame(gameUpdate));
      expect(nextState.game).toEqual({
        ...initialState.game,
        ...gameUpdate
      });
    });

    it('should handle setUserAndRoom', () => {
      // Setup
      const stateWithPlayers = {
        ...initialState,
        game: {
          ...initialState.game,
          players: [{ id: 'player1' }, { id: 'player2' }]
        }
      };
      
      // When user is the first player (leader)
      const payload1 = { user: 'player1', room: 'room1' };
      const nextState1 = reducer(stateWithPlayers, setUserAndRoom(payload1));
      expect(nextState1.currentUser).toEqual('player1');
      expect(nextState1.currentRoom).toEqual('room1');
      expect(nextState1.isLeader).toEqual(true);
      
      // When user is not the leader
      const payload2 = { user: 'player2', room: 'room1' };
      const nextState2 = reducer(stateWithPlayers, setUserAndRoom(payload2));
      expect(nextState2.isLeader).toEqual(false);
    });

    it('should handle updateLeaderStatus', () => {
      // Setup - user is leader
      const stateAsLeader = {
        ...initialState,
        currentUser: 'player1',
        game: {
          ...initialState.game,
          players: [{ id: 'player1' }, { id: 'player2' }]
        }
      };
      
      const nextState = reducer(stateAsLeader, updateLeaderStatus());
      expect(nextState.isLeader).toEqual(true);
      
      // When leader changes
      const stateNotLeader = {
        ...stateAsLeader,
        game: {
          ...stateAsLeader.game,
          players: [{ id: 'player2' }, { id: 'player1' }]
        }
      };
      
      const nextState2 = reducer(stateNotLeader, updateLeaderStatus());
      expect(nextState2.isLeader).toEqual(false);
    });

    it('should handle resetGame', () => {
      const modifiedState = {
        connectionState: 'loaded',
        errorMessage: 'some error',
        game: { status: 'playing', players: [{ id: 'player1' }], winner: 'player1' },
        isLeader: true,
        currentUser: 'player1',
        currentRoom: 'room1',
      };
      
      const nextState = reducer(modifiedState, resetGame());
      expect(nextState).toEqual(initialState);
    });
  });

  describe('selectors', () => {
    const state = {
      game: {
        connectionState: 'loaded',
        errorMessage: 'test error',
        game: {
          status: 'playing',
          players: [
            { 
              id: 'player1', 
              board: [
                [null, null], 
                [null, null]
              ],
              currentTetromino: {
                matrix: [['I']],
                position: { x: 0, y: 0 }
              }
            }
          ],
        },
        isLeader: true,
        currentUser: 'player1',
        currentRoom: 'game1',
      }
    };

    it('should select connectionState', () => {
      expect(selectConnectionState(state)).toEqual('loaded');
    });

    it('should select errorMessage', () => {
      expect(selectErrorMessage(state)).toEqual('test error');
    });

    it('should select game', () => {
      expect(selectGame(state)).toEqual(state.game.game);
    });

    it('should select isLeader', () => {
      expect(selectIsLeader(state)).toEqual(true);
    });

    it('should select currentUser', () => {
      expect(selectCurrentUser(state)).toEqual('player1');
    });

    it('should select currentRoom', () => {
      expect(selectCurrentRoom(state)).toEqual('game1');
    });

    it('should select boards with tetrimino properly positioned', () => {
      const boards = selectBoards(state);
      expect(boards).toHaveLength(1);
      expect(boards[0].userId).toEqual('player1');
      expect(boards[0].board[0][0]).toEqual('I'); // Tetrimino should be placed on board
    });
  });
});
