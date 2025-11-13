import { supabase } from '@/lib/supabase';

interface GroupType {
  group_id: string;
  group_name: string;
}

interface LeaderboardEntry {
  user_id: string;
  username: string;
  current_rank: number;
  current_points: number;
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
        const formattedGroups: GroupType[] = (groupData || []).map((item: any) => ({
          group_id: item.group_id,
          group_name: item.groups?.group_name || 'INVALID GROUP NAME OR NO GROUP NAME',
        }));

        return formattedGroups;
      }
    } catch (err) {
      console.error('Unexpected error fetching data:', err);
      return [];
    }
    return [];
  }

  async getLeaderboardData(groupId: string): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from('ispartof')
        .select(
          `
          user_id,
          current_rank,
          current_points,
          users ( username )
        `
        )
        .eq('group_id', groupId);

      if (error) {
        console.error('Error fetching leaderboard data:', error);
        return [];
      }

      const leaderboard: LeaderboardEntry[] = (data || []).map((item: any) => ({
        user_id: item.user_id,
        username: item.users?.username || 'Unknown User',
        current_rank: item.current_rank ?? 9999,
        current_points: item.current_points ?? 0,
      }));

      leaderboard.sort((a, b) => a.current_rank - b.current_rank);

      return leaderboard;
    } catch (err) {
      console.error('Unexpected error fetching leaderboard data:', err);
      return [];
    }
  }
}

export const groupController = new GroupController();
export const getAllGroups = new GroupController();
