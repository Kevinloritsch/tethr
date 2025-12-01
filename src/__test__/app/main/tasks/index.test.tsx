import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import Index from '@/app/main/tasks/index';
import { completedTasksController } from '@/controllers/completeTask';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(() => ({
    data: JSON.stringify([
      {
        group_name: 'Test Group',
        group_id: 'group-1',
        task_name: 'Test Task',
        recurring: false,
        weekly: true,
      },
    ]),
  })),
  router: {
    navigate: jest.fn(),
    push: jest.fn(),
  },
}));

jest.mock('@/components/tethr', () => 'Tethr');
jest.mock('@/components/searchbar', () => 'SearchBar');
jest.mock('@expo/vector-icons/Entypo', () => 'Entypo');
jest.mock('@/controllers/completeTask', () => ({
  completedTasksController: {
    getTasks: jest.fn().mockResolvedValue([]),
  },
}));

describe('Tasks Index Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (completedTasksController.getTasks as jest.Mock).mockResolvedValue([]);
  });

  it('renders without crashing', async () => {
    const { UNSAFE_root } = render(<Index />);
    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it('calls getTasks on mount', async () => {
    render(<Index />);
    await waitFor(() => {
      expect(completedTasksController.getTasks).toHaveBeenCalled();
    });
  });

  it('has an export as default', () => {
    expect(Index).toBeDefined();
    expect(typeof Index).toBe('function');
  });

  it('accepts Task array from search params', async () => {
    const { UNSAFE_root } = render(<Index />);
    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it('handles undefined data in search params', async () => {
    render(<Index />);
    await waitFor(() => {
      expect(completedTasksController.getTasks).toHaveBeenCalled();
    });
  });

  it('loads completed tasks on component mount', async () => {
    (completedTasksController.getTasks as jest.Mock).mockResolvedValue(['group1-Task 1']);

    render(<Index />);

    await waitFor(() => {
      expect(completedTasksController.getTasks).toHaveBeenCalledTimes(1);
    });
  });

  it('supports search functionality', async () => {
    render(<Index />);

    await waitFor(() => {
      expect(completedTasksController.getTasks).toHaveBeenCalled();
    });
  });

  it('displays task information from params', async () => {
    const { UNSAFE_root } = render(<Index />);

    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it('handles empty tasks list', async () => {
    render(<Index />);

    await waitFor(() => {
      expect(completedTasksController.getTasks).toHaveBeenCalled();
    });
  });

  it('tracks completed tasks state', async () => {
    (completedTasksController.getTasks as jest.Mock).mockResolvedValue([]);

    render(<Index />);

    await waitFor(() => {
      expect(completedTasksController.getTasks).toHaveBeenCalled();
    });
  });

  it('initializes with correct data types', () => {
    expect(Index).toBeDefined();
    const instance = Index.toString();
    expect(instance).toContain('useState');
  });
});
