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
});

describe('controllers/userInfo', () => {
  it('loads module', () => {
    expect(mod).toBeTruthy();
  });
});
