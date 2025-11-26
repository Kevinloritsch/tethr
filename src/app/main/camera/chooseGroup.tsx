import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { getAllGroups } from '@/controllers/group';
import { useEffect, useState, useCallback } from 'react';
import { getCardType, roundedMap } from '@/utils/cardType';
import SearchBar from '@/components/searchbar';
import Tethr from '@/components/tethr';
import Entypo from '@expo/vector-icons/Entypo';

interface Group {
  group_id: string;
  group_name: string;
}

const ChooseGroup = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [filtered, setFiltered] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchGroupData();
  }, []);

  const fetchGroupData = async () => {
    try {
      const allGroups = await getAllGroups.fetchUserData();
      setGroups(allGroups);
      setFiltered(allGroups);
    } catch (err) {
      console.error('Unexpected error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(
    (text: string) => {
      setQuery(text);

      if (!text.trim()) {
        setFiltered(groups);
        return;
      }

      const lowered = text.toLowerCase();
      const filteredGroups = groups.filter((g) => g.group_name.toLowerCase().includes(lowered));
      setFiltered(filteredGroups);
    },
    [groups]
  );
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
      <View className="w-full items-center gap-2">
        <Text className="text-2xl font-bold text-white">Select Group</Text>

        <SearchBar placeholder="Search groups..." value={query} onSearch={handleSearch} />
      </View>
      {loading && (
        <View className="flex-1 items-center justify-center bg-black">
          <ActivityIndicator size="large" color="white" />
          <Text className="mt-4 text-white">Loading groups...</Text>
        </View>
      )}
      {!loading && (
        <View className="items-center">
          {filtered.length === 0 ? (
            <Text className="mt-4 text-center text-white">No matching groups.</Text>
          ) : (
            <ScrollView className="mt-4 w-full" showsVerticalScrollIndicator={false}>
              {filtered.map((group, index) => (
                <TouchableOpacity
                  key={group.group_id}
                  className={`flex w-11/12 self-center bg-tethr-gray/50 px-5 py-4 text-2xl text-white ${roundedMap[getCardType(index, filtered.length)]}`}
                  onPress={() =>
                    router.push({
                      pathname: '/main/camera/chooseTask',
                      params: {
                        group_name: group.group_name,
                        group_id: group.group_id,
                      },
                    })
                  }>
                  <Text className="font-semibold text-white">{group.group_name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
};

export default ChooseGroup;
