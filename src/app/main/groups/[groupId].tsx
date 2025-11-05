import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams } from 'expo-router';

interface GroupUser {
  user_id: string;
  username: string;
}

const GroupPage = () => {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [users, setUsers] = useState<GroupUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (groupId) fetchGroupUsers(groupId);
  }, [groupId]);

  const fetchGroupUsers = async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('ispartof')
        .select('user_id, users ( username )')
        .eq('group_id', groupId);

      if (error) {
        console.error('Error fetching group users:', error);
      } else {
        const formattedUsers = (data || []).map((item: any) => ({
          user_id: item.user_id,
          username: item.users?.username || 'No username',
        }));
        setUsers(formattedUsers);
      }
    } catch (err) {
      console.error('Unexpected error fetching group users:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-black px-4 pt-12">
      <Text className="mb-6 text-2xl font-bold text-white">Group Members</Text>
      {users.map(({ username }, id) => (
        <View key={id} className="mb-3 rounded-xl bg-tethr-gray/45 px-4 py-2">
          <Text className="text-lg text-white">{username}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

export default GroupPage;
