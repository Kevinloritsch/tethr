import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ProfileProps {
  username: string;
  pfpurl: string;
  fullName: string;
  numCompletedTasks: number;
  numFriends: number;
}

class UserController {
  private usersTableName = 'users';
  private avatarBucket = 'avatars';
  private friendsTableName = 'isfriendswith';

  async getProfileInformation(): Promise<ProfileProps> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (!user) throw authError;
    const { data: pfpData } = supabase.storage
      .from(this.avatarBucket)
      .getPublicUrl('default/cat1.jpg');

    const url = pfpData.publicUrl;
    const { data: profileData, error } = await supabase
      .from(this.usersTableName)
      .select('username, num_completed_tasks, name')
      .eq('user_id', user.id)
      .single();
    if (error) throw error;
    const { data: left, error: leftError } = await supabase
      .from(this.friendsTableName)
      .select('*')
      .eq('user1_id', user.id);

    const { data: right, error: rightError } = await supabase
      .from(this.friendsTableName)
      .select('*')
      .eq('user2_id', user.id);

    if (leftError || rightError) throw leftError || rightError;
    const friendRelations = [...(left ?? []), ...(right ?? [])];
    let friendCount = 0;
    const friendIds = friendRelations.map((r) =>
      r.user1_id === user.id ? r.user2_id : r.user1_id
    );
    const uniqueFriends = [...new Set(friendIds)];
    friendCount = uniqueFriends.length;

    await AsyncStorage.setItem('currentUserName', profileData?.username ?? '');

    return {
      username: profileData?.username ?? 'Unknown',
      pfpurl: url,
      fullName: profileData?.name ?? 'Unknown',
      numCompletedTasks: profileData?.num_completed_tasks ?? 0,
      numFriends: friendCount,
    };
  }
  async getUsername(): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('user_id', user.id)
      .single();
    if (error) return null;

    return data?.username || null;
  }

  async getName(): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('name')
      .eq('user_id', user.id)
      .single();

    if (error) return null;

    return data?.name || null;
  }

  async getEmail(): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('user_id', user.id)
      .single();

    if (error) return null;

    return data?.email || null;
  }

  async getId(): Promise<string | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      console.error('Cannot fetch user id:', error);
      return null;
    }
  }

  async getNumCompletedTasks(): Promise<number> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return 0;

    const { data, error } = await supabase
      .from('users')
      .select('num_completed_tasks')
      .eq('user_id', user.id)
      .single();
    if (error) return -1;

    return data?.num_completed_tasks || 0;
  }

  async getUser(): Promise<User | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Cannot get user:', error);
      return null;
    }
  }

  async logout(): Promise<boolean> {
    try {
      await supabase.auth.signOut();
      return true;
    } catch (error) {
      console.error('Error logging out:', error);
      return false;
    }
  }
  async updateUsername(newUsername: string): Promise<void> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user) throw authError;

    const { error } = await supabase
      .from(this.usersTableName)
      .update({ username: newUsername })
      .eq('user_id', user.id);

    if (error) throw error;
  }

  async updateName(newName: string): Promise<void> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user) throw authError;

    const { error } = await supabase
      .from(this.usersTableName)
      .update({ name: newName })
      .eq('user_id', user.id);

    if (error) throw error;
  }
}

export const userController = new UserController();
