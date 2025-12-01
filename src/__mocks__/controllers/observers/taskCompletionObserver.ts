import { TaskCompletionData } from '@/controllers/observers/taskCompletionObserver';

let subscribers: ((data: TaskCompletionData) => void)[] = [];

export const taskCompletionObserver = {
  subscribe: jest.fn((callback: (data: TaskCompletionData) => void) => {
    subscribers.push(callback);
    return () => {
      subscribers = subscribers.filter((sub) => sub !== callback);
    };
  }),

  notify: jest.fn((data: TaskCompletionData) => {
    subscribers.forEach((callback) => callback(data));
  }),

  _getSubscribers: () => subscribers,

  _clear: () => {
    subscribers = [];
  },
};
