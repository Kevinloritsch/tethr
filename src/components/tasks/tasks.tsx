import { FlatList, View, Pressable } from 'react-native';

import Task from '@/components/tasks/task';
import { completedTasksController } from '@/controllers/completeTask';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';

interface TaskItem {
  task_name: string;
  group_name: string;
  group_id: string;
}

interface TasksProps {
  tasks: TaskItem[];
}

const Tasks = ({ tasks }: TasksProps) => {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  useEffect(() => {
    const loadCompletedTasks = async () => {
      const completed = await completedTasksController.getTasks();
      setCompletedTasks(completed);
    };

    loadCompletedTasks();
  }, [tasks]);

  const isCompleted = (taskName: string, groupId: string) => {
    const taskKey = `${groupId}-${taskName}`;
    return completedTasks.includes(taskKey);
  };

  return (
    <FlatList
      data={tasks}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 25,
      }}
      renderItem={({ item }) => {
        const completed = isCompleted(item.task_name, item.group_id);
        if (completed) return null;

        return (
          <View className="h-50 mx-4 w-72 rounded-md bg-tethr-gray p-4">
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/main/camera/takePhoto',
                  params: {
                    group_name: item.group_name,
                    group_id: item.group_id,
                    task_name: item.task_name,
                  },
                })
              }>
              <Task groupName={item.group_name} taskId={item.task_name} />
            </Pressable>
          </View>
        );
      }}
      keyExtractor={(item) => item.group_name + item.task_name}
    />
  );
};

export default Tasks;
