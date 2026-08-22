import type { APIRoute } from 'astro';
import { submissions } from '@wix/forms';

export const prerender = false;

const FORM_ID = '89826b0b-1be8-4b01-81fb-471dea15de03';

export const POST: APIRoute = async ({ request }) => {
	try {
		const body = await request.json();
		const { full_name, email, phone, order_summary, notes } = body ?? {};
		if (!full_name || !email || !phone || !order_summary) {
			return new Response(JSON.stringify({ error: 'Missing required fields.' }), { status: 400 });
		}
		const result = await submissions.createSubmission({
			formId: FORM_ID,
			submissions: { full_name, email, phone, order_summary, notes: notes ?? '' },
		});
		return new Response(JSON.stringify({ status: result.status }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err: any) {
		console.error('preorder submission failed', err);
		return new Response(
			JSON.stringify({ error: 'Submission failed.', detail: err?.message ?? String(err), body: err?.details ?? null }),
			{ status: 500 },
		);
	}
};
