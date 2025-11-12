import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { taskController } from '@/controllers/tasks';
import Tethr from '@/components/tethr';

import Entypo from '@expo/vector-icons/Entypo';

interface Task {
  task_name: string;
  recurring: boolean;
}

const ChooseTask = () => {
  const { group_name } = useLocalSearchParams();
  const { group_id } = useLocalSearchParams();
  const groupId = Array.isArray(group_id) ? group_id[0] : (group_id ?? '');
  console.log(group_name);

  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchGroupTasks = async (groupId: string) => {
    const data = await taskController.getTasksForGroup([{ group_id: groupId, group_name: '' }]);
    setTasks(data);
  };

  useEffect(() => {
    fetchGroupTasks(groupId);
  });

  return (
    <View className="flex-1 flex-col bg-black pt-8">
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
      <View className="items-center">
        <Text className="text-2xl font-bold text-white">Select Task for {group_name}</Text>

        {tasks.map((task, idx) => (
          <Pressable
            className="mr-3 rounded-xl px-4 py-2"
            key={idx}
            onPress={() =>
              router.push({
                pathname: '/main/camera/takePhoto',
                params: { group_name: group_name, group_id: group_id, task_name: task.task_name },
              })
            }>
            <View className="mb-3 rounded-xl bg-tethr-gray/45 px-4 py-2">
              <Text className="text-lg text-white">
                {task.task_name} {task.recurring ? '(Recurring)' : ''}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default ChooseTask;
