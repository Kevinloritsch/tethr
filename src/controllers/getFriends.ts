import { supabase } from '@/lib/supabase';
import { CardType, getCardType } from '@/utils/cardType';

export interface FriendProps {
  pfpUrl: string;
  username: string;
  userId: string;
  buttonText: string;
  cardType: CardType;
}

class GetFriendController {
  private friendRequestsTableName = 'friendrequests';
  private usersTableName = 'users';
  private friendsTableName = 'isfriendswith';
  private avatarBucket = 'avatars';

  private async getFriendRelations() {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (!user) throw authError;
    const userId = user.id;
    console.log(userId);
    const { data: left, error: leftError } = await supabase
      .from(this.friendsTableName)
      .select('*')
      .eq('user1_id', userId);

    const { data: right, error: rightError } = await supabase
      .from(this.friendsTableName)
      .select('*')
      .eq('user2_id', userId);

    if (leftError || rightError) throw leftError || rightError;
    return [...(left ?? []), ...(right ?? [])];
  }

  async getFriends(): Promise<FriendProps[]> {
    const { data: pfpData } = supabase.storage
      .from(this.avatarBucket)
      .getPublicUrl('default/cat1.jpg');

    const pfpUrl = pfpData.publicUrl;
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (!user) throw authError;
    const userId = user.id;
    const relations = await this.getFriendRelations();
    if (!relations.length) return [];

    const friendIds = relations.map((r) => (r.user1_id === userId ? r.user2_id : r.user1_id));
    const uniqueFriendIds = [...new Set(friendIds)];

    const { data: friends, error } = await supabase
      .from(this.usersTableName)
      .select('user_id, username')
      .in('user_id', uniqueFriendIds);

    if (error) throw error;

    const result = (friends ?? []).map((f, index, arr) => ({
      pfpUrl: pfpUrl,
      username: f.username,
      userId: f.user_id,
      buttonText: 'Remove',
      cardType: getCardType(index, arr.length),
    }));

    return result;
  }

  async getIncomingFriendRequests(): Promise<FriendProps[]> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (!user) throw authError;
    const { data: pfpData } = supabase.storage
      .from(this.avatarBucket)
      .getPublicUrl('default/cat1.jpg');

    const pfpUrl = pfpData.publicUrl;
    const userId = user.id;
    const { data, error } = await supabase
      .from(this.friendRequestsTableName)
      .select('sender_id, users!sender_id(user_id, username)')
      .eq('recipient_id', userId);

    if (error) throw error;

    const requests = (data ?? []).map((r, index, arr) => {
      const user = Array.isArray(r.users) ? r.users[0] : r.users;

      return {
        pfpUrl: pfpUrl,
        username: user?.username ?? 'Unknown',
        userId: user?.user_id ?? '',
        buttonText: 'Accept',
        cardType: getCardType(index, arr.length),
      };
    });

    return requests;
  }

  async getIncomingFriendRequestsCount(): Promise<number> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (!user) throw authError;

    const userId = user.id;
    const { data, error } = await supabase
      .from(this.friendRequestsTableName)
      .select('sender_id, users!sender_id(user_id, username)')
      .eq('recipient_id', userId);

    if (error) throw error;

    return data.length;
  }

  async getOutgoingFriendRequests(): Promise<FriendProps[]> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    const { data: pfpData } = supabase.storage
      .from(this.avatarBucket)
      .getPublicUrl('default/cat1.jpg');

    const pfpUrl = pfpData.publicUrl;
    if (!user) throw authError;
    const userId = user.id;
    const { data, error } = await supabase
      .from(this.friendRequestsTableName)
      .select('recipient_id, users!recipient_id(user_id, username)')
      .eq('sender_id', userId);

    if (error) throw error;

    const requests = (data ?? []).map((r, index, arr) => {
      const user = Array.isArray(r.users) ? r.users[0] : r.users;

      return {
        pfpUrl: pfpUrl,
        username: user?.username ?? 'Unknown',
        userId: user?.user_id ?? '',
        buttonText: 'Remove',
        cardType: getCardType(index, arr.length),
      };
    });

    return requests;
  }

  async removeFriend(friendId: string): Promise<void> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (!user) throw authError;

    const userId = user.id;

    const filter = [
      `and(user1_id.eq.${userId},user2_id.eq.${friendId})`,
      `and(user1_id.eq.${friendId},user2_id.eq.${userId})`,
    ].join(',');

    const { error } = await supabase.from('isfriendswith').delete().or(filter);

    if (error) throw error;
  }

  async removeRequest(friendId: string): Promise<void> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (!user) throw authError;

    const userId = user.id;

    const filter = [
      `and(sender_id.eq.${userId},recipient_id.eq.${friendId})`,
      `and(sender_id.eq.${friendId},recipient_id.eq.${userId})`,
    ].join(',');

    const { error } = await supabase.from('friendrequests').delete().or(filter);

    if (error) throw error;
  }

  async searchUsers(query: string): Promise<FriendProps[] | null> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (!user) throw authError;

    const userId = user.id;

    const { data: pfpData } = supabase.storage
      .from(this.avatarBucket)
      .getPublicUrl('default/cat1.jpg');

    const pfpUrl = pfpData.publicUrl;

    const { data: users, error } = await supabase
      .from(this.usersTableName)
      .select('user_id, username')
      .ilike('username', `%${query}%`)
      .neq('user_id', userId);

    if (error) {
      console.error('Error searching users:', error);
      return null;
    }

    if (!users || users.length === 0) return [];

    const result: FriendProps[] = users.map((u, index) => ({
      pfpUrl,
      username: u.username,
      userId: u.user_id,
      buttonText: 'Add',
      cardType: getCardType(index, users.length),
    }));

    return result;
  }
  async sendRequest(recipientId: string): Promise<void> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (!user) throw authError;

    const senderId = user.id;

    const { error } = await supabase.from(this.friendRequestsTableName).insert({
      sender_id: senderId,
      recipient_id: recipientId,
    });

    if (error) throw error;
  }
  async acceptRequest(senderId: string): Promise<void> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (!user) throw authError;

    const recipientId = user.id;

    const { error: insertError } = await supabase.from(this.friendsTableName).insert({
      user1_id: senderId,
      user2_id: recipientId,
    });

    if (insertError) throw insertError;

    const { error: deleteError } = await supabase
      .from(this.friendRequestsTableName)
      .delete()
      .eq('sender_id', senderId)
      .eq('recipient_id', recipientId);

    if (deleteError) throw deleteError;
  }
}

export const getFriendsList = new GetFriendController();
