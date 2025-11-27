import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { taskController } from '@/controllers/tasks';
import { groupController } from '@/controllers/group';
import { supabase } from '@/lib/supabase';
interface GroupUser {
  user_id: string;
  username: string;
  current_rank: number;
  current_points: number;
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
  const [groupName, setGroupName] = useState<string | null>('Unnamed Group');
  useEffect(() => {
    if (groupId) {
      fetchGroupUsers(groupId);
      fetchGroupTasks(groupId);
      fetchGroupName(groupId);
    }
  }, [groupId]);

  const fetchGroupUsers = async (groupId: string) => {
    try {
      setLoading(true);
      const leaderboard = await groupController.getLeaderboardData(groupId);

      if (!leaderboard || leaderboard.length === 0) {
        console.log('No leaderboard data found.');
        setUsers([]);
      } else {
        setUsers(leaderboard);
      }
    } catch (err) {
      console.error('Unexpected error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupName = async (groupId: string) => {
    const data = await groupController.getGroupName(groupId);
    setGroupName(data);
  };

  const fetchGroupTasks = async (groupId: string) => {
    const data = await taskController.getTasksForGroup([{ group_id: groupId, group_name: '' }]);
    setTasks(data);
  };

  const leaveGroup = async () => {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;

    if (!userId || !groupId) {
      console.error('Missing user or group ID');
      return;
    }

    const result = await groupController.leaveGroup(userId, groupId);
    if (!result) return;
    if (result.success) {
      router.replace('/main/groups');
    } else {
      console.error('Failed to leave group:', result.message);
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
      <View className="flex-row items-center justify-between pt-4">
        <Text className="text-3xl font-bold leading-none text-white">{groupName}</Text>
        <Pressable className="rounded-3xl bg-tethr-purple/40 px-4 py-2" onPress={leaveGroup}>
          <Text className="text-white">Leave Group</Text>
        </Pressable>
      </View>
      {/* We can keep  this here but commented out for debugging purposes if we ever need to fetch a list of group members but it's not in the figma
      
      <Text className="mb-6 text-2xl font-bold text-white">Group Members</Text>
      {users.map(({ username, user_id }) => (
        <View key={user_id} className="mb-3 rounded-xl bg-tethr-gray/45 px-4 py-2">
          <Text className="text-lg text-white">{username}</Text>
        </View>
      ))} */}
      <Text className="mb-6 mt-6 text-2xl font-bold text-white">Leaderboard</Text>
      {users.length === 0 ? (
        <Text className="text-white/70">No leaderboard data yet.</Text>
      ) : (
        users.map(({ username, user_id, current_rank, current_points }) => (
          <View
            key={user_id}
            className="mb-3 flex-row items-center justify-between rounded-xl bg-tethr-gray/45 px-4 py-2">
            <Text className="text-lg text-white">
              {current_rank}. {username}
            </Text>
            <Text className="text-lg font-semibold text-white">{current_points} pts</Text>
          </View>
        ))
      )}

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
