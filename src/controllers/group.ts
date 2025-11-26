import { supabase } from '@/lib/supabase';

interface GroupType {
  group_id: string;
  group_name: string;
  current_points: number;
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
        .select('group_id, groups ( group_id, group_name ), current_points')
        .eq('user_id', user.id);

      if (groupError) console.error('Error fetching groups:', groupError);
      else {
        const formattedGroups: GroupType[] = (groupData || []).map((item: any) => ({
          group_id: item.group_id,
          group_name: item.groups?.group_name || 'N/A Group Name',
          current_points: item.current_points,
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
          current_points,
          users ( username )
        `
        )
        .eq('group_id', groupId);

      if (error) {
        console.error('Error fetching leaderboard data:', error);
        return [];
      }

      let leaderboard: LeaderboardEntry[] = (data || []).map((item: any) => ({
        user_id: item.user_id,
        username: item.users?.username || 'Unknown User',
        current_rank: 0,
        current_points: item.current_points ?? 0,
      }));

      leaderboard.sort((a, b) => b.current_points - a.current_points);

      leaderboard = leaderboard.map((person, index) => ({
        ...person,
        current_rank: index + 1,
      }));

      return leaderboard;
    } catch (err) {
      console.error('Unexpected error fetching leaderboard data:', err);
      return [];
    }
  }
  async increaseMemberScore(userId: string, groupId: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('ispartof')
        .select('current_points')
        .eq('user_id', userId)
        .eq('group_id', groupId)
        .single();

      const newPoints = (data?.current_points || 0) + 1;

      const { error: updateError } = await supabase
        .from('ispartof')
        .update({ current_points: newPoints })
        .eq('user_id', userId)
        .eq('group_id', groupId);

      if (updateError) {
        console.error('Error updating:', updateError);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Increasing Score Error:', err);
      return false;
    }
  }
}

export const groupController = new GroupController();
export const getAllGroups = new GroupController();
