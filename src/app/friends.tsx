import { View, Text, ActivityIndicator } from 'react-native';
import Tethr from '@/components/tethr';
import { AppText } from '@/components/apptext';
import { getFriendsList } from '@/controllers/getFriends';
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import FriendCard, { FriendProps } from '@/components/friendcard';

export default function FriendsScreen() {
  const [friends, setFriends] = useState<FriendProps[]>([]);
  const [incomingRequests, setIncoming] = useState<FriendProps[]>([]);
  const [outgoingRequests, setOutgoing] = useState<FriendProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    loadFriends();
  }, []);
  const TEST_USER_ID = process.env.TEST_USER_ID;
  const loadFriends = async () => {
    setFriends(await getFriendsList.getFriends(TEST_USER_ID));
    setIncoming(await getFriendsList.getIncomingFriendRequests(TEST_USER_ID));
    setOutgoing(await getFriendsList.getOutgoingFriendRequests(TEST_USER_ID));
    setLoading(false);
  };
  useFocusEffect(
    useCallback(() => {
      loadFriends();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFriends();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="white" />
        <Text className="mt-4 text-white">Loading friends...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 flex-col items-center bg-black py-8">
      <Tethr side="left" />
      <View>
        <AppText className="text-4xl font-bold text-white">Your Friends</AppText>
        <AppText>searchbar lmao</AppText>
        <AppText center className="text-white">
          Incoming
        </AppText>
        {incomingRequests.map(({ pfpUrl, username, buttonText, cardType }, index) => (
          <FriendCard
            pfpUrl={pfpUrl}
            username={username}
            buttonText={buttonText}
            cardType={cardType}
            key={index}
          />
        ))}
        <AppText center className="text-white">
          Pending
        </AppText>
        {outgoingRequests.map(({ pfpUrl, username, buttonText, cardType }, index) => (
          <FriendCard
            pfpUrl={pfpUrl}
            username={username}
            buttonText={buttonText}
            cardType={cardType}
            key={index}
          />
        ))}
        <AppText center className="text-white">
          Friends
        </AppText>
        {friends.map(({ pfpUrl, username, buttonText, cardType }, index) => (
          <FriendCard
            pfpUrl={pfpUrl}
            username={username}
            buttonText={buttonText}
            cardType={cardType}
            key={index}
          />
        ))}
      </View>
    </View>
  );
}
