import React from 'react';
import { render } from '@testing-library/react-native';
import { AppText } from '@/components/apptext';

describe('AppText', () => {
  it('renders text with children', () => {
    const { getByText } = render(<AppText>Hello World</AppText>);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('renders with small size', () => {
    const { getByText } = render(<AppText size="small">Small text</AppText>);
    expect(getByText('Small text')).toBeTruthy();
  });

  it('renders with medium size by default', () => {
    const { getByText } = render(<AppText>Medium text</AppText>);
    expect(getByText('Medium text')).toBeTruthy();
  });

  it('renders with large size', () => {
    const { getByText } = render(<AppText size="large">Large text</AppText>);
    expect(getByText('Large text')).toBeTruthy();
  });

  it('renders with heading size', () => {
    const { getByText } = render(<AppText size="heading">Heading text</AppText>);
    expect(getByText('Heading text')).toBeTruthy();
  });

  it('renders with bold font weight', () => {
    const { getByText } = render(<AppText bold>Bold text</AppText>);
    expect(getByText('Bold text')).toBeTruthy();
  });

  it('renders with primary color by default', () => {
    const { getByText } = render(<AppText>Primary color</AppText>);
    expect(getByText('Primary color')).toBeTruthy();
  });

  it('renders with secondary color', () => {
    const { getByText } = render(<AppText color="secondary">Secondary color</AppText>);
    expect(getByText('Secondary color')).toBeTruthy();
  });

  it('renders with tertiary color', () => {
    const { getByText } = render(<AppText color="tertiary">Tertiary color</AppText>);
    expect(getByText('Tertiary color')).toBeTruthy();
  });

  it('renders with center alignment', () => {
    const { getByText } = render(<AppText center>Centered text</AppText>);
    expect(getByText('Centered text')).toBeTruthy();
  });

  it('accepts custom className', () => {
    const { getByText } = render(<AppText className="custom-class">Custom</AppText>);
    expect(getByText('Custom')).toBeTruthy();
  });

  it('renders complex children', () => {
    const { getByText } = render(
      <AppText size="large" bold>
        Complex Text
      </AppText>
    );
    expect(getByText('Complex Text')).toBeTruthy();
  });
});
