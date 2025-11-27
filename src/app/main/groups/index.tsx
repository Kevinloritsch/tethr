import {
  View,
  Pressable,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useEffect, useState, useMemo } from 'react';
import { FontAwesome6 } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { getAllGroups } from '@/controllers/group';

import Tethr from '@/components/tethr';
import SearchBar from '@/components/searchbar';
import { getCardType, roundedMap } from '@/utils/cardType';

import Entypo from '@expo/vector-icons/Entypo';

interface Group {
  group_id: string;
  group_name: string;
}

interface GroupWithPhotos {
  group_id: string;
  group_name: string;
  current_points: number;
  total_tasks: number;
  photos: {
    name: string;
    publicUrl: string;
    createdAt: string;
    username: string;
    taskName: string;
  }[];
}

const Index = () => {
  const { data } = useLocalSearchParams();

  let parsedObject: GroupWithPhotos[] = [];

  if (Array.isArray(data)) {
    parsedObject = JSON.parse(data[0]);
  } else if (typeof data === 'string') {
    parsedObject = JSON.parse(data);
  }

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;

    const lowerQuery = searchQuery.toLowerCase();
    return groups.filter((group) => group.group_name.toLowerCase().includes(lowerQuery));
  }, [groups, searchQuery]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black pt-8">
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
      <View className="mb-3 flex-row items-center justify-between pl-10 pr-3">
        <Text className="text-2xl font-bold text-white">Your Groups</Text>
        <Pressable
          className="flex-row items-center px-4 py-2"
          onPress={() => router.push('/main/groups')}>
          <FontAwesome6 name="plus" size={16} color="white" />
        </Pressable>
      </View>
      <View className="mb-5 items-center">
        <SearchBar placeholder="Search groups..." onSearch={setSearchQuery} value={searchQuery} />
      </View>

      {parsedObject.length === 0 ? (
        <Text className="text-center text-xl text-white">
          {searchQuery ? 'No groups found.' : "You're not in any groups yet."}
        </Text>
      ) : (
        <ScrollView showsHorizontalScrollIndicator={false}>
          {parsedObject.map((group: GroupWithPhotos, index: number) => {
            return (
              <TouchableOpacity
                key={group.group_id}
                className={`flex w-10/12 self-center bg-tethr-gray/50 px-5 py-4 text-2xl text-white ${roundedMap[getCardType(index, filteredGroups.length)]}`}
                onPress={() =>
                  router.push({
                    pathname: `/main/groups/${group.group_id}`,
                    params: {
                      group_name: group.group_name,
                      group_id: group.group_id,
                      photos: JSON.stringify(group.photos),
                    },
                  })
                }>
                <Text className="font-semibold text-white">
                  {group.group_name || 'Unnamed Group'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

export default Index;
