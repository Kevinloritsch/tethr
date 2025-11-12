import { FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';

import Group from '@/components/groups/group';

interface GroupWithPhotos {
  group_id: string;
  group_name: string;
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
        <Pressable onPress={() => router.push(`/main/groups/${item.group_id}`)}>
          <Group group_name={item.group_name} photos={item.photos} />
        </Pressable>
      )}
      keyExtractor={(item) => item.group_id}
    />
  );
};

export default Groups;
