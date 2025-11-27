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
});

describe('controllers/group', () => {
  it('loads module', () => {
    expect(mod).toBeTruthy();
  });
});
