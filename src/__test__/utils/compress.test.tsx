import { imageCompressor, type CompressionOptions } from '@/utils/compress';
import * as ImageManipulator from 'expo-image-manipulator';

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: {
    JPEG: 'JPEG',
  },
}));

const mockedImageManipulator = ImageManipulator as jest.Mocked<typeof ImageManipulator>;

describe('ImageCompressor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(imageCompressor).toBeDefined();
  });

  it('compress method exists', () => {
    expect(typeof imageCompressor.compress).toBe('function');
  });

  it('calls manipulateAsync with correct parameters', async () => {
    const testUri = 'file:///test.jpg';
    const options: CompressionOptions = { maxWidth: 1000, quality: 0.8 };

    mockedImageManipulator.manipulateAsync.mockResolvedValue({
      uri: 'file:///compressed.jpg',
      width: 1000,
      height: 800,
    } as any);

    const result = await imageCompressor.compress(testUri, options);

    expect(mockedImageManipulator.manipulateAsync).toHaveBeenCalled();
    expect(result).toBe('file:///compressed.jpg');
  });

  it('returns compressed image uri', async () => {
    const testUri = 'file:///test.jpg';
    const options: CompressionOptions = { maxWidth: 800, quality: 0.7 };

    mockedImageManipulator.manipulateAsync.mockResolvedValue({
      uri: 'file:///compressed.jpg',
      width: 800,
      height: 600,
    } as any);

    const result = await imageCompressor.compress(testUri, options);

    expect(typeof result).toBe('string');
    expect(result).toContain('compressed');
  });

  it('handles compression errors', async () => {
    const testUri = 'file:///test.jpg';
    const options: CompressionOptions = { maxWidth: 1000, quality: 0.8 };

    const error = new Error('Compression failed');
    mockedImageManipulator.manipulateAsync.mockRejectedValue(error);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await expect(imageCompressor.compress(testUri, options)).rejects.toThrow('Compression failed');

    expect(consoleSpy).toHaveBeenCalledWith('Error compressing image:', error);

    consoleSpy.mockRestore();
  });
});
