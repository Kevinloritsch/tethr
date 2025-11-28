import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { groupController } from '@/controllers/group';
import { taskController } from '@/controllers/tasks';
import Tethr from '@/components/tethr';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const CreateTask = () => {
  const {
    groupId,
    groupName: passedGroupName,
    photos,
  } = useLocalSearchParams<{
    groupId: string;
    groupName?: string;
    photos?: string;
  }>();
  const [groupName, setGroupName] = useState<string>(passedGroupName || 'No Name');
  const [loading, setLoading] = useState(!passedGroupName);
  const [uploading, setUploading] = useState(false);
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
    const result = await taskController.createTask(groupId, task, recurring);
    setUploading(true);

    if (result.success) {
      router.dismiss();
      router.push({
        pathname: `/main/groups/${groupId}`,
        params: {
          group_id: groupId,
          group_name: groupName,
          photos: photos,
          return_state: 'main',
        },
      });
    } else {
      const isDuplicateError = result.message
        ?.toLowerCase()
        .includes('duplicate key value violates unique');
      if (isDuplicateError) {
        Alert.alert(
          'Task Already Exists',
          `A task named "${task}" already exists in this group. Please choose a different name.`,
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        console.error('Failed to create task:', result.message);
      }
    }
    setUploading(false);
  };

  return (
    <View className="flex flex-col px-4 pt-8">
      <View className="relative h-[10vh] w-full items-center">
        <View className="absolute left-0 right-0 top-0 items-center">
          <Tethr side="center" />
        </View>
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
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
      <View className="mx-auto w-10/12">
        <Text className="pt-2 text-left text-2xl font-bold text-white">Create a Task</Text>
        <TextInput
          className="border-1 m-2 mx-auto w-full rounded-lg bg-white p-2"
          value={task}
          onChangeText={setTask}
          placeholder="Enter task name"
          placeholderTextColor="#DEDEDE"
        />
        <View className="w-full flex-row items-center py-1 text-white">
          <Text className="mb-1 mr-1 w-1/4 text-white">Recurring</Text>
          <Switch
            value={recurring}
            onValueChange={setRecurring}
            trackColor={{ false: '#767577', true: '#A597FF' }}
            thumbColor={recurring ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>
        <View className="w-full flex-row items-center py-1 text-white">
          <Text className="mb-1 mr-1 w-1/4 text-white">Weekly</Text>
          <Switch
            value={recurring}
            disabled={!recurring}
            onValueChange={setRecurring}
            trackColor={{ false: '#767577', true: '#A597FF' }}
            thumbColor={recurring ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>

        <View className="h-[10vh] w-full flex-row items-center justify-end">
          <TouchableOpacity
            onPress={handleCreateTask}
            disabled={uploading}
            className="flex flex-row items-center">
            <Text className="pr-2 text-xl font-bold text-white">Post To</Text>
            <Text className="text-xl font-bold text-tethr-purple">{groupName}</Text>

            <MaterialCommunityIcons name="chevron-right" size={36} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CreateTask;
