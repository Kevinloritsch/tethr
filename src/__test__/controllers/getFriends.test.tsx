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

    // stub the private helper to return one relation
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

  it('searchUsers returns empty array when none found and null on error', async () => {
    const mockUser = { id: 'u1' };
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
    (supabase.storage.from as jest.Mock).mockReturnValue({
      getPublicUrl: () => ({ data: { publicUrl: 'https://pfp/' } }),
    });

    // no users found — mock the chained query: select().ilike().neq()
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

    // error from db
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
