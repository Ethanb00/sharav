import type { APIRoute } from 'astro';
import { submissions } from '@wix/forms';

export const prerender = false;

const FORM_ID = 'b3faf4c6-4ba9-423e-b43c-62233adfc978';

export const POST: APIRoute = async ({ request }) => {
	try {
		const body = await request.json();
		const { full_name, email, event_date, guest_count, occasion } = body ?? {};
		if (!full_name || !email || !event_date || !guest_count || !occasion) {
			return new Response(JSON.stringify({ error: 'Missing required fields.' }), { status: 400 });
		}
		const result = await submissions.createSubmission({
			formId: FORM_ID,
			submissions: { full_name, email, event_date, guest_count: Number(guest_count), occasion },
		});
		return new Response(JSON.stringify({ status: result.status }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err: any) {
		console.error('catering submission failed', err);
		return new Response(JSON.stringify({ error: 'Submission failed.' }), { status: 500 });
	}
};
