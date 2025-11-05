import { View, Text, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { userController } from '@/controllers/userInfo';

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
    <View className="flex-1 items-center justify-center bg-black p-5">
      <Text className="mb-8 text-xl font-semibold text-white">Welcome Back {username}!</Text>
    </View>
  );
}
