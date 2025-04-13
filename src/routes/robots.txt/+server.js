export async function GET({ request, url }) {
    console.log("request", request, url.origin)

    return new Response(
        `
		User-agent: *
Allow: /
Sitemap: %DOMAIN%/sitemap.xml`.trim().replace(
            /%DOMAIN%/g,
            url.origin
        ),
        {
            headers: {
                'Content-Type': 'text/plain'
            }
        }
    );
}