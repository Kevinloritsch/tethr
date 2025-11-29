import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

interface TaskProps {
  groupName: string;
  taskId: string;
  weekly: boolean;
}

const DayCountdownBar = () => {
  const [progress, setProgress] = useState(100);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const updateProgress = () => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      const totalMs = endOfDay.getTime() - startOfDay.getTime();
      const remainingMs = endOfDay.getTime() - now.getTime();
      const progressPercent = (remainingMs / totalMs) * 100;

      setProgress(progressPercent);

      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor(remainingMs / (1000 * 60));
      if (hours > 0) setTimeRemaining(`${hours} hours remaining!`);
      else setTimeRemaining(`${minutes} minutes remaining!`);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Text className="mb-2 text-sm text-white">{timeRemaining}</Text>
      <View className="h-3 w-full overflow-hidden rounded-full bg-[#a597ff7d]">
        <View className="h-full rounded-full bg-tethr-purple" style={{ width: `${progress}%` }} />
      </View>
    </>
  );
};

const WeekCountdownBar = () => {
  const [progress, setProgress] = useState(100);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const updateProgress = () => {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      const totalMs = endOfWeek.getTime() - startOfWeek.getTime();
      const remainingMs = endOfWeek.getTime() - now.getTime();
      const progressPercent = (remainingMs / totalMs) * 100;

      setProgress(progressPercent);

      const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (days > 0) {
        setTimeRemaining(
          `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''} remaining!`
        );
      } else {
        setTimeRemaining(`${hours} hour${hours !== 1 ? 's' : ''} remaining!`);
      }
    };

    updateProgress();
    const interval = setInterval(updateProgress, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Text className="mb-2 text-sm text-white">{timeRemaining}</Text>
      <View className="h-3 w-full overflow-hidden rounded-full bg-[#a597ff7d]">
        <View className="h-full rounded-full bg-tethr-purple" style={{ width: `${progress}%` }} />
      </View>
    </>
  );
};

const Task = ({ groupName, taskId, weekly }: TaskProps) => {
  return (
    <View className="">
      <Text className="text-3xl font-bold text-white">{groupName}</Text>
      <Text className="py-5 text-xl text-white">{taskId}</Text>
      {weekly ? <WeekCountdownBar /> : <DayCountdownBar />}
      <Text className="text-md pt-5 text-white">Complete the task ➜</Text>
    </View>
  );
};

export default Task;
