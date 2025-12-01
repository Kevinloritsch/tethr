import AsyncStorage from '@react-native-async-storage/async-storage';
import { completedTasksController } from '@/controllers/completeTask';

describe('completedTasksController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('addTask creates a new task when none exist (resets on new day)', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const tasks = await completedTasksController.addTask('taskA', 'group1', false);

    const expectedKey = `group1-taskA`;
    expect(tasks).toEqual([expectedKey]);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('lastTaskDate', expect.any(String));
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'completedTasks',
      JSON.stringify([expectedKey])
    );
  });

  test('addTask does not duplicate an existing task when today matches', async () => {
    const today = new Date().toDateString();
    const taskKey = `group2-taskB`;

    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(today)
      .mockResolvedValueOnce(JSON.stringify([taskKey]));

    const tasks = await completedTasksController.addTask('taskB', 'group2', false);

    expect(tasks).toEqual([taskKey]);
    expect(AsyncStorage.setItem).not.toHaveBeenCalledWith('completedTasks', expect.any(String));
  });

  test('getTasks returns empty array and resets when lastDate differs', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const tasks = await completedTasksController.getTasks();

    expect(tasks).toEqual([]);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('lastTaskDate', expect.any(String));
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('completedTasks', JSON.stringify([]));
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

  test('initialize sets initialized flag and subscribes to observer', () => {
    const initialState = completedTasksController.initialized;
    completedTasksController.initialized = false;

    completedTasksController.initialize();

    expect(completedTasksController.initialized).toBe(true);

    completedTasksController.initialized = initialState;
  });

  test('initialize returns early if already initialized', () => {
    completedTasksController.initialized = true;

    completedTasksController.initialize();

    expect(completedTasksController.initialized).toBe(true);
  });

  test('addTask with weekly=true creates weekly task when none exist', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const tasks = await completedTasksController.addTask('weeklyTask', 'group1', true);

    const expectedKey = `group1-weeklyTask`;
    expect(tasks).toEqual([expectedKey]);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('lastWeekKey', expect.any(String));
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'completedWeeklyTasks',
      JSON.stringify([expectedKey])
    );
  });

  test('addTask with weekly=true does not duplicate when week matches', async () => {
    const weekKey = new Date().toDateString();
    const taskKey = `group1-weeklyTask`;

    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(weekKey)
      .mockResolvedValueOnce(JSON.stringify([taskKey]));

    const tasks = await completedTasksController.addTask('weeklyTask', 'group1', true);

    expect(tasks).toEqual([taskKey]);
    expect(AsyncStorage.setItem).not.toHaveBeenCalledWith(
      'completedWeeklyTasks',
      expect.any(String)
    );
  });

  test('addTask with weekly=true resets when new week starts', async () => {
    const oldWeekKey = new Date(new Date().getTime() - 8 * 24 * 60 * 60 * 1000).toDateString();

    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(oldWeekKey)
      .mockResolvedValueOnce(JSON.stringify([]));

    const tasks = await completedTasksController.addTask('newWeeklyTask', 'group1', true);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('lastWeekKey', expect.any(String));
    expect(tasks).toContain('group1-newWeeklyTask');
  });

  test('getTasks combines daily and weekly tasks', async () => {
    const today = new Date().toDateString();
    const weekKey = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toDateString();

    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(today)
      .mockResolvedValueOnce(JSON.stringify(['daily1', 'daily2']))
      .mockResolvedValueOnce(weekKey)
      .mockResolvedValueOnce(JSON.stringify(['weekly1', 'weekly2']));

    const tasks = await completedTasksController.getTasks();

    expect(tasks).toEqual(['daily1', 'daily2', 'weekly1', 'weekly2']);
  });

  test('getTasks resets daily tasks when date changes', async () => {
    const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toDateString();

    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(yesterday)
      .mockResolvedValueOnce(expect.any(String));

    await completedTasksController.getTasks();

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('lastTaskDate', expect.any(String));
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('completedTasks', JSON.stringify([]));
  });

  test('getTasks resets weekly tasks when week changes', async () => {
    const today = new Date().toDateString();
    const oldWeekKey = new Date(new Date().getTime() - 8 * 24 * 60 * 60 * 1000).toDateString();

    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(today)
      .mockResolvedValueOnce(JSON.stringify([]))
      .mockResolvedValueOnce(oldWeekKey)
      .mockResolvedValueOnce(JSON.stringify([]));

    await completedTasksController.getTasks();

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('lastWeekKey', expect.any(String));
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('completedWeeklyTasks', JSON.stringify([]));
  });

  test('addTask handles error gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
    const spyError = jest.spyOn(console, 'error').mockImplementation();

    const tasks = await completedTasksController.addTask('task', 'group', false);

    expect(tasks).toEqual([]);
    expect(spyError).toHaveBeenCalledWith(
      expect.stringContaining('Error adding task'),
      expect.any(Error)
    );
    spyError.mockRestore();
  });

  test('getTasks handles error gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
    const spyError = jest.spyOn(console, 'error').mockImplementation();

    const tasks = await completedTasksController.getTasks();

    expect(tasks).toEqual([]);
    expect(spyError).toHaveBeenCalledWith(
      expect.stringContaining('Error getting tasks'),
      expect.any(Error)
    );
    spyError.mockRestore();
  });
});
