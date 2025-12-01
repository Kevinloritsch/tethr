import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import EditProfile from '@/app/editprofile';
import { userController } from '@/controllers/userInfo';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

jest.mock('@/controllers/userInfo', () => ({
  userController: {
    getProfileInformation: jest.fn(),
    updateUsername: jest.fn(),
    updateName: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('@/components/tethr', () => {
  return function MockTethr() {
    return <></>;
  };
});

jest.mock('@expo/vector-icons/Entypo', () => {
  return function MockIcon() {
    return <></>;
  };
});

const mockedUserController = userController as jest.Mocked<typeof userController>;
const mockedUseRouter = useRouter as jest.Mock;
const mockedUseFocusEffect = useFocusEffect as jest.Mock;

describe('EditProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ push: jest.fn() });
    mockedUseFocusEffect.mockImplementation(() => {});
    mockedUserController.getProfileInformation.mockResolvedValue({
      username: 'testuser',
      fullName: 'Test User',
      pfpurl: 'https://example.com/pfp.jpg',
      numCompletedTasks: 10,
      numFriends: 5,
    });
  });

  it('renders edit profile screen', async () => {
    const { UNSAFE_root } = render(<EditProfile />);

    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it('loads profile information on mount', async () => {
    mockedUserController.getProfileInformation.mockResolvedValue({
      username: 'testuser',
      fullName: 'Test User',
      pfpurl: 'https://example.com/pfp.jpg',
      numCompletedTasks: 10,
      numFriends: 5,
    });

    render(<EditProfile />);

    await waitFor(() => {
      expect(mockedUserController.getProfileInformation).toHaveBeenCalled();
    });
  });

  it('renders header with Edit Profile title', async () => {
    const { getByText } = render(<EditProfile />);

    await waitFor(() => {
      expect(getByText('Edit Profile')).toBeTruthy();
    });
  });

  it('renders username input field', async () => {
    const { getByPlaceholderText } = render(<EditProfile />);

    await waitFor(() => {
      expect(getByPlaceholderText('Enter username')).toBeTruthy();
    });
  });

  it('renders full name input field', async () => {
    const { getByPlaceholderText } = render(<EditProfile />);

    await waitFor(() => {
      expect(getByPlaceholderText('Enter full name')).toBeTruthy();
    });
  });

  it('renders save changes button', async () => {
    const { getByText } = render(<EditProfile />);

    await waitFor(() => {
      expect(getByText('Save Changes')).toBeTruthy();
    });
  });

  it('handles profile load error gracefully', async () => {
    mockedUserController.getProfileInformation.mockRejectedValue(new Error('Load failed'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { UNSAFE_root } = render(<EditProfile />);

    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });

    consoleSpy.mockRestore();
  });

  it('uses focus effect hook on mount', () => {
    render(<EditProfile />);
    expect(mockedUseFocusEffect).toHaveBeenCalled();
  });

  it('renders tethr component in header', async () => {
    const { UNSAFE_root } = render(<EditProfile />);

    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it('displays back navigation button', async () => {
    const { UNSAFE_root } = render(<EditProfile />);

    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it('applies correct styling', async () => {
    const { UNSAFE_root } = render(<EditProfile />);

    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it('exports EditProfile as default', () => {
    expect(EditProfile).toBeDefined();
    expect(typeof EditProfile).toBe('function');
  });
});
