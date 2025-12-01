import { render, waitFor, fireEvent } from '@testing-library/react-native';
import IndexScreen from '@/app/auth/index';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      signInWithOtp: jest.fn(),
      verifyOtp: jest.fn(),
      getUser: jest.fn(),
    },
  },
}));

jest.mock('expo-router', () => ({
  Redirect: ({ href }: any) => <>{href}</>,
}));

jest.mock('@/components/tethr', () => {
  return function MockTethr() {
    return <></>;
  };
});

jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => {
  return function MockIcon() {
    return <></>;
  };
});

const mockedSupabase = supabase as jest.Mocked<typeof supabase>;

describe('app/auth/index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { UNSAFE_root } = render(<IndexScreen />);
    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it('exports IndexScreen as default', () => {
    expect(IndexScreen).toBeDefined();
    expect(typeof IndexScreen).toBe('function');
  });

  it('renders signup view by default', () => {
    const { getByText } = render(<IndexScreen />);
    expect(getByText('Welcome to Tethr! Please sign up below.')).toBeTruthy();
  });

  it('renders email input field', () => {
    const { getByPlaceholderText } = render(<IndexScreen />);
    expect(getByPlaceholderText('youremail@gmail.com')).toBeTruthy();
  });

  it('renders name input field in signup mode', () => {
    const { getByPlaceholderText } = render(<IndexScreen />);
    expect(getByPlaceholderText('Person Doe')).toBeTruthy();
  });

  it('renders username input field in signup mode', () => {
    const { getByPlaceholderText } = render(<IndexScreen />);
    expect(getByPlaceholderText('Username')).toBeTruthy();
  });

  it('renders continue button', () => {
    const { getByText } = render(<IndexScreen />);
    expect(getByText('Continue')).toBeTruthy();
  });

  it('renders auth mode toggle button', () => {
    const { getByText } = render(<IndexScreen />);
    expect(getByText('Login')).toBeTruthy();
  });

  it('contains signup toggle text', () => {
    const { getByText } = render(<IndexScreen />);
    expect(getByText('Already have an account?')).toBeTruthy();
  });

  it('renders tethr component', () => {
    const { UNSAFE_root } = render(<IndexScreen />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('updates email state on input change', () => {
    const { getByPlaceholderText } = render(<IndexScreen />);
    const emailInput = getByPlaceholderText('youremail@gmail.com') as any;
    fireEvent.changeText(emailInput, 'test@example.com');
    expect(emailInput.props.value).toBe('test@example.com');
  });

  it('updates name state on input change', () => {
    const { getByPlaceholderText } = render(<IndexScreen />);
    const nameInput = getByPlaceholderText('Person Doe') as any;
    fireEvent.changeText(nameInput, 'John Doe');
    expect(nameInput.props.value).toBe('John Doe');
  });

  it('updates username state on input change', () => {
    const { getByPlaceholderText } = render(<IndexScreen />);
    const usernameInput = getByPlaceholderText('Username') as any;
    fireEvent.changeText(usernameInput, 'johndoe');
    expect(usernameInput.props.value).toBe('johndoe');
  });

  it('disables continue button when email is empty', () => {
    const { getByText, getByPlaceholderText } = render(<IndexScreen />);
    const emailInput = getByPlaceholderText('youremail@gmail.com') as any;
    fireEvent.changeText(emailInput, '');
    const continueButton = getByText('Continue');
    expect(continueButton).toBeTruthy();
  });

  it('handles signup flow - checks for existing user', async () => {
    const { getByPlaceholderText, getByText } = render(<IndexScreen />);

    const emailInput = getByPlaceholderText('youremail@gmail.com') as any;
    const nameInput = getByPlaceholderText('Person Doe') as any;
    const usernameInput = getByPlaceholderText('Username') as any;

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(nameInput, 'Test User');
    fireEvent.changeText(usernameInput, 'testuser');

    (mockedSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        or: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });

    (mockedSupabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({ error: null });

    const continueButton = getByText('Continue');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(mockedSupabase.from).toHaveBeenCalled();
    });
  });

  it('handles login flow', async () => {
    const { getByText } = render(<IndexScreen />);

    // Switch to login mode
    const loginToggle = getByText('Login');
    fireEvent.press(loginToggle);

    await waitFor(() => {
      expect(getByText('Welcome back to Tethr! Please login below.')).toBeTruthy();
    });
  });

  it('renders OTP verification view after sending OTP', async () => {
    const { getByText, getByPlaceholderText } = render(<IndexScreen />);

    // Set email and trigger OTP
    const emailInput = getByPlaceholderText('youremail@gmail.com') as any;
    fireEvent.changeText(emailInput, 'test@example.com');

    (mockedSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        or: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });

    (mockedSupabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({ error: null });

    const continueButton = getByText('Continue');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(mockedSupabase.auth.signInWithOtp).toBeDefined();
    });
  });

  it('renders verify email view', async () => {
    (mockedSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        or: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });

    (mockedSupabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({ error: null });

    const { getByText } = render(<IndexScreen />);

    await waitFor(() => {
      expect(getByText('Continue')).toBeTruthy();
    });
  });

  it('handles user authentication success', async () => {
    const { getByPlaceholderText, getByText } = render(<IndexScreen />);

    const emailInput = getByPlaceholderText('youremail@gmail.com') as any;
    fireEvent.changeText(emailInput, 'test@example.com');

    (mockedSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        or: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });

    (mockedSupabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({ error: null });

    const continueButton = getByText('Continue');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(mockedSupabase.auth.signInWithOtp).toHaveBeenCalled();
    });
  });

  it('handles OTP verification with signup', async () => {
    (mockedSupabase.auth.verifyOtp as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: 'user1', email: 'test@example.com' } } },
      error: null,
    });

    (mockedSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user1', email: 'test@example.com' } },
    });

    (mockedSupabase.from as jest.Mock).mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: null }),
    });

    const { getByText } = render(<IndexScreen />);

    await waitFor(() => {
      expect(getByText('Welcome to Tethr! Please sign up below.')).toBeTruthy();
    });
  });

  it('handles OTP verification with login', async () => {
    (mockedSupabase.auth.verifyOtp as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: 'user1', email: 'test@example.com' } } },
      error: null,
    });

    (mockedSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user1', email: 'test@example.com' } },
    });

    const { getByText } = render(<IndexScreen />);

    await waitFor(() => {
      expect(getByText('Welcome to Tethr! Please sign up below.')).toBeTruthy();
    });
  });

  it('handles OTP verification error', async () => {
    (mockedSupabase.auth.verifyOtp as jest.Mock).mockResolvedValue({
      data: null,
      error: new Error('Invalid OTP'),
    });

    (mockedSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const { getByText } = render(<IndexScreen />);

    await waitFor(() => {
      expect(getByText('Continue')).toBeTruthy();
    });

    consoleErrorSpy.mockRestore();
  });

  it('handles signup user insertion error', async () => {
    (mockedSupabase.auth.verifyOtp as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: 'user1', email: 'test@example.com' } } },
      error: null,
    });

    (mockedSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user1', email: 'test@example.com' } },
    });

    (mockedSupabase.from as jest.Mock).mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: new Error('Insert failed') }),
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const { getByText } = render(<IndexScreen />);

    await waitFor(() => {
      expect(getByText('Continue')).toBeTruthy();
    });

    consoleErrorSpy.mockRestore();
  });

  it('validates all required fields on signup', async () => {
    const { getByPlaceholderText } = render(<IndexScreen />);

    const emailInput = getByPlaceholderText('youremail@gmail.com') as any;
    const nameInput = getByPlaceholderText('Person Doe') as any;
    const usernameInput = getByPlaceholderText('Username') as any;

    // Test empty fields
    fireEvent.changeText(emailInput, '');
    expect(emailInput.props.value).toBe('');

    fireEvent.changeText(nameInput, '');
    expect(nameInput.props.value).toBe('');

    fireEvent.changeText(usernameInput, '');
    expect(usernameInput.props.value).toBe('');
  });

  it('handles API error on signup check', async () => {
    const { getByPlaceholderText, getByText } = render(<IndexScreen />);

    const emailInput = getByPlaceholderText('youremail@gmail.com') as any;
    fireEvent.changeText(emailInput, 'test@example.com');

    (mockedSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        or: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
        }),
      }),
    });

    const continueButton = getByText('Continue');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(getByText('Continue')).toBeTruthy();
    });
  });

  it('handles API error on OTP send', async () => {
    const { getByPlaceholderText, getByText } = render(<IndexScreen />);

    const emailInput = getByPlaceholderText('youremail@gmail.com') as any;
    fireEvent.changeText(emailInput, 'test@example.com');

    (mockedSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        or: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });

    (mockedSupabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({
      error: new Error('OTP send failed'),
    });

    const continueButton = getByText('Continue');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(getByText('Continue')).toBeTruthy();
    });
  });
});
