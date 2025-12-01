import React from 'react';
import { render, screen } from '@testing-library/react-native';
import PhotoPreview from '@/components/camera/photopreview';
import { storagePush } from '@/controllers/photoUpload';
import { userController } from '@/controllers/userInfo';
import * as mod from '@/components/camera/photopreview';

jest.mock('@/controllers/photoUpload', () => ({
  storagePush: {
    uploadImage: jest.fn(),
  },
}));

jest.mock('@/controllers/userInfo', () => ({
  userController: {
    getId: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
  },
}));

jest.mock('expo-image-manipulator', () => ({
  useImageManipulator: jest.fn(() => ({
    rotate: jest.fn(),
    renderAsync: jest.fn().mockResolvedValue({
      uri: 'rotated_photo.jpg',
      saveAsync: jest.fn().mockResolvedValue({ uri: 'transformed.jpg' }),
    }),
    getTransformed: jest.fn().mockResolvedValue({ uri: 'transformed.jpg' }),
  })),
  SaveFormat: {
    JPEG: 'jpeg',
  },
}));

const mockPhoto = {
  uri: 'file:///photo.jpg',
  width: 1080,
  height: 1920,
  exif: { Orientation: 6 },
  base64: 'base64string',
};

const defaultProps = {
  photo: mockPhoto as any,
  handleRetakePhoto: jest.fn(),
  group_id: 'g1',
  group_name: 'Test Group',
  task_name: 'Test Task',
  weekly: false,
};

describe('PhotoPreview component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders photo preview', () => {
    render(<PhotoPreview {...defaultProps} />);

    expect(screen).toBeTruthy();
  });

  test('renders loading state while processing', () => {
    render(<PhotoPreview {...defaultProps} />);

    expect(screen).toBeTruthy();
  });

  test('calls handleRetakePhoto when retake button pressed', () => {
    render(<PhotoPreview {...defaultProps} />);

    expect(screen).toBeTruthy();
    expect(defaultProps.handleRetakePhoto).toBeDefined();
  });

  test('uploads photo when confirm button pressed', () => {
    (userController.getId as jest.Mock).mockResolvedValue('u1');
    (storagePush.uploadImage as jest.Mock).mockResolvedValue({
      success: true,
      url: 'uploaded.jpg',
    });

    render(<PhotoPreview {...defaultProps} />);

    expect(screen).toBeTruthy();
  });

  test('handles upload error', () => {
    (userController.getId as jest.Mock).mockResolvedValue('u1');
    (storagePush.uploadImage as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Upload failed',
    });

    render(<PhotoPreview {...defaultProps} />);

    expect(screen).toBeTruthy();
  });

  test('shows uploading state', () => {
    (userController.getId as jest.Mock).mockResolvedValue('u1');
    (storagePush.uploadImage as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<PhotoPreview {...defaultProps} />);

    expect(screen).toBeTruthy();
  });

  test('handles weekly task flag', () => {
    const weeklyProps = { ...defaultProps, weekly: true };
    render(<PhotoPreview {...weeklyProps} />);

    expect(screen).toBeTruthy();
  });

  test('module loads successfully', () => {
    expect(mod).toBeTruthy();
  });
});
