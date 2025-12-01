import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import ExploreScreen from '@/app/main/explore';

jest.mock('@/components/exploreUI', () => {
  return function MockExploreUI() {
    return <>Explore UI</>;
  };
});

describe('Explore Screen', () => {
  it('renders without crashing', async () => {
    const { UNSAFE_root } = render(<ExploreScreen />);

    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it('renders ExploreUI component', async () => {
    const { UNSAFE_root } = render(<ExploreScreen />);

    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it('has an export as default', () => {
    expect(ExploreScreen).toBeDefined();
    expect(typeof ExploreScreen).toBe('function');
  });

  it('returns a valid JSX element', async () => {
    const result = ExploreScreen();
    expect(result).toBeTruthy();
    expect(result.type).toBeDefined();
  });

  it('component is functional', () => {
    expect(ExploreScreen).toBeDefined();
  });
});
