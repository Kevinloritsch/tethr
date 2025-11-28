import AsyncStorage from '@react-native-async-storage/async-storage';

const getWeekKey = () => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  return startOfWeek.toDateString();
};

export const completedTasksController = {
  addTask: async (taskName: string, groupId: string, weekly: boolean = false) => {
    try {
      const taskKey = `${groupId}-${taskName}`;

      if (weekly) {
        const weekKey = getWeekKey();
        const lastWeekKey = await AsyncStorage.getItem('lastWeekKey');

        if (lastWeekKey !== weekKey) {
          await AsyncStorage.setItem('lastWeekKey', weekKey);
          await AsyncStorage.setItem('completedWeeklyTasks', JSON.stringify([]));
        }

        const stored = await AsyncStorage.getItem('completedWeeklyTasks');
        const tasks = stored ? JSON.parse(stored) : [];

        if (!tasks.includes(taskKey)) {
          tasks.push(taskKey);
          await AsyncStorage.setItem('completedWeeklyTasks', JSON.stringify(tasks));
        }

        return tasks;
      }

      const today = new Date().toDateString();
      const lastDate = await AsyncStorage.getItem('lastTaskDate');

      if (lastDate !== today) {
        await AsyncStorage.setItem('lastTaskDate', today);
        await AsyncStorage.setItem('completedTasks', JSON.stringify([]));
      }

      const stored = await AsyncStorage.getItem('completedTasks');
      const tasks = stored ? JSON.parse(stored) : [];

      if (!tasks.includes(taskKey)) {
        tasks.push(taskKey);
        await AsyncStorage.setItem('completedTasks', JSON.stringify(tasks));
      }

      return tasks;
    } catch (error) {
      console.error('Error adding task:', error);
      return [];
    }
  },

  getTasks: async (): Promise<string[]> => {
    try {
      const today = new Date().toDateString();
      const lastDate = await AsyncStorage.getItem('lastTaskDate');

      if (lastDate !== today) {
        await AsyncStorage.setItem('lastTaskDate', today);
        await AsyncStorage.setItem('completedTasks', JSON.stringify([]));

        return [];
      }

      const stored = await AsyncStorage.getItem('completedTasks');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  },
};
