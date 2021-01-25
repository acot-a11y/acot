import { createRule } from '@acot/core';
import type { ComputedAccessibleNode } from '@acot/types';

type Options = {};

export default createRule<Options>({
  meta: {
    help: 'https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html',
    recommended: true,
  },

  test: async (context) => {
    const nodes = await context.page.$$('[aria-haspopup="dialog"]');

    const activeElementHasParentDialogRole = async () => {
      if (document.activeElement === null) {
        return false;
      }

      const ax = await ((window as any).getComputedAccessibleNode(
        document.activeElement,
      ) as Promise<ComputedAccessibleNode>);

      const closest = (
        computed: ComputedAccessibleNode,
      ): ComputedAccessibleNode | null => {
        if (computed.role === 'dialog') {
          return computed;
        }

        return computed.parent != undefined ? closest(computed.parent) : null;
      };

      return closest(ax)?.role === 'dialog';
    };

    for (const node of nodes) {
      try {
        await node.click();

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
        context.debug(e);
      }
    }
  },
});
