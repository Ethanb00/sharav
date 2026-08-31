export interface MenuItem {
	name: string;
	sku: string;
	order: number;
	description: string;
	eyebrow?: string;
	dark?: 'espresso' | 'olive';
	/** Photo shown on the dish card. Either a Wix Media asset — copy the
	 * `wix:image://...` id from the file's "Copy Media ID" option in the Wix Media
	 * Manager — or a path to a file in `public/images/` (e.g. `/images/dishes/hummus.jpg`).
	 * Leave unset to show the "Photo coming soon" placeholder. */
	image?: string;
	/** Set to `false` for items that can only be picked up at the Sunday market
	 * (e.g. items that don't travel well or need a same-day handoff). Defaults to
	 * true when unset. When any cart item has this set to `false`, the order form
	 * disables the Monday North Bethesda pickup option. */
	mondayAvailable?: boolean;
}
