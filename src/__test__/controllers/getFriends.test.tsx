import { getFriendsList } from '@/controllers/getFriends';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
    storage: {
      from: jest.fn(),
    },
  },
}));

describe('getFriendsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(getFriendsList).toBeDefined();
  });

  it('getFriends method exists and is callable', () => {
    expect(typeof getFriendsList.getFriends).toBe('function');
  });

  it('getIncomingFriendRequests method exists and is callable', () => {
    expect(typeof getFriendsList.getIncomingFriendRequests).toBe('function');
  });

  it('getOutgoingFriendRequests method exists and is callable', () => {
    expect(typeof getFriendsList.getOutgoingFriendRequests).toBe('function');
  });

  it('removeFriend method exists and is callable', () => {
    expect(typeof getFriendsList.removeFriend).toBe('function');
  });

  it('removeRequest method exists and is callable', () => {
    expect(typeof getFriendsList.removeRequest).toBe('function');
  });

  it('acceptRequest method exists and is callable', () => {
    expect(typeof getFriendsList.acceptRequest).toBe('function');
  });

  it('searchUsers method exists and is callable', () => {
    expect(typeof getFriendsList.searchUsers).toBe('function');
  });

  it('sendRequest method exists and is callable', () => {
    expect(typeof getFriendsList.sendRequest).toBe('function');
  });

  it('getFriends returns mapped friend props on success', async () => {
    const mockUser = { id: 'u1' };
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    (supabase.storage.from as jest.Mock).mockReturnValue({
      getPublicUrl: () => ({ data: { publicUrl: 'https://pfp/' } }),
    });

    (getFriendsList as any).getFriendRelations = jest
      .fn()
      .mockResolvedValue([{ user1_id: 'u1', user2_id: 'u2' }]);

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: () => ({
            in: async () => ({ data: [{ user_id: 'u2', username: 'alice' }], error: null }),
          }),
        };
      }
      return { select: () => ({ eq: async () => ({ data: [], error: null }) }) };
    });

    const res = await getFriendsList.getFriends();

    expect(res).toHaveLength(1);
    expect(res[0]).toMatchObject({ username: 'alice', userId: 'u2', pfpUrl: 'https://pfp/' });
  });

  it('getFriends throws when auth user missing', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: new Error('no user'),
    });

    await expect(getFriendsList.getFriends()).rejects.toBeDefined();
  });

  it('getFriends returns empty array when no friend relations exist', async () => {
    const mockUser = { id: 'u1' };
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    (supabase.storage.from as jest.Mock).mockReturnValue({
      getPublicUrl: () => ({ data: { publicUrl: 'https://pfp/' } }),
    });

    (supabase.from as jest.Mock).mockImplementation((table: string) => ({
      select: () => ({
        eq: async () => ({ data: [], error: null }),
        in: async () => ({ data: [], error: null }),
      }),
    }));

    const res = await getFriendsList.getFriends();
    expect(res).toEqual([]);
  });

  it('getIncomingFriendRequests returns requests with proper mapping', async () => {
    const mockUser = { id: 'u1' };
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    (supabase.storage.from as jest.Mock).mockReturnValue({
      getPublicUrl: () => ({ data: { publicUrl: 'https://pfp/' } }),
    });

    (supabase.from as jest.Mock).mockImplementation((table: string) => ({
      select: () => ({
        eq: async () => ({
          data: [
            {
              sender_id: 'u2',
              users: { user_id: 'u2', username: 'bob' },
            },
          ],
          error: null,
        }),
      }),
    }));

    const res = await getFriendsList.getIncomingFriendRequests();

    expect(res).toHaveLength(1);
    expect(res[0]).toMatchObject({ username: 'bob', userId: 'u2', buttonText: 'check' });
  });

  it('getOutgoingFriendRequests returns outgoing requests', async () => {
    const mockUser = { id: 'u1' };
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    (supabase.storage.from as jest.Mock).mockReturnValue({
      getPublicUrl: () => ({ data: { publicUrl: 'https://pfp/' } }),
    });

    (supabase.from as jest.Mock).mockImplementation((table: string) => ({
      select: () => ({
        eq: async () => ({
          data: [
            {
              recipient_id: 'u3',
              users: { user_id: 'u3', username: 'charlie' },
            },
          ],
          error: null,
        }),
      }),
    }));

    const res = await getFriendsList.getOutgoingFriendRequests();

    expect(res).toHaveLength(1);
    expect(res[0]).toMatchObject({ username: 'charlie', userId: 'u3', buttonText: 'Remove' });
  });

  it('sendRequest sends a friend request', async () => {
    const mockUser = { id: 'u1' };
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    (supabase.from as jest.Mock).mockImplementation((table: string) => ({
      insert: jest.fn().mockResolvedValue({ data: { id: '1' }, error: null }),
      select: () => ({
        eq: async () => ({ data: [], error: null }),
      }),
    }));

    await expect(getFriendsList.sendRequest('u2')).resolves.toBeUndefined();
  });

  it('sendRequest throws on error', async () => {
    const mockUser = { id: 'u1' };
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    (supabase.from as jest.Mock).mockImplementation((table: string) => ({
      insert: jest.fn().mockResolvedValue({ data: null, error: new Error('Insert failed') }),
    }));

    await expect(getFriendsList.sendRequest('u2')).rejects.toBeDefined();
  });

  it('removeFriend removes a friend successfully', async () => {
    const mockUser = { id: 'u1' };
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    (supabase.from as jest.Mock).mockImplementation((table: string) => ({
      delete: jest.fn().mockReturnValue({
        or: jest.fn().mockResolvedValue({ data: { deleted: 1 }, error: null }),
      }),
    }));

    await expect(getFriendsList.removeFriend('u2')).resolves.toBeUndefined();
  });

  it('removeFriend throws on error', async () => {
    const mockUser = { id: 'u1' };
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    (supabase.from as jest.Mock).mockImplementation((table: string) => ({
      delete: jest.fn().mockReturnValue({
        or: jest.fn().mockResolvedValue({ data: null, error: new Error('Delete failed') }),
      }),
    }));

    await expect(getFriendsList.removeFriend('u2')).rejects.toBeDefined();
  });

  it('acceptRequest accepts a friend request', async () => {
    const mockUser = { id: 'u1' };
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    (supabase.from as jest.Mock).mockImplementation((table: string) => ({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      }),
      insert: jest.fn().mockResolvedValue({ error: null }),
    }));

    await expect(getFriendsList.acceptRequest('u2')).resolves.toBeUndefined();
  });

  it('removeRequest removes a friend request', async () => {
    const mockUser = { id: 'u1' };
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    (supabase.from as jest.Mock).mockImplementation((table: string) => ({
      delete: jest.fn().mockReturnValue({
        or: jest.fn().mockResolvedValue({ error: null }),
      }),
    }));

    await expect(getFriendsList.removeRequest('u2')).resolves.toBeUndefined();
  });

  it('searchUsers returns found users', async () => {
    (supabase.storage.from as jest.Mock).mockReturnValue({
      getPublicUrl: () => ({ data: { publicUrl: 'https://pfp/' } }),
    });

    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: () => ({
        ilike: () => ({
          neq: async () => ({
            data: [{ user_id: 'u2', username: 'bob' }],
            error: null,
          }),
        }),
      }),
    }));

    const result = await getFriendsList.searchUsers('bo');

    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0]).toMatchObject({ username: 'bob', userId: 'u2', buttonText: 'Add' });
  });

  it('searchUsers returns empty array when none found and null on error', async () => {
    const mockUser = { id: 'u1' };
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
    (supabase.storage.from as jest.Mock).mockReturnValue({
      getPublicUrl: () => ({ data: { publicUrl: 'https://pfp/' } }),
    });

    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: () => ({
        ilike: () => ({
          neq: async () => ({ data: [], error: null }),
        }),
      }),
    }));
    const empty = await getFriendsList.searchUsers('nomatch');
    expect(Array.isArray(empty)).toBe(true);
    expect(empty).toHaveLength(0);

    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: () => ({
        ilike: () => ({
          neq: async () => ({ data: null, error: new Error('boom') }),
        }),
      }),
    }));
    const errored = await getFriendsList.searchUsers('boom');
    expect(errored).toBeNull();
  });
});
