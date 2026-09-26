import zhug from './zhug';
import hummus from './hummus';
import babaGanoush from './baba-ganoush';
import muhammara from './muhammara';
import roastedZaatarCarrot from './roasted-zaatar-carrot';
import pita from './pita';
import type { MenuItem } from './types';

export type { MenuItem };

export const MENU_ITEMS: MenuItem[] = [zhug, hummus, babaGanoush, muhammara, roastedZaatarCarrot, pita];

/** Menu item content keyed by product name, so it can be joined against the live Wix Stores catalog. */
export const MENU_BY_NAME: Record<string, MenuItem> = Object.fromEntries(MENU_ITEMS.map((item) => [item.name, item]));
