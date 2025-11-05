import { View, Text, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { userController } from '@/controllers/userInfo';

import Tethr from '@/components/tethr';
import { Button } from '@/components/button';
import Groups from '@/components/groups/groups'

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
    <View className="flex-1 bg-black pt-8">
      <Tethr side="left" />
      <Text className="mb-8 pl-9 text-3xl font-bold text-white">Welcome back, {username}!</Text>
      <View className="pl-9 pr-3 flex-row justify-between items-center">
        <Text className="mb-3 text-2xl font-bold text-white">Your Groups</Text>  
        <Button title="View all ➜"/>
      </View>
      <Groups/>
    </View>
  );
}
