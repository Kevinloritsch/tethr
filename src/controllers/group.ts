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
}

export const groupController = new GroupController();
