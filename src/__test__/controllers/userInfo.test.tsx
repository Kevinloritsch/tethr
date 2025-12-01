import { userController } from '@/controllers/userInfo';
import { supabase } from '@/lib/supabase';
import * as mod from '@/controllers/userInfo';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signOut: jest.fn(),
    },
    storage: { from: jest.fn() },
    from: jest.fn(),
  },
}));

describe('userController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getProfileInformation returns composed profile on success', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'u1' } } });

    (supabase.storage.from as jest.Mock).mockReturnValue({
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'purl' } }),
    });

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: () => ({
            eq: () => ({
              single: jest.fn().mockResolvedValue({
                data: { username: 'uname', num_completed_tasks: 3, name: 'Full Name' },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'isfriendswith') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: [{ user1_id: 'u1', user2_id: 'u2' }], error: null }),
          }),
        };
      }
      return { select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }) };
    });

    const res = await userController.getProfileInformation();
    expect(res.username).toBe('uname');
    expect(res.pfpurl).toBe('purl');
    expect(res.numCompletedTasks).toBe(3);
    expect(res.numFriends).toBe(1);
  });

  test('getProfileInformation throws when not authenticated', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: new Error('no auth'),
    });
    await expect(userController.getProfileInformation()).rejects.toThrow();
  });

  test('getUsername returns null when no user', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null } });
    const val = await userController.getUsername();
    expect(val).toBeNull();
  });

  test('getNumCompletedTasks returns -1 on db error', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'u1' } } });
    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({
        eq: () => ({ single: jest.fn().mockResolvedValue({ data: null, error: new Error('db') }) }),
      }),
    });
    const val = await userController.getNumCompletedTasks();
    expect(val).toBe(-1);
  });

  test('updateUsername throws when not authenticated', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: new Error('auth'),
    });
    await expect(userController.updateUsername('x')).rejects.toThrow();
  });

  test('logout returns false on signOut error', async () => {
    (supabase.auth.signOut as jest.Mock).mockRejectedValue(new Error('boom'));
    const res = await userController.logout();
    expect(res).toBe(false);
  });

  test('getUsername returns username on success', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'u1' } } });
    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: jest.fn().mockResolvedValue({
            data: { username: 'testuser' },
            error: null,
          }),
        }),
      }),
    });
    const val = await userController.getUsername();
    expect(val).toBe('testuser');
  });

  test('getUsername returns null on db error', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'u1' } } });
    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: jest.fn().mockResolvedValue({ data: null, error: new Error('db') }),
        }),
      }),
    });
    const val = await userController.getUsername();
    expect(val).toBeNull();
  });

  test('getName returns name on success', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'u1' } } });
    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: jest.fn().mockResolvedValue({
            data: { name: 'John Doe' },
            error: null,
          }),
        }),
      }),
    });
    const val = await userController.getName();
    expect(val).toBe('John Doe');
  });

  test('getName returns null when no user', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null } });
    const val = await userController.getName();
    expect(val).toBeNull();
  });

  test('getName returns null on db error', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'u1' } } });
    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: jest.fn().mockResolvedValue({ data: null, error: new Error('db') }),
        }),
      }),
    });
    const val = await userController.getName();
    expect(val).toBeNull();
  });

  test('getEmail returns email on success', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'u1' } } });
    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: jest.fn().mockResolvedValue({
            data: { email: 'test@example.com' },
            error: null,
          }),
        }),
      }),
    });
    const val = await userController.getEmail();
    expect(val).toBe('test@example.com');
  });

  test('getEmail returns null when no user', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null } });
    const val = await userController.getEmail();
    expect(val).toBeNull();
  });

  test('getEmail returns null on db error', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'u1' } } });
    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: jest.fn().mockResolvedValue({ data: null, error: new Error('db') }),
        }),
      }),
    });
    const val = await userController.getEmail();
    expect(val).toBeNull();
  });

  test('getId returns user id on success', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'userid123' } } });
    const val = await userController.getId();
    expect(val).toBe('userid123');
  });

  test('getId returns null when no user', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null } });
    const val = await userController.getId();
    expect(val).toBeNull();
  });

  test('getId returns null on error', async () => {
    (supabase.auth.getUser as jest.Mock).mockRejectedValue(new Error('error'));
    const val = await userController.getId();
    expect(val).toBeNull();
  });

  test('getNumCompletedTasks returns 0 when no user', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null } });
    const val = await userController.getNumCompletedTasks();
    expect(val).toBe(0);
  });

  test('getNumCompletedTasks returns count on success', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'u1' } } });
    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: jest.fn().mockResolvedValue({
            data: { num_completed_tasks: 42 },
            error: null,
          }),
        }),
      }),
    });
    const val = await userController.getNumCompletedTasks();
    expect(val).toBe(42);
  });

  test('getNumCompletedTasks returns 0 when null in db', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'u1' } } });
    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: jest.fn().mockResolvedValue({
            data: { num_completed_tasks: null },
            error: null,
          }),
        }),
      }),
    });
    const val = await userController.getNumCompletedTasks();
    expect(val).toBe(0);
  });

  test('getUser returns user on success', async () => {
    const mockUser = { id: 'u1', email: 'test@example.com' };
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });
    const val = await userController.getUser();
    expect(val).toEqual(mockUser);
  });

  test('getUser returns null when no user', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null } });
    const val = await userController.getUser();
    expect(val).toBeNull();
  });

  test('getUser returns null on error', async () => {
    (supabase.auth.getUser as jest.Mock).mockRejectedValue(new Error('error'));
    const val = await userController.getUser();
    expect(val).toBeNull();
  });

  test('logout returns true on success', async () => {
    (supabase.auth.signOut as jest.Mock).mockResolvedValue({});
    const res = await userController.logout();
    expect(res).toBe(true);
  });

  test('updateUsername succeeds', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'u1' } } });
    (supabase.from as jest.Mock).mockReturnValue({
      update: () => ({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    });
    await expect(userController.updateUsername('newname')).resolves.toBeUndefined();
  });

  test('updateUsername throws when not authenticated', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: new Error('auth'),
    });
    await expect(userController.updateUsername('x')).rejects.toThrow();
  });

  test('updateUsername throws on db error', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'u1' } } });
    (supabase.from as jest.Mock).mockReturnValue({
      update: () => ({
        eq: jest.fn().mockResolvedValue({ error: new Error('db update failed') }),
      }),
    });
    await expect(userController.updateUsername('newname')).rejects.toThrow();
  });

  test('updateName succeeds', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'u1' } } });
    (supabase.from as jest.Mock).mockReturnValue({
      update: () => ({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    });
    await expect(userController.updateName('New Name')).resolves.toBeUndefined();
  });

  test('updateName throws when not authenticated', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: new Error('auth'),
    });
    await expect(userController.updateName('x')).rejects.toThrow();
  });

  test('updateName throws on db error', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'u1' } } });
    (supabase.from as jest.Mock).mockReturnValue({
      update: () => ({
        eq: jest.fn().mockResolvedValue({ error: new Error('db update failed') }),
      }),
    });
    await expect(userController.updateName('New Name')).rejects.toThrow();
  });

  test('getProfileInformation handles missing username', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'u1' } } });
    (supabase.storage.from as jest.Mock).mockReturnValue({
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'purl' } }),
    });
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: () => ({
            eq: () => ({
              single: jest.fn().mockResolvedValue({
                data: { username: null, num_completed_tasks: 0, name: null },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'isfriendswith') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: [], error: null }),
          }),
        };
      }
      return { select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }) };
    });

    const res = await userController.getProfileInformation();
    expect(res.username).toBe('Unknown');
    expect(res.fullName).toBe('Unknown');
    expect(res.numFriends).toBe(0);
  });

  test('getProfileInformation throws on profile fetch error', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'u1' } } });
    (supabase.storage.from as jest.Mock).mockReturnValue({
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'purl' } }),
    });
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: () => ({
            eq: () => ({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: new Error('profile fetch failed'),
              }),
            }),
          }),
        };
      }
      return { select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }) };
    });

    await expect(userController.getProfileInformation()).rejects.toThrow();
  });

  test('getProfileInformation throws on friends fetch error', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'u1' } } });
    (supabase.storage.from as jest.Mock).mockReturnValue({
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'purl' } }),
    });
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: () => ({
            eq: () => ({
              single: jest.fn().mockResolvedValue({
                data: { username: 'test', num_completed_tasks: 0, name: 'Test' },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'isfriendswith') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: null, error: new Error('friends fetch failed') }),
          }),
        };
      }
      return { select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }) };
    });

    await expect(userController.getProfileInformation()).rejects.toThrow();
  });
});

describe('controllers/userInfo', () => {
  it('loads module', () => {
    expect(mod).toBeTruthy();
  });
});
