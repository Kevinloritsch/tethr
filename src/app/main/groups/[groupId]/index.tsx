import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, router } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { taskController } from '@/controllers/tasks';

interface GroupUser {
  user_id: string;
  username: string;
}

interface Task {
  task_name: string;
  recurring: boolean;
}

const GroupPage = () => {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [users, setUsers] = useState<GroupUser[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (groupId) {
      fetchGroupUsers(groupId);
      fetchGroupTasks(groupId);
    }
  }, [groupId]);

  const fetchGroupUsers = async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('ispartof')
        .select('user_id, users ( username )')
        .eq('group_id', groupId);

      if (error) console.error('Error fetching group users:', error);
      else {
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

  const fetchGroupTasks = async (groupId: string) => {
    const data = await taskController.getTasksForGroup([{ group_id: groupId, group_name: '' }]);
    setTasks(data);
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
      {users.map(({ username, user_id }) => (
        <View key={user_id} className="mb-3 rounded-xl bg-tethr-gray/45 px-4 py-2">
          <Text className="text-lg text-white">{username}</Text>
        </View>
      ))}

      <View className="my-6 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-white">Tasks</Text>
        <Pressable
          className="flex-row items-center px-4 py-2"
          onPress={() => router.push(`/main/groups/${groupId}/createTask`)}>
          <FontAwesome6 name="plus" size={16} color="white" />
        </Pressable>
      </View>

      {tasks.map((task, idx) => (
        <View key={idx} className="mb-3 rounded-xl bg-tethr-gray/45 px-4 py-2">
          <Text className="text-lg text-white">
            {task.task_name} {task.recurring ? '(Recurring)' : ''}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

export default GroupPage;
