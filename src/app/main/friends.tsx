import {
  View,
  Text,
  ActivityIndicator,
  SectionList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import Tethr from '@/components/tethr';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import FriendCard, { FriendProps } from '@/components/friendcard';
import { getFriendsList } from '@/controllers/getFriends';
import SearchBar from '@/components/searchbar';
import { useRouter } from 'expo-router';

export default function FriendsScreen() {
  const [friends, setFriends] = useState<FriendProps[]>([]);
  const [incomingRequests, setIncoming] = useState<FriendProps[]>([]);
  const [outgoingRequests, setOutgoing] = useState<FriendProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

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
  const handleRemoveFriend = async (friendId: string) => {
    try {
      setFriends((prev) => prev.filter((f) => f.userId !== friendId));
      setIncoming((prev) => prev.filter((f) => f.userId !== friendId));
      setOutgoing((prev) => prev.filter((f) => f.userId !== friendId));

      await getFriendsList.removeFriend(friendId);
    } catch (error) {
      console.error(error);
      loadFriends();
    }
  };
  const handleRemoveRequest = async (friendId: string) => {
    try {
      setFriends((prev) => prev.filter((f) => f.userId !== friendId));
      setIncoming((prev) => prev.filter((f) => f.userId !== friendId));
      setOutgoing((prev) => prev.filter((f) => f.userId !== friendId));

      await getFriendsList.removeRequest(friendId);
    } catch (error) {
      console.error(error);
      loadFriends();
    }
  };
  const handleAcceptRequest = async (friendId: string) => {
    try {
      setFriends((prev) => prev.filter((f) => f.userId !== friendId));
      setIncoming((prev) => prev.filter((f) => f.userId !== friendId));
      setOutgoing((prev) => prev.filter((f) => f.userId !== friendId));

      await getFriendsList.acceptRequest(friendId);
    } catch (error) {
      console.error(error);
      loadFriends();
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFriends();
  }, [loadFriends]);

  const filterFriends = useCallback((friendsList: FriendProps[], query: string) => {
    if (!query.trim()) return friendsList;

    const lowerQuery = query.toLowerCase();
    return friendsList.filter((friend) => friend.username.toLowerCase().includes(lowerQuery));
  }, []);

  const sections = useMemo(() => {
    return [
      {
        title: 'Incoming',
        data: filterFriends(incomingRequests, searchQuery),
      },
      {
        title: 'Pending',
        data: filterFriends(outgoingRequests, searchQuery),
      },
      {
        title: 'Friends',
        data: filterFriends(friends, searchQuery),
      },
    ];
  }, [friends, incomingRequests, outgoingRequests, searchQuery, filterFriends]);

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

      <View className="flex w-full flex-col items-center gap-2">
        <Text className="text-center text-2xl font-bold text-white">Your Friends</Text>
        <View className="w-11/12 flex-row items-center justify-between gap-2">
          <SearchBar
            placeholder="Search friends..."
            onSearch={setSearchQuery}
            value={searchQuery}
          />
          <TouchableOpacity
            className="flex aspect-square h-full flex-col items-center justify-center rounded-2xl bg-tethr-purple/70 p-2"
            onPress={() => {
              router.push('/addfriends');
            }}>
            <Text className="text-white">+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.username}
        renderItem={({ item, section }) => (
          <View className="flex flex-col items-center px-4">
            <FriendCard
              pfpUrl={item.pfpUrl}
              username={item.username}
              buttonText={item.buttonText}
              userId={item.userId}
              pressFunction={() => {
                if (section.title === 'Friends') {
                  handleRemoveFriend(item.userId);
                } else if (section.title === 'Incoming' || section.title === 'Pending') {
                  handleAcceptRequest(item.userId);
                } else if (section.title === 'Outgoing') {
                  handleRemoveRequest(item.userId);
                }
              }}
              cardType={item.cardType}
            />
          </View>
        )}
        renderSectionHeader={({ section: { title, data } }) => (
          <Text className="px-4 pb-4 pt-8 text-left text-xl font-bold text-white">
            {title} ({data.length})
          </Text>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text className="px-4 text-center text-white">No friends or requests yet.</Text>
        }
      />
    </View>
  );
}
