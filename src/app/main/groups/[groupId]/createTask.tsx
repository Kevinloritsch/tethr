import { View, Text, Pressable, TextInput, ActivityIndicator, Switch } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { groupController } from '@/controllers/group';
import { FontAwesome6 } from '@expo/vector-icons';

const CreateTask = () => {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [groupName, setGroupName] = useState<string>('No Name');
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<string>('');
  const [recurring, setRecurring] = useState<boolean>(false);

  useEffect(() => {
    loadGroup();
  });

  const loadGroup = async () => {
    const groupName = await groupController.getGroupName(groupId);
    if (groupName) setGroupName(groupName);
    setLoading(false);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="white" />
        <Text className="mt-4 text-white">Loading...</Text>
      </View>
    );
  }

  const handleCreateTask = async () => {
    const result = await groupController.createTask(groupId, task, recurring);

    if (result.success) {
      router.replace(`/main/groups/${groupId}`);
    } else {
      console.error('Failed to create task:', result.message);
    }
  };

  return (
    <View className="flex flex-col items-center px-4 pt-12">
      <Text className="text-2xl font-bold text-tethr-purple">{groupName}</Text>
      <Text className="pt-8 text-3xl font-bold text-white">Create a Task</Text>
      <TextInput
        className="border-1 m-2 mx-auto w-3/4 rounded-lg bg-white p-2"
        value={task}
        onChangeText={setTask}
        placeholder="Enter task name"
      />
      <View className="flex-row items-center justify-center text-white">
        <Text className="mb-2 text-white">Recurring</Text>
        <Switch
          value={recurring}
          onValueChange={setRecurring}
          trackColor={{ false: '#767577', true: '#A597FF' }}
          thumbColor={recurring ? '#f4f3f4' : '#f4f3f4'}
        />
      </View>

      <Pressable className="flex-row items-center" onPress={() => handleCreateTask()}>
        <Text className="pr-2 text-2xl font-bold text-white">Add to</Text>
        <Text className="pr-4 text-2xl font-bold text-tethr-purple">{groupName}</Text>
        <FontAwesome6 name="arrow-right-long" size={24} color="white" className="pl-2" />
      </Pressable>
    </View>
  );
};

export default CreateTask;
