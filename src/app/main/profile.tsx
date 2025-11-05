import { View, ActivityIndicator, Text, ScrollView, RefreshControl } from 'react-native';
import { AppText } from '@/components/apptext';
import Profile from '@/components/profile/profile';
import Options from '@/components/profile/options';
import Tethr from '@/components/tethr';
import { ProfileProps, userController } from '@/controllers/userInfo';
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<ProfileProps>();
  const router = useRouter();
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);

      const profileResponse = await userController.getProfileInformation();

      setProfile(profileResponse);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );
  const handleLogout = async () => {
    const success = await userController.logout();
    if (success) {
      router.replace('/auth');
    }
  };
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
          <Options logoutHandler={handleLogout} />
        </AppText>
      </ScrollView>
    </View>
  );
}
