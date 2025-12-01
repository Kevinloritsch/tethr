import { supabase } from '@/lib/supabase';
import {
  taskCompletionObserver,
  TaskCompletionData,
} from '@/controllers/observers/taskCompletionObserver';
import { scoreUpdateObserver } from '@/controllers/observers/scoreUpdateObserver';

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
  private initialized = false;

  initialize() {
    if (this.initialized) {
      console.log('Reinitialization check: already done');
      return;
    }
    this.initialized = true;
    taskCompletionObserver.subscribe(async (data: TaskCompletionData) => {
      console.log('Scores: Observer, increasing relevant scores...');
      await this.increaseMemberScore(data.userId, data.groupId);
    });
  }
  async getGroupName(groupId: string): Promise<string | null> {
    const { data: group, error } = await supabase
      .from('groups')
      .select('group_name')
      .eq('group_id', groupId)
      .single();

    if (error) return null;
    return group?.group_name || null;
  }

  async fetchUserData(source?: string): Promise<GroupType[]> {
    console.log(`fetchUserData called by: ${source || 'unknown'}`);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        return [];
      }

      const user = sessionData?.session?.user;
      if (!user) {
        return [];
      }

      const { data: groupData, error: groupError } = await supabase
        .from('ispartof')
        .select('group_id, groups ( group_id, group_name ), current_points')
        .eq('user_id', user.id);

      if (groupError) console.error('Error fetching groups:', groupError);
      const formattedGroups: GroupType[] = (groupData || []).map((item: any) => ({
        group_id: item.group_id,
        group_name: item.groups?.group_name || 'N/A Group Name',
        current_points: item.current_points,
      }));

      return formattedGroups;
    } catch (err) {
      console.error('Unexpected error fetching data:', err);
      return [];
    }
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

      scoreUpdateObserver.notify();

      return true;
    } catch (err) {
      console.error('Increasing Score Error:', err);
      return false;
    }
  }
  async createGroup(group_name: string, user_id: string, friendIds: string[] = []) {
    try {
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert([{ group_name }])
        .select()
        .single();

      if (groupError) {
        console.error('Error creating group:', groupError);
        return { success: false, message: groupError.message };
      }

      console.log('Group created:', group);

      const membersToInsert = [
        {
          user_id: user_id,
          group_id: group.group_id,
          current_points: 0,
        },
        ...friendIds.map((fid) => ({
          user_id: fid,
          group_id: group.group_id,
          current_points: 0,
        })),
      ];

      const { error: isPartOfError } = await supabase.from('ispartof').insert(membersToInsert);

      if (isPartOfError) {
        console.error('Error inserting into ispartof:', isPartOfError);
        return { success: false, message: isPartOfError.message };
      }

      return { success: true, data: group };
    } catch (err) {
      console.error('Unexpected error:', err);
      return {
        success: false,
        message: 'Unexpected error occurred.',
      };
    }
  }
  async leaveGroup(userId: string, groupId: string) {
    // if anyone's trying to understand this the basic logic here is check how many members are in a group,
    // if i am the sole member, delete the group row and ispartof row. if not, then just delete ispartof row
    try {
      const { data: members, error: memberError } = await supabase
        .from('ispartof')
        .select('user_id')
        .eq('group_id', groupId);

      if (memberError) {
        console.error('Error checking group members:', memberError);
        return { success: false, message: memberError.message };
      }

      if (!members) {
        return { success: false, message: 'Unable to fetch group members.' };
      }
      const memberCount = members.length;

      if (memberCount === 1) {
        console.log('User is the only member. Deleting group...');

        const { error: deleteMembershipError } = await supabase
          .from('ispartof')
          .delete()
          .eq('user_id', userId)
          .eq('group_id', groupId);

        if (deleteMembershipError) {
          console.error('Error deleting membership:', deleteMembershipError);
          return { success: false, message: deleteMembershipError.message };
        }
        const { error: deleteGroupError } = await supabase
          .from('groups')
          .delete()
          .eq('group_id', groupId);

        if (deleteGroupError) {
          console.error('Error deleting group:', deleteGroupError);
          return { success: false, message: deleteGroupError.message };
        }

        return { success: true, message: 'Group deleted because you were the only member.' };
      }

      const { error: removeUserError } = await supabase
        .from('ispartof')
        .delete()
        .eq('user_id', userId)
        .eq('group_id', groupId);

      if (removeUserError) {
        console.error('Error removing user:', removeUserError);
        return { success: false, message: removeUserError.message };
      }

      return { success: true, message: 'Left group successfully.' };
    } catch (err) {
      console.error('Error leaving group:', err);
    }
  }
}

export const groupController = new GroupController();
export const getAllGroups = groupController;
