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
import FriendCard, { FriendProps } from '@/components/friendcard';
import { getFriendsList } from '@/controllers/getFriends';
import SearchBar from '@/components/searchbar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCardType } from '@/utils/cardType';

export default function FriendsScreen() {
  const [friends, setFriends] = useState<FriendProps[]>([]);
  const [incomingRequests, setIncoming] = useState<FriendProps[]>([]);
  const [outgoingRequests, setOutgoing] = useState<FriendProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const storeFriendsData = async (
    friendsData: FriendProps[],
    incomingData: FriendProps[],
    outgoingData: FriendProps[]
  ) => {
    try {
      await AsyncStorage.multiSet([
        ['@friends', JSON.stringify(friendsData)],
        ['@incomingRequests', JSON.stringify(incomingData)],
        ['@outgoingRequests', JSON.stringify(outgoingData)],
      ]);
    } catch (err) {
      console.error('Error saving friends to storage:', err);
    }
  };

  const loadFriends = useCallback(async () => {
    try {
      setLoading(true);

      const [friendsRes, incomingRes, outgoingRes] = await Promise.all([
        getFriendsList.getFriends(),
        getFriendsList.getIncomingFriendRequests(),
        getFriendsList.getOutgoingFriendRequests(),
      ]);

      const addedFriends = friendsRes ?? [];
      const incomingReqs = incomingRes ?? [];
      const outgoingReqs = outgoingRes ?? [];

      setFriends(addedFriends);
      setIncoming(incomingReqs);
      setOutgoing(outgoingReqs);

      storeFriendsData(addedFriends, incomingReqs, outgoingReqs);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const [addedFriends, incomingReqs, outgoingReqs] = await AsyncStorage.multiGet([
          '@friends',
          '@incomingRequests',
          '@outgoingRequests',
        ]);

        if (addedFriends[1]) setFriends(JSON.parse(addedFriends[1]));
        if (incomingReqs[1]) setIncoming(JSON.parse(incomingReqs[1]));
        if (outgoingReqs[1]) setOutgoing(JSON.parse(outgoingReqs[1]));
      } catch (err) {
        console.error('Error loading cached friends:', err);
      }
    };

    loadCachedData();
  }, []);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  useEffect(() => {
    loadFriends();
  }, []);
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
        <View className="h-[6vh] w-11/12 flex-row items-center justify-between gap-2">
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
        renderItem={({ item, section, index }) => (
          <View className="flex flex-col items-center px-4">
            <FriendCard
              pfpUrl={item.pfpUrl}
              username={item.username}
              buttonText={item.buttonText}
              userId={item.userId}
              pressFunction={() => {
                if (section.title === 'Friends') {
                  handleRemoveFriend(item.userId);
                } else if (section.title === 'Incoming') {
                  handleAcceptRequest(item.userId);
                } else if (section.title === 'Pending') {
                  handleRemoveRequest(item.userId);
                }
              }}
              cardType={getCardType(index, section.data.length)}
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
