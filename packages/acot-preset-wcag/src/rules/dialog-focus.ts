import { createRule } from '@acot/core';
import type { ComputedAccessibleNode } from '@acot/types';

type Options = {};

export default createRule<Options>({
  type: 'contextual',
  selector: '[aria-haspopup="dialog"]',
  meta: {
    tags: ['wcag2.1a', '2.4.3 Focus Order'],
    recommended: true,
  },

  test: async (context, node) => {
    try {
      await node.click();

      const activeElementHasParentDialogRole = async () => {
        if (document.activeElement === null) {
          return false;
        }

        const ax = (await (window as any).getComputedAccessibleNode(
          document.activeElement,
        )) as ComputedAccessibleNode;

        const findParentDialogRoleAXNode = (
          computedAXNode: ComputedAccessibleNode,
        ): ComputedAccessibleNode | null => {
          if (computedAXNode.role === 'dialog') {
            return computedAXNode;
          }

          return computedAXNode.parent != undefined
            ? findParentDialogRoleAXNode(computedAXNode.parent)
            : null;
        };

        return findParentDialogRoleAXNode(ax)?.role === 'dialog';
      };

      const hasDialogRoleInParentByClick = await context.page.evaluate(
        activeElementHasParentDialogRole,
      );

      context.debug({ hasDialogRoleInParentByClick });

      if (!hasDialogRoleInParentByClick) {
        await context.page.keyboard.press('Tab');

        const hasDialogRoleInParentByPressTab = await context.page.evaluate(
          activeElementHasParentDialogRole,
        );

        context.debug({ hasDialogRoleInParentByPressTab });

        if (!hasDialogRoleInParentByPressTab) {
          await context.report({
            node,
            message: `Move focus to inside dialog or set dialog after trigger.`,
          });
        }
      }
    } catch (e) {
      context.debug('error: ', e);
    }
  },
});
