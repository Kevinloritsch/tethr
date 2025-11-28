import { View, TextInput, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import Tethr from '@/components/tethr';
import { FontAwesome6 } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { groupController } from '@/controllers/group';
import { userController } from '@/controllers/userInfo';
import { getFriendsList } from '@/controllers/getFriends';
import { router } from 'expo-router';
import { getCardType, roundedMap } from '@/utils/cardType';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);

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
    setUploading(true);
    const user_id = await userController.getId();
    if (!user_id) {
      console.error('User ID is null — user may not be logged in.');
      return;
    }

    const result = await groupController.createGroup(group_name, user_id, selectedFriendIds);

    if (result.success) {
      router.navigate(`/`);
    } else {
      console.error('Failed to create group:', result.message);
    }
    setUploading(false);
  };

  const filteredFriends = friends.filter((f) =>
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-black pt-8">
      <View className="relative h-[10vh] w-full items-center">
        <View className="absolute left-0 right-0 top-0 items-center">
          <Tethr side="center" />
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-0 top-0 h-full items-center justify-center pb-2 pl-8">
          <Entypo
            name="chevron-left"
            size={24}
            color="#000000"
            backgroundColor="#A597FF"
            className="rounded-lg px-2"
          />
        </TouchableOpacity>
      </View>

      <View className="flex items-center pt-4">
        <Text className="w-3/4 text-left text-xl font-bold text-white">Create a Group</Text>

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
        <Text className="mb-2 w-3/4 text-left text-lg font-semibold text-white">
          Select Friends to Add
        </Text>
        <TextInput
          className="mb-4 w-3/4 rounded-3xl bg-tethr-gray py-2 pl-4 text-white"
          placeholder="Search friends..."
          placeholderTextColor="#ffffff"
          autoCorrect={false}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <ScrollView className="max-h-[600px] w-3/4">
          {filteredFriends.map(({ userId, pfpUrl, username }, idx) => {
            const selected = selectedFriendIds.includes(userId);

            return (
              <TouchableOpacity
                key={userId}
                onPress={() => toggleSelect(userId)}
                className="w-full items-center rounded-xl px-4">
                <View
                  className={`flex w-full self-center bg-tethr-gray/50 px-5 py-4 text-2xl text-white ${roundedMap[getCardType(idx, filteredFriends.length)]}`}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex flex-row items-center">
                      <Image source={{ uri: pfpUrl }} className="mr-3 h-10 w-10 rounded-full" />
                      <Text className="text-white">{username}</Text>
                    </View>
                    <FontAwesome6
                      name={selected ? 'check-circle' : 'circle'}
                      size={20}
                      color={selected ? '#A597FF' : '#fff'}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View className="h-[10vh] flex-row items-center justify-end pr-8">
        <TouchableOpacity
          onPress={handleCreateGroup}
          disabled={uploading || group_name.length === 0}
          className="flex flex-row items-center">
          <Text
            className={`pr-2 text-xl font-bold ${group_name.length === 0 ? 'text-tethr-gray' : 'text-white'}`}>
            Create
          </Text>
          <Text className="text-xl font-bold text-tethr-purple">{group_name}</Text>

          <MaterialCommunityIcons
            name="chevron-right"
            size={36}
            color={group_name.length === 0 ? '#6b7280' : '#ffffff'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreateGroup;
