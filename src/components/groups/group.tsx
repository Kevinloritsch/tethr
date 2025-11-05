import { View, Text } from 'react-native';
import { photoRetrieve, PhotoSubmission, UserGroupPair } from '@/controllers/photoRetrieve';

interface GroupProps {
  groupId: string;
}

const Group = ({groupId }: GroupProps) => {
  return (
    <View className = "rounded-lg">
      <Text className="text-white bg-[#3f3f3f99]">hdh</Text>
    </View>
  );
};

export default Group;
