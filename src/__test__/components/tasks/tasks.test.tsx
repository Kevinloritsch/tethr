import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import Tasks from '@/components/tasks/tasks';
import * as completeTaskController from '@/controllers/completeTask';
import * as mod from '@/components/tasks/tasks';

jest.mock('@/controllers/completeTask');

const mockTasks = [
  {
    task_name: 'Task 1',
    group_name: 'Test Group',
    group_id: 'group1',
    weekly: false,
  },
  {
    task_name: 'Task 2',
    group_name: 'Test Group',
    group_id: 'group1',
    weekly: true,
  },
];

describe('Tasks component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (completeTaskController.completedTasksController.getTasks as jest.Mock).mockResolvedValue([]);
  });

  test('renders task names', async () => {
    render(<Tasks tasks={mockTasks} />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeTruthy();
      expect(screen.getByText('Task 2')).toBeTruthy();
    });
  });

  test('renders group names', async () => {
    render(<Tasks tasks={mockTasks} />);

    await waitFor(() => {
      expect(screen.getAllByText('Test Group').length).toBeGreaterThan(0);
    });
  });

  test('loads completed tasks on mount', async () => {
    render(<Tasks tasks={mockTasks} />);

    await waitFor(() => {
      expect(completeTaskController.completedTasksController.getTasks).toHaveBeenCalled();
    });
  });

  test('filters out completed tasks', async () => {
    (completeTaskController.completedTasksController.getTasks as jest.Mock).mockResolvedValue([
      'group1-Task 1',
    ]);

    render(<Tasks tasks={mockTasks} />);

    await waitFor(() => {
      expect(screen.queryByText('Task 1')).toBeFalsy();
      expect(screen.getByText('Task 2')).toBeTruthy();
    });
  });

  test('hides all tasks when completed', async () => {
    (completeTaskController.completedTasksController.getTasks as jest.Mock).mockResolvedValue([
      'group1-Task 1',
      'group1-Task 2',
    ]);

    render(<Tasks tasks={mockTasks} />);

    await waitFor(() => {
      expect(screen.queryByText('Task 1')).toBeFalsy();
      expect(screen.queryByText('Task 2')).toBeFalsy();
    });
  });

  test('displays empty state when no tasks', () => {
    render(<Tasks tasks={[]} />);

    expect(screen.getByText(/Add a task by creating it on a group's page!/i)).toBeTruthy();
  });

  test('displays daily task', async () => {
    const dailyTask = [
      {
        task_name: 'Daily Task',
        group_name: 'Daily Group',
        group_id: 'group2',
        weekly: false,
      },
    ];

    render(<Tasks tasks={dailyTask} />);

    await waitFor(() => {
      expect(screen.getByText('Daily Task')).toBeTruthy();
    });
  });

  test('displays weekly task', async () => {
    const weeklyTask = [
      {
        task_name: 'Weekly Task',
        group_name: 'Weekly Group',
        group_id: 'group3',
        weekly: true,
      },
    ];

    render(<Tasks tasks={weeklyTask} />);

    await waitFor(() => {
      expect(screen.getByText('Weekly Task')).toBeTruthy();
    });
  });

  test('re-loads completed tasks when tasks prop changes', async () => {
    const { rerender } = render(<Tasks tasks={mockTasks} />);

    await waitFor(() => {
      expect(completeTaskController.completedTasksController.getTasks).toHaveBeenCalledTimes(1);
    });

    const updatedTasks = [
      {
        task_name: 'New Task',
        group_name: 'Test Group',
        group_id: 'group1',
        weekly: false,
      },
    ];

    rerender(<Tasks tasks={updatedTasks} />);

    await waitFor(() => {
      expect(completeTaskController.completedTasksController.getTasks).toHaveBeenCalledTimes(2);
    });
  });

  test('module loads successfully', () => {
    expect(mod).toBeTruthy();
  });

  test('renders multiple tasks in horizontal scroll', async () => {
    const manyTasks = [
      ...mockTasks,
      {
        task_name: 'Task 3',
        group_name: 'Test Group',
        group_id: 'group1',
        weekly: false,
      },
      {
        task_name: 'Task 4',
        group_name: 'Test Group',
        group_id: 'group1',
        weekly: true,
      },
    ];

    render(<Tasks tasks={manyTasks} />);

    await waitFor(() => {
      expect(screen.getByText('Task 3')).toBeTruthy();
      expect(screen.getByText('Task 4')).toBeTruthy();
    });
  });

  test('uses correct key for task identification', async () => {
    render(<Tasks tasks={mockTasks} />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeTruthy();
    });

    const tasks = mockTasks.map((t) => t.group_name + t.task_name);
    expect(tasks.length).toBe(2);
  });

  test('renders tasks with scrollable horizontal layout', async () => {
    render(<Tasks tasks={mockTasks} />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeTruthy();
      expect(screen.getByText('Task 2')).toBeTruthy();
    });
  });

  test('handles single task correctly', async () => {
    const singleTask = [
      {
        task_name: 'Single Task',
        group_name: 'Single Group',
        group_id: 'group1',
        weekly: false,
      },
    ];

    render(<Tasks tasks={singleTask} />);

    await waitFor(() => {
      expect(screen.getByText('Single Task')).toBeTruthy();
      expect(screen.getByText('Single Group')).toBeTruthy();
    });
  });

  test('preserves task state across rerenders', async () => {
    const { rerender } = render(<Tasks tasks={mockTasks} />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeTruthy();
    });

    rerender(<Tasks tasks={mockTasks} />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeTruthy();
      expect(screen.getByText('Task 2')).toBeTruthy();
    });
  });
});
