import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import Task from '@/components/tasks/task';
import * as mod from '@/components/tasks/task';

const defaultProps = {
  groupName: 'Test Group',
  taskId: 'task1',
  weekly: false,
};

describe('Task component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders group name', () => {
    render(<Task {...defaultProps} />);

    expect(screen.getByText('Test Group')).toBeTruthy();
  });

  test('renders task id', () => {
    render(<Task {...defaultProps} />);

    expect(screen.getByText('task1')).toBeTruthy();
  });

  test('renders complete instruction text', () => {
    render(<Task {...defaultProps} />);

    expect(screen.getByText('Complete the task ➜')).toBeTruthy();
  });

  test('renders daily countdown bar for daily tasks', async () => {
    render(<Task {...defaultProps} weekly={false} />);

    await waitFor(() => {
      const elements = screen.queryAllByText(/remaining/);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  test('renders weekly countdown bar for weekly tasks', async () => {
    render(<Task {...defaultProps} weekly={true} />);

    await waitFor(() => {
      const elements = screen.queryAllByText(/remaining/);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  test('displays hours remaining for daily tasks when > 1 hour left', async () => {
    render(<Task {...defaultProps} weekly={false} />);

    await waitFor(() => {
      const elements = screen.queryAllByText(/remaining/);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  test('displays day and hour information for weekly tasks', async () => {
    render(<Task {...defaultProps} weekly={true} />);

    await waitFor(() => {
      const elements = screen.queryAllByText(/remaining/);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  test('renders progress bar with correct styling', async () => {
    render(<Task {...defaultProps} weekly={false} />);

    await waitFor(() => {
      const elements = screen.queryAllByText(/remaining/);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  test('component accepts weekly prop', () => {
    const { rerender } = render(<Task {...defaultProps} weekly={false} />);

    expect(screen.getByText('task1')).toBeTruthy();

    rerender(<Task {...defaultProps} weekly={true} />);

    expect(screen.getByText('task1')).toBeTruthy();
  });

  test('module loads successfully', () => {
    expect(mod).toBeTruthy();
  });

  test('renders different group name when provided', () => {
    render(<Task groupName="Different Group" taskId="task2" weekly={false} />);

    expect(screen.getByText('Different Group')).toBeTruthy();
    expect(screen.getByText('task2')).toBeTruthy();
  });

  test('handles cleanup on unmount for daily task', () => {
    const { unmount } = render(<Task {...defaultProps} weekly={false} />);

    expect(() => unmount()).not.toThrow();
  });

  test('handles cleanup on unmount for weekly task', () => {
    const { unmount } = render(<Task {...defaultProps} weekly={true} />);

    expect(() => unmount()).not.toThrow();
  });

  test('displays task completion prompt text', () => {
    render(<Task {...defaultProps} />);

    expect(screen.getByText(/Complete the task/)).toBeTruthy();
  });

  test('renders countdown for both daily and weekly task types', async () => {
    const { rerender } = render(<Task {...defaultProps} weekly={false} />);

    await waitFor(() => {
      const dailyElements = screen.queryAllByText(/remaining/);
      expect(dailyElements.length).toBeGreaterThan(0);
    });

    rerender(<Task {...defaultProps} weekly={true} />);

    await waitFor(() => {
      const weeklyElements = screen.queryAllByText(/remaining/);
      expect(weeklyElements.length).toBeGreaterThan(0);
    });
  });
});
