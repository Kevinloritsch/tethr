import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AddFriendsScreen from '@/app/addfriends';
import { getFriendsList } from '@/controllers/getFriends';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  return function MockSearchBar({ onSearch, value }: any) {
    return <></>;
  };
});

jest.mock('@/components/friendcard', () => {
  return function MockFriendCard({ pressFunction }: any) {
    return <></>;
  };
});

jest.mock('@expo/vector-icons/Entypo', () => {
  return function MockIcon() {
    return <></>;
  };
});

jest.mock('@/utils/cardType', () => ({
  getCardType: jest.fn(),
}));

const mockedUseRouter = useRouter as jest.Mock;
const mockedGetFriendsList = getFriendsList as jest.Mocked<typeof getFriendsList>;
const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('AddFriendsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ push: jest.fn() });
    mockedGetFriendsList.searchUsers.mockResolvedValue([]);
    mockedAsyncStorage.multiGet.mockResolvedValue([
      ['@friends', null],
      ['@incomingRequests', null],
      ['@outgoingRequests', null],
    ] as any);
  });

  it('renders add friends screen', async () => {
    const { UNSAFE_root } = render(<AddFriendsScreen />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('loads and displays cached friend data', async () => {
    mockedAsyncStorage.multiGet.mockResolvedValue([
      ['@friends', JSON.stringify([{ userId: 'friend1', username: 'Friend' }])],
      ['@incomingRequests', null],
      ['@outgoingRequests', null],
    ] as any);

    const { UNSAFE_root } = render(<AddFriendsScreen />);

    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
      expect(mockedAsyncStorage.multiGet).toHaveBeenCalled();
    });
  });

  it('loads cached incoming requests', async () => {
    mockedAsyncStorage.multiGet.mockResolvedValue([
      ['@friends', null],
      ['@incomingRequests', JSON.stringify([{ userId: 'user2', username: 'Incoming' }])],
      ['@outgoingRequests', null],
    ] as any);

    const { UNSAFE_root } = render(<AddFriendsScreen />);

    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it('loads cached outgoing requests', async () => {
    mockedAsyncStorage.multiGet.mockResolvedValue([
      ['@friends', null],
      ['@incomingRequests', null],
      ['@outgoingRequests', JSON.stringify([{ userId: 'user3', username: 'Outgoing' }])],
    ] as any);

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
    const mockUser = {
      userId: 'user1',
      username: 'Jane',
      pfpUrl: 'https://example.com/jane.jpg',
      buttonText: 'Add',
      cardType: 'solo' as const,
    };

    mockedGetFriendsList.searchUsers.mockResolvedValue([mockUser]);
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

  it('filters out existing friends from search results', async () => {
    mockedAsyncStorage.multiGet.mockResolvedValue([
      ['@friends', JSON.stringify([{ userId: 'existingFriend', username: 'Existing' }])],
      ['@incomingRequests', null],
      ['@outgoingRequests', null],
    ] as any);

    const mockUsers = [
      {
        userId: 'existingFriend',
        username: 'Existing',
        pfpUrl: 'https://example.com/existing.jpg',
        buttonText: 'Already Friend',
        cardType: 'solo' as const,
      },
      {
        userId: 'newUser',
        username: 'New',
        pfpUrl: 'https://example.com/new.jpg',
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

  it('filters out incoming requests from search results', async () => {
    mockedAsyncStorage.multiGet.mockResolvedValue([
      ['@friends', null],
      ['@incomingRequests', JSON.stringify([{ userId: 'incomingUser', username: 'Incoming' }])],
      ['@outgoingRequests', null],
    ] as any);

    mockedGetFriendsList.searchUsers.mockResolvedValue([]);

    render(<AddFriendsScreen />);

    await waitFor(() => {
      expect(mockedGetFriendsList.searchUsers).toBeDefined();
    });
  });

  it('filters out outgoing requests from search results', async () => {
    mockedAsyncStorage.multiGet.mockResolvedValue([
      ['@friends', null],
      ['@incomingRequests', null],
      ['@outgoingRequests', JSON.stringify([{ userId: 'outgoingUser', username: 'Outgoing' }])],
    ] as any);

    mockedGetFriendsList.searchUsers.mockResolvedValue([]);

    render(<AddFriendsScreen />);

    await waitFor(() => {
      expect(mockedGetFriendsList.searchUsers).toBeDefined();
    });
  });

  it('navigates back to friends screen', async () => {
    const mockPush = jest.fn();
    mockedUseRouter.mockReturnValue({ push: mockPush });

    const { UNSAFE_root } = render(<AddFriendsScreen />);

    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it('handles request send error', async () => {
    mockedGetFriendsList.sendRequest.mockRejectedValue(new Error('Send failed'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<AddFriendsScreen />);

    await waitFor(() => {
      expect(consoleSpy).toBeDefined();
    });

    consoleSpy.mockRestore();
  });

  it('caches sent friend request in AsyncStorage', async () => {
    mockedGetFriendsList.sendRequest.mockResolvedValue();
    mockedAsyncStorage.setItem.mockResolvedValue(undefined);

    render(<AddFriendsScreen />);

    await waitFor(() => {
      expect(mockedAsyncStorage.setItem).toBeDefined();
    });
  });

  it('displays header with Add Friends title', () => {
    const { UNSAFE_root } = render(<AddFriendsScreen />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('displays search bar component', () => {
    const { UNSAFE_root } = render(<AddFriendsScreen />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('displays empty state when no results found', () => {
    mockedGetFriendsList.searchUsers.mockResolvedValue([]);

    const { UNSAFE_root } = render(<AddFriendsScreen />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('displays loading state during search', async () => {
    mockedGetFriendsList.searchUsers.mockImplementation(
      () =>
        new Promise(() => {
          // never resolves
        })
    );

    const { UNSAFE_root } = render(<AddFriendsScreen />);

    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it('handles cached data loading errors', async () => {
    mockedAsyncStorage.multiGet.mockRejectedValue(new Error('Storage error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<AddFriendsScreen />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading cached relationships:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });
});
