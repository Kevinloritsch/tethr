import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { userController } from '@/controllers/userInfo';
import { FontAwesome6 } from '@expo/vector-icons';
import { router } from 'expo-router';
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
    <View className="bg-black px-4 pt-12">
      <Text className="mb-8 text-2xl font-semibold text-white">
        Welcome Back, {name || 'User'}!
      </Text>
      <View className="flex-row justify-between">
        <Text className="text-xl font-bold text-white">Your Groups</Text>
        <Pressable
          className="flex-row items-center rounded-xl bg-tethr-purple/40 px-4 py-2"
          onPress={() => router.push('main/groups')}>
          <Text className="mr-1 font-medium text-white">View all</Text>
          <FontAwesome6 name="arrow-right-long" size={16} color="white" className="pl-2" />
        </Pressable>
      </View>
    </View>
  );
}
