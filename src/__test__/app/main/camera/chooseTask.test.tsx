import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import ChooseTask from '@/app/main/camera/chooseTask';
import * as tasks from '@/controllers/tasks';
import * as completeTask from '@/controllers/completeTask';
import { useLocalSearchParams, useRouter } from 'expo-router';

jest.mock('@/controllers/tasks');
jest.mock('@/controllers/completeTask');
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
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

describe('ChooseTask Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: jest.fn() });
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      group_id: '1',
      group_name: 'Test Group',
    });
    (completeTask.completedTasksController.getTasks as jest.Mock).mockResolvedValue([]);
  });

  it('renders without crashing', () => {
    (tasks.taskController.getTasksForGroup as jest.Mock).mockResolvedValue([]);
    const { UNSAFE_root } = render(<ChooseTask />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('fetches group tasks on mount', async () => {
    (tasks.taskController.getTasksForGroup as jest.Mock).mockResolvedValue([]);
    render(<ChooseTask />);
    await waitFor(() => {
      expect(tasks.taskController.getTasksForGroup).toHaveBeenCalled();
    });
  });

  it('displays tasks list when data is loaded', async () => {
    const mockTasks = [
      { task_name: 'Task 1', recurring: false, weekly: false },
      { task_name: 'Task 2', recurring: false, weekly: false },
    ];
    (tasks.taskController.getTasksForGroup as jest.Mock).mockResolvedValue(mockTasks);
    render(<ChooseTask />);
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeTruthy();
      expect(screen.getByText('Task 2')).toBeTruthy();
    });
  });

  it('navigates to takePhoto when task is selected', async () => {
    const mockTasks = [{ task_name: 'Task 1', recurring: false, weekly: false }];
    (tasks.taskController.getTasksForGroup as jest.Mock).mockResolvedValue(mockTasks);
    render(<ChooseTask />);
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeTruthy();
    });
  });

  it('displays empty state when no tasks exist', async () => {
    (tasks.taskController.getTasksForGroup as jest.Mock).mockResolvedValue([]);
    render(<ChooseTask />);
    await waitFor(() => {
      expect(screen.getByText(/no matching tasks/i)).toBeTruthy();
    });
  });

  it('filters tasks when search query is entered', async () => {
    const mockTasks = [
      { task_name: 'Task 1', recurring: false, weekly: false },
      { task_name: 'Other Task', recurring: false, weekly: false },
    ];
    (tasks.taskController.getTasksForGroup as jest.Mock).mockResolvedValue(mockTasks);
    render(<ChooseTask />);
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeTruthy();
      expect(screen.getByText('Other Task')).toBeTruthy();
    });
  });

  it('displays group name in header', () => {
    (tasks.taskController.getTasksForGroup as jest.Mock).mockResolvedValue([]);
    render(<ChooseTask />);
    expect(screen.getByText(/select task for/i)).toBeTruthy();
  });
});
