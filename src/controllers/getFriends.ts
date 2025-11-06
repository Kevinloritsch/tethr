import { supabase } from '@/lib/supabase';

export type CardType = 'top' | 'middle' | 'bottom' | 'solo';

export interface FriendProps {
  pfpUrl: string;
  username: string;
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
      buttonText: 'Friends',
      cardType: this.getCardType(index, arr.length),
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
      .select('sender_id, users!sender_id(username)')
      .eq('recipient_id', userId);

    if (error) throw error;

    const requests = (data ?? []).map((r, index, arr) => {
      const user = Array.isArray(r.users) ? r.users[0] : r.users;

      return {
        pfpUrl: pfpUrl,
        username: user?.username ?? 'Unknown',
        buttonText: 'Accept',
        cardType: this.getCardType(index, arr.length),
      };
    });

    return requests;
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
      .select('recipient_id, users!recipient_id(username)')
      .eq('sender_id', userId);

    if (error) throw error;

    const requests = (data ?? []).map((r, index, arr) => {
      const user = Array.isArray(r.users) ? r.users[0] : r.users;

      return {
        pfpUrl: pfpUrl,
        username: user?.username ?? 'Unknown',
        buttonText: 'Remove',
        cardType: this.getCardType(index, arr.length),
      };
    });

    return requests;
  }

  private getCardType(index: number, total: number): CardType {
    if (total === 1) return 'solo';
    if (index === 0) return 'top';
    if (index === total - 1) return 'bottom';
    return 'middle';
  }
}

export const getFriendsList = new GetFriendController();
