import { taskController } from '@/controllers/tasks';
import { supabase } from '@/lib/supabase';
import * as mod from '@/controllers/tasks';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('taskController', () => {
  beforeEach(() => jest.clearAllMocks());

  test('getTasksForGroup returns mapped tasks on success', async () => {
    const groups = [{ group_id: 'g1' }];

    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({
        in: () =>
          Promise.resolve({
            data: [
              {
                group_id: 'g1',
                task_name: 't1',
                recurring: false,
                groups: { group_name: 'Group One' },
              },
            ],
            error: null,
          }),
      }),
    });

    const res = await taskController.getTasksForGroup(groups as any);
    expect(res).toEqual([
      { group_id: 'g1', group_name: 'Group One', task_name: 't1', recurring: false },
    ]);
  });

  test('getTasksForGroup returns empty array on db error', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({ in: () => Promise.resolve({ data: null, error: new Error('db') }) }),
    });
    const res = await taskController.getTasksForGroup([{ group_id: 'x' }] as any);
    expect(res).toEqual([]);
  });

  test('createTask succeeds and returns data', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      insert: () => ({
        select: () => ({ single: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null }) }),
      }),
    });
    const res = await taskController.createTask('g', 't', false);
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
  });

  test('createTask returns failure on insert error', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      insert: () => ({
        select: () => ({
          single: jest.fn().mockResolvedValue({ data: null, error: new Error('insert fail') }),
        }),
      }),
    });
    const res = await taskController.createTask('g', 't', false);
    expect(res.success).toBe(false);
    expect(res.message).toMatch(/insert fail/);
  });
});

describe('controllers/tasks', () => {
  it('loads module', () => {
    expect(mod).toBeTruthy();
  });
});
