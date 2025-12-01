import { render, waitFor } from '@testing-library/react-native';
import Index from '@/app/index';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => <></>,
}));

const mockedSupabase = supabase as jest.Mocked<typeof supabase>;

describe('Index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading indicator when session is loading', () => {
    (mockedSupabase.auth.getSession as jest.Mock).mockReturnValue(
      new Promise(() => {
        // never resolves during this test
      })
    );

    (mockedSupabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    } as any);

    const { getByTestId } = render(<Index />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('shows loading indicator and then redirects when session exists', async () => {
    const mockSession = { user: { id: '123' } };
    (mockedSupabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
    } as any);

    (mockedSupabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    } as any);

    const { queryByTestId } = render(<Index />);

    await waitFor(() => {
      expect(queryByTestId('loading-indicator')).toBeNull();
    });
  });

  it('calls getSession on mount', async () => {
    (mockedSupabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    } as any);

    (mockedSupabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    } as any);

    render(<Index />);

    await waitFor(() => {
      expect(mockedSupabase.auth.getSession).toHaveBeenCalled();
    });
  });

  it('subscribes to auth state changes', async () => {
    (mockedSupabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    } as any);

    const mockUnsubscribe = jest.fn();
    (mockedSupabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    } as any);

    const { unmount } = render(<Index />);

    await waitFor(() => {
      expect(mockedSupabase.auth.onAuthStateChange).toHaveBeenCalled();
    });

    unmount();

    await waitFor(() => {
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  it('updates session when auth state changes', async () => {
    const newSession = { user: { id: '456' } };
    let authCallback: any;

    (mockedSupabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    } as any);

    (mockedSupabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: jest.fn() } } } as any;
    });

    render(<Index />);

    await waitFor(() => {
      expect(authCallback).toBeDefined();
      authCallback('SIGNED_IN', newSession);
    });
  });
});
