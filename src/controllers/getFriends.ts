import { supabase } from "@/lib/supabase";

class getFriendController {
    private friendRequestsTableName = 'friendrequests'

    private async getFriendsLeft(userId: string) {
        let { data: isfriendswithRight, error } = await supabase.from('isfriendswith').select("*").eq('user1_id', userId)
    }
    private async getFriendsRight(userId: string) {
        let { data: isfriendswithRight, error } = await supabase.from('isfriendswith').select("*").eq('user2_id', userId)
    }

    async getIncomingFriendRequests(userId: string) {
        const { data: friendrequests, error } = await supabase.from(this.friendRequestsTableName).select("*").eq('recipient_id', userId)

    }

    async getOutgoingFriendRequests(userId: string) {
        const { data: friendrequests, error } = await supabase.from(this.friendRequestsTableName).select("*").eq('sender_id', userId)
    }

    async getFriends(userId: string) {
        
    }
    
}

export const getFriends = new getFriendController();