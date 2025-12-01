import React from 'react';
import { render } from '@testing-library/react-native';
import Tethr from '@/components/tethr';

jest.mock('expo-image', () => ({
  Image: ({ source }: any) => <></>,
}));

describe('Tethr', () => {
  it('renders tethr component', () => {
    const { UNSAFE_root } = render(<Tethr side="left" />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders with left side alignment', () => {
    const { UNSAFE_root } = render(<Tethr side="left" />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders with right side alignment', () => {
    const { UNSAFE_root } = render(<Tethr side="right" />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('accepts side prop', () => {
    const { UNSAFE_root: root1 } = render(<Tethr side="left" />);
    const { UNSAFE_root: root2 } = render(<Tethr side="right" />);
    expect(root1).toBeTruthy();
    expect(root2).toBeTruthy();
  });

  it('renders container view', () => {
    const { UNSAFE_root } = render(<Tethr side="left" />);
    expect(UNSAFE_root.findByType('View')).toBeTruthy();
  });
});
