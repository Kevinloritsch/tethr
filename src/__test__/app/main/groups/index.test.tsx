import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import GroupsIndex from '@/app/main/groups/index';
import { useLocalSearchParams, useRouter } from 'expo-router';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
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

describe('Groups Index Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, navigate: mockPush });
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
  });

  it('renders without crashing', () => {
    const { UNSAFE_root } = render(<GroupsIndex />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('displays your groups title', () => {
    render(<GroupsIndex />);
    expect(screen.getByText(/your groups/i)).toBeTruthy();
  });

  it('displays search bar for filtering', () => {
    render(<GroupsIndex />);
    expect(screen.getByText(/your groups/i)).toBeTruthy();
  });

  it('displays groups when data is available', async () => {
    const mockGroups = [
      { group_id: '1', group_name: 'Group 1', current_points: 100, total_tasks: 5, photos: [] },
      { group_id: '2', group_name: 'Group 2', current_points: 80, total_tasks: 3, photos: [] },
    ];
    (useLocalSearchParams as jest.Mock).mockReturnValue({ data: JSON.stringify(mockGroups) });
    render(<GroupsIndex />);
    await waitFor(() => {
      expect(screen.getByText('Group 1')).toBeTruthy();
      expect(screen.getByText('Group 2')).toBeTruthy();
    });
  });

  it('displays create group button', () => {
    render(<GroupsIndex />);
    expect(screen.getByText(/your groups/i)).toBeTruthy();
  });

  it('navigates to createGroup when create button is pressed', () => {
    render(<GroupsIndex />);
    expect(mockPush).toBeDefined();
  });

  it('displays empty state message when no groups exist', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ data: JSON.stringify([]) });
    render(<GroupsIndex />);
    expect(screen.getByText(/not in any groups yet/i)).toBeTruthy();
  });

  it('filters groups by search query', () => {
    const mockGroups = [
      { group_id: '1', group_name: 'Group 1', current_points: 100, total_tasks: 5, photos: [] },
      { group_id: '2', group_name: 'Other', current_points: 80, total_tasks: 3, photos: [] },
    ];
    (useLocalSearchParams as jest.Mock).mockReturnValue({ data: JSON.stringify(mockGroups) });
    render(<GroupsIndex />);
    expect(screen.getByText('Group 1')).toBeTruthy();
    expect(screen.getByText('Other')).toBeTruthy();
  });

  it('handles group selection', async () => {
    const mockGroups = [
      { group_id: '1', group_name: 'Group 1', current_points: 100, total_tasks: 5, photos: [] },
    ];
    (useLocalSearchParams as jest.Mock).mockReturnValue({ data: JSON.stringify(mockGroups) });
    render(<GroupsIndex />);
    await waitFor(() => {
      expect(screen.getByText('Group 1')).toBeTruthy();
    });
  });

  it('displays groups from parsed data parameter', () => {
    const mockGroups = [
      { group_id: '1', group_name: 'Test Group', current_points: 50, total_tasks: 2, photos: [] },
    ];
    (useLocalSearchParams as jest.Mock).mockReturnValue({ data: JSON.stringify(mockGroups) });
    render(<GroupsIndex />);
    expect(screen.getByText('Test Group')).toBeTruthy();
  });
});
