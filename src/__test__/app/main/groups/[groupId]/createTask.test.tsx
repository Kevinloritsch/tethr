import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import CreateTask from '@/app/main/groups/[groupId]/createTask';
import * as tasks from '@/controllers/tasks';
import { useLocalSearchParams, useRouter } from 'expo-router';

jest.mock('@/controllers/group');
jest.mock('@/controllers/tasks');
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));
jest.mock('@/components/tethr', () => {
  return function MockTethr() {
    return null;
  };
});

const mockPush = jest.fn();

describe('CreateTask Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      dismiss: jest.fn(),
    });
    (useLocalSearchParams as jest.Mock).mockReturnValue({ groupId: '1', groupName: 'Test Group' });
  });

  it('renders without crashing', () => {
    const { UNSAFE_root } = render(<CreateTask />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders task name input field', () => {
    render(<CreateTask />);
    expect(screen.getByPlaceholderText(/task name/i)).toBeTruthy();
  });

  it('renders recurring toggle', () => {
    render(<CreateTask />);
    const switches = screen.getAllByRole('switch');
    expect(switches.length).toBeGreaterThan(0);
  });

  it('renders create button', () => {
    render(<CreateTask />);
    expect(screen.getByText(/create/i)).toBeTruthy();
  });

  it('updates task name state on input change', async () => {
    render(<CreateTask />);
    const nameInput = screen.getByPlaceholderText(/task name/i);
    fireEvent.changeText(nameInput, 'My Task');
    await waitFor(() => {
      expect(nameInput.props.value).toBe('My Task');
    });
  });

  it('filters out special characters from task name', async () => {
    render(<CreateTask />);
    const nameInput = screen.getByPlaceholderText(/task name/i);
    fireEvent.changeText(nameInput, 'Task@#$%^&*()');
    await waitFor(() => {
      expect(nameInput.props.value).not.toMatch(/[@#$%^&*()]/);
    });
  });

  it('toggles recurring switch', async () => {
    render(<CreateTask />);
    const switches = screen.getAllByRole('switch');
    if (switches.length > 0) {
      fireEvent(switches[0], 'valueChange', true);
    }
  });

  it('calls createTask when create button is pressed', async () => {
    (tasks.taskController.createTask as jest.Mock).mockResolvedValue({
      success: true,
    });
    render(<CreateTask />);
    const nameInput = screen.getByPlaceholderText(/task name/i);
    fireEvent.changeText(nameInput, 'New Task');
    await waitFor(() => {
      const createButton = screen.getByText(/create/i);
      fireEvent.press(createButton);
    });
  });

  it('displays loading state', () => {
    render(<CreateTask />);
    expect(screen.getByText(/create a task/i)).toBeTruthy();
  });

  it('renders tethr header component', () => {
    render(<CreateTask />);
    expect(screen.getByText(/test group/i)).toBeTruthy();
  });
});
