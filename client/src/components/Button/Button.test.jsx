import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TestRenderer from 'react-test-renderer';
import Button from './Button';

describe('Button Component', () => {
  // Test using react-test-renderer for snapshot testing
  it('renders correctly with default props', () => {
    const tree = TestRenderer.create(<Button>Click me</Button>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  // Test using React Testing Library for interaction
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDefined();
  });

  // Test using props
  it('applies custom className when provided', () => {
    const { container } = render(<Button className="custom-btn">Custom Button</Button>);
    expect(container.firstChild).toHaveClass('custom-btn');
  });
});
