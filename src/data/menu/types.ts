export interface MenuItem {
	name: string;
	sku: string;
	order: number;
	description: string;
	eyebrow?: string;
	dark?: 'espresso' | 'olive';
}
