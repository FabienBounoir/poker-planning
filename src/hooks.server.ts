import type { RequestEvent } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = ({ event, resolve }) => {
    return resolve(event, {
        transformPageChunk: ({ html }) => {
            return html.replace('%lang%', get_lang(event)).replace(/%domain%/g, event.url.origin)
        }
    });
};

const get_lang = (event: RequestEvent) => {
    if (event?.request?.headers?.has('Accept-Language')) {
        const acceptLanguage = `${event?.request?.headers?.get('Accept-Language')}`.split(",")
        return acceptLanguage[0]
    }

    return "en-US"
}