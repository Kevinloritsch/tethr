import {
  friendRequestObserver,
  FriendRequestData,
} from '@/controllers/observers/friendRequestObserver';

describe('friendRequestObserver', () => {
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
    friendRequestObserver.subscribe(mockObserver);

    const testData: FriendRequestData = {
      action: 'accept',
      friendId: 'f1',
      username: 'friend1',
    };

    friendRequestObserver.notify(testData);

    expect(mockObserver).toHaveBeenCalledWith(testData);
  });

  test('subscribe returns unsubscribe function', () => {
    const mockObserver = jest.fn();
    const unsubscribe = friendRequestObserver.subscribe(mockObserver);

    const testData: FriendRequestData = {
      action: 'reject',
      friendId: 'f2',
      username: 'friend2',
    };

    unsubscribe();
    friendRequestObserver.notify(testData);

    expect(mockObserver).not.toHaveBeenCalled();
  });

  test('notify calls all subscribed observers', () => {
    const mockObserver1 = jest.fn();
    const mockObserver2 = jest.fn();

    friendRequestObserver.subscribe(mockObserver1);
    friendRequestObserver.subscribe(mockObserver2);

    const testData: FriendRequestData = {
      action: 'accept',
      friendId: 'f3',
      username: 'friend3',
    };

    friendRequestObserver.notify(testData);

    expect(mockObserver1).toHaveBeenCalledWith(testData);
    expect(mockObserver2).toHaveBeenCalledWith(testData);
  });

  test('notify logs notification', () => {
    const testData: FriendRequestData = {
      action: 'cancel',
      friendId: 'f4',
      username: 'friend4',
    };

    friendRequestObserver.notify(testData);

    expect(consoleLogSpy).toHaveBeenCalledWith('Notifying all friendrequest observers:', testData);
  });

  test('notify handles observer errors gracefully', () => {
    const mockObserverThatThrows = jest.fn().mockImplementation(() => {
      throw new Error('Observer error');
    });
    const mockObserverSuccess = jest.fn();

    friendRequestObserver.subscribe(mockObserverThatThrows);
    friendRequestObserver.subscribe(mockObserverSuccess);

    const testData: FriendRequestData = {
      action: 'reject',
      friendId: 'f5',
      username: 'friend5',
    };

    friendRequestObserver.notify(testData);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Friend request observer error:',
      expect.any(Error)
    );

    expect(mockObserverSuccess).toHaveBeenCalledWith(testData);
  });

  test('supports action types: accept, reject, cancel', () => {
    const mockObserver = jest.fn();
    friendRequestObserver.subscribe(mockObserver);

    const acceptData: FriendRequestData = {
      action: 'accept',
      friendId: 'f6',
    };

    const rejectData: FriendRequestData = {
      action: 'reject',
      friendId: 'f7',
    };

    const cancelData: FriendRequestData = {
      action: 'cancel',
      friendId: 'f8',
    };

    friendRequestObserver.notify(acceptData);
    friendRequestObserver.notify(rejectData);
    friendRequestObserver.notify(cancelData);

    expect(mockObserver).toHaveBeenCalledTimes(3);
    expect(mockObserver).toHaveBeenNthCalledWith(1, acceptData);
    expect(mockObserver).toHaveBeenNthCalledWith(2, rejectData);
    expect(mockObserver).toHaveBeenNthCalledWith(3, cancelData);
  });

  test('username is optional in FriendRequestData', () => {
    const mockObserver = jest.fn();
    friendRequestObserver.subscribe(mockObserver);

    const dataWithoutUsername: FriendRequestData = {
      action: 'accept',
      friendId: 'f9',
    };

    friendRequestObserver.notify(dataWithoutUsername);

    expect(mockObserver).toHaveBeenCalledWith(dataWithoutUsername);
  });

  test('can re-subscribe after unsubscribe', () => {
    const mockObserver = jest.fn();

    const unsub = friendRequestObserver.subscribe(mockObserver);
    unsub();

    friendRequestObserver.subscribe(mockObserver);

    const testData: FriendRequestData = {
      action: 'accept',
      friendId: 'f10',
      username: 'friend10',
    };

    friendRequestObserver.notify(testData);

    expect(mockObserver).toHaveBeenCalledWith(testData);
  });

  test('notify with multiple unsubscribes', () => {
    const observer1 = jest.fn();
    const observer2 = jest.fn();
    const observer3 = jest.fn();

    const unsub1 = friendRequestObserver.subscribe(observer1);
    const unsub2 = friendRequestObserver.subscribe(observer2);
    friendRequestObserver.subscribe(observer3);

    const testData: FriendRequestData = {
      action: 'reject',
      friendId: 'f11',
    };

    unsub1();
    unsub2();

    friendRequestObserver.notify(testData);

    expect(observer1).not.toHaveBeenCalled();
    expect(observer2).not.toHaveBeenCalled();
    expect(observer3).toHaveBeenCalledWith(testData);
  });
});
