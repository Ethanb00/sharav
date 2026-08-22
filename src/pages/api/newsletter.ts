import type { APIRoute } from 'astro';
import { submissions } from '@wix/forms';

export const prerender = false;

const FORM_ID = '8c56de65-fe8b-4478-87e9-be3467d47bce';

export const POST: APIRoute = async ({ request }) => {
	try {
		const body = await request.json();
		const { email } = body ?? {};
		if (!email) {
			return new Response(JSON.stringify({ error: 'Email is required.' }), { status: 400 });
		}
		const result = await submissions.createSubmission({
			formId: FORM_ID,
			submissions: { email },
		});
		return new Response(JSON.stringify({ status: result.status }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err: any) {
		console.error('newsletter submission failed', err);
		return new Response(JSON.stringify({ error: 'Submission failed.' }), { status: 500 });
	}
};
