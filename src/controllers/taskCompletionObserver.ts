class TaskCompletionObserver {
  private observers: ((data: TaskCompletionData) => void)[] = [];

  subscribe(observer: (data: TaskCompletionData) => void) {
    this.observers.push(observer);
    return () => {
      this.observers = this.observers.filter((obs) => obs !== observer);
    };
  }

  notify(data: TaskCompletionData) {
    console.log('Notifying all observers:', data);
    this.observers.forEach((observer) => {
      try {
        observer(data);
      } catch (error) {
        console.error('Observer error:', error);
      }
    });
  }
}

export interface TaskCompletionData {
  taskName: string;
  groupId: string;
  userId: string;
  photoUri: string;
  weekly: boolean;
  timestamp: string;
}

export const taskCompletionObserver = new TaskCompletionObserver();
