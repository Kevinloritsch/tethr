export interface FriendRequestData {
  action: 'accept' | 'reject' | 'cancel' | 'manualUpdate';
  friendId?: string;
  username?: string;
  count?: number;
}

class FriendRequestObserver {
  private observers: ((data: FriendRequestData) => void)[] = [];

  subscribe(observer: (data: FriendRequestData) => void) {
    this.observers.push(observer);
    return () => {
      this.observers = this.observers.filter((obs) => obs !== observer);
    };
  }

  notify(data: FriendRequestData) {
    console.log('Notifying all friendrequest observers:', data);
    this.observers.forEach((observer) => {
      try {
        observer(data);
      } catch (error) {
        console.error('Friend request observer error:', error);
      }
    });
  }

  notifyChange(count: number) {
    this.notify({ action: 'manualUpdate', count });
  }
}

export const friendRequestObserver = new FriendRequestObserver();
