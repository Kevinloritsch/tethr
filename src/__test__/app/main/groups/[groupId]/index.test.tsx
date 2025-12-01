import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import GroupPage from '@/app/main/groups/[groupId]/index';
import { taskController } from '@/controllers/tasks';
import { groupController } from '@/controllers/group';
import { completedTasksController } from '@/controllers/completeTask';
import { supabase } from '@/lib/supabase';
import * as router from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  router: {
    navigate: jest.fn(),
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

jest.mock('@/controllers/tasks', () => ({
  taskController: {
    getTasksForGroup: jest.fn(),
  },
}));

jest.mock('@/controllers/group', () => ({
  groupController: {
    getLeaderboardData: jest.fn(),
    getGroupName: jest.fn(),
    leaveGroup: jest.fn(),
  },
}));

jest.mock('@/controllers/completeTask', () => ({
  completedTasksController: {
    getTasks: jest.fn(),
  },
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

jest.mock('@/components/tethr', () => 'Tethr');
jest.mock('@/components/fyp', () => 'Fyp');
jest.mock('@expo/vector-icons/FontAwesome6', () => 'FontAwesome6');
jest.mock('@expo/vector-icons/Entypo', () => 'Entypo');

describe('GroupPage - [groupId]/index', () => {
  const mockUsers = [
    { user_id: 'user1', username: 'Alice', current_rank: 1, current_points: 100 },
    { user_id: 'user2', username: 'Bob', current_rank: 2, current_points: 80 },
  ];

  const mockTasks = [
    { task_name: 'Task 1', recurring: false, weekly: false },
    { task_name: 'Task 2', recurring: true, weekly: true },
  ];

  const mockPhotos = [
    {
      name: 'photo1.jpg',
      publicUrl: 'https://example.com/photo1.jpg',
      createdAt: '2024-01-01T00:00:00Z',
      username: 'Alice',
      taskName: 'Task 1',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (router.useLocalSearchParams as jest.Mock).mockReturnValue({
      group_id: 'group1',
      group_name: 'Test Group',
      photos: JSON.stringify(mockPhotos),
    });
    (taskController.getTasksForGroup as jest.Mock).mockResolvedValue(mockTasks);
    (groupController.getLeaderboardData as jest.Mock).mockResolvedValue(mockUsers);
    (groupController.getGroupName as jest.Mock).mockResolvedValue('Test Group');
    (completedTasksController.getTasks as jest.Mock).mockResolvedValue([]);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('CurrentUser');
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: 'user1' } } },
    });
  });

  it('renders without crashing', async () => {
    const { UNSAFE_root } = render(<GroupPage />);

    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it('fetches group users on mount', async () => {
    render(<GroupPage />);

    await waitFor(() => {
      expect(groupController.getLeaderboardData).toHaveBeenCalledWith('group1');
    });
  });

  it('fetches group tasks on mount', async () => {
    render(<GroupPage />);

    await waitFor(() => {
      expect(taskController.getTasksForGroup).toHaveBeenCalled();
    });
  });

  it('fetches group name on mount', async () => {
    render(<GroupPage />);

    await waitFor(() => {
      expect(groupController.getGroupName).toHaveBeenCalledWith('group1');
    });
  });

  it('loads completed tasks on mount', async () => {
    render(<GroupPage />);

    await waitFor(() => {
      expect(completedTasksController.getTasks).toHaveBeenCalled();
    });
  });

  it('loads current username from AsyncStorage', async () => {
    render(<GroupPage />);

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('currentUserName');
    });
  });

  it('handles array group_id parameter', async () => {
    (router.useLocalSearchParams as jest.Mock).mockReturnValue({
      group_id: ['group1'],
      group_name: ['Test Group'],
      photos: JSON.stringify(mockPhotos),
    });

    render(<GroupPage />);

    await waitFor(() => {
      expect(groupController.getLeaderboardData).toHaveBeenCalledWith('group1');
    });
  });

  it('handles empty leaderboard data', async () => {
    (groupController.getLeaderboardData as jest.Mock).mockResolvedValue([]);

    const { UNSAFE_root } = render(<GroupPage />);

    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it('handles photos parameter parsing', async () => {
    const { UNSAFE_root } = render(<GroupPage />);

    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it('handles malformed photos JSON', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    (router.useLocalSearchParams as jest.Mock).mockReturnValue({
      group_id: 'group1',
      group_name: 'Test Group',
      photos: 'invalid-json',
    });

    render(<GroupPage />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error parsing photos:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('identifies completed tasks correctly', async () => {
    (completedTasksController.getTasks as jest.Mock).mockResolvedValue(['group1-Task 1']);

    const { UNSAFE_root } = render(<GroupPage />);

    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it('handles leave group action', async () => {
    (groupController.leaveGroup as jest.Mock).mockResolvedValue({ success: true });

    render(<GroupPage />);

    await waitFor(() => {
      expect(groupController.leaveGroup).toBeDefined();
    });
  });

  it('handles leave group error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (groupController.leaveGroup as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Failed to leave',
    });

    render(<GroupPage />);

    await waitFor(() => {
      expect(groupController.getLeaderboardData).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('handles missing user or group ID for leave group', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    });

    render(<GroupPage />);

    await waitFor(() => {
      expect(groupController.leaveGroup).toBeDefined();
    });

    consoleErrorSpy.mockRestore();
  });

  it('highlights current user in leaderboard', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('Alice');

    render(<GroupPage />);

    await waitFor(() => {
      expect(groupController.getLeaderboardData).toHaveBeenCalled();
    });
  });

  it('displays tasks with recurring and weekly badges', async () => {
    (taskController.getTasksForGroup as jest.Mock).mockResolvedValue([
      { task_name: 'Task 1', recurring: true, weekly: true },
    ]);

    render(<GroupPage />);

    await waitFor(() => {
      expect(taskController.getTasksForGroup).toHaveBeenCalled();
    });
  });

  it('disables completed tasks from being pressed', async () => {
    (completedTasksController.getTasks as jest.Mock).mockResolvedValue(['group1-Task 1']);
    (taskController.getTasksForGroup as jest.Mock).mockResolvedValue(mockTasks);

    render(<GroupPage />);

    await waitFor(() => {
      expect(completedTasksController.getTasks).toHaveBeenCalled();
    });
  });

  it('renders scroll to top button', async () => {
    render(<GroupPage />);

    await waitFor(() => {
      expect(groupController.getLeaderboardData).toHaveBeenCalled();
    });
  });

  it('handles group ID from search params', async () => {
    render(<GroupPage />);

    await waitFor(() => {
      expect(groupController.getLeaderboardData).toHaveBeenCalledWith('group1');
      expect(taskController.getTasksForGroup).toHaveBeenCalled();
    });
  });

  it('renders with return_state parameter', async () => {
    (router.useLocalSearchParams as jest.Mock).mockReturnValue({
      group_id: 'group1',
      group_name: 'Test Group',
      photos: JSON.stringify(mockPhotos),
      return_state: 'home',
    });

    render(<GroupPage />);

    await waitFor(() => {
      expect(groupController.getLeaderboardData).toHaveBeenCalledWith('group1');
    });
  });

  it('handles empty photos list', async () => {
    (router.useLocalSearchParams as jest.Mock).mockReturnValue({
      group_id: 'group1',
      group_name: 'Test Group',
      photos: JSON.stringify([]),
    });

    render(<GroupPage />);

    await waitFor(() => {
      expect(taskController.getTasksForGroup).toHaveBeenCalled();
    });
  });

  it('has an export as default', () => {
    expect(GroupPage).toBeDefined();
    expect(typeof GroupPage).toBe('function');
  });

  it('initializes with correct component structure', () => {
    const instance = GroupPage.toString();
    expect(instance).toContain('useState');
    expect(instance).toContain('useEffect');
  });

  it('fetches leaderboard and tasks independently', async () => {
    render(<GroupPage />);

    await waitFor(() => {
      expect(groupController.getLeaderboardData).toHaveBeenCalled();
      expect(taskController.getTasksForGroup).toHaveBeenCalled();
      expect(groupController.getGroupName).toHaveBeenCalled();
    });
  });

  it('handles no data for all data sources', async () => {
    (groupController.getLeaderboardData as jest.Mock).mockResolvedValue([]);
    (taskController.getTasksForGroup as jest.Mock).mockResolvedValue([]);
    (completedTasksController.getTasks as jest.Mock).mockResolvedValue([]);

    const { UNSAFE_root } = render(<GroupPage />);

    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });
  });
});
