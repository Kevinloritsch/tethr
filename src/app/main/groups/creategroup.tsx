import { View, TextInput, Text, Pressable, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import Tethr from '@/components/tethr';
import { FontAwesome6 } from '@expo/vector-icons';
import { groupController } from '@/controllers/group';
import { userController } from '@/controllers/userInfo';
import { getFriendsList } from '@/controllers/getFriends';
import { router } from 'expo-router';

interface FriendProps {
  pfpUrl: string;
  username: string;
  userId: string;
  buttonText: string;
  cardType: any;
}

const CreateGroup = () => {
  const [group_name, setGroupName] = useState('');
  const [friends, setFriends] = useState<FriendProps[]>([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);

  useEffect(() => {
    const loadFriends = async () => {
      const data = await getFriendsList.getFriends();
      setFriends(data);
    };
    loadFriends();
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = async () => {
    const user_id = await userController.getId();
    if (!user_id) {
      console.error('User ID is null — user may not be logged in.');
      return;
    }

    const result = await groupController.createGroup(group_name, user_id, selectedFriendIds);

    if (result.success) {
      router.replace(`/main/groups`);
    } else {
      console.error('Failed to create group:', result.message);
    }
  };

  return (
    <View className="min-h-screen bg-black pt-8">
      <Tethr side="left" />

      <View className="flex items-center pt-8">
        <Text className="text-xl font-bold text-white">Create a Group</Text>

        <TextInput
          className="mt-4 w-3/4 rounded-3xl bg-tethr-gray py-2 pl-4 text-white"
          placeholder="Enter a group name"
          placeholderTextColor="#ffffff"
          autoCorrect={false}
          value={group_name}
          onChangeText={setGroupName}
        />
      </View>

      <View className="mt-6 flex items-center">
        <Text className="mb-2 text-lg font-semibold text-white">Select Friends to Add</Text>
        <ScrollView className="max-h-[300px] w-3/4">
          {friends.map((f) => {
            const selected = selectedFriendIds.includes(f.userId);

            return (
              <Pressable
                key={f.userId}
                onPress={() => toggleSelect(f.userId)}
                className="my-2 flex-row items-center justify-between rounded-xl bg-tethr-gray px-4 py-3">
                <Text className="text-white">{f.username}</Text>

                <FontAwesome6
                  name={selected ? 'check-circle' : 'circle'}
                  size={20}
                  color={selected ? '#A597FF' : '#fff'}
                />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View className="flex items-center pt-6">
        <Pressable className="flex flex-row items-end" onPress={handleCreateGroup}>
          <Text className="pr-2 text-2xl font-bold text-white">Create</Text>
          <Text className="pr-4 text-2xl font-bold text-tethr-purple">{group_name}</Text>
          <FontAwesome6 name="arrow-right-long" size={24} color="white" />
        </Pressable>
      </View>
    </View>
  );
};

export default CreateGroup;
