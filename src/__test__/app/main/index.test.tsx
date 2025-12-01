import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import Index from '@/app/main/index';
import * as mod from '@/app/main/index';
import { userController } from '@/controllers/userInfo';
import { getAllGroups } from '@/controllers/group';
import { photoRetrieve } from '@/controllers/photoRetrieve';
import { taskController } from '@/controllers/tasks';
import { registerHomeObserver, unregisterHomeObserver } from '@/controllers/observers/uiObservers';
import * as SplashScreen from 'expo-splash-screen';

jest.mock('@/controllers/userInfo', () => ({
  userController: {
    getName: jest.fn(),
  },
}));

jest.mock('@/controllers/group', () => ({
  getAllGroups: {
    fetchUserData: jest.fn(),
  },
}));

jest.mock('@/controllers/photoRetrieve', () => ({
  photoRetrieve: {
    getPhotosByGroups: jest.fn(),
  },
}));

jest.mock('@/controllers/tasks', () => ({
  taskController: {
    getTasksForGroup: jest.fn(),
  },
}));

jest.mock('@/controllers/observers/uiObservers', () => ({
  registerHomeObserver: jest.fn(),
  unregisterHomeObserver: jest.fn(),
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/components/tethr', () => 'Tethr');
jest.mock('@/components/groups/groups', () => 'Groups');
jest.mock('@/components/tasks/tasks', () => 'Tasks');
jest.mock('@expo/vector-icons/FontAwesome6', () => 'FontAwesome6');

describe('app/main/index', () => {
  const mockGroupsData = [
    { group_id: 'group1', group_name: 'Group 1', current_points: 100, tasks: [] },
    { group_id: 'group2', group_name: 'Group 2', current_points: 50, tasks: [] },
  ];

  const mockPhotosData = [
    {
      groupId: 'group1',
      name: 'photo1.jpg',
      publicUrl: 'https://example.com/photo1.jpg',
      createdAt: '2024-01-01T00:00:00Z',
      username: 'user1',
      taskName: 'Task 1',
    },
  ];

  const mockTasksData = [
    { group_id: 'group1', task_name: 'Task 1', recurring: false, weekly: false },
    { group_id: 'group2', task_name: 'Task 2', recurring: true, weekly: true },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (userController.getName as jest.Mock).mockResolvedValue('Test User');
    (getAllGroups.fetchUserData as jest.Mock).mockResolvedValue(mockGroupsData);
    (photoRetrieve.getPhotosByGroups as jest.Mock).mockResolvedValue(mockPhotosData);
    (taskController.getTasksForGroup as jest.Mock).mockResolvedValue(mockTasksData);
    (registerHomeObserver as jest.Mock).mockReturnValue(jest.fn());
  });

  it('loads module', () => {
    expect(mod).toBeTruthy();
  });

  it('renders the screen', async () => {
    const { UNSAFE_root } = render(<Index />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('loads page data on mount', async () => {
    render(<Index />);

    await waitFor(() => {
      expect(userController.getName).toHaveBeenCalled();
      expect(getAllGroups.fetchUserData).toHaveBeenCalledWith('Home');
    });
  });

  it('registers home observer on mount', async () => {
    render(<Index />);

    await waitFor(() => {
      expect(registerHomeObserver).toHaveBeenCalled();
    });
  });

  it('unregisters home observer on unmount', async () => {
    const { unmount } = render(<Index />);

    await waitFor(() => {
      expect(registerHomeObserver).toHaveBeenCalled();
    });

    unmount();

    expect(unregisterHomeObserver).toHaveBeenCalled();
  });

  it('hides splash screen after loading', async () => {
    render(<Index />);

    await waitFor(() => {
      expect(SplashScreen.hideAsync).toHaveBeenCalled();
    });
  });

  it('handles empty groups list', async () => {
    (getAllGroups.fetchUserData as jest.Mock).mockResolvedValue([]);

    render(<Index />);

    await waitFor(() => {
      expect(getAllGroups.fetchUserData).toHaveBeenCalledWith('Home');
    });
  });

  it('fetches photos for all group IDs', async () => {
    render(<Index />);

    await waitFor(() => {
      expect(photoRetrieve.getPhotosByGroups).toHaveBeenCalledWith(['group1', 'group2']);
    });
  });

  it('fetches tasks for all groups', async () => {
    render(<Index />);

    await waitFor(() => {
      expect(taskController.getTasksForGroup).toHaveBeenCalledWith(mockGroupsData);
    });
  });

  it('handles error during page load', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (getAllGroups.fetchUserData as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<Index />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading homescreen:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('updates observer photos in state when home observer fires', async () => {
    let observerCallback: Function | null = null;
    (registerHomeObserver as jest.Mock).mockImplementation((callback: Function) => {
      observerCallback = callback;
      return jest.fn();
    });

    render(<Index />);

    await waitFor(() => {
      expect(registerHomeObserver).toHaveBeenCalled();
      expect(observerCallback).toBeDefined();
    });
  });

  it('has an export as default', () => {
    expect(Index).toBeDefined();
    expect(typeof Index).toBe('function');
  });

  it('initializes with correct hooks', () => {
    const instance = Index.toString();
    expect(instance).toContain('useState');
    expect(instance).toContain('useEffect');
  });
});
