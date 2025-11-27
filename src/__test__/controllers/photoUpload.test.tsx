import { storagePush } from '@/controllers/photoUpload';
import { imageCompressor } from '@/utils/compress';
import { supabase } from '@/lib/supabase';
import * as mod from '@/controllers/photoUpload';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn(),
    },
  },
}));

jest.mock('@/utils/compress', () => ({
  imageCompressor: { compress: jest.fn() },
}));

describe('photoUpload/storagePush', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uploads image and returns public url on success', async () => {
    const compressed = 'file://compressed.jpg';
    (imageCompressor.compress as jest.Mock).mockResolvedValue(compressed);

    const fakeBuffer = Buffer.from('abc');
    (global as any).fetch = jest.fn(() =>
      Promise.resolve({ arrayBuffer: () => Promise.resolve(fakeBuffer) })
    );

    const publicUrl = 'https://storage.example.com/public.jpg';

    const fromObj = {
      upload: jest.fn().mockResolvedValue({ error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl } }),
    };

    (supabase.storage.from as jest.Mock).mockReturnValue(fromObj);

    const res = await storagePush.uploadImage({
      uri: 'file://original.jpg',
      userId: 'u1',
      groupId: 'g1',
      taskName: 't1',
    });

    expect(imageCompressor.compress).toHaveBeenCalledWith('file://original.jpg', {
      maxWidth: 1080,
      quality: 0.6,
    });

    expect((global as any).fetch).toHaveBeenCalledWith(compressed);
    expect(fromObj.upload).toHaveBeenCalled();
    expect(fromObj.getPublicUrl).toHaveBeenCalled();
    expect(res).toEqual({ success: true, url: publicUrl });
  });

  it('returns failure when upload errors', async () => {
    (imageCompressor.compress as jest.Mock).mockResolvedValue('file://compressed.jpg');

    (global as any).fetch = jest.fn(() =>
      Promise.resolve({ arrayBuffer: () => Promise.resolve(Buffer.from('x')) })
    );

    const fromObj = {
      upload: jest.fn().mockResolvedValue({ error: new Error('upload fail') }),
      getPublicUrl: jest.fn(),
    };

    (supabase.storage.from as jest.Mock).mockReturnValue(fromObj);

    const res = await storagePush.uploadImage({
      uri: 'file://original.jpg',
      userId: 'u1',
      groupId: 'g1',
      taskName: 't1',
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe('upload fail');
  });
});

describe('controllers/photoUpload', () => {
  it('loads module', () => {
    expect(mod).toBeTruthy();
  });
});
