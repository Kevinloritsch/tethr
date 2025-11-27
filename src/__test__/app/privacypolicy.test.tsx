import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
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
  it('renders privacy policy text', () => {
    mockedUseRouter.mockReturnValue({ push: jest.fn() });

    const { getByText } = render(<PrivacyPolicy />);

    expect(getByText('Privacy Policy')).toBeTruthy();
    expect(
      getByText(
        'Your data is NOT secure, we WILL sell your data because we are BROKE and we NEED MONEY. Thank you for understanding!'
      )
    ).toBeTruthy();
  });

  it('navigates back to profile on press', () => {
    const mockPush = jest.fn();
    mockedUseRouter.mockReturnValue({ push: mockPush });

    const { getByRole } = render(<PrivacyPolicy />);

    const backButton = getByRole('button');
    fireEvent.press(backButton);

    expect(mockPush).toHaveBeenCalledWith('/main/profile');
  });
});
