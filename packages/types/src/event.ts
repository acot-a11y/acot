export type EventMap = Record<string, any[]>;
export type EventListenerResult = void | Promise<void>;
export type EventListener<T extends EventMap, U extends keyof T> = (
  args: T[U],
) => EventListenerResult;

export type EventMethodFactory<T extends EventMap> = {
  on: <U extends keyof T>(eventName: U, listener: EventListener<T, U>) => void;
  off: <U extends keyof T>(eventName: U, listener: EventListener<T, U>) => void;
};
