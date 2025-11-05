import { View, Text, Image } from 'react-native';
import { ProfileProps } from '@/controllers/profile';

const Profile = ({ username, pfpurl, fullName, numCompletedTasks, numFriends }: ProfileProps) => {
  return (
    <View className="w-full items-center">
      <Image source={{ uri: pfpurl }} className="w-1/5 rounded-full" style={{ aspectRatio: 1 }} />
      <Text>{username}</Text>
      <Text>{fullName}</Text>
      <Text>{numCompletedTasks}</Text>
      <Text>{numFriends}</Text>
    </View>
  );
};

export default Profile;
