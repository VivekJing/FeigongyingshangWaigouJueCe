export enum EventNames {
  API_ERROR = 'API:ERROR',
}

interface EventPayloads {
  [EventNames.API_ERROR]: [error: string];
}

type Listener<T extends keyof EventPayloads> = (
  ...args: EventPayloads[T]
) => unknown;

type EventMap = { [K in keyof EventPayloads]: Set<Listener<K>> };

class EventEmitter {
  private listeners: EventMap = Object.values(EventNames).reduce(
    (acc, eventName) => {
      acc[eventName] = new Set();
      return acc;
    },
    {} as EventMap
  );

  on<T extends keyof EventPayloads>(eventName: T, listener: Listener<T>) {
    this.listeners[eventName].add(listener);
  }

  emit<T extends keyof EventPayloads>(eventName: T, ...args: EventPayloads[T]) {
    this.listeners[eventName].forEach((listener) => listener(...args));
  }
}

export default new EventEmitter();
