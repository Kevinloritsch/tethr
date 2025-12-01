import { View, Text, Image } from 'react-native';
import { completedTasksController } from '@/controllers/completeTask';

import { useState, useEffect } from 'react';

import CircleProgress from '@/components/groups/circleProgress';

interface GroupProps {
  group_id: string;
  group_name: string;
  current_points: number;
  total_tasks: number;
  photos: {
    name: string;
    publicUrl: string;
    createdAt: string;
  }[];
}

const Group = ({ group_id, group_name, current_points, total_tasks, photos }: GroupProps) => {
  const [completedTasks, setCompletedTasks] = useState(0);

  useEffect(() => {
    const loadCompletedTasks = async () => {
      const completed = await completedTasksController.getTasks();
      const count = completed.filter((task: string) => {
        return task.startsWith(group_id);
      }).length;
      setCompletedTasks(count);
    };

    loadCompletedTasks();
  }, [group_id]);

  return (
    <View className="mx-4 h-72 w-72 rounded-md bg-tethr-gray p-4">
      <View className="flex flex-row justify-between">
        <Text className="mb-2 text-center text-4xl font-bold text-white">{group_name}</Text>
        <Text className="mt-1 items-center text-xl font-bold text-white/40">{current_points}</Text>
      </View>
      <View className="relative flex-1 items-center justify-center">
        {photos.length > 0 ? (
          <>
            {photos[2] && (
              <Image
                source={{ uri: photos[2].publicUrl }}
                className="absolute left-2 top-10 h-28 w-28 -rotate-[15deg] rounded-lg border border-black"
              />
            )}

            {photos[1] && (
              <Image
                source={{ uri: photos[1].publicUrl }}
                className="absolute left-10 top-10 h-28 w-28 -rotate-[8deg] rounded-lg border border-black"
              />
            )}

            {photos[0] && (
              <Image
                source={{ uri: photos[0].publicUrl }}
                className="absolute left-16 top-10 h-28 w-28 rounded-lg border border-black"
              />
            )}
          </>
        ) : (
          <Text className="absolute left-0 text-white/60">No photos yet</Text>
        )}

        <View className="absolute right-0 text-3xl font-bold text-white">
          <CircleProgress
            percentage={
              total_tasks === 0 ? 0 : Number(((completedTasks / total_tasks) * 100).toFixed(2))
            }
          />
        </View>
      </View>
    </View>
  );
};

export default Group;
