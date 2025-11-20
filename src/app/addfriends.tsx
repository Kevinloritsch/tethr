import { View, Text, SectionList, ActivityIndicator, TouchableOpacity } from 'react-native';
import SearchBar from '@/components/searchbar';
import FriendCard, { FriendProps } from '@/components/friendcard';
import { getFriendsList } from '@/controllers/getFriends';
import { useState, useCallback } from 'react';
import Tethr from '@/components/tethr';
import { useRouter } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';

export default function AddFriendsScreen() {
  const [users, setUsers] = useState<FriendProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  const searchUsers = useCallback(async (text: string) => {
    setQuery(text);

    if (!text.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    const result = await getFriendsList.searchUsers(text);
    setUsers(result || []);
    setLoading(false);
  }, []);
  return (
    <View className="flex-1 flex-col bg-black pt-8">
      <View className="relative h-[10vh] w-full items-center">
        <View className="absolute left-0 right-0 top-0 items-center">
          <Tethr side="center" />
        </View>
        <TouchableOpacity
          className="absolute left-0 top-0 h-full items-center justify-center pb-2 pl-8"
          onPress={() => {
            router.push('/main/friends');
          }}>
          <Entypo
            name="chevron-left"
            size={24}
            color="#000000"
            backgroundColor="#A597FF"
            className="rounded-lg px-2"
          />
        </TouchableOpacity>
      </View>

      <View className="flex w-full flex-col items-center gap-2">
        <Text className="text-center text-2xl font-bold text-white">Add Friends</Text>

        <SearchBar placeholder="Search users..." value={query} onSearch={searchUsers} />
      </View>
      {loading && (
        <View className="flex-1 items-center justify-center bg-black">
          <ActivityIndicator size="large" color="white" />
          <Text className="mt-4 text-white">Loading friends...</Text>
        </View>
      )}
      {!loading && (
        <SectionList
          className="flex flex-col items-center px-4"
          sections={[{ title: 'Results', data: users }]}
          keyExtractor={(item) => item.userId}
          renderItem={({ item }) => (
            <FriendCard
              pfpUrl={item.pfpUrl}
              username={item.username}
              userId={item.userId}
              buttonText={item.buttonText}
              cardType={item.cardType}
              pressFunction={() => getFriendsList.sendRequest(item.userId)}
            />
          )}
          ListEmptyComponent={<Text className="px-4 text-center text-white">No results found</Text>}
        />
      )}
    </View>
  );
}
