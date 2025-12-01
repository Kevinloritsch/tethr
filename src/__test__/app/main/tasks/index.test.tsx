import { render, waitFor } from '@testing-library/react-native';
import Index from '@/app/main/tasks/index';
import { completedTasksController } from '@/controllers/completeTask';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(() => ({
    data: JSON.stringify([
      {
        group_name: 'Test Group',
        group_id: 'group-1',
        task_name: 'Test Task',
        recurring: false,
        weekly: true,
      },
    ]),
  })),
  router: {
    navigate: jest.fn(),
    push: jest.fn(),
  },
}));

jest.mock('@/components/tethr', () => 'Tethr');
jest.mock('@/components/searchbar', () => 'SearchBar');
jest.mock('@/controllers/completeTask', () => ({
  completedTasksController: {
    getTasks: jest.fn().mockResolvedValue([]),
  },
}));

describe('app/main/tasks/index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { UNSAFE_root } = render(<Index />);
    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it('calls getTasks on mount', async () => {
    render(<Index />);
    await waitFor(() => {
      expect(completedTasksController.getTasks).toHaveBeenCalled();
    });
  });

  it('has an export as default', () => {
    expect(Index).toBeDefined();
    expect(typeof Index).toBe('function');
  });
});
