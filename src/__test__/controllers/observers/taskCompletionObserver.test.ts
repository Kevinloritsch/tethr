import {
  taskCompletionObserver,
  TaskCompletionData,
} from '@/controllers/observers/taskCompletionObserver';

describe('taskCompletionObserver', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('subscribe adds an observer', () => {
    const mockObserver = jest.fn();
    taskCompletionObserver.subscribe(mockObserver);

    const testData: TaskCompletionData = {
      taskName: 'task1',
      groupId: 'g1',
      userId: 'u1',
      photoUri: 'photo.jpg',
      weekly: false,
      timestamp: '2025-01-01T00:00:00Z',
    };

    taskCompletionObserver.notify(testData);

    expect(mockObserver).toHaveBeenCalledWith(testData);
  });

  test('subscribe returns unsubscribe function', () => {
    const mockObserver = jest.fn();
    const unsubscribe = taskCompletionObserver.subscribe(mockObserver);

    const testData: TaskCompletionData = {
      taskName: 'task1',
      groupId: 'g1',
      userId: 'u1',
      photoUri: 'photo.jpg',
      weekly: true,
      timestamp: '2025-01-01T00:00:00Z',
    };

    unsubscribe();

    taskCompletionObserver.notify(testData);

    expect(mockObserver).not.toHaveBeenCalled();
  });

  test('notify calls all subscribed observers', () => {
    const mockObserver1 = jest.fn();
    const mockObserver2 = jest.fn();

    taskCompletionObserver.subscribe(mockObserver1);
    taskCompletionObserver.subscribe(mockObserver2);

    const testData: TaskCompletionData = {
      taskName: 'task2',
      groupId: 'g2',
      userId: 'u2',
      photoUri: 'photo2.jpg',
      weekly: false,
      timestamp: '2025-01-02T00:00:00Z',
    };

    taskCompletionObserver.notify(testData);

    expect(mockObserver1).toHaveBeenCalledWith(testData);
    expect(mockObserver2).toHaveBeenCalledWith(testData);
  });

  test('notify logs notification', () => {
    const testData: TaskCompletionData = {
      taskName: 'task3',
      groupId: 'g3',
      userId: 'u3',
      photoUri: 'photo3.jpg',
      weekly: true,
      timestamp: '2025-01-03T00:00:00Z',
    };

    taskCompletionObserver.notify(testData);

    expect(consoleLogSpy).toHaveBeenCalledWith('Notifying all task observers:', testData);
  });

  test('notify handles observer errors gracefully', () => {
    const mockObserverThatThrows = jest.fn().mockImplementation(() => {
      throw new Error('Observer error');
    });
    const mockObserverSuccess = jest.fn();

    taskCompletionObserver.subscribe(mockObserverThatThrows);
    taskCompletionObserver.subscribe(mockObserverSuccess);

    const testData: TaskCompletionData = {
      taskName: 'task4',
      groupId: 'g4',
      userId: 'u4',
      photoUri: 'photo4.jpg',
      weekly: false,
      timestamp: '2025-01-04T00:00:00Z',
    };

    taskCompletionObserver.notify(testData);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Observer error:', expect.any(Error));

    expect(mockObserverSuccess).toHaveBeenCalledWith(testData);
  });

  test('notify with multiple unsubscribes', () => {
    const observer1 = jest.fn();
    const observer2 = jest.fn();
    const observer3 = jest.fn();

    const unsub1 = taskCompletionObserver.subscribe(observer1);
    const unsub2 = taskCompletionObserver.subscribe(observer2);
    taskCompletionObserver.subscribe(observer3);

    const testData: TaskCompletionData = {
      taskName: 'task5',
      groupId: 'g5',
      userId: 'u5',
      photoUri: 'photo5.jpg',
      weekly: true,
      timestamp: '2025-01-05T00:00:00Z',
    };

    unsub1();
    unsub2();

    taskCompletionObserver.notify(testData);

    expect(observer1).not.toHaveBeenCalled();
    expect(observer2).not.toHaveBeenCalled();
    expect(observer3).toHaveBeenCalledWith(testData);
  });

  test('can re-subscribe after unsubscribe', () => {
    const mockObserver = jest.fn();

    const unsub = taskCompletionObserver.subscribe(mockObserver);
    unsub();

    taskCompletionObserver.subscribe(mockObserver);

    const testData: TaskCompletionData = {
      taskName: 'task6',
      groupId: 'g6',
      userId: 'u6',
      photoUri: 'photo6.jpg',
      weekly: false,
      timestamp: '2025-01-06T00:00:00Z',
    };

    taskCompletionObserver.notify(testData);

    expect(mockObserver).toHaveBeenCalledWith(testData);
  });
});
