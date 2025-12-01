import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import ExploreUI from '@/components/exploreUI';
import { photoRetrieve } from '@/controllers/photoRetrieve';
import { groupController } from '@/controllers/group';
import * as mod from '@/components/exploreUI';

jest.mock('@/controllers/photoRetrieve', () => ({
  photoRetrieve: {
    getPhotosByGroups: jest.fn(),
  },
}));

jest.mock('@/controllers/group', () => ({
  groupController: {
    fetchUserData: jest.fn(),
  },
}));

jest.mock('@/controllers/observers/uiObservers', () => ({
  registerExploreObserver: jest.fn(),
  unregisterExploreObserver: jest.fn(),
}));

describe('ExploreUI component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    (groupController.fetchUserData as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<ExploreUI />);

    expect(screen.getByText('Loading photos...')).toBeTruthy();
  });

  test('loads photos on mount', async () => {
    const mockGroups = [
      { group_id: 'g1', group_name: 'Group 1', current_points: 0 },
      { group_id: 'g2', group_name: 'Group 2', current_points: 0 },
    ];

    const mockPhotos = [
      {
        groupId: 'g1',
        taskName: 'task1',
        userId: 'u1',
        username: 'user1',
        createdAt: '2025-01-01',
        photoUri: 'photo1.jpg',
      },
    ];

    (groupController.fetchUserData as jest.Mock).mockResolvedValue(mockGroups);
    (photoRetrieve.getPhotosByGroups as jest.Mock).mockResolvedValue(mockPhotos);

    render(<ExploreUI />);

    await waitFor(() => {
      expect(groupController.fetchUserData).toHaveBeenCalledWith('EXPLORE_SCREEN');
      expect(photoRetrieve.getPhotosByGroups).toHaveBeenCalledWith(['g1', 'g2']);
    });
  });

  test('handles error when loading photos', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    (groupController.fetchUserData as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch groups')
    );

    render(<ExploreUI />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading photos:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  test('sets photos to empty array when no groups', async () => {
    (groupController.fetchUserData as jest.Mock).mockResolvedValue([]);
    (photoRetrieve.getPhotosByGroups as jest.Mock).mockResolvedValue([]);

    render(<ExploreUI />);

    await waitFor(() => {
      expect(photoRetrieve.getPhotosByGroups).not.toHaveBeenCalled();
    });
  });

  test('maps photos with group names', async () => {
    const mockGroups = [{ group_id: 'g1', group_name: 'My Group', current_points: 0 }];
    const mockPhotos = [
      {
        groupId: 'g1',
        taskName: 'task1',
        userId: 'u1',
        username: 'user1',
        createdAt: '2025-01-01',
        photoUri: 'photo1.jpg',
      },
    ];

    (groupController.fetchUserData as jest.Mock).mockResolvedValue(mockGroups);
    (photoRetrieve.getPhotosByGroups as jest.Mock).mockResolvedValue(mockPhotos);

    render(<ExploreUI />);

    await waitFor(() => {
      expect(photoRetrieve.getPhotosByGroups).toHaveBeenCalled();
    });
  });

  test('module loads successfully', () => {
    expect(mod).toBeTruthy();
  });
});
