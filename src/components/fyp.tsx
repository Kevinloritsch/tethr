import { View, Image, Text } from 'react-native';

interface FypExplicitProps {
  publicUrl: string;
  taskName: string;
  userId: string;
  groupId: string;
}

const Fyp = ({ publicUrl, taskName, userId, groupId }: FypExplicitProps) => {
  return (
    <View className="w-[90vw] rounded-lg bg-tethr-gray p-6">
      <Text className="pb-1 text-2xl font-bold text-white">{userId}</Text>
      <View className="flex flex-row gap-x-2 font-bold">
        <Text className="text-lg color-tethr-purple">Completed</Text>
        <Text className="text-lg text-white">{taskName}</Text>
      </View>
      <Text className="pb-1 text-white">{groupId}</Text>
      <Image
        source={{ uri: publicUrl }}
        className="w-full rounded-2xl"
        style={{ aspectRatio: 3 / 4, height: undefined }}
        resizeMode="cover"
      />
    </View>
  );
};

export default Fyp;
