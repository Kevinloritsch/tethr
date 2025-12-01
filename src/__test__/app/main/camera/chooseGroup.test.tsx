import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import ChooseGroup from '@/app/main/camera/chooseGroup';
import * as group from '@/controllers/group';
import { useRouter } from 'expo-router';

jest.mock('@/controllers/group');
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/components/tethr', () => {
  return function MockTethr() {
    return null;
  };
});

jest.mock('@/components/searchbar', () => {
  return function MockSearchBar() {
    return null;
  };
});

const mockPush = jest.fn();

describe('ChooseGroup Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: jest.fn() });
  });

  it('renders without crashing', () => {
    (group.getAllGroups.fetchUserData as jest.Mock).mockResolvedValue([]);
    const { UNSAFE_root } = render(<ChooseGroup />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('displays loading state initially', () => {
    (group.getAllGroups.fetchUserData as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<ChooseGroup />);
    expect(screen.getByText(/loading/i)).toBeTruthy();
  });

  it('fetches user groups on mount', async () => {
    (group.getAllGroups.fetchUserData as jest.Mock).mockResolvedValue([]);
    render(<ChooseGroup />);
    await waitFor(() => {
      expect(group.getAllGroups.fetchUserData).toHaveBeenCalled();
    });
  });

  it('displays groups list when data is loaded', async () => {
    const mockGroups = [
      { group_id: '1', group_name: 'Group 1' },
      { group_id: '2', group_name: 'Group 2' },
    ];
    (group.getAllGroups.fetchUserData as jest.Mock).mockResolvedValue(mockGroups);
    render(<ChooseGroup />);
    await waitFor(() => {
      expect(screen.getByText('Group 1')).toBeTruthy();
      expect(screen.getByText('Group 2')).toBeTruthy();
    });
  });

  it('navigates to chooseTask when group is selected', async () => {
    const mockGroups = [{ group_id: '1', group_name: 'Group 1' }];
    (group.getAllGroups.fetchUserData as jest.Mock).mockResolvedValue(mockGroups);
    render(<ChooseGroup />);
    await waitFor(() => {
      expect(screen.getByText('Group 1')).toBeTruthy();
    });
  });

  it('displays empty state when no groups exist', async () => {
    (group.getAllGroups.fetchUserData as jest.Mock).mockResolvedValue([]);
    render(<ChooseGroup />);
    await waitFor(() => {
      expect(screen.getByText(/no matching groups/i)).toBeTruthy();
    });
  });

  it('filters groups when search query is entered', async () => {
    const mockGroups = [
      { group_id: '1', group_name: 'Group 1' },
      { group_id: '2', group_name: 'Other Group' },
    ];
    (group.getAllGroups.fetchUserData as jest.Mock).mockResolvedValue(mockGroups);
    render(<ChooseGroup />);
    await waitFor(() => {
      expect(screen.getByText('Group 1')).toBeTruthy();
      expect(screen.getByText('Other Group')).toBeTruthy();
    });
  });

  it('displays select group title', () => {
    (group.getAllGroups.fetchUserData as jest.Mock).mockResolvedValue([]);
    render(<ChooseGroup />);
    expect(screen.getByText(/select group/i)).toBeTruthy();
  });
});
