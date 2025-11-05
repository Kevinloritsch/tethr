import { View, Text, Image } from 'react-native';
import { ProfileProps } from '@/controllers/profile';

const Profile = ({ username, pfpurl, fullName, numCompletedTasks, numFriends }: ProfileProps) => {
  return (
    <View className="my-5 w-full items-center text-white">
      <Image source={{ uri: pfpurl }} className="w-1/3 rounded-full" style={{ aspectRatio: 1 }} />
      <View className="my-5 flex flex-col">
        <Text className="text-4xl font-semibold text-tethr-purple">{username}</Text>
        <Text className="text-2xl">{fullName}</Text>
      </View>

      <Text className="text-white/70">{numFriends} friends</Text>
      <Text className="text-white/70">{numCompletedTasks} tasks completed</Text>
    </View>
  );
};

export default Profile;
