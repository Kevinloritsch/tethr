import { supabase } from '@/lib/supabase';

interface GroupType {
  group_id: string;
  group_name: string;
}

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

  async fetchUserData(): Promise<GroupType[]> {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Error fetching session:', sessionError);
        return [];
      }

      const user = sessionData?.session?.user;
      if (!user) {
        console.log('No user logged in.');
        return [];
      }

      const { data: groupData, error: groupError } = await supabase
        .from('ispartof')
        .select('group_id, groups ( group_id, group_name )')
        .eq('user_id', user.id);

      if (groupError) console.error('Error fetching groups:', groupError);
      else {
        //console.log('Raw groups data:', groupData);
        const formattedGroups: GroupType[] = (groupData || []).map((item: any) => ({
          group_id: item.group_id,
          group_name: item.groups?.group_name || 'INVALID GROUP NAME OR NO GROUP NAME',
        }));

        //console.log('Formatted groups:', formattedGroups);
        return formattedGroups;
      }
    } catch (err) {
      console.error('Unexpected error fetching data:', err);
      return [];
    }
    return [];
  }
}

export const groupController = new GroupController();
export const getAllGroups = new GroupController();
