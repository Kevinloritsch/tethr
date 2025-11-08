import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { getAllGroups } from '@/controllers/group';
import { useEffect, useState } from 'react';

import Tethr from '@/components/tethr';

import Entypo from '@expo/vector-icons/Entypo';

interface Group {
  group_id: string;
  group_name: string;
}

const ChooseGroup = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroupData();
  }, []);

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
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <View className="flex-1 flex-col bg-black pt-8">
      <View className="relative h-[10vh] w-full items-center">
        <View className="absolute left-0 right-0 top-0 items-center">
          <Tethr side="center" />
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-0 top-0 h-full items-center justify-center pb-2 pl-8">
          <Entypo
            name="chevron-left"
            size={24}
            color="#000000"
            backgroundColor="#A597FF"
            className="rounded-lg px-2"
          />
        </TouchableOpacity>
      </View>
      <View className="items-center">
        <Text className="text-2xl font-bold text-white">Select Group</Text>
        {groups.length === 0 ? (
          <Text className="text-center text-white">You’re not in any groups yet.</Text>
        ) : (
          <ScrollView showsHorizontalScrollIndicator={false}>
            {groups.map((group) => (
              <Pressable
                key={group.group_id}
                className="mr-3 rounded-xl bg-tethr-gray/45 px-4 py-2"
                onPress={() =>
                  router.push({
                    pathname: '/main/camera/chooseTask',
                    params: { group_name: group.group_name },
                  })
                }>
                <Text className="text-2xl font-medium text-white">{group.group_name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default ChooseGroup;
