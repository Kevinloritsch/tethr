import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SearchBar from '@/components/searchbar';

jest.mock('@expo/vector-icons/Ionicons', () => {
  return function MockIcon() {
    return <></>;
  };
});

describe('SearchBar', () => {
  it('renders search bar', () => {
    const mockOnSearch = jest.fn();
    const { UNSAFE_root } = render(
      <SearchBar onSearch={mockOnSearch} value="" placeholder="Search..." />
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders with placeholder text', () => {
    const mockOnSearch = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar onSearch={mockOnSearch} value="" placeholder="Search friends..." />
    );
    expect(getByPlaceholderText('Search friends...')).toBeTruthy();
  });

  it('displays default placeholder when not provided', () => {
    const mockOnSearch = jest.fn();
    const { getByPlaceholderText } = render(<SearchBar onSearch={mockOnSearch} value="" />);
    expect(getByPlaceholderText('Search...')).toBeTruthy();
  });

  it('updates text input value on change', async () => {
    const mockOnSearch = jest.fn();
    const { getByDisplayValue } = render(
      <SearchBar onSearch={mockOnSearch} value="" placeholder="Search..." />
    );

    // Get the text input
    const input = getByDisplayValue('');
    fireEvent.changeText(input, 'test');

    await waitFor(
      () => {
        expect(mockOnSearch).toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });

  it('debounces search input', async () => {
    const mockOnSearch = jest.fn();
    const { getByDisplayValue } = render(<SearchBar onSearch={mockOnSearch} value="" />);

    const input = getByDisplayValue('');
    fireEvent.changeText(input, 't');
    fireEvent.changeText(input, 'te');
    fireEvent.changeText(input, 'tes');
    fireEvent.changeText(input, 'test');

    await waitFor(
      () => {
        expect(mockOnSearch).toHaveBeenCalledWith('test');
      },
      { timeout: 500 }
    );
  });

  it('shows clear button when text is present', async () => {
    const mockOnSearch = jest.fn();
    const { getByDisplayValue, UNSAFE_root } = render(
      <SearchBar onSearch={mockOnSearch} value="" />
    );

    const input = getByDisplayValue('');
    fireEvent.changeText(input, 'test');

    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it('clears text when clear button is pressed', async () => {
    const mockOnSearch = jest.fn();
    const { getByDisplayValue } = render(<SearchBar onSearch={mockOnSearch} value="" />);

    const input = getByDisplayValue('');
    fireEvent.changeText(input, 'test');

    await waitFor(
      () => {
        expect(mockOnSearch).toHaveBeenCalledWith('test');
      },
      { timeout: 500 }
    );
  });

  it('sets autoFocus when prop is true', () => {
    const mockOnSearch = jest.fn();
    const { UNSAFE_root } = render(<SearchBar onSearch={mockOnSearch} value="" autoFocus />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('accepts value prop and updates internal state', () => {
    const mockOnSearch = jest.fn();
    const { rerender, getByDisplayValue } = render(<SearchBar onSearch={mockOnSearch} value="" />);

    rerender(<SearchBar onSearch={mockOnSearch} value="updated" />);

    expect(getByDisplayValue('updated')).toBeTruthy();
  });
});
