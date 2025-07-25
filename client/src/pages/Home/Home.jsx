import React, { useState } from 'react';
import Button from '../../components/Button/Button';

/**
 * Home page component for the Red Tetris application
 * Allows users to create or join games
 */
const Home = () => {
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  
  const handleCreateGame = () => {
    // Logic to create a new game
    console.log('Creating game with player:', playerName);
  };
  
  const handleJoinGame = () => {
    // Logic to join existing game
    console.log('Joining game:', gameId, 'with player:', playerName);
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-8 text-center text-red-600">RED TETRIS</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="mb-4">
          <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
            data-testid="player-name-input"
          />
        </div>
        
        <div className="flex space-x-2 mb-6">
          <Button 
            onClick={handleCreateGame}
            disabled={!playerName}
            data-testid="create-game-button"
            className="flex-1"
          >
            Create Game
          </Button>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or join existing game</span>
          </div>
        </div>
        
        <div className="mt-6 mb-4">
          <label htmlFor="gameId" className="block text-sm font-medium text-gray-700 mb-1">
            Game ID
          </label>
          <input
            type="text"
            id="gameId"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter game ID"
            data-testid="game-id-input"
          />
        </div>
        
        <Button 
          variant="secondary" 
          onClick={handleJoinGame}
          disabled={!playerName || !gameId}
          className="w-full"
          data-testid="join-game-button"
        >
          Join Game
        </Button>
      </div>
    </div>
  );
};

export default Home;
