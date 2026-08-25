import type { APIRoute } from 'astro';
import { forms, submissions } from '@wix/forms';

export const prerender = false;

const FORM_ID = '8c56de65-fe8b-4478-87e9-be3467d47bce';

export const POST: APIRoute = async ({ request }) => {
	try {
		const body = await request.json();
		const email = typeof body?.email === 'string' ? body.email.trim() : '';
		const firstName = typeof body?.first_name_ed32 === 'string' ? body.first_name_ed32.trim() : '';
		const lastName = typeof body?.last_name_c908 === 'string' ? body.last_name_c908.trim() : '';
		if (!email) {
			return new Response(JSON.stringify({ error: 'Email is required.' }), { status: 400 });
		}
		const form = await forms.getForm(FORM_ID);
		const formFields = (form.formFields ?? []) as Array<{
			inputOptions?: {
				target?: string;
				contactMapping?: { contactField?: string };
			};
		}>;
		const targetFor = (contactField: string) =>
			formFields.find((field) => field.inputOptions?.contactMapping?.contactField === contactField)
				?.inputOptions?.target;
		const emailTarget = targetFor('EMAIL');
		const firstNameTarget = targetFor('FIRST_NAME');
		const lastNameTarget = targetFor('LAST_NAME');
		const subscriptionTarget = targetFor('SUBSCRIPTION');
		if (!emailTarget) throw new Error('Newsletter form is missing an email field target.');

		const formValues: Record<string, unknown> = { [emailTarget]: email };
		if (firstName && firstNameTarget) formValues[firstNameTarget] = firstName;
		if (lastName && lastNameTarget) formValues[lastNameTarget] = lastName;
		if (subscriptionTarget) formValues[subscriptionTarget] = true;
		const result = await submissions.createSubmission({
			formId: FORM_ID,
			submissions: formValues,
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
