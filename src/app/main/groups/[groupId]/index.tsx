import { View, Text, TouchableOpacity, ActivityIndicator, Pressable, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { taskController } from '@/controllers/tasks';
import { groupController } from '@/controllers/group';
import { supabase } from '@/lib/supabase';
import { completedTasksController } from '@/controllers/completeTask';
import Fyp from '@/components/fyp';
import Tethr from '@/components/tethr';
import { getCardType, roundedMap } from '@/utils/cardType';
import Entypo from '@expo/vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GroupUser {
  user_id: string;
  username: string;
  current_rank: number;
  current_points: number;
}

interface Task {
  task_name: string;
  recurring: boolean;
  weekly: boolean;
}

interface Photo {
  name: string;
  publicUrl: string;
  createdAt: string;
  username: string;
  taskName: string;
}

const GroupPage = () => {
  const { group_id } = useLocalSearchParams();
  const groupId = Array.isArray(group_id) ? group_id[0] : (group_id ?? '');
  const { group_name } = useLocalSearchParams();
  const groupName = Array.isArray(group_name) ? group_name[0] : (group_name ?? '');
  const { return_state } = useLocalSearchParams();
  const hasReturn = return_state ? true : false;
  const [users, setUsers] = useState<GroupUser[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupNameState, setGroupNameState] = useState<string | null>('Unnamed Group');
  const [myUsername, setMyUsername] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  useEffect(() => {
    if (groupId) {
      fetchGroupUsers(groupId);
      fetchGroupTasks(groupId);
      fetchGroupNameState(groupId);
      const loadCompletedTasks = async () => {
        const completed = await completedTasksController.getTasks();
        setCompletedTasks(completed);
      };
      loadCompletedTasks();
    }
  }, [groupId]);

  const params = useLocalSearchParams();

  useEffect(() => {
    try {
      const photosParam = params.photos;
      if (typeof photosParam === 'string') {
        const parsedPhotos = JSON.parse(photosParam);
        setPhotos(parsedPhotos);
      }
    } catch (error) {
      console.error('Error parsing photos:', error);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, [params.photos]);

  const fetchGroupUsers = async (groupId: string) => {
    try {
      setLoading(true);
      const leaderboard = await groupController.getLeaderboardData(groupId);
      const storedUsername = await AsyncStorage.getItem('currentUserName');
      if (storedUsername) setMyUsername(storedUsername);

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

  const fetchGroupNameState = async (groupId: string) => {
    const data = await groupController.getGroupName(groupId);
    setGroupNameState(data);
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
      router.replace('/');
    } else {
      console.error('Failed to leave group:', result.message);
    }
  };
  const isCompleted = (taskName: string, groupId: string) => {
    const taskKey = `${groupId}-${taskName}`;
    return completedTasks.includes(taskKey);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <View className="mx-auto w-full flex-1 flex-col justify-center bg-black pt-8">
        <View className="relative h-[10vh] w-full items-center">
          <View className="absolute left-0 right-0 top-0 items-center">
            <Tethr side="center" />
          </View>
          <TouchableOpacity
            onPress={() => {
              if (hasReturn) {
                router.navigate('/');
              } else {
                router.back();
              }
            }}
            className="absolute left-0 top-0 h-full items-center justify-center pb-2 pl-8">
            <Entypo
              name="chevron-left"
              size={24}
              color="#000000"
              backgroundColor="#A597FF"
              className="rounded-lg px-2"
            />
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center justify-between px-[5vw] pb-4 pt-2">
          <Text className="text-3xl font-bold leading-none text-white">{groupNameState}</Text>
          <Pressable className="rounded-3xl bg-tethr-purple/40 px-4 py-2" onPress={leaveGroup}>
            <Text className="text-white">Leave Group</Text>
          </Pressable>
        </View>
        <FlatList
          data={photos}
          ListHeaderComponent={
            <View className="mx-auto w-[90vw] pb-8">
              <Text className="my-6 text-xl font-bold text-white">Leaderboard</Text>
              {users.length === 0 ? (
                <Text className="text-white/70">No leaderboard data yet.</Text>
              ) : (
                users.map(({ username, current_rank, current_points }, idx) => (
                  <View className="w-full items-center rounded-xl" key={idx}>
                    <View
                      className={`flex w-full flex-row justify-between bg-tethr-gray/50 py-4 text-2xl text-white ${roundedMap[getCardType(idx, users.length)]} p-2`}>
                      <Text
                        className={`font-semibold ${username === myUsername ? `text-tethr-purple` : `text-white`}`}>
                        {current_rank}. {username}
                      </Text>
                      <Text
                        className={`font-semibold ${username === myUsername ? `text-tethr-purple` : `text-white`}`}>
                        {current_points} pts
                      </Text>
                    </View>
                  </View>
                ))
              )}

              <View className="my-6 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-white">Tasks</Text>
                <Pressable
                  className="flex-row items-center py-2"
                  onPress={() =>
                    router.push({
                      pathname: `/main/groups/${groupId}/createTask`,
                      params: {
                        groupName: groupName,
                        photos: JSON.stringify(photos),
                      },
                    })
                  }>
                  <FontAwesome6 name="plus" size={16} color="white" />
                </Pressable>
              </View>

              {tasks.map((task, idx) => {
                const taskCompleted = isCompleted(task.task_name, groupId);

                return (
                  <TouchableOpacity
                    className="w-full items-center rounded-xl"
                    key={idx}
                    disabled={taskCompleted}
                    onPress={() =>
                      router.push({
                        pathname: '/main/camera/takePhoto',
                        params: {
                          group_name: group_name,
                          group_id: group_id,
                          task_name: task.task_name,
                          return_state: 'group',
                          photos: JSON.stringify(photos),
                          weekly: task.weekly as unknown as string,
                        },
                      })
                    }>
                    <View
                      className={`flex w-full self-center bg-tethr-gray/50 py-4 text-2xl text-white ${roundedMap[getCardType(idx, tasks.length)]} p-2`}>
                      <Text
                        className={`${taskCompleted ? 'text-tethr-light-gray/20' : 'text-white'} font-semibold`}>
                        {task.task_name} {task.recurring ? '(Recurring)' : ''}{' '}
                        {task.weekly ? '(Weekly)' : ''} {taskCompleted ? '(Completed)' : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              <Text className="pt-8 text-xl font-bold text-white">Recently Completed Tasks</Text>
            </View>
          }
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <View className="mx-auto justify-center pb-6">
              <Fyp
                publicUrl={item.publicUrl}
                taskName={item.taskName}
                userId={item.username}
                groupId={params.group_name as string}
              />
            </View>
          )}
          contentContainerStyle={{
            justifyContent: photos.length === 0 ? 'center' : undefined,
            alignItems: photos.length === 0 ? 'center' : undefined,
            paddingBottom: 80,
          }}
          ListEmptyComponent={
            <Text className="px-4 text-center text-white">No photos in this group yet.</Text>
          }
        />
      </View>
    </View>
  );
};

export default GroupPage;
