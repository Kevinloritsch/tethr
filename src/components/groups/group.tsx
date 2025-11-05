import { View, Text } from 'react-native';
import { photoRetrieve } from '@/controllers/photoRetrieve';

interface GroupProps {
  groupId: string;
}

//{groupId }: GroupProps
const Group = ({ groupId }: GroupProps) => {
  return (
    <View>
      <Text className="text-3xl font-bold text-white">{groupId}</Text>

    </View>
  );
};

export default Group;
