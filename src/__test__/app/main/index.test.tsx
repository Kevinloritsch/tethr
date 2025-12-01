import React from 'react';
import { render } from '@testing-library/react-native';
import Index from '@/app/main/index';
import * as mod from '@/app/main/index';
import { userController } from '@/controllers/userInfo';
import { getAllGroups } from '@/controllers/group';
import { photoRetrieve } from '@/controllers/photoRetrieve';
import { taskController } from '@/controllers/tasks';

jest.mock('@/controllers/userInfo', () => ({
  userController: {
    getName: jest.fn(),
  },
}));

jest.mock('@/controllers/group', () => ({
  getAllGroups: {
    fetchUserData: jest.fn(),
  },
}));

jest.mock('@/controllers/photoRetrieve', () => ({
  photoRetrieve: {
    getPhotosByGroups: jest.fn(),
  },
}));

jest.mock('@/controllers/tasks', () => ({
  taskController: {
    getTasksForGroup: jest.fn(),
  },
}));

jest.mock('@/controllers/observers/uiObservers', () => ({
  registerHomeObserver: jest.fn(),
  unregisterHomeObserver: jest.fn(),
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: () => null,
}));

describe('app/main/index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (userController.getName as jest.Mock).mockResolvedValue('Test User');
    (getAllGroups.fetchUserData as jest.Mock).mockResolvedValue([]);
    (photoRetrieve.getPhotosByGroups as jest.Mock).mockResolvedValue([]);
    (taskController.getTasksForGroup as jest.Mock).mockResolvedValue([]);
  });

  it('loads module', () => {
    expect(mod).toBeTruthy();
  });

  it('renders the screen', async () => {
    render(<Index />);
    expect(screen).toBeTruthy();
  });
});
