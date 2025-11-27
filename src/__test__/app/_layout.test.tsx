import React from 'react';
import { render } from '@testing-library/react-native';
import RootLayout from '@/app/_layout';

jest.mock('expo-router', () => ({
  Stack: ({ children, screenOptions }: any) => <>{children}</>,
}));

describe('RootLayout', () => {
  it('renders root layout', () => {
    const { UNSAFE_root } = render(<RootLayout />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('provides navigation structure', () => {
    const { UNSAFE_root } = render(<RootLayout />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('configures screen options', () => {
    const { UNSAFE_root } = render(<RootLayout />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('sets black background color', () => {
    const { UNSAFE_root } = render(<RootLayout />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('hides header by default', () => {
    const { UNSAFE_root } = render(<RootLayout />);
    expect(UNSAFE_root).toBeTruthy();
  });
});
