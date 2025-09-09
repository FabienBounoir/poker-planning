import { error, json } from "@sveltejs/kit";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

/**
 * @type {import("./$types").RequestHandler}
 */
export const POST = async ({ request }) => {
    try {
        // Get content type and length for validation
        const contentType = request.headers.get('content-type');
        const contentLength = parseInt(request.headers.get('content-length') || '0');

        // Validate file size
        if (contentLength > MAX_FILE_SIZE) {
            return error(413, { message: "File size too large. Maximum 5MB allowed." });
        }

        // Basic validation of content type
        if (contentType && !ALLOWED_TYPES.includes(contentType.toLowerCase())) {
            return error(415, { message: "Unsupported file type. Only images are allowed." });
        }

        const blob = await request.text();

        // Additional size check after reading
        if (blob.length > MAX_FILE_SIZE) {
            return error(413, { message: "File size too large. Maximum 5MB allowed." });
        }

        // Validate that UPLOAD_URL is configured
        const uploadUrl = process.env.UPLOAD_URL;
        if (!uploadUrl) {
            console.error("[CUSTOM AVATAR] UPLOAD_URL environment variable not configured");
            return error(503, { message: "Upload service not configured" });
        }

        const myHeaders = new Headers();
        myHeaders.append("accept", "application/json");
        myHeaders.append("content-type", "text/plain");
        
        // Only set origin if it's configured
        if (process.env.UPLOAD_ORIGIN) {
            myHeaders.append("origin", process.env.UPLOAD_ORIGIN);
        }

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: blob,
            redirect: "follow"
        };

        const res = await fetch(uploadUrl, requestOptions);
        
        if (!res.ok) {
            throw new Error(`Upload service responded with ${res.status}`);
        }
        
        const result = await res.json();
        console.info("[CUSTOM AVATAR] Upload successful");
        return json(result);
    }
    catch (e) {
        console.error("[CUSTOM AVATAR] Error while uploading:", e);
        return error(500, { message: "Upload failed. Please try again." });
    }
};
