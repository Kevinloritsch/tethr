import { FlatList, View, ActivityIndicator, Text } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

import Group from '@/components/groups/group';

interface GroupType {
  group_id: string;
  group_name: string;
}

const Groups = () => {
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [loading, setLoading] = useState(true);

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

      const { data: groupData, error: groupError } = await supabase
        .from('ispartof')
        .select('group_id, groups ( group_id, group_name )')
        .eq('user_id', user.id);

      if (groupError) console.error('Error fetching groups:', groupError);
      else {
        console.log('Raw groups data:', groupData);

        const formattedGroups: GroupType[] = (groupData || []).map((item: any) => ({
          group_id: item.group_id,
          group_name: item.groups?.group_name || 'INVALID GROUP NAME OR NO GROUP NAME',
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

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="white" />
        <Text className="mt-4 text-white">Loading groups...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={groups}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 25,
      }}
      renderItem={({ item }) => (
        <View className="mx-4 h-72 w-72 rounded-md bg-tethr-gray p-4">
          <Group group_name={item.group_name} />
        </View>
      )}
      keyExtractor={(item) => item.group_id}
    />
  );
};

export default Groups;
