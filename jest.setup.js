import '@testing-library/jest-native/extend-expect';
import { jest } from '@jest/globals';

jest.mock('react-native-reanimated', () => require('__mocks__/react-native-reanimated'));
jest.mock('react-native-worklets', () => require('__mocks__/react-native-worklets'));
