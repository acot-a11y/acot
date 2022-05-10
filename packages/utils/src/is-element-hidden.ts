import type { ElementHandle } from 'puppeteer-core';

/**
 * @see https://chromedevtools.github.io/devtools-protocol/tot/Accessibility/#method-queryAXTree
 */
export const isElementHidden = async (
  element: ElementHandle,
): Promise<boolean> => {
  const [
    {
      node: { backendNodeId },
    },
    { nodes },
  ] = await Promise.all([
    element._client.send('DOM.describeNode', {
      objectId: element._remoteObject.objectId,
    }),
    element._client.send('Accessibility.queryAXTree', {
      objectId: element._remoteObject.objectId,
    }),
  ]);

  const node = nodes.find((o) => o.backendDOMNodeId === backendNodeId);
  if (node == null) {
    return false;
  }

  // Even if it is ignored for accessibility, it is judged to be hidden.
  if (node.ignored) {
    return true;
  }

  if (node.properties == null) {
    return false;
  }

  for (const prop of node.properties) {
    if (prop.name === 'hidden') {
      return prop.value.value === true;
    }
  }

  return false;
};
