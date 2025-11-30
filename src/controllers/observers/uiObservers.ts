import {
  taskCompletionObserver,
  TaskCompletionData,
} from '@/controllers/observers/taskCompletionObserver';

let homeUpdateCallback: ((data: TaskCompletionData) => void) | null = null;
let exploreUpdateCallback: ((data: TaskCompletionData) => void) | null = null;

taskCompletionObserver.subscribe((data) => {
  console.log('Call to update UI:', data);
  if (homeUpdateCallback) {
    homeUpdateCallback(data);
  }
  if (exploreUpdateCallback) {
    exploreUpdateCallback(data);
  }
});

// Home screen registration
export const registerHomeObserver = (callback: (data: TaskCompletionData) => void) => {
  console.log('Home observer registered');
  homeUpdateCallback = callback;
};

export const unregisterHomeObserver = () => {
  console.log('Home observer unregistered');
  homeUpdateCallback = null;
};

// Explore screen registration
export const registerExploreObserver = (callback: (data: TaskCompletionData) => void) => {
  console.log('Explore observer registered');
  exploreUpdateCallback = callback;
};

export const unregisterExploreObserver = () => {
  console.log('Explore observer unregistered');
  exploreUpdateCallback = null;
};
