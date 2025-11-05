import { View, ActivityIndicator, Text, ScrollView, RefreshControl } from 'react-native';
import { AppText } from '@/components/apptext';
import Profile from '@/components/profile/profile';
import Options from '@/components/profile/options';
import Tethr from '@/components/tethr';
import { ProfileProps, getProfileData } from '@/controllers/profile';
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<ProfileProps>();
  const TEST_USER_ID = process.env.TEST_USER_ID;
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);

      const profileResponse = await getProfileData.getProfileInformation(TEST_USER_ID);

      setProfile(profileResponse);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [TEST_USER_ID]);
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfile();
  }, [loadProfile]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="white" />
        <Text className="mt-4 text-white">Loading profile...</Text>
      </View>
    );
  }
  console.log(`user id: ${TEST_USER_ID}`);
  return (
    <View className="flex-1 flex-col bg-black">
      <Tethr side="left" />
      <ScrollView
        className="flex-1 justify-center"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <AppText center>
          {profile && (
            <Profile
              username={profile.username}
              pfpurl={profile.pfpurl}
              fullName={profile.fullName}
              numCompletedTasks={profile.numCompletedTasks}
              numFriends={profile.numFriends}
            />
          )}
          <Options />
        </AppText>
      </ScrollView>
    </View>
  );
}
