import { View, Pressable, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { FontAwesome6 } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

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
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Error fetching session:', sessionError);
        setLoading(false);
        return;
      }

      const user = sessionData?.session?.user;
      if (!user) {
        console.log('No user logged in.');
        setLoading(false);
        return;
      }

      console.log('Current user ID:', user.id);

      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('username, name')
        .eq('user_id', user.id)
        .single();

      if (userError) console.error('Error fetching user profile:', userError);
      else {
        setUserProfile(userRow);
        console.log('User profile:', userRow);
      }

      const { data: groupData, error: groupError } = await supabase
        .from('ispartof')
        .select('group_id, groups ( group_id, group_name )')
        .eq('user_id', user.id);

      if (groupError) console.error('Error fetching groups:', groupError);
      else {
        console.log('Raw groups data:', groupData);

        const formattedGroups: Group[] = (groupData || []).map((item: any) => ({
          group_id: item.group_id,
          group_name:
            item.groups?.group_name || 'AN ERROR HAS OCCURRED. INVALID GROUP NAME / NO GROUP NAME',
        }));

        console.log('Formatted groups:', formattedGroups);
        setGroups(formattedGroups);
      }
    } catch (err) {
      console.error('Unexpected error fetching data:', err);
    } finally {
      setLoading(false);
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
          className="flex-row items-center rounded-lg bg-tethr-purple/40 px-4 py-2"
          onPress={() => router.push('/main/groups')}>
          <FontAwesome6 name="plus" size={16} color="white" />
        </Pressable>
      </View>

      {groups.length === 0 ? (
        <Text className="text-center text-white/70">You’re not in any groups yet.</Text>
      ) : (
        <ScrollView showsHorizontalScrollIndicator={false}>
          {groups.map((group) => (
            <Pressable
              key={group.group_id}
              className="mr-3 rounded-xl bg-tethr-purple/40 px-4 py-2"
              onPress={() => console.log('Pressed group:', group.group_name)}>
              <Text className="font-medium text-white">{group.group_name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default Index;
