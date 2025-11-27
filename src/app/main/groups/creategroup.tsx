import { View, TextInput, Text, Pressable } from 'react-native';
import { useState } from 'react';
import Tethr from '@/components/tethr';
import { FontAwesome6 } from '@expo/vector-icons';
import { groupController } from '@/controllers/group';
import { userController } from '@/controllers/userInfo';
import { router } from 'expo-router';
const CreateGroup = () => {
  const [group_name, setGroupName] = useState('');

  const handleCreateGroup = async () => {
    const user_id = await userController.getId();
    if (!user_id) {
      console.error('User ID is null — user may not be logged in.');
      return;
    }
    const result = await groupController.createGroup(group_name, user_id);

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
          className="mt-4 w-3/4 rounded-3xl bg-tethr-gray pl-4 text-white"
          placeholder="Enter a group name"
          placeholderTextColor="#ffffff"
          autoCorrect={false}
          value={group_name}
          onChangeText={setGroupName}
        />
      </View>
      <View className="flex items-center pt-4">
        <Pressable className="flex flex-row items-end" onPress={() => handleCreateGroup()}>
          <Text className="pr-2 text-2xl font-bold text-white">Add to</Text>
          <Text className="pr-4 text-2xl font-bold text-tethr-purple">{group_name}</Text>
          <FontAwesome6 name="arrow-right-long" size={24} color="white" className="pl-2" />
        </Pressable>
      </View>
    </View>
  );
};

export default CreateGroup;
