import { photoRetrieve } from '@/controllers/photoRetrieve';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn(),
    },
    from: jest.fn(),
  },
}));

describe('photoRetrieve', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getPhotosByGroups returns empty array when no groups provided', async () => {
    const result = await photoRetrieve.getPhotosByGroups([]);
    expect(result).toEqual([]);
  });

  test('getPhotosByGroups returns photos with usernames', async () => {
    const mockStorageFrom = jest.fn();
    (supabase.storage.from as jest.Mock).mockReturnValue({
      list: mockStorageFrom,
      getPublicUrl: jest.fn((path) => ({
        data: { publicUrl: `https://storage.example.com/${path}` },
      })),
    });

    mockStorageFrom
      .mockResolvedValueOnce({
        data: [{ name: 'user1' }, { name: '.emptyFolderPlaceholder' }],
      })
      .mockResolvedValueOnce({
        data: [{ name: 'task1' }],
      })
      .mockResolvedValueOnce({
        data: [{ name: 'photo1.jpg', created_at: '2025-01-01' }],
      });
    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({
          data: [{ user_id: 'user1', username: 'alice' }],
        }),
      }),
    });
    (supabase.from as jest.Mock).mockImplementation(mockFrom);

    const result = await photoRetrieve.getPhotosByGroups(['group1']);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      name: 'photo1.jpg',
      userId: 'user1',
      username: 'alice',
      groupId: 'group1',
      taskName: 'task1',
    });
    expect(result[0].publicUrl).toContain('group1/user1/task1/photo1.jpg');
  });

  test('getPhotosByGroups handles missing user folders gracefully', async () => {
    const mockStorageFrom = jest.fn();
    (supabase.storage.from as jest.Mock).mockReturnValue({
      list: mockStorageFrom,
      getPublicUrl: jest.fn(),
    });

    mockStorageFrom.mockResolvedValueOnce({ data: null });

    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({ data: [] }),
      }),
    });
    (supabase.from as jest.Mock).mockImplementation(mockFrom);

    const result = await photoRetrieve.getPhotosByGroups(['group1']);

    expect(result).toEqual([]);
  });

  test('getPhotosByGroups filters out placeholder folders', async () => {
    const mockList = jest.fn();
    (supabase.storage.from as jest.Mock).mockReturnValue({
      list: mockList,
    });

    mockList
      .mockResolvedValueOnce({
        data: [
          { name: '.emptyFolderPlaceholder' },
          { name: 'user1' },
          { name: '.emptyFolderPlaceholder' },
        ],
      })
      .mockResolvedValueOnce({
        data: [{ name: '.emptyFolderPlaceholder' }, { name: 'task1' }],
      })
      .mockResolvedValueOnce({
        data: [
          { name: '.emptyFolderPlaceholder' },
          { name: 'photo1.jpg', created_at: '2025-01-01' },
        ],
      });

    (supabase.storage.from as jest.Mock).mockImplementation(() => ({
      list: mockList,
      getPublicUrl: jest.fn((path) => ({
        data: { publicUrl: `https://storage.example.com/${path}` },
      })),
    }));

    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({ data: [{ user_id: 'user1', username: 'bob' }] }),
      }),
    });
    (supabase.from as jest.Mock).mockImplementation(mockFrom);

    const result = await photoRetrieve.getPhotosByGroups(['group1']);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('photo1.jpg');
  });

  test('getPhotosByGroups sorts photos by creation date descending', async () => {
    const mockStorageFrom = jest.fn();
    (supabase.storage.from as jest.Mock).mockReturnValue({
      list: mockStorageFrom,
      getPublicUrl: jest.fn((path) => ({
        data: { publicUrl: `https://storage.example.com/${path}` },
      })),
    });

    mockStorageFrom
      .mockResolvedValueOnce({
        data: [{ name: 'user1' }],
      })
      .mockResolvedValueOnce({
        data: [{ name: 'task1' }],
      })
      .mockResolvedValueOnce({
        data: [
          { name: 'photo1.jpg', created_at: '2025-01-01' },
          { name: 'photo2.jpg', created_at: '2025-01-03' },
          { name: 'photo3.jpg', created_at: '2025-01-02' },
        ],
      });

    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({ data: [{ user_id: 'user1', username: 'charlie' }] }),
      }),
    });
    (supabase.from as jest.Mock).mockImplementation(mockFrom);

    const result = await photoRetrieve.getPhotosByGroups(['group1']);

    expect(result[0].name).toBe('photo2.jpg');
    expect(result[1].name).toBe('photo3.jpg');
    expect(result[2].name).toBe('photo1.jpg');
  });

  test('getPhotosByGroups handles storage errors gracefully', async () => {
    const mockStorageFrom = jest.fn();
    (supabase.storage.from as jest.Mock).mockReturnValue({
      list: mockStorageFrom,
    });

    mockStorageFrom.mockRejectedValueOnce(new Error('Storage error'));

    const result = await photoRetrieve.getPhotosByGroups(['group1']);

    expect(result).toEqual([]);
  });

  test('getPhotosByGroups handles multiple groups', async () => {
    const mockStorageFrom = jest.fn();
    (supabase.storage.from as jest.Mock).mockReturnValue({
      list: mockStorageFrom,
      getPublicUrl: jest.fn((path) => ({
        data: { publicUrl: `https://storage.example.com/${path}` },
      })),
    });

    mockStorageFrom
      .mockResolvedValueOnce({
        data: [{ name: 'user1' }],
      })
      .mockResolvedValueOnce({
        data: [{ name: 'task1' }],
      })
      .mockResolvedValueOnce({
        data: [{ name: 'photo1.jpg', created_at: '2025-01-01' }],
      })
      .mockResolvedValueOnce({
        data: [{ name: 'user2' }],
      })
      .mockResolvedValueOnce({
        data: [{ name: 'task2' }],
      })
      .mockResolvedValueOnce({
        data: [{ name: 'photo2.jpg', created_at: '2025-01-02' }],
      });

    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({
          data: [
            { user_id: 'user1', username: 'alice' },
            { user_id: 'user2', username: 'bob' },
          ],
        }),
      }),
    });
    (supabase.from as jest.Mock).mockImplementation(mockFrom);

    const result = await photoRetrieve.getPhotosByGroups(['group1', 'group2']);

    expect(result).toHaveLength(2);
    expect(result.some((p) => p.groupId === 'group1')).toBe(true);
    expect(result.some((p) => p.groupId === 'group2')).toBe(true);
  });

  test('getPhotosByGroups handles missing task folders gracefully', async () => {
    const mockStorageFrom = jest.fn();
    (supabase.storage.from as jest.Mock).mockReturnValue({
      list: mockStorageFrom,
    });

    mockStorageFrom
      .mockResolvedValueOnce({
        data: [{ name: 'user1' }],
      })
      .mockResolvedValueOnce({
        data: null,
      });

    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({ data: [{ user_id: 'user1', username: 'alice' }] }),
      }),
    });
    (supabase.from as jest.Mock).mockImplementation(mockFrom);

    const result = await photoRetrieve.getPhotosByGroups(['group1']);

    expect(result).toEqual([]);
  });

  test('getPhotosByGroups handles missing files gracefully', async () => {
    const mockStorageFrom = jest.fn();
    (supabase.storage.from as jest.Mock).mockReturnValue({
      list: mockStorageFrom,
    });

    mockStorageFrom
      .mockResolvedValueOnce({
        data: [{ name: 'user1' }],
      })
      .mockResolvedValueOnce({
        data: [{ name: 'task1' }],
      })
      .mockResolvedValueOnce({
        data: null,
      });

    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({ data: [{ user_id: 'user1', username: 'alice' }] }),
      }),
    });
    (supabase.from as jest.Mock).mockImplementation(mockFrom);

    const result = await photoRetrieve.getPhotosByGroups(['group1']);

    expect(result).toEqual([]);
  });

  test('getPhotosByGroups maps usernames correctly when not found', async () => {
    const mockStorageFrom = jest.fn();
    (supabase.storage.from as jest.Mock).mockReturnValue({
      list: mockStorageFrom,
      getPublicUrl: jest.fn((path) => ({
        data: { publicUrl: `https://storage.example.com/${path}` },
      })),
    });

    mockStorageFrom
      .mockResolvedValueOnce({
        data: [{ name: 'unknown_user' }],
      })
      .mockResolvedValueOnce({
        data: [{ name: 'task1' }],
      })
      .mockResolvedValueOnce({
        data: [{ name: 'photo1.jpg', created_at: '2025-01-01' }],
      });

    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({ data: [] }),
      }),
    });
    (supabase.from as jest.Mock).mockImplementation(mockFrom);

    const result = await photoRetrieve.getPhotosByGroups(['group1']);

    expect(result[0].username).toBe('unknown_user');
  });
});
