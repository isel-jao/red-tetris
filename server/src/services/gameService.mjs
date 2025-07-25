/**
 * Game service for managing Tetris games
 */

// In-memory store for active games
const games = new Map();

/**
 * Creates a new game with the specified ID and host player
 * @param {string} gameId - Unique identifier for the game
 * @param {string} hostPlayerId - ID of the player hosting the game
 * @returns {Object} Newly created game object
 */
export const createGame = (gameId, hostPlayerId) => {
  if (!gameId || !hostPlayerId) {
    throw new Error('Game ID and host player ID are required');
  }

  if (games.has(gameId)) {
    throw new Error(`Game with ID ${gameId} already exists`);
  }

  const game = {
    id: gameId,
    host: hostPlayerId,
    players: [{
      id: hostPlayerId,
      score: 0,
      ready: false,
      board: Array(20).fill().map(() => Array(10).fill(0))
    }],
    status: 'waiting', // waiting, playing, finished
    startedAt: null,
    endedAt: null,
  };

  games.set(gameId, game);
  return game;
};

/**
 * Finds a game by its ID
 * @param {string} gameId - ID of the game to find
 * @returns {Object|null} Game object if found, null otherwise
 */
export const findGame = (gameId) => {
  if (!gameId) return null;
  return games.get(gameId) || null;
};

/**
 * Adds a player to an existing game
 * @param {string} gameId - ID of the game to join
 * @param {string} playerId - ID of the player joining
 * @returns {Object} Updated game object
 */
export const joinGame = (gameId, playerId) => {
  const game = findGame(gameId);
  
  if (!game) {
    throw new Error(`Game with ID ${gameId} not found`);
  }
  
  if (game.status !== 'waiting') {
    throw new Error('Cannot join a game that is already in progress or finished');
  }
  
  if (game.players.some(player => player.id === playerId)) {
    throw new Error(`Player ${playerId} is already in this game`);
  }
  
  game.players.push({
    id: playerId,
    score: 0,
    ready: false,
    board: Array(20).fill().map(() => Array(10).fill(0))
  });
  
  return game;
};

/**
 * Gets all active games
 * @returns {Array} Array of game objects
 */
export const getAllGames = () => {
  return Array.from(games.values());
};

/**
 * Sets a player's ready status in a game
 * @param {string} gameId - ID of the game
 * @param {string} playerId - ID of the player
 * @param {boolean} ready - Ready status
 * @returns {Object} Updated game object
 */
export const setPlayerReady = (gameId, playerId, ready) => {
  const game = findGame(gameId);
  
  if (!game) {
    throw new Error(`Game with ID ${gameId} not found`);
  }
  
  const player = game.players.find(p => p.id === playerId);
  if (!player) {
    throw new Error(`Player ${playerId} not found in game ${gameId}`);
  }
  
  player.ready = ready;
  
  // If all players are ready, start the game
  if (game.players.length >= 2 && game.players.every(p => p.ready)) {
    game.status = 'playing';
    game.startedAt = new Date();
  }
  
  return game;
};
