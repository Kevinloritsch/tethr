import { supabase } from '@/lib/supabase';

export interface ProfileProps {
  username: string;
  pfpurl: string;
  fullName: string;
  numCompletedTasks: number;
  numFriends: number;
}

class ProfileController {
  private usersTableName = 'users';
  private avatarBucket = 'avatars';
  private friendsTableName = 'isfriendswith';
  //   default profile picture is currently used for everyone, code can be changed to fetch pfp url from user when custom pfps are implemented
  async getProfileInformation(userId: string): Promise<ProfileProps> {
    const { data: pfpData } = supabase.storage
      .from(this.avatarBucket)
      .getPublicUrl('default/cat1.jpg');

    const url = pfpData.publicUrl;
    const { data: profileData, error } = await supabase
      .from(this.usersTableName)
      .select('username, num_completed_tasks, full_name')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    const { data: left, error: leftError } = await supabase
      .from(this.friendsTableName)
      .select('*')
      .eq('user1_id', userId);

    const { data: right, error: rightError } = await supabase
      .from(this.friendsTableName)
      .select('*')
      .eq('user2_id', userId);

    if (leftError || rightError) throw leftError || rightError;
    const friendRelations = [...(left ?? []), ...(right ?? [])];
    let friendCount = 0;

    // Determine unique friend IDs (to avoid duplicates)
    const friendIds = friendRelations.map((r) => (r.user1_id === userId ? r.user2_id : r.user1_id));
    const uniqueFriends = [...new Set(friendIds)];
    friendCount = uniqueFriends.length;

    return {
      username: profileData?.username ?? 'Unknown',
      pfpurl: url,
      fullName: profileData?.full_name ?? 'Unknown',
      numCompletedTasks: profileData?.num_completed_tasks ?? 0,
      numFriends: friendCount,
    };
  }
}

export default ProfileController;
