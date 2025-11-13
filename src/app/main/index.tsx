import { View, Text, Pressable, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { userController } from '@/controllers/userInfo';
import { FontAwesome6 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { photoRetrieve } from '@/controllers/photoRetrieve';
import { getAllGroups } from '@/controllers/group';
import { taskController, Task } from '@/controllers/tasks';
import { LinearGradient } from 'expo-linear-gradient';

import Tethr from '@/components/tethr';
import Groups from '@/components/groups/groups';
import Tasks from '@/components/tasks/tasks';

interface GroupWithPhotos {
  group_id: string;
  group_name: string;
  photos: {
    name: string;
    publicUrl: string;
    createdAt: string;
  }[];
}

export default function Index() {
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [groupsWithPhotos, setGroupsWithPhotos] = useState<GroupWithPhotos[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadPageData();
  }, []);

  const loadPageData = async () => {
    try {
      setLoading(true);

      const userName = await userController.getName();
      if (userName) setName(userName);

      const allGroups = await getAllGroups.fetchUserData();

      const groupIds = allGroups.map((g) => g.group_id);

      if (groupIds.length > 0) {
        const allPhotos = await photoRetrieve.getPhotosByGroups(groupIds);

        const grouped = allGroups.map((group) => {
          const groupPhotos = allPhotos
            .filter((p) => p.groupId === group.group_id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);

          return {
            group_id: group.group_id,
            group_name: group.group_name,
            photos: groupPhotos.map((p) => ({
              name: p.name,
              publicUrl: p.publicUrl,
              createdAt: p.createdAt,
            })),
          };
        });

        setGroupsWithPhotos(grouped);
        const tasks = await taskController.getTasksForGroup(allGroups);
        setAllTasks(tasks);
      } else {
        setGroupsWithPhotos([]);
        setAllTasks([]);
      }
    } catch (err) {
      console.error('Error loading homescreen:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPageData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="white" />
        <Text className="mt-4 text-white">Loading Home Screen...</Text>
      </View>
    );
  }

  return (
    <View className="relative flex-1 pt-8">
      <Tethr side="left" />
      <LinearGradient
        colors={['rgba(0,0,0,1)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: '10%',
          zIndex: 10,
        }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          height: '100%',
          width: '10%',
          zIndex: 10,
        }}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />
        }>
        <Text className="mb-6 pl-9 text-3xl font-bold text-white">Welcome back, {name}!</Text>
        <View className="flex-row items-center justify-between pl-8 pr-3">
          <Text className="mb-3 text-2xl font-bold text-white">Your Groups</Text>
          <Pressable
            className="flex-row items-center rounded-xl bg-tethr-purple/40 px-4 py-2"
            onPress={() => router.push('main/groups')}>
            <Text className="mr-1 font-medium text-white">View all</Text>
            <FontAwesome6 name="arrow-right-long" size={16} color="white" className="pl-2" />
          </Pressable>
        </View>
        <Groups groups={groupsWithPhotos} />
        <View className="flex-row items-center justify-between pl-8 pr-3 pt-6">
          <Text className="mb-3 text-2xl font-bold text-white">To-Do</Text>
        </View>
        <Tasks tasks={allTasks} />
      </ScrollView>
    </View>
  );
}
