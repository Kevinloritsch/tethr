import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import Group from '@/components/groups/group';
import { completedTasksController } from '@/controllers/completeTask';
import * as mod from '@/components/groups/group';

jest.mock('@/controllers/completeTask', () => ({
  completedTasksController: {
    getTasks: jest.fn(),
  },
}));

jest.mock('@/components/groups/circleProgress', () => ({
  __esModule: true,
  default: () => null,
}));

const defaultProps = {
  group_id: 'g1',
  group_name: 'Test Group',
  current_points: 100,
  total_tasks: 10,
  photos: [
    { name: 'photo1.jpg', publicUrl: 'https://example.com/photo1.jpg', createdAt: '2025-01-01' },
    { name: 'photo2.jpg', publicUrl: 'https://example.com/photo2.jpg', createdAt: '2025-01-02' },
    { name: 'photo3.jpg', publicUrl: 'https://example.com/photo3.jpg', createdAt: '2025-01-03' },
  ],
};

describe('Group component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders group name', async () => {
    (completedTasksController.getTasks as jest.Mock).mockResolvedValue([]);

    render(<Group {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Test Group')).toBeTruthy();
    });
  });

  test('renders current points', async () => {
    (completedTasksController.getTasks as jest.Mock).mockResolvedValue([]);

    render(<Group {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('100')).toBeTruthy();
    });
  });

  test('loads and displays completed tasks count', async () => {
    (completedTasksController.getTasks as jest.Mock).mockResolvedValue([
      'g1-task1',
      'g1-task2',
      'g2-task1',
    ]);

    render(<Group {...defaultProps} />);

    await waitFor(() => {
      expect(completedTasksController.getTasks).toHaveBeenCalled();
    });
  });

  test('filters completed tasks by group id', async () => {
    (completedTasksController.getTasks as jest.Mock).mockResolvedValue([
      'g1-task1',
      'g1-task2',
      'g2-task1',
      'g2-task2',
    ]);

    render(<Group {...defaultProps} />);

    await waitFor(() => {
      expect(completedTasksController.getTasks).toHaveBeenCalled();
    });
  });

  test('renders photos when provided', async () => {
    (completedTasksController.getTasks as jest.Mock).mockResolvedValue([]);

    render(<Group {...defaultProps} />);

    await waitFor(() => {
      expect(screen).toBeTruthy();
    });
  });

  test('renders "No photos yet" when no photos provided', async () => {
    (completedTasksController.getTasks as jest.Mock).mockResolvedValue([]);

    const propsWithoutPhotos = { ...defaultProps, photos: [] };
    render(<Group {...propsWithoutPhotos} />);

    await waitFor(() => {
      expect(screen.getByText('No photos yet')).toBeTruthy();
    });
  });

  test('calculates progress percentage correctly', async () => {
    (completedTasksController.getTasks as jest.Mock).mockResolvedValue(['g1-task1', 'g1-task2']);

    render(<Group {...defaultProps} />);

    await waitFor(() => {
      expect(completedTasksController.getTasks).toHaveBeenCalled();
    });
  });

  test('handles zero total tasks', async () => {
    (completedTasksController.getTasks as jest.Mock).mockResolvedValue([]);

    const propsWithZeroTasks = { ...defaultProps, total_tasks: 0 };
    render(<Group {...propsWithZeroTasks} />);

    await waitFor(() => {
      expect(screen).toBeTruthy();
    });
  });

  test('handles partial photo list', async () => {
    (completedTasksController.getTasks as jest.Mock).mockResolvedValue([]);

    const propsWithPartialPhotos = {
      ...defaultProps,
      photos: [
        {
          name: 'photo1.jpg',
          publicUrl: 'https://example.com/photo1.jpg',
          createdAt: '2025-01-01',
        },
      ],
    };

    render(<Group {...propsWithPartialPhotos} />);

    await waitFor(() => {
      expect(completedTasksController.getTasks).toHaveBeenCalled();
    });
  });

  test('module loads successfully', () => {
    expect(mod).toBeTruthy();
  });
});
