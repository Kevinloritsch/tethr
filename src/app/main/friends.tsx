import { View, Text, ActivityIndicator, SectionList, RefreshControl } from 'react-native';
import Tethr from '@/components/tethr';
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import FriendCard, { FriendProps } from '@/components/friendcard';
import { getFriendsList } from '@/controllers/getFriends';

export default function FriendsScreen() {
  const [friends, setFriends] = useState<FriendProps[]>([]);
  const [incomingRequests, setIncoming] = useState<FriendProps[]>([]);
  const [outgoingRequests, setOutgoing] = useState<FriendProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFriends = useCallback(async () => {
    try {
      setLoading(true);

      const [friendsRes, incomingRes, outgoingRes] = await Promise.all([
        getFriendsList.getFriends(),
        getFriendsList.getIncomingFriendRequests(),
        getFriendsList.getOutgoingFriendRequests(),
      ]);

      setFriends(friendsRes ?? []);
      setIncoming(incomingRes ?? []);
      setOutgoing(outgoingRes ?? []);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  useFocusEffect(
    useCallback(() => {
      loadFriends();
    }, [loadFriends])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFriends();
  }, [loadFriends]);

  const sections = [
    { title: 'Incoming Requests', data: incomingRequests },
    { title: 'Outgoing Requests', data: outgoingRequests },
    { title: 'Friends', data: friends },
  ];

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="white" />
        <Text className="mt-4 text-white">Loading friends...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 flex-col bg-black pt-8">
      <Tethr side="left" />
      <View className="mb-4">
        <Text className="text-center text-white">Searchbar placeholder</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.username}
        renderItem={({ item }) => (
          <FriendCard
            pfpUrl={item.pfpUrl}
            username={item.username}
            buttonText={item.buttonText}
            cardType={item.cardType}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text className="pb-4 pt-8 text-center text-xl font-bold text-white">{title}</Text>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text className="px-4 text-center text-white">No friends or requests yet.</Text>
        }
      />
    </View>
  );
}
