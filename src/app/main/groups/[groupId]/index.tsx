import { View, Text, TouchableOpacity, ActivityIndicator, Pressable, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { taskController } from '@/controllers/tasks';
import { groupController } from '@/controllers/group';

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
  const [users, setUsers] = useState<GroupUser[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [myUsername, setMyUsername] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    if (groupId) {
      fetchGroupUsers(groupId);
      fetchGroupTasks(groupId);
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
    <View className="mx-auto w-full flex-1 flex-col justify-center bg-black pt-8">
      <View className="relative h-[10vh] w-full items-center">
        <View className="absolute left-0 right-0 top-0 items-center">
          <Tethr side="center" />
        </View>
        <TouchableOpacity
          onPress={() => {
            router.navigate('/main');
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
      <FlatList
        data={photos}
        ListHeaderComponent={
          <View className="mx-auto w-[90vw] pb-8">
            <Text className="text-3xl font-bold text-white">{groupName}</Text>
            <Text className="my-6 text-xl font-bold text-white">Leaderboard</Text>
            {users.length === 0 ? (
              <Text className="text-white/70">No leaderboard data yet.</Text>
            ) : (
              users.map(({ username, current_rank, current_points }, idx) => (
                <View className="w-full items-center rounded-xl" key={idx}>
                  <View
                    className={`flex w-full flex-row justify-between self-center bg-tethr-gray/50 py-4 text-2xl text-white ${roundedMap[getCardType(idx, users.length)]} p-2`}>
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
                onPress={() => router.push(`/main/groups/${groupId}/createTask`)}>
                <FontAwesome6 name="plus" size={16} color="white" />
              </Pressable>
            </View>

            {tasks.map((task, idx) => (
              <View className="w-full items-center rounded-xl" key={idx}>
                <View
                  className={`flex w-full self-center bg-tethr-gray/50 py-4 text-2xl text-white ${roundedMap[getCardType(idx, tasks.length)]} p-2`}>
                  <Text className="font-semibold text-white">
                    {task.task_name} {task.recurring ? '(Recurring)' : ''}
                  </Text>
                </View>
              </View>
            ))}

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
  );
};

export default GroupPage;
