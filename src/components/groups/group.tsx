import { View, Text } from 'react-native';
import { photoRetrieve } from '@/controllers/photoRetrieve';

interface GroupProps {
  groupId: string;
}

//{groupId }: GroupProps
const Group = ({groupId }: GroupProps) => {
  // istg if i forget to comment this out
  groupId = "QUACKS"
  return (
    <View className = "rounded-lg w-9/12 h-3/5 bg-tethr-gray">
      <Text className="text-white text-3xl font-bold p-5">{groupId}</Text>
    </View>
  );
};

export default Group;
