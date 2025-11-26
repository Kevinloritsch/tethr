import { View, Text, Image, Pressable } from 'react-native';
import { ProfileProps } from '@/controllers/userInfo';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';

const Profile = ({ username, pfpurl, fullName, numCompletedTasks, numFriends }: ProfileProps) => {
  const router = useRouter();
  return (
    <View className="my-5 w-full items-center text-white">
      <Image source={{ uri: pfpurl }} className="w-1/3 rounded-full" style={{ aspectRatio: 1 }} />
      <View className="mt-4 flex flex-col">
        <Text className="text-4xl font-semibold text-tethr-purple">{username}</Text>
        <Text className="text-center text-2xl text-white">{fullName}</Text>
      </View>
      <Pressable
        className="my-3"
        onPress={() => {
          router.push('/editprofile');
        }}>
        <Feather name="edit-2" size={20} color="white" />
      </Pressable>
      <Text className="text-white/70">{numFriends} friends</Text>
      <Text className="text-white/70">{numCompletedTasks} tasks completed</Text>
    </View>
  );
};

export default Profile;
