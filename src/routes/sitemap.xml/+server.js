export async function GET({ request, url }) {
    console.log("request", request, url.origin)

    return new Response(
        `
		<?xml version="1.0" encoding="UTF-8" ?>
		<urlset
			xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
			xmlns:xhtml="https://www.w3.org/1999/xhtml"
			xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
			xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
			xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
			xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
		>
			<url>
                <loc>%DOMAIN%/</loc>
                <lastmod>2025-04-13T12:05:00+00:00</lastmod>
            </url>

            <url>
                <loc>%DOMAIN%/create</loc>
                <lastmod>2025-04-13T12:05:00+00:00</lastmod>
            </url>

            <url>
                <loc>%DOMAIN%/join</loc>
                <lastmod>2025-04-13T12:05:00+00:00</lastmod>
            </url>

            <url>
                <loc>%DOMAIN%/manager</loc>
                <lastmod>2025-04-13T12:05:00+00:00</lastmod>
            </url>

            <url>
                <loc>%DOMAIN%/rooms</loc>
                <lastmod>2025-04-13T12:05:00+00:00</lastmod>
            </url>

            <url>
                <loc>%DOMAIN%/feedback</loc>
                <lastmod>2025-04-13T12:05:00+00:00</lastmod>
            </url>

            <url>
                <loc>%DOMAIN%/pokerhistory</loc>
                <lastmod>2025-04-13T12:05:00+00:00</lastmod>
            </url>
		</urlset>`.trim().replace(
            /%DOMAIN%/g,
            url.origin
        ),
        {
            headers: {
                'Content-Type': 'application/xml'
            }
        }
    );
}