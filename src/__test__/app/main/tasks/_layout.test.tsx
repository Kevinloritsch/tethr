import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import TasksLayout from '@/app/main/tasks/_layout';
import { Stack } from 'expo-router';

jest.mock('expo-router', () => ({
  Stack: ({ screenOptions, children }: any) => {
    return <>{children}</>;
  },
  'Stack.Screen': jest.fn(() => null),
  useRouter: jest.fn(),
}));

const mockStack = Stack;
mockStack.Screen = jest.fn(() => null);

describe('app/main/tasks/_layout', () => {
  it('renders without crashing', async () => {
    const { UNSAFE_root } = render(<TasksLayout />);
    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it('exports TasksLayout as default', () => {
    expect(TasksLayout).toBeDefined();
    expect(typeof TasksLayout).toBe('function');
  });
});
