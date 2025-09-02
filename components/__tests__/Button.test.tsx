import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  // Test standard button rendering
  it('renders button with children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  // Test link rendering when href is provided
  it('renders as anchor tag when href is provided', () => {
    render(<Button href="/test">Link text</Button>);
    const link = screen.getByText('Link text');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/test');
  });

  // Test click handler
  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Test disabled state
  it('disables the button when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
    expect(screen.getByText('Click me')).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  // Test variant classes
  it('applies correct classes for different variants', () => {
    // Primary variant
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText('Primary')).toHaveClass('bg-knokspack-primary');

    // Secondary variant
    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText('Secondary')).toHaveClass('bg-knokspack-primary-light');

    // Outline variant
    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByText('Outline')).toHaveClass('border-gray-300', 'bg-white');
  });

  // Test size classes
  it('applies correct classes for different sizes', () => {
    // Base size
    const { rerender } = render(<Button size="base">Base</Button>);
    expect(screen.getByText('Base')).toHaveClass('px-6', 'py-3', 'text-base');

    // Small size
    rerender(<Button size="sm">Small</Button>);
    expect(screen.getByText('Small')).toHaveClass('px-3', 'py-1.5', 'text-sm');
  });

  // Test fullWidth prop
  it('applies full width class when fullWidth is true', () => {
    render(<Button fullWidth>Full width</Button>);
    expect(screen.getByText('Full width')).toHaveClass('w-full');
  });

  // Test custom className
  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByText('Custom')).toHaveClass('custom-class');
  });

  // Test button type
  it('sets correct button type', () => {
    const { rerender } = render(<Button type="submit">Submit</Button>);
    expect(screen.getByText('Submit')).toHaveAttribute('type', 'submit');

    rerender(<Button type="reset">Reset</Button>);
    expect(screen.getByText('Reset')).toHaveAttribute('type', 'reset');
  });
});
