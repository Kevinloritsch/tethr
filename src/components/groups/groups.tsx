import { FlatList, Pressable, View, Text } from 'react-native';
import { router } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';

import Group from '@/components/groups/group';

interface GroupWithPhotos {
  group_id: string;
  group_name: string;
  current_points: number;
  total_tasks: number;
  photos: {
    name: string;
    publicUrl: string;
    createdAt: string;
  }[];
}

interface GroupsProps {
  groups: GroupWithPhotos[];
}

const Groups = ({ groups }: GroupsProps) => {
  return (
    <FlatList
      data={groups}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 25,
      }}
      renderItem={({ item }) => (
        <Pressable
          onPress={() =>
            router.replace({
              pathname: `/main/groups/${item.group_id}`,
              params: {
                group_name: item.group_name,
                group_id: item.group_id,
                photos: JSON.stringify(item.photos),
                return_state: 'main',
              },
            })
          }>
          <Group
            group_id={item.group_id}
            group_name={item.group_name}
            photos={item.photos}
            current_points={item.current_points}
            total_tasks={item.total_tasks}
          />
        </Pressable>
      )}
      keyExtractor={(item) => item.group_id}
      ListEmptyComponent={
        <View className="flex items-center justify-center px-8 py-4">
          <Text className="text-center text-white">
            Create or a group to get started!
            <Pressable
              className="flex-row items-center px-4 py-2"
              onPress={() => router.push('/main/groups/createGroup')}>
              <FontAwesome6 name="plus" size={16} color="white" />
            </Pressable>
          </Text>
        </View>
      }
    />
  );
};

export default Groups;
