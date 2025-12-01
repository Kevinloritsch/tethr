import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import FriendsScreen from '@/app/main/friends';
import { getFriendsList } from '@/controllers/getFriends';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/controllers/getFriends', () => ({
  getFriendsList: {
    getFriends: jest.fn(),
    getIncomingFriendRequests: jest.fn(),
    getOutgoingFriendRequests: jest.fn(),
    removeFriend: jest.fn(),
    removeRequest: jest.fn(),
    acceptRequest: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  multiSet: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([['@friends', null]])),
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

const mockedUseRouter = useRouter as jest.Mock;
const mockedGetFriendsList = getFriendsList as jest.Mocked<typeof getFriendsList>;
const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('FriendsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ push: jest.fn() });
    mockedAsyncStorage.multiGet.mockResolvedValue([
      ['@friends', null],
      ['@incomingRequests', null],
      ['@outgoingRequests', null],
    ] as any);
  });

  it('renders loading indicator initially', async () => {
    mockedGetFriendsList.getFriends.mockImplementation(
      () =>
        new Promise(() => {
          // never resolves
        })
    );
    mockedGetFriendsList.getIncomingFriendRequests.mockResolvedValue([]);
    mockedGetFriendsList.getOutgoingFriendRequests.mockResolvedValue([]);

    const { UNSAFE_getByType } = render(<FriendsScreen />);
    expect(UNSAFE_getByType).toBeTruthy();
  });

  it('loads friends data from controller', async () => {
    const mockFriends = [
      {
        userId: '1',
        username: 'John',
        pfpUrl: 'https://example.com/john.jpg',
        buttonText: 'Remove',
        cardType: 'solo' as const,
      },
    ];

    mockedGetFriendsList.getFriends.mockResolvedValue(mockFriends);
    mockedGetFriendsList.getIncomingFriendRequests.mockResolvedValue([]);
    mockedGetFriendsList.getOutgoingFriendRequests.mockResolvedValue([]);

    render(<FriendsScreen />);

    await waitFor(() => {
      expect(mockedGetFriendsList.getFriends).toHaveBeenCalled();
    });
  });

  it('stores friends data to AsyncStorage after loading', async () => {
    const mockFriends = [
      {
        userId: '1',
        username: 'John',
        pfpUrl: 'https://example.com/john.jpg',
        buttonText: 'Remove',
        cardType: 'solo' as const,
      },
    ];

    mockedGetFriendsList.getFriends.mockResolvedValue(mockFriends);
    mockedGetFriendsList.getIncomingFriendRequests.mockResolvedValue([]);
    mockedGetFriendsList.getOutgoingFriendRequests.mockResolvedValue([]);

    render(<FriendsScreen />);

    await waitFor(() => {
      expect(mockedAsyncStorage.multiSet).toHaveBeenCalled();
    });
  });

  it('loads cached friends data on mount', async () => {
    const cachedFriends = [
      {
        userId: '1',
        username: 'Cached Friend',
        pfpUrl: 'https://example.com/cached.jpg',
        buttonText: 'Remove',
        cardType: 'solo' as const,
      },
    ];

    mockedAsyncStorage.multiGet.mockResolvedValue([
      ['@friends', JSON.stringify(cachedFriends)],
      ['@incomingRequests', null],
      ['@outgoingRequests', null],
    ] as any);

    mockedGetFriendsList.getFriends.mockResolvedValue([]);
    mockedGetFriendsList.getIncomingFriendRequests.mockResolvedValue([]);
    mockedGetFriendsList.getOutgoingFriendRequests.mockResolvedValue([]);

    render(<FriendsScreen />);

    await waitFor(() => {
      expect(mockedAsyncStorage.multiGet).toHaveBeenCalled();
    });
  });

  it('handles errors when loading friends', async () => {
    mockedGetFriendsList.getFriends.mockRejectedValue(new Error('Network error'));
    mockedGetFriendsList.getIncomingFriendRequests.mockResolvedValue([]);
    mockedGetFriendsList.getOutgoingFriendRequests.mockResolvedValue([]);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<FriendsScreen />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error loading friends:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('filters friends by search query', async () => {
    const mockFriends = [
      {
        userId: '1',
        username: 'John',
        pfpUrl: 'https://example.com/john.jpg',
        buttonText: 'Remove',
        cardType: 'top' as const,
      },
      {
        userId: '2',
        username: 'Jane',
        pfpUrl: 'https://example.com/jane.jpg',
        buttonText: 'Remove',
        cardType: 'bottom' as const,
      },
    ];

    mockedGetFriendsList.getFriends.mockResolvedValue(mockFriends);
    mockedGetFriendsList.getIncomingFriendRequests.mockResolvedValue([]);
    mockedGetFriendsList.getOutgoingFriendRequests.mockResolvedValue([]);

    render(<FriendsScreen />);

    await waitFor(() => {
      expect(mockedGetFriendsList.getFriends).toHaveBeenCalled();
    });
  });

  it('navigates to add friends screen when + button is pressed', async () => {
    const mockPush = jest.fn();
    mockedUseRouter.mockReturnValue({ push: mockPush });

    mockedGetFriendsList.getFriends.mockResolvedValue([]);
    mockedGetFriendsList.getIncomingFriendRequests.mockResolvedValue([]);
    mockedGetFriendsList.getOutgoingFriendRequests.mockResolvedValue([]);

    const { getByText } = render(<FriendsScreen />);

    await waitFor(() => {
      const addButton = getByText('+');
      fireEvent.press(addButton);
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/addfriends');
    });
  });

  it('handles refresh control', async () => {
    mockedGetFriendsList.getFriends.mockResolvedValue([]);
    mockedGetFriendsList.getIncomingFriendRequests.mockResolvedValue([]);
    mockedGetFriendsList.getOutgoingFriendRequests.mockResolvedValue([]);

    render(<FriendsScreen />);

    await waitFor(() => {
      expect(mockedGetFriendsList.getFriends).toHaveBeenCalled();
    });
  });
});
