import { error, json } from "@sveltejs/kit";
const IMGUR_CLIENT_ID = import.meta.env.VITE_IMGUR_CLIENT_ID;


/**
 * @type {import("./$types").RequestHandler}
 */
export const POST = async ({ request }) => {
    const base64 = await request.text();

    const myHeaders = new Headers();
    myHeaders.append("accept", "application/json");
    myHeaders.append("accept-language", "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7");
    myHeaders.append("content-type", "text/plain");
    myHeaders.append("dnt", "1");
    myHeaders.append("origin", "https://www.draftbot.fr");
    myHeaders.append("priority", "u=1, i");
    myHeaders.append("referer", "https://www.draftbot.fr/");
    myHeaders.append("sec-ch-ua", "\"Chromium\";v=\"133\", \"Not(A:Brand\";v=\"99\"");
    myHeaders.append("sec-ch-ua-mobile", "?0");
    myHeaders.append("sec-ch-ua-platform", "\"macOS\"");
    myHeaders.append("sec-fetch-dest", "empty");
    myHeaders.append("sec-fetch-mode", "cors");
    myHeaders.append("sec-fetch-site", "same-site");
    myHeaders.append("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36");

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: "data:image/png;base64," + base64,
        redirect: "follow"
    };

    try {
        const res = await fetch("https://s.draftbot.fr/upload", requestOptions).then(res => res.json());
        console.info("[CUSTOM AVATAR] Response from the server", res);
        return json(res);
    }
    catch (e) {
        console.error("[CUSTOM AVATAR] Error while fetching the server", e);

        console.log("Use fallback to imgur");
        const imgur = await uploadToImgur(base64);
        return json(imgur);
    }
};

async function uploadToImgur(base64) {
    const res = await fetch("https://api.imgur.com/3/image", {
        method: "POST",
        headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        },
        body: new URLSearchParams({ image: base64 })
    });
    if (!res.ok) throw new Error("imgur failed");
    return { url: (await res.json()).data.link };
}
