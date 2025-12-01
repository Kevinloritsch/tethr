export interface FriendRequestData {
  action: 'accept' | 'reject' | 'cancel';
  friendId: string;
  username?: string;
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
}

export const friendRequestObserver = new FriendRequestObserver();
