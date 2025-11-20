import AsyncStorage from '@react-native-async-storage/async-storage';

export const completedTasksController = {
  addTask: async (taskName: string, groupId: string) => {
    try {
      const today = new Date().toDateString();
      const lastDate = await AsyncStorage.getItem('lastTaskDate');

      if (lastDate !== today) {
        await AsyncStorage.removeItem('completedTasks');
        await AsyncStorage.setItem('lastTaskDate', today);
      }

      const stored = await AsyncStorage.getItem('completedTasks');
      const tasks = stored ? JSON.parse(stored) : [];

      const taskKey = `${groupId}-${taskName}`;
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
        await AsyncStorage.removeItem('completedTasks');
        await AsyncStorage.setItem('lastTaskDate', today);
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
