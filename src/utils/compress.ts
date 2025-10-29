import * as ImageManipulator from 'expo-image-manipulator';

export interface CompressionOptions {
  maxWidth: number;
  quality: number;
}

export class ImageCompressor {
  async compress(uri: string, options: CompressionOptions): Promise<string> {
    try {
      const opts = { ...options };

      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: opts.maxWidth } }],
        {
          compress: opts.quality,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return manipResult.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw error;
    }
  }
}

export const imageCompressor = new ImageCompressor();
