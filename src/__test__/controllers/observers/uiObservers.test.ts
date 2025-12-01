import {
  registerHomeObserver,
  unregisterHomeObserver,
  registerExploreObserver,
  unregisterExploreObserver,
} from '@/controllers/observers/uiObservers';

jest.mock('@/controllers/observers/taskCompletionObserver', () => {
  const subscribers: any[] = [];

  return {
    taskCompletionObserver: {
      subscribe: jest.fn((callback: any) => {
        subscribers.push(callback);
        return () => {
          subscribers.splice(subscribers.indexOf(callback), 1);
        };
      }),
      _notifySubscribers: (data: any) => {
        subscribers.forEach((callback) => callback(data));
      },
      _getSubscribers: () => subscribers,
    },
  };
});

describe('uiObservers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('basic functionality', () => {
    it('exports registerHomeObserver', () => {
      expect(typeof registerHomeObserver).toBe('function');
    });

    it('exports unregisterHomeObserver', () => {
      expect(typeof unregisterHomeObserver).toBe('function');
    });

    it('exports registerExploreObserver', () => {
      expect(typeof registerExploreObserver).toBe('function');
    });

    it('exports unregisterExploreObserver', () => {
      expect(typeof unregisterExploreObserver).toBe('function');
    });
  });
  describe('registerHomeObserver', () => {
    it('registers a callback for home screen', () => {
      const callback = jest.fn();
      registerHomeObserver(callback);

      expect(console.log).toHaveBeenCalledWith('Home observer registered');
    });
  });

  describe('unregisterHomeObserver', () => {
    it('unregisters home observer', () => {
      registerHomeObserver(jest.fn());
      unregisterHomeObserver();

      expect(console.log).toHaveBeenCalledWith('Home observer unregistered');
    });
  });

  describe('registerExploreObserver', () => {
    it('registers a callback for explore screen', () => {
      const callback = jest.fn();
      registerExploreObserver(callback);

      expect(console.log).toHaveBeenCalledWith('Explore observer registered');
    });
  });

  describe('unregisterExploreObserver', () => {
    it('unregisters explore observer', () => {
      registerExploreObserver(jest.fn());
      unregisterExploreObserver();

      expect(console.log).toHaveBeenCalledWith('Explore observer unregistered');
    });
  });

  describe('module initialization', () => {
    it('loads the module without errors', () => {
      expect(registerHomeObserver).toBeDefined();
      expect(registerExploreObserver).toBeDefined();
      expect(typeof registerHomeObserver).toBe('function');
      expect(typeof registerExploreObserver).toBe('function');
    });
  });
});
