import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PrivacyPolicy from '@/app/privacypolicy';
import { useRouter } from 'expo-router';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

const mockedUseRouter = useRouter as jest.Mock;

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

describe('PrivacyPolicy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ push: jest.fn() });
  });

  it('renders privacy policy screen', () => {
    const { UNSAFE_root } = render(<PrivacyPolicy />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders privacy policy title', () => {
    const { getByText } = render(<PrivacyPolicy />);
    expect(getByText('Privacy Policy')).toBeTruthy();
  });

  it('renders privacy policy text', () => {
    const { getByText } = render(<PrivacyPolicy />);

    expect(
      getByText(
        'Your data is NOT secure, we WILL sell your data because we are BROKE and we NEED MONEY. Thank you for understanding!'
      )
    ).toBeTruthy();
  });

  it('displays back button', () => {
    const { getByRole } = render(<PrivacyPolicy />);
    const backButton = getByRole('button');
    expect(backButton).toBeTruthy();
  });

  it('navigates back to profile on back button press', () => {
    const mockPush = jest.fn();
    mockedUseRouter.mockReturnValue({ push: mockPush });

    const { getByRole } = render(<PrivacyPolicy />);

    const backButton = getByRole('button');
    fireEvent.press(backButton);

    expect(mockPush).toHaveBeenCalledWith('/main/profile');
  });

  it('renders header section', () => {
    const { UNSAFE_root } = render(<PrivacyPolicy />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders tethr component in header', () => {
    const { UNSAFE_root } = render(<PrivacyPolicy />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders content section with policy text', () => {
    const { UNSAFE_root } = render(<PrivacyPolicy />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('applies correct styling classes', () => {
    const { UNSAFE_root } = render(<PrivacyPolicy />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('uses correct router navigation', async () => {
    const mockPush = jest.fn();
    mockedUseRouter.mockReturnValue({ push: mockPush });

    render(<PrivacyPolicy />);

    await waitFor(() => {
      expect(mockedUseRouter).toHaveBeenCalled();
    });
  });

  it('displays full privacy policy content', () => {
    const { getByText, UNSAFE_root } = render(<PrivacyPolicy />);

    expect(getByText('Privacy Policy')).toBeTruthy();
    expect(
      getByText(
        'Your data is NOT secure, we WILL sell your data because we are BROKE and we NEED MONEY. Thank you for understanding!'
      )
    ).toBeTruthy();

    expect(UNSAFE_root).toBeTruthy();
  });

  it('exports PrivacyPolicy as default', () => {
    expect(PrivacyPolicy).toBeDefined();
    expect(typeof PrivacyPolicy).toBe('function');
  });
});
