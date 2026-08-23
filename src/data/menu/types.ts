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
}
