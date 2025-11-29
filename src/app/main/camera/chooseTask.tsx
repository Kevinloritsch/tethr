import { View, Text, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { taskController } from '@/controllers/tasks';
import Tethr from '@/components/tethr';
import SearchBar from '@/components/searchbar';
import { completedTasksController } from '@/controllers/completeTask';
import { getCardType, roundedMap } from '@/utils/cardType';
import Entypo from '@expo/vector-icons/Entypo';

interface Task {
  task_name: string;
  recurring: boolean;
  weekly: boolean;
}

const ChooseTask = () => {
  const { group_name, group_id } = useLocalSearchParams();
  const groupId = Array.isArray(group_id) ? group_id[0] : (group_id ?? '');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [query, setQuery] = useState('');
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

  useEffect(() => {
    setFilteredTasks(tasks);
  }, [tasks]);

  const handleSearch = (text: string) => {
    setQuery(text);
    const lower = text.toLowerCase();

    if (!lower.trim()) {
      setFilteredTasks(tasks);
      return;
    }

    setFilteredTasks(tasks.filter((t) => t.task_name.toLowerCase().includes(lower)));
  };

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
        <Text className="mb-4 text-2xl font-bold text-white">Select Task for {group_name}</Text>

        <View className="mb-4 w-full items-center">
          <SearchBar placeholder="Search tasks..." value={query} onSearch={handleSearch} />
        </View>
        {filteredTasks.length === 0 ? (
          <Text className="mt-4 text-center text-white">No matching tasks.</Text>
        ) : (
          <View className="mb-4 w-full items-center">
            {filteredTasks.map((task, idx) => {
              const taskCompleted = isCompleted(task.task_name, groupId);

              return (
                <TouchableOpacity
                  className={`flex w-10/12 self-center bg-tethr-gray/50 px-5 py-4 text-2xl text-white ${roundedMap[getCardType(idx, filteredTasks.length)]}`}
                  key={idx}
                  disabled={taskCompleted}
                  onPress={() =>
                    router.push({
                      pathname: '/main/camera/takePhoto',
                      params: {
                        group_name: group_name,
                        group_id: group_id,
                        task_name: task.task_name,
                        weekly: task.weekly as unknown as string,
                      },
                    })
                  }>
                  <Text
                    className={`${taskCompleted ? 'text-tethr-light-gray/20' : 'text-white'} font-semibold`}>
                    {task.task_name} {task.recurring ? '(Recurring)' : ''}{' '}
                    {task.weekly ? '(Weekly)' : ''} {taskCompleted ? '(Completed)' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

export default ChooseTask;
