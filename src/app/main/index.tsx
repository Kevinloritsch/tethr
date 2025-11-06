import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { userController } from '@/controllers/userInfo';
import { FontAwesome6 } from '@expo/vector-icons';
import { router } from 'expo-router';

import Tethr from '@/components/tethr';
import Groups from '@/components/groups/groups';
import Tasks from '@/components/tasks/tasks';

export default function Index() {
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const name = await userController.getName();
    if (name) setName(name);
    setLoading(false);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="white" />
        <Text className="mt-4 text-white">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 pt-8">
      <Tethr side="left" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
        <Text className="mb-6 pl-9 text-3xl font-bold text-white">Welcome back, {name}!</Text>
        <View className="flex-row items-center justify-between pl-9 pr-3">
          <Text className="mb-3 text-2xl font-bold text-white">Your Groups</Text>
          <Pressable
            className="flex-row items-center rounded-xl bg-tethr-purple/40 px-4 py-2"
            onPress={() => router.push('main/groups')}>
            <Text className="mr-1 font-medium text-white">View all</Text>
            <FontAwesome6 name="arrow-right-long" size={16} color="white" className="pl-2" />
          </Pressable>
        </View>
        <Groups />
        <View className="flex-row items-center justify-between pl-9 pr-3 pt-6">
          <Text className="mb-3 text-2xl font-bold text-white">To-Do</Text>
        </View>
        <Tasks />
      </ScrollView>
    </View>
  );
}
