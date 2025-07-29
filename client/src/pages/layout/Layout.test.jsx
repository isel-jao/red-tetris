import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Layout from './index';

// Mock dependencies
vi.mock('react-router', () => ({
  Outlet: () => <div data-testid="outlet">Outlet Content</div>
}));

vi.mock('sonner', () => ({
  Toaster: () => <div data-testid="toaster">Toaster Component</div>
}));

vi.mock('../../components/socket-config', () => ({
  SocketConfig: ({ children }) => <div data-testid="socket-config">{children}</div>
}));

describe('Layout Component', () => {
  it('renders with correct structure', () => {
    // Render the component
    const { container, getByTestId } = render(<Layout />);
    
    // Verify component structure
    expect(getByTestId('socket-config')).toBeInTheDocument();
    expect(getByTestId('outlet')).toBeInTheDocument();
    expect(getByTestId('toaster')).toBeInTheDocument();
    
    // Verify main element exists with background style
    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();
    // expect(mainElement.style.backgroundImage).toBe('url(\'/bg.jpg\')');
  });

  it.skip('passes correct props to SocketConfig', () => {
    // Setup spy on the SocketConfig component
    const socketConfigSpy = vi.spyOn(require('../../components/socket-config'), 'SocketConfig');
    
    // Render the component
    render(<Layout />);
    
    // Verify SocketConfig props
    expect(socketConfigSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:3000',
        options: {},
      }),
      expect.anything() // children prop
    );
  });

  it('renders children within SocketConfig wrapper', () => {
    // Render the component
    const { getByTestId } = render(<Layout />);
    
    // Verify the Outlet is rendered inside SocketConfig
    const socketConfig = getByTestId('socket-config');
    expect(socketConfig).toContainElement(getByTestId('outlet'));
  });
});
