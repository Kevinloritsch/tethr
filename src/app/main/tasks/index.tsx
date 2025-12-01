import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useMemo, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

import Tethr from '@/components/tethr';
import SearchBar from '@/components/searchbar';
import { getCardType, roundedMap } from '@/utils/cardType';

import Entypo from '@expo/vector-icons/Entypo';

import { completedTasksController } from '@/controllers/completeTask';

export interface Task {
  group_name: string;
  group_id: string;
  task_name: string;
  recurring: boolean;
  weekly: boolean;
}

const Index = () => {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const { data } = useLocalSearchParams();

  const parsedObject: Task[] = useMemo(() => {
    if (Array.isArray(data)) {
      return JSON.parse(data[0]);
    } else if (typeof data === 'string') {
      return JSON.parse(data);
    }
    return [];
  }, [data]);

  useEffect(() => {
    const loadCompletedTasks = async () => {
      const completed = await completedTasksController.getTasks();
      setCompletedTasks(completed);
    };

    loadCompletedTasks();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return parsedObject;

    const lowerQuery = searchQuery.toLowerCase();
    return parsedObject.filter((task) => task.task_name.toLowerCase().includes(lowerQuery));
  }, [parsedObject, searchQuery]);

  const isCompleted = (taskName: string, groupId: string) => {
    const taskKey = `${groupId}-${taskName}`;
    return completedTasks.includes(taskKey);
  };

  return (
    <View className="flex-1 bg-black pt-8">
      <View className="relative h-[10vh] w-full items-center">
        <View className="absolute left-0 right-0 top-0 items-center">
          <Tethr side="center" />
        </View>
        <TouchableOpacity
          onPress={() => router.navigate('/main')}
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
      <View className="mb-3 flex-row items-center justify-between pl-10 pr-3">
        <Text className="text-2xl font-bold text-white">Your Tasks</Text>
      </View>
      <View className="mb-5 items-center">
        <SearchBar placeholder="Search tasks..." onSearch={setSearchQuery} value={searchQuery} />
      </View>

      {filteredTasks.length === 0 ? (
        <Text className="text-center text-xl text-white">
          {searchQuery ? 'No groups found.' : "You're not in any groups yet."}
        </Text>
      ) : (
        <ScrollView showsHorizontalScrollIndicator={false}>
          {filteredTasks.map((task: Task, index: number) => {
            const taskCompleted = isCompleted(task.task_name, task.group_id);
            return (
              <TouchableOpacity
                key={task.group_id + task.task_name}
                disabled={taskCompleted}
                className={`flex w-10/12 self-center bg-tethr-gray/50 px-5 py-4 text-2xl text-white ${roundedMap[getCardType(index, filteredTasks.length)]}`}
                onPress={() =>
                  router.push({
                    pathname: '/main/camera/takePhoto',
                    params: {
                      group_name: task.group_name,
                      group_id: task.group_id,
                      task_name: task.task_name,
                      all_tasks: JSON.stringify(parsedObject),
                      return_state: 'tasks',
                      weekly: task.weekly as unknown as string,
                    },
                  })
                }>
                <View className="flex flex-row justify-between">
                  <Text
                    className={`${taskCompleted ? 'text-tethr-light-gray/20' : 'text-white'} font-semibold`}>
                    {task.task_name || 'Unnamed Task'}
                  </Text>
                  <Text
                    className={`${taskCompleted ? 'text-tethr-purple/20' : 'text-tethr-purple'} font-semibold`}>
                    {task.group_name || 'Unnamed Task'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

export default Index;
