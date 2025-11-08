import { FlatList, View, ActivityIndicator, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { getAllGroups } from '@/controllers/group';

import Group from '@/components/groups/group';

interface GroupType {
  group_id: string;
  group_name: string;
}

const Groups = () => {
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroupData = async () => {
    try {
      const allGroups = await getAllGroups.fetchUserData();
      setGroups(allGroups);
    } catch (err) {
      console.error('Unexpected error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="white" />
        <Text className="mt-4 text-white">Loading groups...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={groups}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 25,
      }}
      renderItem={({ item }) => (
        <View className="mx-4 h-72 w-72 rounded-md bg-tethr-gray p-4">
          <Group group_name={item.group_name} />
        </View>
      )}
      keyExtractor={(item) => item.group_id}
    />
  );
};

export default Groups;
