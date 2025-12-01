import { View, Text, SectionList, ActivityIndicator, TouchableOpacity } from 'react-native';
import SearchBar from '@/components/searchbar';
import FriendCard, { FriendProps } from '@/components/friendcard';
import { getFriendsList } from '@/controllers/getFriends';
import { useState, useCallback, useEffect } from 'react';
import Tethr from '@/components/tethr';
import { useRouter } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCardType } from '@/utils/cardType';

export default function AddFriendsScreen() {
  const [users, setUsers] = useState<FriendProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const [cachedFriends, setCachedFriends] = useState<FriendProps[]>([]);
  const [cachedIncoming, setCachedIncoming] = useState<FriendProps[]>([]);
  const [cachedOutgoing, setCachedOutgoing] = useState<FriendProps[]>([]);

  const filterOutExisting = useCallback(
    (results: FriendProps[]) => {
      const existingIds = new Set([
        ...cachedFriends.map((u) => u.userId),
        ...cachedIncoming.map((u) => u.userId),
        ...cachedOutgoing.map((u) => u.userId),
      ]);

      return results.filter((user) => !existingIds.has(user.userId));
    },
    [cachedFriends, cachedIncoming, cachedOutgoing]
  );

  const handleSendRequest = useCallback(
    async (user: FriendProps) => {
      try {
        await getFriendsList.sendRequest(user.userId);
        setUsers((prev) => prev.filter((u) => u.userId !== user.userId));

        const updatedOutgoing = [...cachedOutgoing, user];
        setCachedOutgoing(updatedOutgoing);
        await AsyncStorage.setItem('@outgoingRequests', JSON.stringify(updatedOutgoing));
      } catch (error) {
        console.error('Error sending request:', error);
      }
    },
    [cachedOutgoing]
  );
  const searchUsers = useCallback(
    async (text: string) => {
      setQuery(text);

      if (!text.trim()) {
        setUsers([]);
        return;
      }

      setLoading(true);
      const result = await getFriendsList.searchUsers(text);
      const filtered = filterOutExisting(result || []);
      setUsers(filtered);
      setLoading(false);
    },
    [filterOutExisting]
  );

  useEffect(() => {
    const loadCachedRelationships = async () => {
      try {
        const [addedFriends, incomingReqs, outgoingReqs] = await AsyncStorage.multiGet([
          '@friends',
          '@incomingRequests',
          '@outgoingRequests',
        ]);

        if (addedFriends[1]) setCachedFriends(JSON.parse(addedFriends[1]));
        if (incomingReqs[1]) setCachedIncoming(JSON.parse(incomingReqs[1]));
        if (outgoingReqs[1]) setCachedOutgoing(JSON.parse(outgoingReqs[1]));
      } catch (err) {
        console.error('Error loading cached relationships:', err);
      }
    };

    loadCachedRelationships();
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

      <View className="mb-4 flex w-full flex-col items-center gap-2">
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
          className="flex flex-col px-4"
          sections={[{ title: 'Results', data: users }]}
          keyExtractor={(item) => item.userId}
          renderItem={({ item, index }) => (
            <FriendCard
              pfpUrl={item.pfpUrl}
              username={item.username}
              userId={item.userId}
              buttonText={item.buttonText}
              cardType={getCardType(index, users.length)}
              pressFunction={() => handleSendRequest(item)}
            />
          )}
          ListEmptyComponent={<Text className="px-4 text-center text-white">No results found</Text>}
        />
      )}
    </View>
  );
}
