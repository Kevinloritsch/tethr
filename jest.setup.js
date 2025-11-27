import '@testing-library/jest-native/extend-expect';
import { jest } from '@jest/globals';

jest.mock('react-native-reanimated', () => require('__mocks__/react-native-reanimated'));
jest.mock('react-native-worklets', () => require('__mocks__/react-native-worklets'));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  multiSet: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('*.css', () => ({}));
jest.mock('*.png', () => ({}));
jest.mock('*.jpg', () => ({}));
