import { createSlice } from '@reduxjs/toolkit';

const createEmptyBoard = (rows, cols) => {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
};

const initialState = {
  // Connection state
  connectionState: 'loading', // 'loading', 'loaded', 'error'
  errorMessage: null,
  
  // Game state
  game: {
    status: 'waiting', // 'waiting', 'playing', 'finished'
    players: [],
    winner: null,
  },
  
  // UI state
  isLeader: false,
  currentUser: null,
  currentRoom: null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setConnectionState: (state, action) => {
      state.connectionState = action.payload;
    },
    setErrorMessage: (state, action) => {
      state.errorMessage = action.payload;
    },
    setGameData: (state, action) => {
      state.game = { ...state.game, ...action.payload };
    },
    updateGame: (state, action) => {
      state.game = { ...state.game, ...action.payload };
    },
    setUserAndRoom: (state, action) => {
      const { user, room } = action.payload;
      state.currentUser = user;
      state.currentRoom = room;
      state.isLeader = state.game.players[0]?.id === user;
    },
    updateLeaderStatus: (state) => {
      state.isLeader = state.game.players[0]?.id === state.currentUser;
    },
    resetGame: () => initialState,
  },
});

export const {
  setConnectionState,
  setErrorMessage,
  setGameData,
  updateGame,
  setUserAndRoom,
  updateLeaderStatus,
  resetGame,
} = gameSlice.actions;

// Selectors
export const selectConnectionState = (state) => state.game.connectionState;
export const selectErrorMessage = (state) => state.game.errorMessage;
export const selectGame = (state) => state.game.game;
export const selectIsLeader = (state) => state.game.isLeader;
export const selectCurrentUser = (state) => state.game.currentUser;
export const selectCurrentRoom = (state) => state.game.currentRoom;
export const selectBoards = (state) => {
  const game = state.game.game;
  return game.players?.map((p) => ({
    board: boardWithTetrimino({
      board: p.board || createEmptyBoard(20, 10),
      tetrimino: p.currentTetromino,
    }),
    userId: p.id,
  })) || [];
};

// Helper function for board with tetrimino
const boardWithTetrimino = ({ board, tetrimino }) => {
  const newBoard = board.map((row) => [...row]);
  if (!tetrimino) return newBoard;

  const { matrix, position } = tetrimino;
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j]) {
        const row = position.y + i;
        const col = position.x + j;
        if (
          row >= 0 &&
          row < newBoard.length &&
          col >= 0 &&
          col < newBoard[row].length
        ) {
          newBoard[row][col] = matrix[i][j];
        }
      }
    }
  }
  return newBoard;
};

export default gameSlice.reducer;
