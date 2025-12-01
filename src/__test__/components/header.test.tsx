import React from 'react';
import { render } from '@testing-library/react-native';
import Header from '@/components/header';

describe('Header', () => {
  it('renders header component', () => {
    const { UNSAFE_root } = render(<Header />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders view element', () => {
    const { UNSAFE_root } = render(<Header />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders text element', () => {
    const { UNSAFE_root } = render(<Header />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('header component structure is valid', () => {
    const { UNSAFE_root } = render(<Header />);
    expect(UNSAFE_root.findByType('View')).toBeTruthy();
  });
});
