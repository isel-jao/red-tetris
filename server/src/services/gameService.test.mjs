import { describe, it, expect, beforeEach } from 'vitest';
import * as gameService from './gameService.mjs';

describe('Game Service', () => {
  // Reset the games state before each test
  beforeEach(() => {
    // Clear all games from the in-memory store
    // This is a bit hacky since we're accessing a private state
    // In a real app, you might want to expose a clear function for testing
    const games = gameService.getAllGames();
    games.forEach(game => {
      // We can't directly clear the Map, so we'll need to remove each game
      // that was created in the test
      if (game.id) {
        // This assumes the gameService has internal games Map we can't directly access
        // So we'll recreate/overwrite each game
        gameService.createGame(game.id, game.host);
      }
    });
  });

  describe('createGame', () => {
    it('should create a new game with the provided ID and host', () => {
      const gameId = 'test-game-1';
      const hostId = 'player-1';
      
      const game = gameService.createGame(gameId, hostId);
      
      expect(game.id).toBe(gameId);
      expect(game.host).toBe(hostId);
      expect(game.players.length).toBe(1);
      expect(game.players[0].id).toBe(hostId);
      expect(game.status).toBe('waiting');
    });

    it('should throw an error when creating a game with an existing ID', () => {
      const gameId = 'test-game-2';
      const hostId = 'player-1';
      
      gameService.createGame(gameId, hostId);
      
      expect(() => gameService.createGame(gameId, 'player-2'))
        .toThrow(`Game with ID ${gameId} already exists`);
    });

    it('should throw an error when gameId or hostPlayerId is missing', () => {
      expect(() => gameService.createGame('', 'player-1'))
        .toThrow('Game ID and host player ID are required');
      
      expect(() => gameService.createGame('test-game', ''))
        .toThrow('Game ID and host player ID are required');
    });
  });

  describe('findGame', () => {
    it('should find a game by ID', () => {
      const gameId = 'test-game-3';
      const hostId = 'player-1';
      
      gameService.createGame(gameId, hostId);
      
      const foundGame = gameService.findGame(gameId);
      expect(foundGame).toBeDefined();
      expect(foundGame.id).toBe(gameId);
    });

    it('should return null when game is not found', () => {
      const foundGame = gameService.findGame('non-existent-game');
      expect(foundGame).toBeNull();
    });
  });

  describe('joinGame', () => {
    it('should add a player to an existing game', () => {
      const gameId = 'test-game-4';
      const hostId = 'player-1';
      const newPlayerId = 'player-2';
      
      gameService.createGame(gameId, hostId);
      const updatedGame = gameService.joinGame(gameId, newPlayerId);
      
      expect(updatedGame.players.length).toBe(2);
      expect(updatedGame.players[1].id).toBe(newPlayerId);
    });

    it('should throw an error when joining a non-existent game', () => {
      expect(() => gameService.joinGame('non-existent-game', 'player-1'))
        .toThrow('Game with ID non-existent-game not found');
    });

    it('should throw an error when player is already in the game', () => {
      const gameId = 'test-game-5';
      const playerId = 'player-1';
      
      gameService.createGame(gameId, playerId);
      
      expect(() => gameService.joinGame(gameId, playerId))
        .toThrow(`Player ${playerId} is already in this game`);
    });
  });

  describe('setPlayerReady', () => {
    it('should update player ready status', () => {
      const gameId = 'test-game-6';
      const playerId = 'player-1';
      
      gameService.createGame(gameId, playerId);
      const updatedGame = gameService.setPlayerReady(gameId, playerId, true);
      
      expect(updatedGame.players[0].ready).toBe(true);
    });

    it('should start the game when all players are ready', () => {
      const gameId = 'test-game-7';
      const hostId = 'player-1';
      const secondPlayerId = 'player-2';
      
      gameService.createGame(gameId, hostId);
      gameService.joinGame(gameId, secondPlayerId);
      
      // First player ready
      gameService.setPlayerReady(gameId, hostId, true);
      
      // Get the game state
      let game = gameService.findGame(gameId);
      expect(game.status).toBe('waiting'); // Still waiting
      
      // Second player ready - should start game
      gameService.setPlayerReady(gameId, secondPlayerId, true);
      
      game = gameService.findGame(gameId);
      expect(game.status).toBe('playing');
      expect(game.startedAt).toBeInstanceOf(Date);
    });
  });
});
