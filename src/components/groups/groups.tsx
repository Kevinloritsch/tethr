import { FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';

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
    />
  );
};

export default Groups;
