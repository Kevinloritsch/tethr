class ScoreUpdateObserver {
  private observers: (() => void)[] = [];

  subscribe(observer: () => void) {
    this.observers.push(observer);
    return () => {
      this.observers = this.observers.filter((obs) => obs !== observer);
    };
  }

  notify() {
    console.log('Notifying profile observer');
    this.observers.forEach((observer) => {
      try {
        observer();
      } catch (error) {
        console.error('Score update observer error:', error);
      }
    });
  }
}

export const scoreUpdateObserver = new ScoreUpdateObserver();
