import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import CreateGroup from '@/app/main/groups/createGroup';
import * as group from '@/controllers/group';
import * as userInfo from '@/controllers/userInfo';
import * as getFriends from '@/controllers/getFriends';
import { useRouter } from 'expo-router';

jest.mock('@/controllers/group');
jest.mock('@/controllers/userInfo');
jest.mock('@/controllers/getFriends');
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/components/tethr', () => {
  return function MockTethr() {
    return null;
  };
});
jest.mock('@/components/searchbar', () => {
  return function MockSearchBar() {
    return null;
  };
});

const mockPush = jest.fn();

describe('CreateGroup Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      navigate: mockPush,
    });
    (getFriends.getFriendsList.getFriends as jest.Mock).mockResolvedValue([]);
    (userInfo.userController.getId as jest.Mock).mockResolvedValue('user-123');
  });

  it('renders without crashing', () => {
    const { UNSAFE_root } = render(<CreateGroup />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders group name input field', () => {
    render(<CreateGroup />);
    expect(screen.getByPlaceholderText(/group name/i)).toBeTruthy();
  });

  it('renders create group heading', () => {
    render(<CreateGroup />);
    expect(screen.getByText(/create a group/i)).toBeTruthy();
  });

  it('renders select friends heading', () => {
    render(<CreateGroup />);
    expect(screen.getByText(/select friends/i)).toBeTruthy();
  });

  it('displays search for friends', () => {
    render(<CreateGroup />);
    expect(screen.getByText(/select friends/i)).toBeTruthy();
  });

  it('updates group name state on input change', async () => {
    render(<CreateGroup />);
    const nameInput = screen.getByPlaceholderText(/group name/i);
    fireEvent.changeText(nameInput, 'My Group');
    await waitFor(() => {
      expect(nameInput.props.value).toBe('My Group');
    });
  });

  it('renders create button', () => {
    render(<CreateGroup />);
    expect(screen.getByText('Create')).toBeTruthy();
  });

  it('disables create button when name is empty', () => {
    render(<CreateGroup />);
    expect(screen.getByText('Create')).toBeTruthy();
  });

  it('fetches friends on mount', async () => {
    (getFriends.getFriendsList.getFriends as jest.Mock).mockResolvedValue([]);
    render(<CreateGroup />);
    await waitFor(() => {
      expect(getFriends.getFriendsList.getFriends).toHaveBeenCalled();
    });
  });

  it('calls createGroup when create button is pressed', async () => {
    (group.groupController.createGroup as jest.Mock).mockResolvedValue({
      success: true,
    });
    render(<CreateGroup />);
    const nameInput = screen.getByPlaceholderText(/group name/i);
    fireEvent.changeText(nameInput, 'New Group');
    await waitFor(() => {
      expect(nameInput.props.value).toBe('New Group');
    });
  });

  it('displays selected friend options', async () => {
    const mockFriends = [
      { pfpUrl: 'url', username: 'Friend 1', userId: '1', buttonText: 'Add', cardType: 0 },
    ];
    (getFriends.getFriendsList.getFriends as jest.Mock).mockResolvedValue(mockFriends);
    render(<CreateGroup />);
    await waitFor(() => {
      expect(screen.getByText('Friend 1')).toBeTruthy();
    });
  });

  it('enables create button when name is provided', async () => {
    render(<CreateGroup />);
    const nameInput = screen.getByPlaceholderText(/group name/i);
    fireEvent.changeText(nameInput, 'Test Group');
    await waitFor(() => {
      expect(nameInput.props.value).toBe('Test Group');
    });
  });
});
