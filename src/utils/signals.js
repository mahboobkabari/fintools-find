/**
  Lightweight Micro-Reactive Signals Utility (30 lines).
  Provides reactive state binding for Vanilla JS calculator islands
  without pulling in heavy frameworks.
 */

export function signal(initialValue) {
  let value = initialValue;
  const subscribers = new Set();

  return {
    get value() {
      return value;
    },
    set value(newValue) {
      if (value !== newValue) {
        value = newValue;
        subscribers.forEach((fn) => fn(value));
      }
    },
    subscribe(fn) {
      subscribers.add(fn);
      fn(value);
      return () => subscribers.delete(fn);
    },
  };
}

export function computed(fn, signals) {
  const resultSignal = signal(fn());
  signals.forEach((sig) => {
    sig.subscribe(() => {
      resultSignal.value = fn();
    });
  });
  return resultSignal;
}
