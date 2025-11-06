import { supabase } from '@/lib/supabase';

class GroupController {
  async getGroupName(groupId: string): Promise<string | null> {
    const { data: group, error } = await supabase
      .from('groups')
      .select('group_name')
      .eq('group_id', groupId)
      .single();
    if (error) return null;
    return group?.group_name || null;
  }

  async createTask(groupId: string, taskName: string, recurring: boolean) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            group_id: groupId,
            task_name: taskName,
            recurring: recurring,
          },
        ])
        .select()
        .single();

      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, data };
    } catch {
      return { success: false, message: 'Unexpected error occurred.' };
    }
  }
}

export const groupController = new GroupController();
