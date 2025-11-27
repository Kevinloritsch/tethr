import React from 'react';
import { render } from '@testing-library/react-native';
import Loading from '@/components/loading';

describe('Loading', () => {
  it('renders loading component', () => {
    const { UNSAFE_root } = render(<Loading />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders view element', () => {
    const { UNSAFE_root } = render(<Loading />);
    expect(UNSAFE_root.findByType('View')).toBeTruthy();
  });

  it('renders text element', () => {
    const { UNSAFE_root } = render(<Loading />);
    expect(UNSAFE_root).toBeTruthy();
  });
});
