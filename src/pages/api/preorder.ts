import type { APIRoute } from 'astro';
import { submissions } from '@wix/forms';
import { SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, SQUARE_ENV } from 'astro:env/server';

export const prerender = false;

const FORM_ID = '89826b0b-1be8-4b01-81fb-471dea15de03';
const SQUARE_API_VERSION = '2024-10-17';

type CartLine = { sku: string; name: string; price: number; qty: number };

function randomIdempotencyKey(): string {
	const c: any = globalThis.crypto;
	if (c?.randomUUID) return c.randomUUID();
	return `sharav-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function summarize(cart: CartLine[]): string {
	const lines = cart.map((l) => `${l.qty}x ${l.name} ($${(l.price * l.qty).toFixed(0)})`);
	const total = cart.reduce((sum, l) => sum + l.price * l.qty, 0);
	return `${lines.join(', ')} — Total: $${total.toFixed(0)}`;
}

export const POST: APIRoute = async ({ request }) => {
	try {
		const body = await request.json();
		const { full_name, email, phone, pickup, notes, cart } = body ?? {};
		if (!full_name || !email || !phone || !pickup || !Array.isArray(cart)) {
			return new Response(JSON.stringify({ error: 'Missing required fields.' }), { status: 400 });
		}

		const lines: CartLine[] = cart.filter(
			(l: any) => l && typeof l.sku === 'string' && typeof l.name === 'string' && Number(l.qty) > 0 && Number(l.price) >= 0,
		);
		if (!lines.length) {
			return new Response(JSON.stringify({ error: 'Your order is empty.' }), { status: 400 });
		}

		if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
			console.error('Square is not configured — set SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID (see README).');
			return new Response(JSON.stringify({ error: 'Online payment is not set up yet - please call us to order.' }), { status: 500 });
		}

		const squareApiBase = SQUARE_ENV === 'production' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';
		const redirectUrl = new URL('/?order=success#order', request.url).toString();

		const squareRes = await fetch(`${squareApiBase}/v2/online-checkout/payment-links`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
				'Square-Version': SQUARE_API_VERSION,
			},
			body: JSON.stringify({
				idempotency_key: randomIdempotencyKey(),
				order: {
					location_id: SQUARE_LOCATION_ID,
					line_items: lines.map((l) => ({
						name: l.name,
						quantity: String(l.qty),
						base_price_money: { amount: Math.round(l.price * 100), currency: 'USD' },
					})),
					metadata: {
						customer_name: String(full_name).slice(0, 250),
						pickup: String(pickup).slice(0, 200),
						...(notes ? { notes: String(notes).slice(0, 500) } : {}),
					},
				},
				checkout_options: {
					redirect_url: redirectUrl,
					ask_for_shipping_address: false,
				},
				pre_populated_data: {
					buyer_email: String(email),
					buyer_phone_number: String(phone),
				},
			}),
		});

		const squareData: any = await squareRes.json();
		if (!squareRes.ok || !squareData?.payment_link?.url) {
			console.error('Square payment link creation failed', squareData);
			return new Response(JSON.stringify({ error: 'Could not start checkout - please try again or call us.' }), { status: 502 });
		}

		// Best-effort internal record so the existing Wix Forms/Contacts workflow still sees the
		// order come in — payment itself is confirmed in the Square dashboard, not here.
		try {
			const paymentNote = 'Payment handled via Square checkout — confirm payment received before preparing.';
			const pickupLine = `Pickup: ${pickup}`;
			await submissions.createSubmission({
				formId: FORM_ID,
				submissions: {
					full_name,
					email,
					phone,
					order_summary: summarize(lines),
					notes: notes ? `${pickupLine}\n${notes}\n\n${paymentNote}` : `${pickupLine}\n\n${paymentNote}`,
				},
			});
		} catch (err) {
			console.error('preorder record (Wix Forms) failed — Square checkout link was still created', err);
		}

		return new Response(JSON.stringify({ url: squareData.payment_link.url }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err: any) {
		console.error('preorder checkout failed', err);
		return new Response(
			JSON.stringify({ error: 'Checkout failed.', detail: err?.message ?? String(err) }),
			{ status: 500 },
		);
	}
};
