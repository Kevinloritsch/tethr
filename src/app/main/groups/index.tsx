import { View, Pressable, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { FontAwesome6 } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { getAllGroups } from '@/controllers/group';

interface Group {
  group_id: string;
  group_name: string;
}

interface UserProfile {
  username: string;
  name: string;
}

const Index = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Error fetching session:', sessionError);
    }
    const user = sessionData?.session?.user;
    const { data: userRow, error: userError } = await supabase
      .from('users')
      .select('username, name')
      .eq('user_id', user?.id)
      .single();

    if (userError) console.error('Error fetching user profile:', userError);
    else {
      setUserProfile(userRow);
      //console.log('User profile:', userRow);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black px-4 pt-12">
      <Text className="mb-8 text-2xl font-semibold text-white">
        Welcome Back, {userProfile?.name || 'User'}!
      </Text>

      <View className="mb-6 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-white">Your Groups</Text>
        <Pressable
          className="flex-row items-center px-4 py-2"
          onPress={() => router.push('/main/groups')}>
          <FontAwesome6 name="plus" size={16} color="white" />
        </Pressable>
      </View>

      {groups.length === 0 ? (
        <Text className="text-center text-white">You’re not in any groups yet.</Text>
      ) : (
        <ScrollView showsHorizontalScrollIndicator={false}>
          {groups.map((group) => (
            <Pressable
              key={group.group_id}
              className="mr-3 rounded-xl bg-tethr-gray/45 px-4 py-2"
              onPress={() => router.push(`/main/groups/${group.group_id}`)}>
              <Text className="text-2xl font-medium text-white">{group.group_name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default Index;
