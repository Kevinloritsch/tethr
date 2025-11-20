import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { taskController } from '@/controllers/tasks';
import Tethr from '@/components/tethr';
import { completedTasksController } from '@/controllers/completeTask';

import Entypo from '@expo/vector-icons/Entypo';

interface Task {
  task_name: string;
  recurring: boolean;
}

const ChooseTask = () => {
  const { group_name } = useLocalSearchParams();
  const { group_id } = useLocalSearchParams();
  const groupId = Array.isArray(group_id) ? group_id[0] : (group_id ?? '');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const fetchGroupTasks = async (groupId: string) => {
    const data = await taskController.getTasksForGroup([{ group_id: groupId, group_name: '' }]);
    setTasks(data);
  };

  useEffect(() => {
    const loadCompletedTasks = async () => {
      const completed = await completedTasksController.getTasks();
      setCompletedTasks(completed);
    };

    loadCompletedTasks();
    fetchGroupTasks(groupId);
  }, [groupId]);

  const isCompleted = (taskName: string, groupId: string) => {
    const taskKey = `${groupId}-${taskName}`;
    return completedTasks.includes(taskKey);
  };

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

        {tasks.map((task, idx) => {
          const taskCompleted = isCompleted(task.task_name, groupId);
          return (
            <Pressable
              className="mr-3 rounded-xl px-4 py-2"
              key={idx}
              disabled={taskCompleted}
              onPress={() =>
                router.push({
                  pathname: '/main/camera/takePhoto',
                  params: { group_name: group_name, group_id: group_id, task_name: task.task_name },
                })
              }>
              <View
                className={`flex w-full flex-col items-center rounded-2xl ${taskCompleted ? `bg-gray-400` : `bg-tethr-purple/70`} p-2`}>
                <Text className="text-white">
                  {task.task_name} {task.recurring ? '(Recurring)' : ''}{' '}
                  {taskCompleted ? '(Completed Today)' : ''}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default ChooseTask;
