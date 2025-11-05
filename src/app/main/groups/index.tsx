import { View, Pressable, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { FontAwesome6 } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

const Index = () => {
  const [groups, setGroups] = useState<{ group_id: string; group_name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserGroups();
  }, []);

  const fetchUserGroups = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('ispartof')
      .select('group_id, groups ( group_name )')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching groups:', error);
    } else {
      const formatted = data.map((item: any) => ({
        group_id: item.group_id,
        group_name: item.groups.group_name,
      }));
      setGroups(formatted);
    }

    setLoading(false);
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {groups.map((group) => (
            <Pressable
              key={group.group_id}
              className="mr-3 rounded-full bg-tethr-purple/40 px-4 py-2"
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
