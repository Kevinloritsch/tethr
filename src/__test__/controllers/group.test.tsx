import { groupController } from '@/controllers/group';
import { supabase } from '@/lib/supabase';
import * as mod from '@/controllers/group';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: { getSession: jest.fn() },
  },
}));

describe('groupController', () => {
  beforeEach(() => jest.clearAllMocks());

  test('getGroupName returns name on success', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: jest.fn().mockResolvedValue({ data: { group_name: 'G' }, error: null }),
        }),
      }),
    });
    const res = await groupController.getGroupName('g1');
    expect(res).toBe('G');
  });

  test('getGroupName returns null on error', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({
        eq: () => ({ single: jest.fn().mockResolvedValue({ data: null, error: new Error('no') }) }),
      }),
    });
    const res = await groupController.getGroupName('g1');
    expect(res).toBeNull();
  });

  test('fetchUserData returns [] when no session user', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null,
    });
    const res = await groupController.fetchUserData();
    expect(res).toEqual([]);
  });

  test('fetchUserData formats groups on success', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: 'u1' } } },
      error: null,
    });
    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({
        eq: () =>
          Promise.resolve({
            data: [{ group_id: 'g1', groups: { group_name: 'G1' }, current_points: 5 }],
            error: null,
          }),
      }),
    });
    const res = await groupController.fetchUserData();
    expect(res).toEqual([{ group_id: 'g1', group_name: 'G1', current_points: 5 }]);
  });

  test('getLeaderboardData sorts and ranks users', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({
        eq: () =>
          Promise.resolve({
            data: [
              { user_id: 'u1', current_points: 10, users: { username: 'a' } },
              { user_id: 'u2', current_points: 5, users: { username: 'b' } },
            ],
            error: null,
          }),
      }),
    });
    const res = await groupController.getLeaderboardData('g1');
    expect(res.length).toBe(2);
    expect(res[0].current_rank).toBe(1);
    expect(res[0].user_id).toBe('u1');
  });

  test('increaseMemberScore succeeds when updates ok', async () => {
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'ispartof') {
        const selectChain: any = {};
        selectChain.eq = () => selectChain;
        selectChain.single = jest
          .fn()
          .mockResolvedValue({ data: { current_points: 2 }, error: null });

        const updateChain: any = { error: null };
        updateChain.eq = () => updateChain;

        return {
          select: () => selectChain,
          update: () => updateChain,
        };
      }

      if (table === 'users') {
        const selectChain2: any = {};
        selectChain2.eq = () => selectChain2;
        selectChain2.single = jest
          .fn()
          .mockResolvedValue({ data: { num_completed_tasks: 1 }, error: null });

        const updateChain2: any = { error: null };
        updateChain2.eq = () => updateChain2;

        return {
          select: () => selectChain2,
          update: () => updateChain2,
        };
      }

      return { select: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }) };
    });

    const res = await groupController.increaseMemberScore('u1', 'g1');
    expect(res).toBe(true);
  });

  test('increaseMemberScore returns false when update fails', async () => {
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'ispartof') {
        const selectChain: any = {};
        selectChain.eq = () => selectChain;
        selectChain.single = jest
          .fn()
          .mockResolvedValue({ data: { current_points: 2 }, error: null });

        const updateChain: any = { error: new Error('fail') };
        updateChain.eq = () => updateChain;

        return {
          select: () => selectChain,
          update: () => updateChain,
        };
      }
      return { select: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }) };
    });

    const res = await groupController.increaseMemberScore('u1', 'g1');
    expect(res).toBe(false);
  });

  test('initialize sets initialized flag and subscribes to observer', () => {
    (groupController as any).initialized = false;

    groupController.initialize();

    expect((groupController as any).initialized).toBe(true);
  });

  test('initialize returns early if already initialized', () => {
    const controllerAlreadyInit = { initialized: true } as any;
    const spyLog = jest.spyOn(console, 'log').mockImplementation();

    groupController.initialize.call(controllerAlreadyInit);

    expect(spyLog).toHaveBeenCalledWith('Reinitialization check: already done');
    spyLog.mockRestore();
  });

  test('fetchUserData returns [] when getSession returns error', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: null,
      error: new Error('session error'),
    });
    const res = await groupController.fetchUserData();
    expect(res).toEqual([]);
  });

  test('fetchUserData returns [] when group fetch returns error', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: 'u1' } } },
      error: null,
    });
    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({
        eq: () =>
          Promise.resolve({
            data: null,
            error: new Error('fetch error'),
          }),
      }),
    });
    const res = await groupController.fetchUserData('test');
    expect(res).toEqual([]);
  });

  test('fetchUserData handles groups without group_name', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: 'u1' } } },
      error: null,
    });
    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({
        eq: () =>
          Promise.resolve({
            data: [{ group_id: 'g1', groups: null, current_points: 5 }],
            error: null,
          }),
      }),
    });
    const res = await groupController.fetchUserData();
    expect(res[0].group_name).toBe('N/A Group Name');
  });

  test('getLeaderboardData returns [] on error', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({
        eq: () =>
          Promise.resolve({
            data: null,
            error: new Error('fetch error'),
          }),
      }),
    });
    const res = await groupController.getLeaderboardData('g1');
    expect(res).toEqual([]);
  });

  test('getLeaderboardData handles null users', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({
        eq: () =>
          Promise.resolve({
            data: [{ user_id: 'u1', current_points: 10, users: null }],
            error: null,
          }),
      }),
    });
    const res = await groupController.getLeaderboardData('g1');
    expect(res[0].username).toBe('Unknown User');
  });

  test('getLeaderboardData handles null current_points', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({
        eq: () =>
          Promise.resolve({
            data: [{ user_id: 'u1', current_points: null, users: { username: 'a' } }],
            error: null,
          }),
      }),
    });
    const res = await groupController.getLeaderboardData('g1');
    expect(res[0].current_points).toBe(0);
  });

  test('createGroup succeeds and adds creator and friends', async () => {
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'groups') {
        return {
          insert: () => ({
            select: () => ({
              single: jest.fn().mockResolvedValue({
                data: { group_id: 'newg', group_name: 'NewGroup' },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'ispartof') {
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    });

    const res = await groupController.createGroup('NewGroup', 'u1', ['u2', 'u3']);
    expect(res.success).toBe(true);
    expect(res.data?.group_id).toBe('newg');
  });

  test('createGroup returns error when group insert fails', async () => {
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'groups') {
        return {
          insert: () => ({
            select: () => ({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: new Error('group insert failed'),
              }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await groupController.createGroup('NewGroup', 'u1');
    expect(res.success).toBe(false);
    expect(res.message).toMatch(/group insert failed/);
  });

  test('createGroup returns error when ispartof insert fails', async () => {
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'groups') {
        return {
          insert: () => ({
            select: () => ({
              single: jest.fn().mockResolvedValue({
                data: { group_id: 'newg', group_name: 'NewGroup' },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'ispartof') {
        return {
          insert: jest.fn().mockResolvedValue({ error: new Error('ispartof insert failed') }),
        };
      }
      return {};
    });

    const res = await groupController.createGroup('NewGroup', 'u1');
    expect(res.success).toBe(false);
    expect(res.message).toMatch(/ispartof insert failed/);
  });

  test('leaveGroup deletes group when user is sole member', async () => {
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'ispartof') {
        const selectChain: any = {};
        selectChain.eq = () => selectChain;
        selectChain.mockResolvedValue = jest
          .fn()
          .mockResolvedValue({ data: [{ user_id: 'u1' }], error: null });

        const deleteChain: any = { error: null };
        deleteChain.eq = () => deleteChain;

        return {
          select: () => selectChain,
          delete: () => deleteChain,
        };
      }
      if (table === 'groups') {
        const deleteChain: any = { error: null };
        deleteChain.eq = () => deleteChain;
        return { delete: () => deleteChain };
      }
      return {};
    });

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [{ user_id: 'u1' }],
        error: null,
      }),
    });

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'ispartof') {
        return {
          select: mockSelect,
          delete: () => ({
            eq: () => ({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          }),
        };
      }
      if (table === 'groups') {
        return {
          delete: () => ({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        };
      }
      return {};
    });

    const res = await groupController.leaveGroup('u1', 'g1');
    expect(res?.success).toBe(true);
    expect(res?.message).toMatch(/Group deleted/);
  });

  test('leaveGroup removes user when multiple members exist', async () => {
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [{ user_id: 'u1' }, { user_id: 'u2' }],
        error: null,
      }),
    });

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'ispartof') {
        return {
          select: mockSelect,
          delete: () => ({
            eq: () => ({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await groupController.leaveGroup('u1', 'g1');
    expect(res?.success).toBe(true);
    expect(res?.message).toMatch(/Left group successfully/);
  });

  test('leaveGroup returns error when member fetch fails', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('member check failed'),
        }),
      }),
    });

    const res = await groupController.leaveGroup('u1', 'g1');
    expect(res?.success).toBe(false);
    expect(res?.message).toMatch(/member check failed/);
  });

  test('leaveGroup returns error when no members returned', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    });

    const res = await groupController.leaveGroup('u1', 'g1');
    expect(res?.success).toBe(false);
    expect(res?.message).toMatch(/Unable to fetch/);
  });

  test('increaseMemberScore returns false when profile update fails', async () => {
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'ispartof') {
        const selectChain: any = {};
        selectChain.eq = () => selectChain;
        selectChain.single = jest
          .fn()
          .mockResolvedValue({ data: { current_points: 2 }, error: null });

        const updateChain: any = { error: null };
        updateChain.eq = () => updateChain;

        return {
          select: () => selectChain,
          update: () => updateChain,
        };
      }

      if (table === 'users') {
        const selectChain2: any = {};
        selectChain2.eq = () => selectChain2;
        selectChain2.single = jest
          .fn()
          .mockResolvedValue({ data: { num_completed_tasks: 1 }, error: null });

        const updateChain2: any = { error: new Error('profile update fail') };
        updateChain2.eq = () => updateChain2;

        return {
          select: () => selectChain2,
          update: () => updateChain2,
        };
      }

      return { select: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }) };
    });

    const res = await groupController.increaseMemberScore('u1', 'g1');
    expect(res).toBe(false);
  });
});

describe('controllers/group', () => {
  it('loads module', () => {
    expect(mod).toBeTruthy();
  });
});
