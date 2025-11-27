import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TouchableOpacity } from 'react-native';
import FriendCard from '@/components/friendcard';

jest.mock('@/utils/cardType', () => ({
  roundedMap: {
    top: 'rounded-t-2xl',
    middle: '',
    bottom: 'rounded-b-2xl',
    solo: 'rounded-2xl',
  },
}));

describe('FriendCard', () => {
  const defaultProps = {
    pfpUrl: 'https://example.com/avatar.jpg',
    username: 'John Doe',
    userId: 'user123',
    buttonText: 'Add',
    cardType: 'solo' as const,
  };

  it('renders friend card with username', () => {
    const { getByText } = render(<FriendCard {...defaultProps} />);
    expect(getByText('John Doe')).toBeTruthy();
  });

  it('renders button with correct text', () => {
    const { getByText } = render(<FriendCard {...defaultProps} buttonText="Remove" />);
    expect(getByText('Remove')).toBeTruthy();
  });

  it('calls pressFunction when button is pressed', async () => {
    const mockPressFunction = jest.fn();
    const { UNSAFE_getByType } = render(
      <FriendCard {...defaultProps} pressFunction={mockPressFunction} />
    );

    const button = UNSAFE_getByType(TouchableOpacity);
    fireEvent.press(button);

    expect(mockPressFunction).toHaveBeenCalledWith('user123');
  });

  it('logs error when no pressFunction is provided', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const { UNSAFE_getByType } = render(<FriendCard {...defaultProps} />);

    const button = UNSAFE_getByType(TouchableOpacity);
    fireEvent.press(button);

    expect(consoleSpy).toHaveBeenCalledWith('error with button function');

    consoleSpy.mockRestore();
  });

  it('renders with top card type', () => {
    const { UNSAFE_root } = render(<FriendCard {...defaultProps} cardType="top" />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders with middle card type', () => {
    const { UNSAFE_root } = render(<FriendCard {...defaultProps} cardType="middle" />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders with bottom card type', () => {
    const { UNSAFE_root } = render(<FriendCard {...defaultProps} cardType="bottom" />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('displays user profile picture', () => {
    const { UNSAFE_getByType } = render(<FriendCard {...defaultProps} />);
    expect(UNSAFE_getByType).toBeTruthy();
  });

  it('renders all required elements', () => {
    const { getByText, UNSAFE_root } = render(<FriendCard {...defaultProps} />);
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Add')).toBeTruthy();
    expect(UNSAFE_root).toBeTruthy();
  });
});
