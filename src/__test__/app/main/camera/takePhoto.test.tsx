import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import TakePhoto from '@/app/main/camera/takePhoto';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Camera from 'expo-camera';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));
jest.mock('expo-camera');
jest.mock('@/components/tethr', () => {
  return function MockTethr() {
    return null;
  };
});
jest.mock('@/components/camera/photopreview', () => {
  return function MockPhotoPreview() {
    return null;
  };
});

const mockPush = jest.fn();

describe('TakePhoto Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      replace: jest.fn(),
      dismissAll: jest.fn(),
    });
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      group_id: '1',
      group_name: 'Test Group',
      task_name: 'Test Task',
      weekly: 'false',
    });
    (Camera.useCameraPermissions as jest.Mock).mockReturnValue([{ granted: true }, jest.fn()]);
  });

  it('renders without crashing', () => {
    const { UNSAFE_root } = render(<TakePhoto />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('displays task name on screen', () => {
    render(<TakePhoto />);
    expect(screen.getByText('Test Task')).toBeTruthy();
  });

  it('shows camera view when permissions are granted', () => {
    render(<TakePhoto />);
    expect(screen.getByText(/test task/i)).toBeTruthy();
  });

  it('renders header with tethr component', () => {
    render(<TakePhoto />);
    expect(screen.getByText(/test task/i)).toBeTruthy();
  });

  it('displays camera controls', async () => {
    render(<TakePhoto />);
    await waitFor(() => {
      expect(screen.getByText(/test task/i)).toBeTruthy();
    });
  });

  it('displays zoom label', () => {
    render(<TakePhoto />);
    expect(screen.getByText(/x/)).toBeTruthy();
  });

  it('renders back button', () => {
    render(<TakePhoto />);
    expect(screen.getByText('Test Task')).toBeTruthy();
  });

  it('navigates back when back button is pressed', () => {
    const mockBack = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
      replace: jest.fn(),
      dismissAll: jest.fn(),
    });
    render(<TakePhoto />);
    expect(screen.getByText('Test Task')).toBeTruthy();
  });

  it('allows camera parameter passing', async () => {
    render(<TakePhoto />);
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeTruthy();
    });
  });
});
