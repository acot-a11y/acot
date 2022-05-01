import type { ElementHandle } from 'puppeteer-core';

export type EventListener = {
  scriptId: string;
  type: string;
  useCapture: boolean;
  passive: boolean;
  once: boolean;
  lineNumber: number;
  columnNumber: number;
};

export const getEventListeners = async (
  element: ElementHandle,
): Promise<EventListener[]> => {
  const { listeners }: any = await (
    element.executionContext() as any
  )._client.send('DOMDebugger.getEventListeners', {
    objectId: (element as any)._remoteObject.objectId,
  });

  return listeners as EventListener[];
};
