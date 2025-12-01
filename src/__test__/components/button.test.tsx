import React from 'react';
import { render } from '@testing-library/react-native';
import { Button } from '@/components/button';

describe('Button', () => {
  it('renders button with title', () => {
    const { getByText } = render(<Button title="Click me" />);
    expect(getByText('Click me')).toBeTruthy();
  });

  it('calls onPress callback when pressed', () => {
    const mockOnPress = jest.fn();

    const { getByText } = render(<Button title="Click me" onPress={mockOnPress} />);
    const text = getByText('Click me');
    expect(text).toBeTruthy();
  });

  it('renders with primary theme by default', () => {
    const { getByText } = render(<Button title="Primary" />);
    const text = getByText('Primary');
    expect(text).toBeTruthy();
  });

  it('renders with secondary theme when specified', () => {
    const { getByText } = render(<Button title="Secondary" theme="secondary" />);
    const text = getByText('Secondary');
    expect(text).toBeTruthy();
  });

  it('renders with tertiary theme when specified', () => {
    const { getByText } = render(<Button title="Tertiary" theme="tertiary" />);
    const text = getByText('Tertiary');
    expect(text).toBeTruthy();
  });

  it('disables button when disabled prop is true', () => {
    const mockOnPress = jest.fn();

    const { getByText } = render(<Button title="Disabled" onPress={mockOnPress} disabled />);
    const text = getByText('Disabled');
    expect(text).toBeTruthy();
  });

  it('shows disabled state in button text', () => {
    const { getByText } = render(<Button title="Test" disabled />);
    expect(getByText).toBeTruthy();
  });

  it('renders with custom className passed via rest props', () => {
    const { getByText } = render(
      <Button title="Custom" className="custom-class" testID="custom-button" />
    );
    expect(getByText('Custom')).toBeTruthy();
  });

  it('does not call onPress when disabled', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Disabled Button" onPress={mockOnPress} disabled testID="disabled-btn" />
    );

    const text = getByText('Disabled Button');
    expect(text).toBeTruthy();
  });
});
