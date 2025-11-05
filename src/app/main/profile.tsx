import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { userController } from '@/controllers/userInfo';
import { useRouter } from 'expo-router';

export default function Index() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [tasks, setTasks] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const username = await userController.getUsername();
    const email = await userController.getEmail();
    const name = await userController.getName();
    const tasks = await userController.getNumCompletedTasks();
    if (username) setUsername(username);
    if (email) setEmail(email);
    if (name) setName(name);
    if (tasks) setTasks(tasks);
    setLoading(false);
  };

  const handleLogout = async () => {
    const success = await userController.logout();
    if (success) {
      router.replace('/auth');
    }
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
      <Text className="mb-8 text-xl font-semibold text-white">{username}</Text>
      <Text className="mb-8 text-xl font-semibold text-white">{name}</Text>
      <Text className="mb-8 text-xl font-semibold text-white">{email}</Text>
      <Text className="mb-8 text-xl font-semibold text-white">{tasks}</Text>

      <TouchableOpacity className="rounded-xl bg-red-500 p-4" onPress={handleLogout}>
        <Text className="text-base font-semibold text-white">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
