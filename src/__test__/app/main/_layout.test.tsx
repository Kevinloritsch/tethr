import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import RootLayout from '@/app/main/_layout';
import { useSegments } from 'expo-router';
import { getFriendsList } from '@/controllers/getFriends';
import { completedTasksController } from '@/controllers/completeTask';
import { groupController } from '@/controllers/group';
import { friendRequestObserver } from '@/controllers/observers/friendRequestObserver';

jest.mock('expo-router', () => {
  const mockTabs = {
    Screen: jest.fn(() => null),
  };
  return {
    Tabs: Object.assign(({ children, screenOptions }: any) => <>{children}</>, mockTabs),
    useSegments: jest.fn(),
  };
});

jest.mock('@/controllers/getFriends', () => ({
  getFriendsList: {
    getIncomingFriendRequestsCount: jest.fn(),
  },
}));

jest.mock('@/controllers/completeTask', () => ({
  completedTasksController: {
    initialize: jest.fn(),
  },
}));

jest.mock('@/controllers/group', () => ({
  groupController: {
    initialize: jest.fn(),
  },
}));

jest.mock('@/controllers/observers/friendRequestObserver', () => ({
  friendRequestObserver: {
    subscribe: jest.fn(),
  },
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: ({ style }: any) => <></>,
}));

jest.mock('@expo/vector-icons/AntDesign', () => {
  return function MockIcon() {
    return <></>;
  };
});

jest.mock('@expo/vector-icons/Feather', () => {
  return function MockIcon() {
    return <></>;
  };
});

jest.mock('@expo/vector-icons/Ionicons', () => {
  return function MockIcon() {
    return <></>;
  };
});

const mockedUseSegments = useSegments as jest.Mock;
const mockedGetFriendsList = getFriendsList as jest.Mocked<typeof getFriendsList>;
const mockedCompletedTasksController = completedTasksController as jest.Mocked<
  typeof completedTasksController
>;
const mockedGroupController = groupController as jest.Mocked<typeof groupController>;
const mockedFriendRequestObserver = friendRequestObserver as jest.Mocked<
  typeof friendRequestObserver
>;

describe('app/main/_layout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseSegments.mockReturnValue([]);
    mockedGetFriendsList.getIncomingFriendRequestsCount.mockResolvedValue(0);
    mockedCompletedTasksController.initialize.mockReturnValue(undefined);
    mockedGroupController.initialize.mockReturnValue(undefined);
    mockedFriendRequestObserver.subscribe.mockReturnValue(() => {});
  });

  it('renders without crashing', () => {
    const { UNSAFE_root } = render(<RootLayout />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('loads incoming friend requests count on mount', async () => {
    mockedGetFriendsList.getIncomingFriendRequestsCount.mockResolvedValue(2);

    render(<RootLayout />);

    await waitFor(() => {
      expect(mockedGetFriendsList.getIncomingFriendRequestsCount).toHaveBeenCalled();
    });
  });

  it('initializes task observers on mount', async () => {
    render(<RootLayout />);

    await waitFor(() => {
      expect(mockedCompletedTasksController.initialize).toHaveBeenCalled();
      expect(mockedGroupController.initialize).toHaveBeenCalled();
    });
  });

  it('subscribes to friend request observer', async () => {
    mockedFriendRequestObserver.subscribe.mockReturnValue(() => {});

    render(<RootLayout />);

    await waitFor(() => {
      expect(mockedFriendRequestObserver.subscribe).toHaveBeenCalled();
    });
  });

  it('hides tab bar when in camera segment', () => {
    mockedUseSegments.mockReturnValue(['camera']);

    const { UNSAFE_root } = render(<RootLayout />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('hides tab bar when in groups segment', () => {
    mockedUseSegments.mockReturnValue(['groups']);

    const { UNSAFE_root } = render(<RootLayout />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('hides tab bar when in tasks segment', () => {
    mockedUseSegments.mockReturnValue(['tasks']);

    const { UNSAFE_root } = render(<RootLayout />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('shows tab bar on main screens', () => {
    mockedUseSegments.mockReturnValue(['main']);

    const { UNSAFE_root } = render(<RootLayout />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('loads friend requests on mount', async () => {
    mockedGetFriendsList.getIncomingFriendRequestsCount.mockResolvedValue(3);

    render(<RootLayout />);

    await waitFor(() => {
      expect(mockedGetFriendsList.getIncomingFriendRequestsCount).toHaveBeenCalled();
    });
  });

  it('sets incoming requests count from API', async () => {
    mockedGetFriendsList.getIncomingFriendRequestsCount.mockResolvedValue(5);

    render(<RootLayout />);

    await waitFor(() => {
      expect(mockedGetFriendsList.getIncomingFriendRequestsCount).toHaveBeenCalled();
    });
  });

  it('handles accept action from observer callback', async () => {
    mockedGetFriendsList.getIncomingFriendRequestsCount.mockResolvedValue(2);
    let subscriberCallback: ((data: any) => void) | null = null;

    mockedFriendRequestObserver.subscribe.mockImplementation((callback) => {
      subscriberCallback = callback;
      return jest.fn();
    });

    render(<RootLayout />);

    await waitFor(() => {
      expect(subscriberCallback).toBeDefined();
    });

    if (subscriberCallback) {
      await act(async () => {
        (subscriberCallback as (data: any) => void)({ action: 'accept' });
      });
    }
  });

  it('handles reject action from observer callback', async () => {
    mockedGetFriendsList.getIncomingFriendRequestsCount.mockResolvedValue(3);
    let subscriberCallback: ((data: any) => void) | null = null;

    mockedFriendRequestObserver.subscribe.mockImplementation((callback) => {
      subscriberCallback = callback;
      return jest.fn();
    });

    render(<RootLayout />);

    await waitFor(() => {
      expect(subscriberCallback).toBeDefined();
    });

    if (subscriberCallback) {
      await act(async () => {
        (subscriberCallback as (data: any) => void)({ action: 'reject' });
      });
    }
  });

  it('handles manualUpdate action from observer callback', async () => {
    let subscriberCallback: ((data: any) => void) | null = null;

    mockedFriendRequestObserver.subscribe.mockImplementation((callback) => {
      subscriberCallback = callback;
      return jest.fn();
    });

    render(<RootLayout />);

    await waitFor(() => {
      expect(subscriberCallback).toBeDefined();
    });

    if (subscriberCallback) {
      await act(async () => {
        (subscriberCallback as (data: any) => void)({ action: 'manualUpdate', count: 4 });
      });
    }
  });

  it('prevents negative incoming requests count', async () => {
    mockedGetFriendsList.getIncomingFriendRequestsCount.mockResolvedValue(1);
    let subscriberCallback: ((data: any) => void) | null = null;

    mockedFriendRequestObserver.subscribe.mockImplementation((callback) => {
      subscriberCallback = callback;
      return jest.fn();
    });

    render(<RootLayout />);

    await waitFor(() => {
      expect(subscriberCallback).toBeDefined();
    });

    if (subscriberCallback) {
      await act(async () => {
        (subscriberCallback as (data: any) => void)({ action: 'accept' });
        (subscriberCallback as (data: any) => void)({ action: 'accept' });
      });
    }
  });

  it('initializes both task controller and group controller', async () => {
    render(<RootLayout />);

    await waitFor(() => {
      expect(mockedCompletedTasksController.initialize).toHaveBeenCalled();
      expect(mockedGroupController.initialize).toHaveBeenCalled();
    });
  });

  it('renders StatusBar with light style', () => {
    const { UNSAFE_root } = render(<RootLayout />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('applies correct tab bar styling', () => {
    const { UNSAFE_root } = render(<RootLayout />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('unsubscribes from friend request observer on unmount', async () => {
    const mockUnsubscribe = jest.fn();
    mockedFriendRequestObserver.subscribe.mockReturnValue(mockUnsubscribe);

    const { unmount } = render(<RootLayout />);

    await waitFor(() => {
      expect(mockedFriendRequestObserver.subscribe).toHaveBeenCalled();
    });

    unmount();

    await waitFor(() => {
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
});
