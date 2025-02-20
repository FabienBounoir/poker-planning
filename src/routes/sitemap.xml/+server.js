export async function GET() {
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
                <loc>https://anotherpp.vercel.app/</loc>
                <lastmod>2025-01-05T16:15:00+00:00</lastmod>
            </url>

            <url>
                <loc>https://anotherpp.vercel.app/create</loc>
                <lastmod>2025-02-20T11:15:00+00:00</lastmod>
            </url>

            <url>
                <loc>https://anotherpp.vercel.app/join</loc>
                <lastmod>2025-01-05T16:15:00+00:00</lastmod>
            </url>

            <url>
                <loc>https://anotherpp.vercel.app/manager</loc>
                <lastmod>2025-02-20T11:15:00+00:00</lastmod>
            </url>

            <url>
                <loc>https://anotherpp.vercel.app/rooms</loc>
                <lastmod>2025-02-20T11:15:00+00:00</lastmod>
            </url>

            <url>
                <loc>https://anotherpp.vercel.app/feedback</loc>
                <lastmod>2025-02-20T11:15:00+00:00</lastmod>
            </url>

            <url>
                <loc>https://anotherpp.vercel.app/pokerhistory</loc>
                <lastmod>2025-01-25T23:15:00+00:00</lastmod>
            </url>
		</urlset>`.trim(),
        {
            headers: {
                'Content-Type': 'application/xml'
            }
        }
    );
}