import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Server } from "socket.io";
import { Game } from "../game.mjs";

// We'll mock the modules to avoid actual server creation
vi.mock("express", () => {
  const mockApp = {
    use: vi.fn(),
    get: vi.fn(),
  };
  const mockExpress = vi.fn(() => mockApp);
  mockExpress.json = vi.fn();
  mockExpress.urlencoded = vi.fn();
  mockExpress.static = vi.fn();
  return { default: mockExpress };
});

vi.mock("cors", () => ({
  default: vi.fn(() => "mockedCors"),
}));

vi.mock("node:http", () => ({
  createServer: vi.fn(() => ({
    listen: vi.fn((port, callback) => {
      if (callback) callback();
      return { port: port };
    }),
  })),
}));

vi.mock("socket.io", () => {
  const mockSocket = {
    id: "test-socket-id",
    join: vi.fn(),
    on: vi.fn(),
    emit: vi.fn(),
  };

  const mockIo = {
    on: vi.fn((event, callback) => {
      if (event === "connection") {
        callback(mockSocket);
      }
    }),
    to: vi.fn().mockReturnThis(),
    emit: vi.fn(),
  };

  return {
    Server: vi.fn(() => mockIo),
  };
});

vi.mock("../game.mjs", () => {
  const mockGame = {
    addPlayer: vi.fn().mockImplementation((userId) => ({
      success: true,
      message: "Player added successfully",
      game: { players: [{ id: userId }], status: "waiting" },
    })),
    removePlayer: vi.fn(),
    moveTetromino: vi.fn(),
    dropTetromino: vi.fn(),
    rotateTetromino: vi.fn(),
    start: vi.fn(),
    reset: vi.fn(),
    isEmpty: vi.fn().mockReturnValue(false),
    status: "waiting",
  };

  return {
    Game: vi.fn(() => mockGame),
  };
});

describe("main.mjs", () => {
  // Instead of trying to test the main module directly, which involves many side effects,
  // we'll simply test that the socket handlers are set up correctly

  // Mock the socket.io instance
  const mockSocket = {
    id: "mock-socket-id",
    join: vi.fn(),
    on: vi.fn(),
    emit: vi.fn(),
  };

  const mockIo = {
    on: vi.fn(),
    to: vi.fn().mockReturnThis(),
    emit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up the socket.io mock
    vi.mocked(Server).mockReturnValue(mockIo);

    // Set up the connection handler to call our mock socket
    mockIo.on.mockImplementation((event, handler) => {
      if (event === "connection") {
        handler(mockSocket);
      }
      return mockIo;
    });
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("should register socket event handlers when server starts", async () => {
    // Import the main module which will set up all event handlers
    await import("../main.mjs");

    // Verify socket.io connection handler was registered
    expect(mockIo.on).toHaveBeenCalledWith("connection", expect.any(Function));

    // Verify all the socket event handlers were registered
    expect(mockSocket.on).toHaveBeenCalledWith(
      "game:join",
      expect.any(Function)
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      "move:right",
      expect.any(Function)
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      "move:left",
      expect.any(Function)
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      "move:down",
      expect.any(Function)
    );
    expect(mockSocket.on).toHaveBeenCalledWith("drop", expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith("rotate", expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith(
      "game:leave",
      expect.any(Function)
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      "game:start",
      expect.any(Function)
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      "game:reset",
      expect.any(Function)
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      "disconnect",
      expect.any(Function)
    );
  });
});
