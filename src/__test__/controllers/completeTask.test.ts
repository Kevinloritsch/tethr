import AsyncStorage from '@react-native-async-storage/async-storage';
import { completedTasksController } from '@/controllers/completeTask';

describe('completedTasksController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('addTask creates a new task when none exist (resets on new day)', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const tasks = await completedTasksController.addTask('taskA', 'group1');

    const expectedKey = `group1-taskA`;
    expect(tasks).toEqual([expectedKey]);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('lastTaskDate', expect.any(String));
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'completedTasks',
      JSON.stringify([expectedKey])
    );
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('completedTasks');
  });

  test('addTask does not duplicate an existing task when today matches', async () => {
    const today = new Date().toDateString();
    const taskKey = `group2-taskB`;

    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(today)
      .mockResolvedValueOnce(JSON.stringify([taskKey]));

    const tasks = await completedTasksController.addTask('taskB', 'group2');

    expect(tasks).toEqual([taskKey]);
    expect(AsyncStorage.setItem).not.toHaveBeenCalledWith('completedTasks', expect.any(String));
  });

  test('getTasks returns empty array and resets when lastDate differs', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const tasks = await completedTasksController.getTasks();

    expect(tasks).toEqual([]);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('completedTasks');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('lastTaskDate', expect.any(String));
  });

  test('getTasks returns stored tasks when lastDate matches today', async () => {
    const today = new Date().toDateString();
    const stored = ['g-task1', 'g-task2'];

    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(today)
      .mockResolvedValueOnce(JSON.stringify(stored));

    const tasks = await completedTasksController.getTasks();

    expect(tasks).toEqual(stored);
  });
});
