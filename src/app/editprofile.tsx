import { View, Text, ActivityIndicator, Pressable, TextInput, Alert } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { userController } from '@/controllers/userInfo';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

export default function EditProfile() {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');

  const router = useRouter();

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profileResponse = await userController.getProfileInformation();
      setUsername(profileResponse?.username ?? '');
      setFullName(profileResponse?.fullName ?? '');
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleSave = async () => {
    try {
      await Promise.all([
        userController.updateUsername(username),
        userController.updateName(fullName),
      ]);
      router.push('/main/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'There was an error updating your profile. Please try again.');
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
    <View className="flex-1 items-center bg-black px-6 pt-12">
      <Text className="mb-6 text-2xl font-bold text-white">Edit Profile</Text>
      <Text className="w-full text-left text-white">Username</Text>
      <TextInput
        className="my-1 w-full rounded-xl bg-tethr-gray/50 p-3 text-white"
        value={username}
        onChangeText={setUsername}
        placeholder="Enter username"
        placeholderTextColor="#777"
      />
      <Text className="w-full text-left text-white">Full Name</Text>
      <TextInput
        className="my-1 w-full rounded-xl bg-tethr-gray/50 p-3 text-white"
        value={fullName}
        onChangeText={setFullName}
        placeholder="Enter full name"
        placeholderTextColor="#777"
      />
      <Pressable
        className="mt-5 w-1/2 items-center rounded-xl bg-tethr-purple/40 py-2"
        onPress={handleSave}>
        <Text className="text-lg text-white">Save Changes</Text>
      </Pressable>
    </View>
  );
}
