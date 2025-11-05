import { ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { userController } from '@/controllers/userInfo';

import Tethr from '@/components/tethr';
import { Button } from '@/components/button';
import Groups from '@/components/groups/groups';
import Tasks from '@/components/tasks/tasks';

export default function Index() {
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const name = await userController.getUsername();
    if (name) setUsername(name);
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
      <Text className="mb-6 pl-9 text-3xl font-bold text-white">Welcome back, {username}!</Text>
      <View className="flex-row items-center justify-between pl-9 pr-3">
        <Text className="mb-3 text-2xl font-bold text-white">Your Groups</Text>
        <Button title="View all ➜" />
      </View>
      <Groups />
      <View className="flex-row items-center justify-between pt-6 pl-9 pr-3">
        <Text className="mb-3 text-2xl font-bold text-white">To-Do</Text>
        <Button title="View all ➜" />
      </View>
      <Tasks/>
     </ScrollView>
    </View>
  );
}
