import { View, Text } from 'react-native';

interface GroupProps {
  // group_id: string;
  group_name: string;
}

//{groupId }: GroupProps
const Group = ({ group_name }: GroupProps) => {
  return (
    <View>
      <Text className="text-3xl font-bold text-white">{group_name}</Text>
    </View>
  );
};

export default Group;
