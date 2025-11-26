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
      let { data: groupData } = await supabase
        .from('ispartof')
        .select('current_points')
        .eq('user_id', userId)
        .eq('group_id', groupId)
        .single();

      const newPoints = (groupData?.current_points || 0) + 1;

      const { error: groupUpdateError } = await supabase
        .from('ispartof')
        .update({ current_points: newPoints })
        .eq('user_id', userId)
        .eq('group_id', groupId);

      if (groupUpdateError) {
        console.error('Error updating groups:', groupUpdateError);
        return false;
      }

      let { data: profileData } = await supabase
        .from('users')
        .select('num_completed_tasks')
        .eq('user_id', userId)
        .single();

      const newCompletedTasks = (profileData?.num_completed_tasks || 0) + 1;

      const { error: profileUpdateError } = await supabase
        .from('users')
        .update({ num_completed_tasks: newCompletedTasks })
        .eq('user_id', userId);

      if (profileUpdateError) {
        console.error('Error updating profile:', profileUpdateError);
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
