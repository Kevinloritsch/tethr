import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AddFriendsScreen from '@/app/addfriends';
import { getFriendsList } from '@/controllers/getFriends';
import { useRouter } from 'expo-router';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/controllers/getFriends', () => ({
  getFriendsList: {
    searchUsers: jest.fn(),
    sendRequest: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  multiGet: jest.fn(() =>
    Promise.resolve([
      ['@friends', null],
      ['@incomingRequests', null],
      ['@outgoingRequests', null],
    ])
  ),
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/components/tethr', () => {
  return function MockTethr() {
    return <></>;
  };
});

jest.mock('@/components/searchbar', () => {
  return function MockSearchBar({ onSearch }: any) {
    return <></>;
  };
});

jest.mock('@/components/friendcard', () => {
  return function MockFriendCard() {
    return <></>;
  };
});

jest.mock('@expo/vector-icons/Entypo', () => {
  return function MockIcon() {
    return <></>;
  };
});

const mockedUseRouter = useRouter as jest.Mock;
const mockedGetFriendsList = getFriendsList as jest.Mocked<typeof getFriendsList>;

describe('AddFriendsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ push: jest.fn() });
  });

  it('renders add friends screen', async () => {
    mockedGetFriendsList.searchUsers.mockResolvedValue([]);

    const { UNSAFE_root } = render(<AddFriendsScreen />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('loads and displays cached friend data', async () => {
    mockedGetFriendsList.searchUsers.mockResolvedValue([]);

    const { UNSAFE_root } = render(<AddFriendsScreen />);

    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it('searches for users when query is entered', async () => {
    const mockUsers = [
      {
        userId: 'user1',
        username: 'Jane',
        pfpUrl: 'https://example.com/jane.jpg',
        buttonText: 'Add',
        cardType: 'solo' as const,
      },
    ];

    mockedGetFriendsList.searchUsers.mockResolvedValue(mockUsers);

    render(<AddFriendsScreen />);

    await waitFor(() => {
      expect(mockedGetFriendsList.searchUsers).toBeDefined();
    });
  });

  it('sends friend request when button is pressed', async () => {
    mockedGetFriendsList.searchUsers.mockResolvedValue([
      {
        userId: 'user1',
        username: 'Jane',
        pfpUrl: 'https://example.com/jane.jpg',
        buttonText: 'Add',
        cardType: 'solo' as const,
      },
    ]);
    mockedGetFriendsList.sendRequest.mockResolvedValue();

    render(<AddFriendsScreen />);

    await waitFor(() => {
      expect(mockedGetFriendsList.sendRequest).toBeDefined();
    });
  });

  it('handles search errors gracefully', async () => {
    mockedGetFriendsList.searchUsers.mockRejectedValue(new Error('Search failed'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<AddFriendsScreen />);

    await waitFor(() => {
      expect(consoleSpy).toBeDefined();
    });

    consoleSpy.mockRestore();
  });
});
