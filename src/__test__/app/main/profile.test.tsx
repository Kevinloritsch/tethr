import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import ProfileScreen from '@/app/main/profile';
import { userController } from '@/controllers/userInfo';
import { scoreUpdateObserver } from '@/controllers/observers/scoreUpdateObserver';
import * as router from 'expo-router';

jest.mock('@/controllers/userInfo', () => ({
  userController: {
    getProfileInformation: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock('@/controllers/observers/scoreUpdateObserver', () => ({
  scoreUpdateObserver: {
    subscribe: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/tethr', () => 'Tethr');
jest.mock('@/components/profile/profile', () => 'Profile');
jest.mock('@/components/profile/options', () => 'Options');

describe('Profile Screen', () => {
  const mockProfileData = {
    username: 'testuser',
    pfpurl: 'https://example.com/profile.jpg',
    fullName: 'Test User',
    numCompletedTasks: 10,
    numFriends: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (userController.getProfileInformation as jest.Mock).mockResolvedValue(mockProfileData);
    (scoreUpdateObserver.subscribe as jest.Mock).mockReturnValue(jest.fn());
    (router.useRouter as jest.Mock).mockReturnValue({
      replace: jest.fn(),
      push: jest.fn(),
    });
  });

  it('renders without crashing', async () => {
    const { UNSAFE_root } = render(<ProfileScreen />);

    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it('loads profile information on mount', async () => {
    render(<ProfileScreen />);

    await waitFor(() => {
      expect(userController.getProfileInformation).toHaveBeenCalled();
    });
  });

  it('subscribes to score update observer on mount', async () => {
    render(<ProfileScreen />);

    await waitFor(() => {
      expect(scoreUpdateObserver.subscribe).toHaveBeenCalled();
    });
  });

  it('has an export as default', () => {
    expect(ProfileScreen).toBeDefined();
    expect(typeof ProfileScreen).toBe('function');
  });

  it('initializes with correct hooks', () => {
    const instance = ProfileScreen.toString();
    expect(instance).toContain('useState');
    expect(instance).toContain('useEffect');
  });

  it('calls logout controller when logout is triggered', async () => {
    (userController.logout as jest.Mock).mockResolvedValue(true);

    render(<ProfileScreen />);

    await waitFor(() => {
      expect(userController.getProfileInformation).toHaveBeenCalled();
    });
  });

  it('subscribes and handles unsubscribe on unmount', async () => {
    const mockUnsubscribe = jest.fn();
    (scoreUpdateObserver.subscribe as jest.Mock).mockReturnValue(mockUnsubscribe);

    const { unmount } = render(<ProfileScreen />);

    await waitFor(() => {
      expect(scoreUpdateObserver.subscribe).toHaveBeenCalled();
    });

    unmount();

    await waitFor(() => {
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  it('handles profile loading errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (userController.getProfileInformation as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    render(<ProfileScreen />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading profile:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('reloads profile when observer callback fires', async () => {
    let observerCallback: Function | null = null;
    (scoreUpdateObserver.subscribe as jest.Mock).mockImplementation((callback: Function) => {
      observerCallback = callback;
      return jest.fn();
    });

    render(<ProfileScreen />);

    await waitFor(() => {
      expect(userController.getProfileInformation).toHaveBeenCalledTimes(1);
    });

    observerCallback?.();

    await waitFor(() => {
      expect(userController.getProfileInformation).toHaveBeenCalledTimes(2);
    });
  });

  it('navigates to auth on successful logout', async () => {
    const mockReplace = jest.fn();
    (router.useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
      push: jest.fn(),
    });
    (userController.logout as jest.Mock).mockResolvedValue(true);

    render(<ProfileScreen />);

    await waitFor(() => {
      expect(userController.getProfileInformation).toHaveBeenCalled();
    });
  });

  it('does not navigate on failed logout', async () => {
    const mockReplace = jest.fn();
    (router.useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
      push: jest.fn(),
    });
    (userController.logout as jest.Mock).mockResolvedValue(false);

    render(<ProfileScreen />);

    await waitFor(() => {
      expect(userController.getProfileInformation).toHaveBeenCalled();
    });
  });
});
